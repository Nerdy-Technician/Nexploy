import "./styles.sass";
import { getRequest, postRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import ContainerCard from "../../components/ContainerCard";
import { useState, useMemo, useEffect, useCallback } from "react";
import { IconInput } from "@/common/components/IconInput/IconInput.jsx";
import { SelectBox } from "@/common/components/SelectBox/SelectBox.jsx";
import TabSwitcher from "@/common/components/TabSwitcher";
import { mdiMagnify, mdiViewGrid, mdiViewList, mdiRefresh, mdiLoading } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import { Button } from "@/common/components/Button/Button.jsx";

const STATUS_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Running", value: "running" },
    { label: "Exited", value: "exited" },
    { label: "Paused", value: "paused" },
    { label: "Restarting", value: "restarting" },
];

const VIEW_MODES = [
    { key: "grid", label: "Grid", icon: mdiViewGrid },
    { key: "list", label: "List", icon: mdiViewList },
];

export const AllContainers = () => {
    const navigate = useNavigate();
    const { sendToast } = useToast();
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [viewMode, setViewMode] = useState("grid");

    const fetchContainers = useCallback(async () => {
        try {
            setContainers(await getRequest("containers"));
        } catch {
            sendToast("Error", "Failed to load containers");
        } finally {
            setLoading(false);
        }
    }, [sendToast]);

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, 10000);
        return () => clearInterval(interval);
    }, [fetchContainers]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await postRequest("containers/refresh");
            sendToast("Success", "Container refresh started");
            setTimeout(fetchContainers, 2000);
        } catch {
            sendToast("Error", "Failed to refresh containers");
        } finally {
            setRefreshing(false);
        }
    };

    const filteredContainers = useMemo(() => {
        let filtered = containers;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.image.toLowerCase().includes(q) ||
                c.containerId?.toLowerCase().includes(q)
            );
        }
        if (selectedStatus !== "all") {
            filtered = filtered.filter(c => {
                const state = c.state?.toLowerCase() || c.status?.toLowerCase();
                return state === selectedStatus;
            });
        }
        return filtered;
    }, [containers, searchQuery, selectedStatus]);

    const handleContainerAction = async (containerId, action) => {
        if (action === "terminal" || action === "logs") {
            navigate(`/containers/detail/${containerId}?tab=${action}`);
            return;
        }
        if (action === "remove") {
            try {
                await deleteRequest(`containers/${containerId}`);
                sendToast("Success", "Container removed");
                fetchContainers();
            } catch (err) {
                sendToast("Error", err.message || "Failed to remove container");
            }
            return;
        }
        try {
            await postRequest(`containers/${containerId}/action`, { action });
            sendToast("Success", `Container ${action} successful`);
            fetchContainers();
        } catch (err) {
            sendToast("Error", err.message || `Failed to ${action} container`);
        }
    };

    if (loading) {
        return (
            <div className="all-containers-page loading-state">
                <Icon path={mdiLoading} spin={true} size={2} />
                <p>Loading containers...</p>
            </div>
        );
    }

    return (
        <div className="all-containers-page">
            <div className="containers-filters">
                <div className="containers-search">
                    <IconInput
                        type="text"
                        placeholder="Search containers..."
                        icon={mdiMagnify}
                        value={searchQuery}
                        setValue={setSearchQuery}
                    />
                </div>
                <div className="filter-group">
                    <SelectBox
                        options={STATUS_OPTIONS}
                        selected={selectedStatus}
                        setSelected={setSelectedStatus}
                    />
                </div>
                <Button
                    icon={refreshing ? mdiLoading : mdiRefresh}
                    text="Refresh"
                    type="secondary"
                    onClick={handleRefresh}
                    disabled={refreshing}
                />
                <TabSwitcher tabs={VIEW_MODES} activeTab={viewMode} onTabChange={setViewMode} iconOnly />
            </div>

            <div className="containers-results">
                {filteredContainers.length > 0 ? (
                    <div className={`containers-${viewMode}`}>
                        {filteredContainers.map((container) => (
                            <ContainerCard
                                key={container.id}
                                container={container}
                                onClick={(c) => navigate(`/containers/detail/${c.containerId}`)}
                                onAction={handleContainerAction}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <Icon path={mdiMagnify} />
                        <h3>No containers found</h3>
                        <p>{containers.length === 0 ? "No containers have been discovered yet. Make sure you have active servers." : "Try adjusting your search or filters"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
