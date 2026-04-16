import "./styles.sass";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { getRequest, postRequest, request } from "@/common/utils/RequestUtil.js";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import Editor from "@monaco-editor/react";
import { Icon } from "@mdi/react";
import TabSwitcher from "@/common/components/TabSwitcher";
import SelectBox from "@/common/components/SelectBox";
import {
    mdiArrowLeft,
    mdiContentSave,
    mdiHammer,
    mdiSourceBranch,
    mdiCog,
    mdiFileDocumentOutline,
    mdiTextBox,
    mdiLoading,
    mdiCloudUploadOutline,
    mdiCheckCircleOutline,
    mdiCloseCircleOutline,
    mdiClockOutline,
    mdiGit,
    mdiRefresh,
    mdiLanConnect,
} from "@mdi/js";
import Button from "@/common/components/Button";
import IconInput from "@/common/components/IconInput";
import ToggleSwitch from "@/common/components/ToggleSwitch";
import LogViewer from "@/common/components/LogViewer";

const TABS = [
    { key: "settings", label: "Settings", icon: mdiCog },
    { key: "compose", label: "Compose", icon: mdiFileDocumentOutline },
    { key: "buildlog", label: "Build Log", icon: mdiTextBox },
];

const AUTO_BUILD_INTERVALS = [
    { label: "Every 1 minute", value: 60 },
    { label: "Every 5 minutes", value: 300 },
    { label: "Every 15 minutes", value: 900 },
    { label: "Every 30 minutes", value: 1800 },
    { label: "Every 1 hour", value: 3600 },
    { label: "Every 6 hours", value: 21600 },
    { label: "Every 24 hours", value: 86400 },
];

const STATUS_CONFIG = {
    deployed: { label: "Deployed", className: "deployed", icon: mdiCheckCircleOutline },
    building: { label: "Building", className: "building", icon: mdiLoading },
    pending: { label: "Pending", className: "pending", icon: mdiClockOutline },
    failed: { label: "Failed", className: "failed", icon: mdiCloseCircleOutline },
};

export const DeploymentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sendToast } = useToast();

    const [deployment, setDeployment] = useState(null);
    const [activeTab, setActiveTab] = useState("settings");
    const [saving, setSaving] = useState(false);
    const [building, setBuilding] = useState(false);
    const [buildLog, setBuildLog] = useState("");
    const [buildLogLoading, setBuildLogLoading] = useState(false);
    const buildLogIntervalRef = useRef(null);

    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState("");
    const [name, setName] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [branch, setBranch] = useState("main");
    const [dockerfilePath, setDockerfilePath] = useState("Dockerfile");
    const [buildContext, setBuildContext] = useState(".");
    const [composeContent, setComposeContent] = useState("");
    const [autoBuild, setAutoBuild] = useState(false);
    const [autoBuildInterval, setAutoBuildInterval] = useState(300);
    const [gitCredentialId, setGitCredentialId] = useState("");
    const [gitCredentials, setGitCredentials] = useState([]);
    const [port, setPort] = useState("");
    const [creating, setCreating] = useState(false);

    const isNew = id === "new";

    const fetchDeployment = useCallback(async () => {
        if (isNew) return;
        try {
            const data = await getRequest(`deployments/${id}`);
            if (data?.code) {
                sendToast("Error", data.message || "Deployment not found");
                navigate("/deployments/all");
                return;
            }
            setDeployment(data);
            setBranch(data.branch || "main");
            setDockerfilePath(data.dockerfilePath || "Dockerfile");
            setBuildContext(data.buildContext || ".");
            setComposeContent(data.composeContent || "");
            setAutoBuild(data.autoBuild || false);
            setAutoBuildInterval(data.autoBuildInterval || 300);
            setGitCredentialId(data.gitCredentialId ? String(data.gitCredentialId) : "");
            setPort(data.port ? String(data.port) : "");
        } catch {
            sendToast("Error", "Failed to load deployment");
            navigate("/deployments/all");
        }
    }, [id, isNew, navigate, sendToast]);

    const fetchBuildLog = useCallback(async () => {
        if (isNew) return;
        setBuildLogLoading(true);
        try {
            const data = await getRequest(`deployments/${id}/log`);
            if (!data?.code) setBuildLog(data.log || "No build log available.");
        } catch {
            setBuildLog("Failed to load build log.");
        } finally {
            setBuildLogLoading(false);
        }
    }, [id, isNew]);

    useEffect(() => {
        getRequest("git-credentials").then(data => {
            if (Array.isArray(data)) setGitCredentials(data);
        }).catch(() => {});

        if (isNew) {
            getRequest("servers").then(data => {
                if (Array.isArray(data)) {
                    const active = data.filter(s => s.status === "active");
                    setServers(active);
                    if (active.length === 1) setSelectedServer(String(active[0].id));
                }
            }).catch(() => {});
            return;
        }
        fetchDeployment();
    }, [isNew, fetchDeployment]);

    useEffect(() => {
        if (activeTab === "buildlog" && !isNew) {
            fetchBuildLog();
            if (deployment?.status === "building") {
                buildLogIntervalRef.current = setInterval(fetchBuildLog, 3000);
                return () => clearInterval(buildLogIntervalRef.current);
            }
        }
        return () => {
            if (buildLogIntervalRef.current) clearInterval(buildLogIntervalRef.current);
        };
    }, [activeTab, isNew, fetchBuildLog, deployment?.status]);

    useEffect(() => {
        if (!isNew && deployment?.status === "building") {
            const interval = setInterval(fetchDeployment, 5000);
            return () => clearInterval(interval);
        }
    }, [isNew, deployment?.status, fetchDeployment]);

    const handleCreate = async () => {
        if (!selectedServer || !name || !repoUrl) {
            sendToast("Error", "Please fill in all required fields");
            return;
        }

        setCreating(true);
        try {
            const result = await postRequest("deployments", {
                serverId: Number.parseInt(selectedServer),
                name,
                repoUrl,
                branch,
                dockerfilePath,
                buildContext,
                composeContent: composeContent || null,
                autoBuild,
                autoBuildInterval,
                gitCredentialId: gitCredentialId ? Number.parseInt(gitCredentialId) : null,
                port: port ? Number.parseInt(port) : null,
            });

            if (result?.code) {
                sendToast("Error", result.message || "Failed to create deployment");
                return;
            }

            sendToast("Success", "Deployment created");
            navigate(`/deployments/edit/${result.id}`);
        } catch (err) {
            sendToast("Error", err.message || "Failed to create deployment");
        } finally {
            setCreating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("overrideToken") || localStorage.getItem("sessionToken");
            const result = await request(`deployments/${id}`, "PATCH", {
                branch,
                dockerfilePath,
                buildContext,
                composeContent: composeContent || null,
                autoBuild,
                autoBuildInterval,
                gitCredentialId: gitCredentialId ? Number.parseInt(gitCredentialId) : null,
                port: port ? Number.parseInt(port) : null,
            }, { "Authorization": `Bearer ${token}` });

            if (result?.code) {
                sendToast("Error", result.message || "Failed to save");
                return;
            }

            sendToast("Success", "Deployment updated");
            setDeployment(result);
        } catch (err) {
            sendToast("Error", err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleBuild = async () => {
        setBuilding(true);
        try {
            const result = await postRequest(`deployments/${id}/build`);
            if (result?.code) {
                sendToast("Error", result.message || "Failed to start build");
                return;
            }
            sendToast("Success", "Build started");
            fetchDeployment();
            if (activeTab === "buildlog") fetchBuildLog();
        } catch (err) {
            sendToast("Error", err.message || "Failed to start build");
        } finally {
            setBuilding(false);
        }
    };

    const handleCheckUpdates = async () => {
        try {
            const result = await getRequest(`deployments/${id}/updates`);
            if (result?.code) {
                sendToast("Error", result.message || "Failed to check");
                return;
            }
            if (result.hasUpdates) {
                sendToast("Info", "New commits available. Trigger a rebuild to update.");
            } else {
                sendToast("Success", "Already up to date.");
            }
        } catch (err) {
            sendToast("Error", err.message || "Failed to check for updates");
        }
    };

    const status = deployment ? (STATUS_CONFIG[deployment.status] || STATUS_CONFIG.pending) : null;

    const serverOptions = servers.map(s => ({ label: `${s.name} (${s.host})`, value: String(s.id) }));
    const credentialOptions = [
        { label: "None (public repository)", value: "" },
        ...gitCredentials.map(c => ({ label: `${c.name} (${c.host})`, value: String(c.id) })),
    ];

    const renderSettingsTab = () => {
        if (isNew) {
            return (
                <div className="deployment-settings-form">
                    <div className="form-section">
                        <h3>Server</h3>
                        <SelectBox
                            options={serverOptions}
                            selected={selectedServer}
                            setSelected={setSelectedServer}
                            placeholder="Select a server"
                        />
                    </div>

                    <div className="form-section">
                        <h3>Repository</h3>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Deployment Name</label>
                                <IconInput
                                    type="text"
                                    placeholder="my-app"
                                    icon={mdiCloudUploadOutline}
                                    value={name}
                                    setValue={setName}
                                />
                            </div>
                            <div className="form-field">
                                <label>Repository URL</label>
                                <IconInput
                                    type="text"
                                    placeholder="https://github.com/user/repo.git"
                                    icon={mdiGit}
                                    value={repoUrl}
                                    setValue={setRepoUrl}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Branch</label>
                                <IconInput
                                    type="text"
                                    placeholder="main"
                                    icon={mdiSourceBranch}
                                    value={branch}
                                    setValue={setBranch}
                                />
                            </div>
                            <div className="form-field">
                                <label>Dockerfile Path</label>
                                <IconInput
                                    type="text"
                                    placeholder="Dockerfile"
                                    icon={mdiFileDocumentOutline}
                                    value={dockerfilePath}
                                    setValue={setDockerfilePath}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Build Context</label>
                                <IconInput
                                    type="text"
                                    placeholder="."
                                    icon={mdiFileDocumentOutline}
                                    value={buildContext}
                                    setValue={setBuildContext}
                                />
                            </div>
                            <div className="form-field">
                                <label>Git Credential</label>
                                <SelectBox
                                    options={credentialOptions}
                                    selected={gitCredentialId}
                                    setSelected={setGitCredentialId}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-field">
                                <label>Port</label>
                                <IconInput
                                    type="number"
                                    placeholder="e.g. 3000"
                                    icon={mdiLanConnect}
                                    value={port}
                                    setValue={setPort}
                                />
                            </div>
                            <div className="form-field" />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Auto Build</h3>
                        <div className="auto-build-toggle">
                            <div className="toggle-label">
                                <ToggleSwitch checked={autoBuild} onChange={setAutoBuild} id="auto-build-new" />
                                <span>Automatically rebuild when new commits are detected</span>
                            </div>
                            {autoBuild && (
                                <div className="auto-build-interval">
                                    <label>Check Interval</label>
                                    <SelectBox
                                        options={AUTO_BUILD_INTERVALS.map(i => ({ ...i, value: String(i.value) }))}
                                        selected={String(autoBuildInterval)}
                                        setSelected={(v) => setAutoBuildInterval(Number.parseInt(v))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button
                            text={creating ? "Creating..." : "Create Deployment"}
                            icon={mdiCloudUploadOutline}
                            loading={creating}
                            onClick={handleCreate}
                            disabled={creating}
                        />
                    </div>
                </div>
            );
        }

        if (!deployment) return null;

        return (
            <div className="deployment-settings-form">
                <div className="form-section">
                    <h3>Repository</h3>
                    <div className="info-row">
                        <span className="info-label">URL</span>
                        <span className="info-value">{deployment.repoUrl}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Image</span>
                        <span className="info-value mono">{deployment.imageName}:latest</span>
                    </div>
                    {deployment.lastCommitHash && (
                        <div className="info-row">
                            <span className="info-label">Last Commit</span>
                            <span className="info-value mono" title={deployment.lastCommitHash}>
                                {deployment.lastCommitHash?.substring(0, 8)} - {deployment.lastCommitMessage || ""}
                            </span>
                        </div>
                    )}
                    <div className="form-row">
                        <div className="form-field">
                            <label>Branch</label>
                            <IconInput type="text" icon={mdiSourceBranch} value={branch} setValue={setBranch} />
                        </div>
                        <div className="form-field">
                            <label>Dockerfile Path</label>
                            <IconInput type="text" icon={mdiFileDocumentOutline} value={dockerfilePath} setValue={setDockerfilePath} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Build Context</label>
                            <IconInput type="text" icon={mdiFileDocumentOutline} value={buildContext} setValue={setBuildContext} />
                        </div>
                        <div className="form-field">
                            <label>Git Credential</label>
                            <SelectBox
                                options={credentialOptions}
                                selected={gitCredentialId}
                                setSelected={setGitCredentialId}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-field">
                            <label>Port</label>
                            <IconInput type="number" placeholder="e.g. 3000" icon={mdiLanConnect} value={port} setValue={setPort} />
                        </div>
                        <div className="form-field" />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Auto Build</h3>
                    <div className="auto-build-toggle">
                        <div className="toggle-label">
                            <ToggleSwitch checked={autoBuild} onChange={setAutoBuild} id="auto-build-edit" />
                            <span>Automatically rebuild when new commits are detected</span>
                        </div>
                        {autoBuild && (
                            <div className="auto-build-interval">
                                <label>Check Interval</label>
                                <SelectBox
                                    options={AUTO_BUILD_INTERVALS.map(i => ({ ...i, value: String(i.value) }))}
                                    selected={String(autoBuildInterval)}
                                    setSelected={(v) => setAutoBuildInterval(Number.parseInt(v))}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions">
                    <Button
                        text={saving ? "Saving..." : "Save Changes"}
                        icon={mdiContentSave}
                        loading={saving}
                        onClick={handleSave}
                        disabled={saving}
                    />
                </div>
            </div>
        );
    };

    const renderComposeTab = () => (
        <div className="compose-editor-wrap">
            <div className="compose-info">
                <p>Define the Docker Compose configuration for deploying your built image. The image <code>{deployment?.imageName || "nexploy-deploy-<name>"}:latest</code> will be available locally after build.</p>
            </div>
            <div className="compose-editor">
                <Editor
                    height="400px"
                    defaultLanguage="yaml"
                    value={composeContent}
                    onChange={(v) => setComposeContent(v || "")}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        tabSize: 2,
                    }}
                />
            </div>
            <div className="form-actions">
                <Button
                    text={saving ? "Saving..." : "Save Compose"}
                    icon={mdiContentSave}
                    loading={saving}
                    onClick={handleSave}
                    disabled={saving}
                />
            </div>
        </div>
    );

    const renderBuildLogTab = () => (
        <div className="build-log-wrap">
            <LogViewer
                logs={buildLog}
                loading={buildLogLoading}
                onRefresh={fetchBuildLog}
                liveMode={deployment?.status === "building"}
                liveLogs={buildLog}
            />
        </div>
    );

    return (
        <div className="deployment-editor">
            <div className="deployment-editor-header">
                <div className="header-top">
                    <div className="header-left">
                        <button className="back-btn" onClick={() => navigate("/deployments/all")}>
                            <Icon path={mdiArrowLeft} />
                        </button>
                        <div className="header-info">
                            <h2>{isNew ? "New Deployment" : deployment?.name || "Loading..."}</h2>
                            {!isNew && status && (
                                <div className={`status-badge ${status.className}`}>
                                    <Icon path={status.icon} spin={deployment?.status === "building"} />
                                    <span>{status.label}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isNew && (
                        <div className="header-right">
                            <Button
                                text="Check Updates"
                                icon={mdiRefresh}
                                type="secondary"
                                onClick={handleCheckUpdates}
                            />
                            <Button
                                text={building || deployment?.status === "building" ? "Building..." : "Build & Deploy"}
                                icon={mdiHammer}
                                loading={building || deployment?.status === "building"}
                                onClick={handleBuild}
                                disabled={building || deployment?.status === "building"}
                            />
                        </div>
                    )}
                </div>
                {!isNew && (
                    <TabSwitcher
                        tabs={TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        variant="flat"
                    />
                )}
            </div>

            <div className="deployment-editor-content">
                {(isNew || activeTab === "settings") && renderSettingsTab()}
                {!isNew && activeTab === "compose" && renderComposeTab()}
                {!isNew && activeTab === "buildlog" && renderBuildLogTab()}
            </div>
        </div>
    );
};
