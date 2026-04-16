import "./styles.sass";
import { useEffect, useState, useCallback } from "react";
import { getRequest, postRequest, patchRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import Button from "@/common/components/Button";
import { DialogProvider } from "@/common/components/Dialog";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import ActionConfirmDialog from "@/common/components/ActionConfirmDialog";
import IconInput from "@/common/components/IconInput";
import SelectBox from "@/common/components/SelectBox";
import { Icon } from "@mdi/react";
import {
    mdiPlus,
    mdiPencil,
    mdiTrashCan,
    mdiGit,
    mdiFormTextbox,
    mdiLink,
    mdiKey,
    mdiAccountOutline,
    mdiShieldLockOutline,
    mdiEyeOffOutline,
} from "@mdi/js";

const AUTH_TYPE_OPTIONS = [
    { label: "Personal Access Token", value: "token" },
    { label: "Username & Password", value: "basic" },
];

export const GitCredentials = () => {
    const [credentials, setCredentials] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editCred, setEditCred] = useState(null);
    const [formData, setFormData] = useState({ name: "", host: "", authType: "token", username: "", token: "" });
    const [saving, setSaving] = useState(false);
    const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, cred: null });
    const { sendToast } = useToast();

    const loadCredentials = useCallback(async () => {
        try {
            const data = await getRequest("git-credentials");
            setCredentials(data);
        } catch {
            sendToast("Error", "Failed to load git credentials");
        }
    }, [sendToast]);

    useEffect(() => {
        loadCredentials();
    }, [loadCredentials]);

    const openCreateDialog = () => {
        setEditCred(null);
        setFormData({ name: "", host: "", authType: "token", username: "", token: "" });
        setDialogOpen(true);
    };

    const openEditDialog = (cred) => {
        setEditCred(cred);
        setFormData({
            name: cred.name,
            host: cred.host,
            authType: cred.authType,
            username: cred.username || "",
            token: "",
        });
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditCred(null);
        setFormData({ name: "", host: "", authType: "token", username: "", token: "" });
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.host) {
            sendToast("Error", "Name and host are required");
            return;
        }
        if (!editCred && !formData.token) {
            sendToast("Error", "Token / password is required");
            return;
        }

        setSaving(true);
        try {
            if (editCred) {
                const updateData = { ...formData };
                if (!updateData.token) delete updateData.token;
                await patchRequest(`git-credentials/${editCred.id}`, updateData);
                sendToast("Success", "Git credential updated");
            } else {
                await postRequest("git-credentials", formData);
                sendToast("Success", "Git credential created");
            }
            closeDialog();
            loadCredentials();
        } catch (error) {
            sendToast("Error", error.message || "Failed to save credential");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRequest = (cred) => {
        setDeleteConfirmDialog({ open: true, cred });
    };

    const handleDeleteConfirm = async () => {
        const cred = deleteConfirmDialog.cred;
        try {
            await deleteRequest(`git-credentials/${cred.id}`);
            sendToast("Success", "Git credential deleted");
            loadCredentials();
        } catch (error) {
            sendToast("Error", error.message || "Failed to delete credential");
        }
        setDeleteConfirmDialog({ open: false, cred: null });
    };

    const getAuthLabel = (authType) => {
        return authType === "basic" ? "Username & Password" : "Access Token";
    };

    return (
        <div className="git-credentials-page">
            <div className="git-credentials-section">
                <div className="section-header">
                    <div className="header-content">
                        <h2>Git Credentials</h2>
                        <p>Manage authentication for private Git repositories used by deployments</p>
                    </div>
                    <Button text="Add Credential" icon={mdiPlus} onClick={openCreateDialog} />
                </div>

                <div className="credentials-list">
                    {credentials.length === 0 ? (
                        <div className="no-credentials">
                            <Icon path={mdiGit} />
                            <h2>No git credentials configured</h2>
                            <p>Add credentials to authenticate with private repositories</p>
                        </div>
                    ) : (
                        credentials.map(cred => (
                            <div key={cred.id} className="credential-item">
                                <div className="credential-info">
                                    <Icon path={mdiShieldLockOutline} className="credential-icon" />
                                    <div className="credential-details">
                                        <div className="credential-header">
                                            <h3>{cred.name}</h3>
                                            <span className="auth-badge">{getAuthLabel(cred.authType)}</span>
                                        </div>
                                        <div className="credential-meta">
                                            <span className="meta-item">
                                                <Icon path={mdiLink} />
                                                {cred.host}
                                            </span>
                                            {cred.username && (
                                                <span className="meta-item">
                                                    <Icon path={mdiAccountOutline} />
                                                    {cred.username}
                                                </span>
                                            )}
                                            <span className="meta-item">
                                                <Icon path={mdiEyeOffOutline} />
                                                {cred.hasToken ? "Token set" : "No token"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="credential-actions">
                                    <button className="action-btn edit-btn" onClick={() => openEditDialog(cred)} title="Edit">
                                        <Icon path={mdiPencil} />
                                    </button>
                                    <button className="action-btn delete-btn" onClick={() => handleDeleteRequest(cred)} title="Delete">
                                        <Icon path={mdiTrashCan} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <DialogProvider open={dialogOpen} onClose={closeDialog}>
                <div className="git-credential-dialog">
                    <h2>{editCred ? "Edit Credential" : "Add Git Credential"}</h2>

                    <div className="form-group">
                        <label>Name</label>
                        <IconInput
                            type="text"
                            icon={mdiFormTextbox}
                            value={formData.name}
                            setValue={(value) => setFormData({ ...formData, name: value })}
                            placeholder="My GitHub Token"
                        />
                    </div>

                    <div className="form-group">
                        <label>Host</label>
                        <IconInput
                            type="text"
                            icon={mdiLink}
                            value={formData.host}
                            setValue={(value) => setFormData({ ...formData, host: value })}
                            placeholder="github.com"
                        />
                        <span className="form-hint">The hostname to match against repository URLs</span>
                    </div>

                    <div className="form-group">
                        <label>Auth Type</label>
                        <SelectBox
                            options={AUTH_TYPE_OPTIONS}
                            selected={formData.authType}
                            setSelected={(value) => setFormData({ ...formData, authType: value })}
                        />
                    </div>

                    {formData.authType === "basic" && (
                        <div className="form-group">
                            <label>Username</label>
                            <IconInput
                                type="text"
                                icon={mdiAccountOutline}
                                value={formData.username}
                                setValue={(value) => setFormData({ ...formData, username: value })}
                                placeholder="git-username"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>{formData.authType === "basic" ? "Password" : "Personal Access Token"}</label>
                        <IconInput
                            type="password"
                            icon={mdiKey}
                            value={formData.token}
                            setValue={(value) => setFormData({ ...formData, token: value })}
                            placeholder={editCred ? "Leave empty to keep current" : "ghp_xxxx..."}
                        />
                        {editCred && (
                            <span className="form-hint">Leave empty to keep the existing token unchanged</span>
                        )}
                    </div>

                    <div className="dialog-actions">
                        <Button text="Cancel" onClick={closeDialog} type="secondary" />
                        <Button
                            text={editCred ? "Save" : "Add Credential"}
                            onClick={handleSubmit}
                            loading={saving}
                            disabled={saving || !formData.name || !formData.host || (!editCred && !formData.token)}
                        />
                    </div>
                </div>
            </DialogProvider>

            <ActionConfirmDialog
                open={deleteConfirmDialog.open}
                setOpen={(open) => setDeleteConfirmDialog(prev => ({ ...prev, open }))}
                onConfirm={handleDeleteConfirm}
                text={`Are you sure you want to delete "${deleteConfirmDialog.cred?.name}"? Deployments using this credential will lose authentication.`}
            />
        </div>
    );
};
