import "./styles.sass";
import { Icon } from "@mdi/react";
import {
    mdiViewDashboardOutline,
    mdiServerOutline,
    mdiDocker,
    mdiLayers,
    mdiCloudUploadOutline,
    mdiCheckCircleOutline,
    mdiAlertCircleOutline,
    mdiPauseCircleOutline,
    mdiCircleOutline,
    mdiLoading,
    mdiOpenInNew,
    mdiPackageVariant,
} from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect, useMemo } from "react";
import { getRequest } from "@/common/utils/RequestUtil.js";
import { useLiveData } from "@/common/hooks/useLiveData.js";

const STATUS_CONFIG = {
    running: { icon: mdiCheckCircleOutline, className: "running" },
    exited: { icon: mdiAlertCircleOutline, className: "exited" },
    stopped: { icon: mdiAlertCircleOutline, className: "stopped" },
    paused: { icon: mdiPauseCircleOutline, className: "paused" },
    partial: { icon: mdiPauseCircleOutline, className: "partial" },
    online: { icon: mdiCheckCircleOutline, className: "running" },
    offline: { icon: mdiAlertCircleOutline, className: "stopped" },
    pending: { icon: mdiCircleOutline, className: "unknown" },
    unknown: { icon: mdiCircleOutline, className: "unknown" },
};

const getStatusConfig = (status) =>
    STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.unknown;

export const Overview = () => {
    const navigate = useNavigate();

    const [installedApps, setInstalledApps] = useState([]);
    const [appsLoading, setAppsLoading] = useState(true);

    const fetchServers = useCallback(() => getRequest("servers"), []);
    const fetchContainers = useCallback(() => getRequest("containers"), []);
    const fetchStacks = useCallback(() => getRequest("stacks"), []);
    const fetchDeployments = useCallback(() => getRequest("deployments"), []);

    const { data: rawServers, loading: serversLoading } = useLiveData(fetchServers, "servers:updated", { initialData: [] });
    const { data: rawContainers, loading: containersLoading } = useLiveData(fetchContainers, "containers:updated", { initialData: [] });
    const { data: rawStacks, loading: stacksLoading } = useLiveData(fetchStacks, "stacks:updated", { initialData: [] });
    const { data: rawDeployments, loading: deploymentsLoading } = useLiveData(fetchDeployments, "deployments:updated", { initialData: [] });

    const servers = Array.isArray(rawServers) ? rawServers : [];
    const containers = Array.isArray(rawContainers) ? rawContainers : [];
    const stacks = Array.isArray(rawStacks) ? rawStacks : [];
    const deployments = Array.isArray(rawDeployments) ? rawDeployments : [];

    useEffect(() => {
        getRequest("apps/installed").then(data => {
            setInstalledApps(Array.isArray(data) ? data : []);
        }).finally(() => setAppsLoading(false));
    }, []);

    const flatApps = useMemo(() => {
        const rows = [];
        for (const app of installedApps) {
            for (const inst of app.instances) {
                rows.push({ ...app, instanceId: inst.id, serverId: inst.serverId, version: inst.version });
            }
        }
        return rows;
    }, [installedApps]);

    const loading = serversLoading || containersLoading || stacksLoading || deploymentsLoading || appsLoading;

    const serverStats = {
        total: servers.length,
        online: servers.filter(s => s.status === "online").length,
        offline: servers.filter(s => s.status !== "online").length,
    };

    const containerStats = {
        total: containers.length,
        running: containers.filter(c => (c.status || c.state)?.toLowerCase() === "running").length,
        stopped: containers.filter(c => (c.status || c.state)?.toLowerCase() === "exited").length,
    };

    const stackStats = {
        total: stacks.length,
        running: stacks.filter(s => s.status === "running").length,
        stopped: stacks.filter(s => ["stopped", "unknown"].includes(s.status)).length,
    };

    const deploymentStats = {
        total: deployments.length,
    };

    const summaryCards = [
        {
            title: "Servers",
            icon: mdiServerOutline,
            total: serverStats.total,
            detail: `${serverStats.online} online`,
            path: "/servers",
        },
        {
            title: "Containers",
            icon: mdiDocker,
            total: containerStats.total,
            detail: `${containerStats.running} running`,
            path: "/containers",
        },
        {
            title: "Stacks",
            icon: mdiLayers,
            total: stackStats.total,
            detail: `${stackStats.running} running`,
            path: "/stacks",
        },
        {
            title: "Deployments",
            icon: mdiCloudUploadOutline,
            total: deploymentStats.total,
            detail: `${deploymentStats.total} total`,
            path: "/deployments",
        },
    ];

    const recentContainers = containers.slice(0, 6);

    const recentStacks = stacks.slice(0, 6);

    return (
        <div className="overview-page">
            <div className="overview-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Icon path={mdiViewDashboardOutline} />
                    </div>
                    <div className="header-text">
                        <h1>Overview</h1>
                        <p>Your infrastructure at a glance</p>
                    </div>
                </div>
            </div>

            <div className="overview-content">
                {loading ? (
                    <div className="overview-loading">
                        <Icon path={mdiLoading} spin={true} size={2} />
                    </div>
                ) : (
                    <>
                        <div className="summary-cards">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.title}
                                    className="summary-card"
                                    onClick={() => navigate(card.path)}
                                >
                                    <div className="summary-card-icon">
                                        <Icon path={card.icon} />
                                    </div>
                                    <div className="summary-card-info">
                                        <span className="summary-card-total">{card.total}</span>
                                        <span className="summary-card-title">{card.title}</span>
                                    </div>
                                    <span className="summary-card-detail">{card.detail}</span>
                                </div>
                            ))}
                        </div>

                        <div className="overview-sections">
                            <div className="overview-section">
                                <div className="section-header">
                                    <h2>Containers</h2>
                                    <span
                                        className="section-link"
                                        onClick={() => navigate("/containers")}
                                    >
                                        View all
                                        <Icon path={mdiOpenInNew} size={0.6} />
                                    </span>
                                </div>
                                {recentContainers.length > 0 ? (
                                    <div className="overview-list">
                                        {recentContainers.map((c) => {
                                            const state = c.status?.toLowerCase() || c.state?.toLowerCase() || "unknown";
                                            const cfg = getStatusConfig(state);
                                            return (
                                                <div
                                                    key={c.id}
                                                    className="overview-list-item"
                                                    onClick={() => navigate(`/containers/detail/${c.containerId}`)}
                                                >
                                                    <div className={`list-item-status ${cfg.className}`}>
                                                        <Icon path={cfg.icon} />
                                                    </div>
                                                    <div className="list-item-info">
                                                        <span className="list-item-name">{c.name}</span>
                                                        <span className="list-item-sub">{c.image}</span>
                                                    </div>
                                                    <span className={`list-item-badge ${cfg.className}`}>
                                                        {state.charAt(0).toUpperCase() + state.slice(1)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="overview-empty">
                                        <p>No containers found</p>
                                    </div>
                                )}
                            </div>

                            <div className="overview-section">
                                <div className="section-header">
                                    <h2>Stacks</h2>
                                    <span
                                        className="section-link"
                                        onClick={() => navigate("/stacks")}
                                    >
                                        View all
                                        <Icon path={mdiOpenInNew} size={0.6} />
                                    </span>
                                </div>
                                {recentStacks.length > 0 ? (
                                    <div className="overview-list">
                                        {recentStacks.map((s) => {
                                            const cfg = getStatusConfig(s.status);
                                            return (
                                                <div
                                                    key={s.id}
                                                    className="overview-list-item"
                                                    onClick={() => navigate(`/stacks/edit/${s.id}`)}
                                                >
                                                    <div className={`list-item-status ${cfg.className}`}>
                                                        <Icon path={cfg.icon} />
                                                    </div>
                                                    <div className="list-item-info">
                                                        <span className="list-item-name">{s.name}</span>
                                                        <span className="list-item-sub">
                                                            {s.services} service{s.services !== 1 && "s"}
                                                        </span>
                                                    </div>
                                                    <span className={`list-item-badge ${cfg.className}`}>
                                                        {s.status?.charAt(0).toUpperCase() + s.status?.slice(1)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="overview-empty">
                                        <p>No stacks configured</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {flatApps.length > 0 && (
                            <div className="installed-apps-section">
                                <div className="installed-apps-header">
                                    <h2>Installed Apps</h2>
                                    <span
                                        className="section-link"
                                        onClick={() => navigate("/apps/installed")}
                                    >
                                        View all
                                        <Icon path={mdiOpenInNew} size={0.6} />
                                    </span>
                                </div>
                                <div className="installed-apps-grid">
                                    {flatApps.map((app) => (
                                        <div key={app.instanceId} className="installed-app-card">
                                            <div className="installed-app-icon">
                                                {app.hasLogo ? (
                                                    <img src={`/api/apps/${app.source}/${app.slug}/logo`} alt={app.name} />
                                                ) : (
                                                    <Icon path={mdiPackageVariant} />
                                                )}
                                            </div>
                                            <span className="installed-app-name">{app.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
