import "./styles.sass";
import { DialogProvider } from "@/common/components/Dialog";
import SelectBox from "@/common/components/SelectBox";
import Button from "@/common/components/Button";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiServerNetwork, mdiLayersTriple, mdiDocker, mdiRocketLaunch } from "@mdi/js";

const RESOURCE_TYPES = [
    { value: "server", label: "Server", icon: mdiServerNetwork, hint: "Grants access to all stacks & containers on it" },
    { value: "stack", label: "Stack", icon: mdiLayersTriple, hint: "A Docker Compose stack" },
    { value: "container", label: "Container", icon: mdiDocker, hint: "An individual container" },
    { value: "deployment", label: "Deployment", icon: mdiRocketLaunch, hint: "A Git-based deployment" },
];

export const AssignResourceDialog = ({ open, onClose, resourceForm, setResourceForm, resourceOptions, onSubmit }) => {
    return (
        <DialogProvider open={open} onClose={onClose}>
            <div className="assign-resource-dialog">
                <h2>Assign Resource</h2>
                <div className="form-group">
                    <label>Type</label>
                    <div className="resource-type-grid">
                        {RESOURCE_TYPES.map(type => (
                            <button
                                key={type.value}
                                className={`resource-type-tile ${resourceForm.resourceType === type.value ? "active" : ""}`}
                                onClick={() => setResourceForm({ ...resourceForm, resourceType: type.value, resourceId: null })}
                                type="button"
                            >
                                <Icon path={type.icon} className="tile-icon" />
                                <span className="tile-label">{type.label}</span>
                            </button>
                        ))}
                    </div>
                    <p className="type-hint">
                        {RESOURCE_TYPES.find(t => t.value === resourceForm.resourceType)?.hint}
                    </p>
                </div>
                <div className="form-group">
                    <label>Resource</label>
                    <SelectBox
                        options={resourceOptions}
                        selected={resourceForm.resourceId}
                        setSelected={(v) => setResourceForm({ ...resourceForm, resourceId: v })}
                        searchable={true}
                    />
                </div>
                <Button text="Assign Resource" icon={mdiPlus} onClick={onSubmit} />
            </div>
        </DialogProvider>
    );
};
