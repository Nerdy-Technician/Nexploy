import "./styles.sass";
import { Icon } from "@mdi/react";
import { 
    mdiDotsVertical, mdiPlay, mdiStop, mdiRestart, mdiPause, 
    mdiDelete, mdiConsole, mdiTextBox, mdiInformationOutline, mdiDocker
} from "@mdi/js";
import { ContextMenu, ContextMenuItem } from "@/common/components/ContextMenu";
import { useState } from "react";

const STATUS_MAP = { running: "running", exited: "exited", stopped: "exited", paused: "paused", restarting: "restarting" };

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "Unknown";

const getPrimaryPort = (ports) => {
    if (!ports?.length) return "No ports";
    const p = ports[0];
    if (p.PublicPort && p.PrivatePort) return `${p.PublicPort}:${p.PrivatePort}`;
    if (p.host && p.container) return `${p.host}:${p.container}`;
    return p.PrivatePort || p.container || "N/A";
};

export const ContainerCard = ({ container, onClick, onAction, viewMode = "grid" }) => {
    const [contextMenuOpen, setContextMenuOpen] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [menuTrigger, setMenuTrigger] = useState(null);

    const status = container.status?.toLowerCase() || "unknown";
    const statusColor = STATUS_MAP[status] || "unknown";
    const isRunning = status === "running";
    const isStopped = status === "exited" || status === "stopped";
    const isPaused = status === "paused";

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setContextMenuOpen(true);
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuTrigger(e.currentTarget);
        setContextMenuPosition({ x: rect.right - 10, y: rect.bottom + 5 });
        setContextMenuOpen(true);
    };

    const handleAction = (action) => {
        onAction?.(container.containerId, action);
        setContextMenuOpen(false);
    };

    const menuBtn = (
        <button className="container-menu-btn" onClick={handleMenuClick} aria-label="Container options">
            <Icon path={mdiDotsVertical} />
        </button>
    );

    const contextMenu = (
        <ContextMenu
            isOpen={contextMenuOpen}
            position={contextMenuPosition}
            onClose={() => setContextMenuOpen(false)}
            trigger={menuTrigger}
        >
            <ContextMenuItem icon={mdiInformationOutline} label="Details" onClick={() => onClick(container)} />
            <ContextMenuItem icon={mdiConsole} label="Terminal" onClick={() => handleAction('terminal')} disabled={!isRunning} />
            <ContextMenuItem icon={mdiTextBox} label="Logs" onClick={() => handleAction('logs')} />
            {(isStopped || isPaused) && (
                <ContextMenuItem icon={mdiPlay} label="Start" onClick={() => handleAction('start')} />
            )}
            {isRunning && (
                <>
                    <ContextMenuItem icon={mdiStop} label="Stop" onClick={() => handleAction('stop')} />
                    <ContextMenuItem icon={mdiPause} label="Pause" onClick={() => handleAction('pause')} />
                    <ContextMenuItem icon={mdiRestart} label="Restart" onClick={() => handleAction('restart')} />
                </>
            )}
            {isPaused && (
                <ContextMenuItem icon={mdiPlay} label="Unpause" onClick={() => handleAction('unpause')} />
            )}
            <ContextMenuItem icon={mdiDelete} label="Remove" danger onClick={() => handleAction('remove')} disabled={isRunning} />
        </ContextMenu>
    );

    if (viewMode === "list") {
        return (
            <>
                <div className="container-card-list" onClick={() => onClick(container)} onContextMenu={handleContextMenu}>
                    <div className="list-left">
                        <div className={`container-icon-small ${statusColor}`}>
                            <Icon path={mdiDocker} />
                        </div>
                        <div className="list-info">
                            <div className="list-name-row">
                                <h3 className="container-name">{container.name}</h3>
                                <span className={`status-badge ${statusColor}`}>{capitalize(status)}</span>
                            </div>
                            <p className="container-image">{container.image}</p>
                        </div>
                    </div>
                    <div className="list-right">
                        <div className="list-meta">
                            <span className="meta-item">{getPrimaryPort(container.ports)}</span>
                        </div>
                        {menuBtn}
                    </div>
                </div>
                {contextMenu}
            </>
        );
    }

    return (
        <>
            <div className="container-card" onClick={() => onClick(container)} onContextMenu={handleContextMenu}>
                <div className="container-card-header">
                    <div className="container-status-wrapper">
                        <div className={`container-icon ${statusColor}`}>
                            <Icon path={mdiDocker} />
                        </div>
                    </div>
                    {menuBtn}
                </div>
                <div className="container-card-content">
                    <h3 className="container-name">{container.name}</h3>
                    <p className="container-image">{container.image}</p>
                    <div className="container-stats">
                        <div className="stat-item">
                            <span className="stat-label">Status</span>
                            <span className="stat-value">{capitalize(status)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Port</span>
                            <span className="stat-value">{getPrimaryPort(container.ports)}</span>
                        </div>
                    </div>
                </div>
            </div>
            {contextMenu}
        </>
    );
};
