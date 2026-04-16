import "./styles.sass";
import Button from "@/common/components/Button";
import { Icon } from "@mdi/react";
import {
    mdiServerNetwork,
    mdiLayersTriple,
    mdiDocker,
    mdiCloudUploadOutline,
    mdiPlus,
    mdiClose,
} from "@mdi/js";

const RESOURCE_TYPE_ICONS = {
    server: mdiServerNetwork,
    stack: mdiLayersTriple,
    container: mdiDocker,
    deployment: mdiCloudUploadOutline,
};

export const ResourceList = ({ resources, isAdmin, getResourceName, onAddResource, onRemoveResource }) => {
    return (
        <div className="resource-list-section">
            <div className="section-header">
                <div className="header-content">
                    <h3><Icon path={mdiServerNetwork} /> Resources</h3>
                </div>
                {isAdmin && <Button text="Assign Resource" icon={mdiPlus} onClick={onAddResource} type="secondary" />}
            </div>

            <div className="resource-list">
                {resources.length === 0 ? (
                    <div className="empty-state small">
                        <p>No resources assigned yet</p>
                    </div>
                ) : (
                    resources.map(resource => (
                        <div key={resource.id} className="resource-item">
                            <div className="resource-info">
                                <Icon
                                    path={RESOURCE_TYPE_ICONS[resource.resourceType] || mdiServerNetwork}
                                    className="resource-icon"
                                />
                                <div className="resource-details">
                                    <span className="resource-name">{getResourceName(resource)}</span>
                                    <span className="resource-type-badge">{resource.resourceType}</span>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="resource-actions">
                                    <button className="action-btn delete-btn" onClick={() => onRemoveResource(resource)} title="Remove">
                                        <Icon path={mdiClose} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
