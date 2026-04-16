import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiFolderOpen, mdiPencil, mdiTrashCan, mdiChevronRight } from "@mdi/js";

export const ProjectCard = ({ project, isAdmin, onClick, onEdit, onDelete }) => {
    return (
        <div className="project-card" onClick={onClick}>
            <div className="project-card-info">
                <Icon path={mdiFolderOpen} className="project-card-icon" />
                <div className="project-card-details">
                    <h3>{project.name}</h3>
                    {project.description && <p>{project.description}</p>}
                </div>
            </div>
            <div className="project-card-actions">
                {isAdmin && (
                    <>
                        <button className="action-btn edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(project); }} title="Edit">
                            <Icon path={mdiPencil} />
                        </button>
                        <button className="action-btn delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(project); }} title="Delete">
                            <Icon path={mdiTrashCan} />
                        </button>
                    </>
                )}
                <Icon path={mdiChevronRight} className="chevron" />
            </div>
        </div>
    );
};
