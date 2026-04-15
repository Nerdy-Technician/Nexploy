import "./styles.sass";
import { getRequest, postRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import StackCard from "../../components/StackCard";
import { useState, useMemo, useEffect, useCallback } from "react";
import IconInput from "@/common/components/IconInput";
import SelectBox from "@/common/components/SelectBox";
import TabSwitcher from "@/common/components/TabSwitcher";
import { mdiMagnify, mdiViewGrid, mdiViewList, mdiRefresh, mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import Button from "@/common/components/Button";

const STATUS_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Running", value: "running" },
    { label: "Stopped", value: "stopped" },
    { label: "Partial", value: "partial" },
    { label: "Orphaned", value: "orphaned" },
];

const VIEW_MODES = [
    { key: "grid", label: "Grid", icon: mdiViewGrid },
    { key: "list", label: "List", icon: mdiViewList },
];

export const AllStacks = () => {
    const navigate = useNavigate();
    const { sendToast } = useToast();
    const [stacks, setStacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [viewMode, setViewMode] = useState("grid");

    const fetchStacks = useCallback(async () => {
        try {
            setStacks(await getRequest("stacks"));
        } catch {
            sendToast("Error", "Failed to load stacks");
        } finally {
            setLoading(false);
        }
    }, [sendToast]);

    useEffect(() => {
        fetchStacks();
        const interval = setInterval(fetchStacks, 10000);
        return () => clearInterval(interval);
    }, [fetchStacks]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await postRequest("stacks/refresh");
            sendToast("Success", "Stack refresh started");
            setTimeout(fetchStacks, 2000);
        } catch {
            sendToast("Error", "Failed to refresh stacks");
        } finally {
            setRefreshing(false);
        }
    };

    const filteredStacks = useMemo(() => {
        let filtered = stacks;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.directory?.toLowerCase().includes(q)
            );
        }

        if (selectedStatus !== "all") {
            filtered = filtered.filter(s => s.status === selectedStatus);
        }

        return filtered;
    }, [stacks, searchQuery, selectedStatus]);

    const handleStackAction = async (stackId, action) => {
        if (action === "delete") {
            try {
                await deleteRequest(`stacks/${stackId}`);
                sendToast("Success", "Stack deleted");
                fetchStacks();
            } catch (err) {
                sendToast("Error", err.message || "Failed to delete stack");
            }
            return;
        }

        try {
            await postRequest(`stacks/${stackId}/action`, { action });
            sendToast("Success", `Stack ${action} successful`);
            fetchStacks();
        } catch (err) {
            sendToast("Error", err.message || `Failed to ${action} stack`);
        }
    };

    if (loading) {
        return (
            <div className="all-stacks-page loading-state">
                <Icon path={mdiLoading} spin={true} size={2} />
                <p>Loading stacks...</p>
            </div>
        );
    }

    return (
        <div className="all-stacks-page">
            <div className="stacks-filters">
                <div className="stacks-search">
                    <IconInput
                        type="text"
                        placeholder="Search stacks..."
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
                <TabSwitcher
                    tabs={VIEW_MODES}
                    activeTab={viewMode}
                    onTabChange={setViewMode}
                    iconOnly
                />
            </div>

            <div className="stacks-results">
                {filteredStacks.length > 0 ? (
                    <div className={`stacks-${viewMode}`}>
                        {filteredStacks.map((stack) => (
                            <StackCard
                                key={stack.id}
                                stack={stack}
                                onClick={(s) => navigate(`/stacks/edit/${s.id}`)}
                                onAction={handleStackAction}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <Icon path={mdiMagnify} />
                        <h3>No stacks found</h3>
                        <p>{stacks.length === 0 ? "No stacks have been discovered yet. Make sure you have active servers." : "Try adjusting your search or filters"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
