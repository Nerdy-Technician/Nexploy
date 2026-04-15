import "./styles.sass";
import { getRequest, postRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import ServerCard from "../../components/ServerCard";
import Icon from "@mdi/react";
import { mdiLoading, mdiDelete, mdiRefresh, mdiConnection, mdiMapMarker } from "@mdi/js";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import { ContextMenu, ContextMenuItem, useContextMenu } from "@/common/components/ContextMenu";
import { ActionConfirmDialog } from "@/common/components/ActionConfirmDialog/ActionConfirmDialog.jsx";

export const AllServers = () => {
    const { sendToast } = useToast();
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextServer, setContextServer] = useState(null);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
    const contextMenu = useContextMenu();

    const fetchServers = useCallback(async () => {
        try {
            const data = await getRequest("servers");
            setServers(data);
        } catch (err) {
            sendToast("Error", "Failed to load servers");
        } finally {
            setLoading(false);
        }
    }, [sendToast]);

    useEffect(() => {
        fetchServers();

        const interval = setInterval(fetchServers, 5000);
        return () => clearInterval(interval);
    }, [fetchServers]);

    const handleServerClick = (server) => {
        console.log("Server clicked:", server);
    };

    const handleMenuClick = (e, server) => {
        e.preventDefault();
        e.stopPropagation();
        setContextServer(server);
        contextMenu.open(e);
    };

    const handleReprovision = async (server) => {
        try {
            await postRequest(`servers/${server.id}/reprovision`);
            sendToast("Success", "Re-provisioning started");
            fetchServers();
        } catch (err) {
            sendToast("Error", err.message || "Failed to start re-provisioning");
        }
    };

    const handleTestConnection = async () => {
        if (!contextServer) return;
        try {
            await postRequest(`servers/${contextServer.id}/test`);
            sendToast("Success", "Connection successful");
        } catch (err) {
            sendToast("Error", err.message || "Connection failed");
        }
    };

    const handleDelete = async () => {
        if (!contextServer) return;
        try {
            await deleteRequest(`servers/${contextServer.id}`);
            sendToast("Success", "Server deleted");
            fetchServers();
        } catch (err) {
            sendToast("Error", err.message || "Failed to delete server");
        }
    };

    const serversByLocation = useMemo(() => {
        const groups = {};
        for (const server of servers) {
            const key = (server.location || "Uncategorized").toLowerCase();
            if (!groups[key]) {
                groups[key] = { label: server.location || "Uncategorized", servers: [] };
            }
            groups[key].servers.push(server);
        }
        return Object.values(groups);
    }, [servers]);

    if (loading) {
        return (
            <div className="all-servers loading-state">
                <Icon path={mdiLoading} spin={true} size={2} />
                <p>Loading servers...</p>
            </div>
        );
    }

    return (
        <div className="all-servers">
            {servers.length === 0 ? (
                <div className="empty-state">
                    <p>No servers added yet. Click "Add Server" to get started.</p>
                </div>
            ) : (
                serversByLocation.map((group) => (
                    <div className="servers-section" key={group.label}>
                        <div className="section-header">
                            <div className="header-left">
                                <Icon path={mdiMapMarker} />
                                <h2>{group.label}</h2>
                                <span className="badge">{group.servers.length}</span>
                            </div>
                            <div className="header-line" />
                        </div>
                        <div className="servers-grid">
                            {group.servers.map((server) => (
                                <ServerCard
                                    key={server.id}
                                    server={server}
                                    onClick={handleServerClick}
                                    onMenuClick={handleMenuClick}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}

            <ActionConfirmDialog
                open={confirmDeleteDialogOpen}
                setOpen={setConfirmDeleteDialogOpen}
                onConfirm={handleDelete}
                text={`Are you sure you want to delete "${contextServer?.name}"?`}
            />

            <ContextMenu
                isOpen={contextMenu.isOpen}
                position={contextMenu.position}
                onClose={contextMenu.close}
                trigger={contextMenu.triggerRef}
            >
                {contextServer?.status === "error" && (
                    <ContextMenuItem
                        icon={mdiRefresh}
                        label="Retry Provisioning"
                        onClick={() => handleReprovision(contextServer)}
                    />
                )}
                <ContextMenuItem
                    icon={mdiConnection}
                    label="Test Connection"
                    onClick={handleTestConnection}
                />
                <ContextMenuItem
                    icon={mdiDelete}
                    label="Delete Server"
                    onClick={() => setConfirmDeleteDialogOpen(true)}
                    danger
                />
            </ContextMenu>
        </div>
    );
};
