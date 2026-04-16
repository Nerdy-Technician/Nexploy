import "./styles.sass";
import { getRequest, postRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import { useLiveData } from "@/common/hooks/useLiveData.js";
import StackCard from "../../components/StackCard";
import { useState, useMemo, useCallback } from "react";
import IconInput from "@/common/components/IconInput";
import SelectBox from "@/common/components/SelectBox";
import TabSwitcher from "@/common/components/TabSwitcher";
import { mdiMagnify, mdiViewGrid, mdiViewList, mdiLoading } from "@mdi/js";
import { Icon } from "@mdi/react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/common/contexts/ToastContext.jsx";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [actionLoading, setActionLoading] = useState(null);

    const fetchStacks = useCallback(() => getRequest("stacks"), []);
    const { data: stacks, loading } = useLiveData(fetchStacks, "stacks:updated", { initialData: [] });

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
            setActionLoading({ id: stackId, action });
            try {
                await deleteRequest(`stacks/${stackId}`);
                sendToast("Success", "Stack deleted");
            } catch (err) {
                sendToast("Error", err.message || "Failed to delete stack");
            } finally {
                setActionLoading(null);
            }
            return;
        }

        setActionLoading({ id: stackId, action });
        try {
            await postRequest(`stacks/${stackId}/action`, { action });
            sendToast("Success", `Stack ${action} successful`);
        } catch (err) {
            sendToast("Error", err.message || `Failed to ${action} stack`);
        } finally {
            setActionLoading(null);
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
                                actionLoading={actionLoading?.id === stack.id ? actionLoading.action : null}
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
