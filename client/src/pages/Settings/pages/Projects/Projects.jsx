import "./styles.sass";
import { useEffect, useState, useCallback, useContext } from "react";
import { getRequest, postRequest, patchRequest, deleteRequest } from "@/common/utils/RequestUtil.js";
import Button from "@/common/components/Button";
import { useToast } from "@/common/contexts/ToastContext.jsx";
import ActionConfirmDialog from "@/common/components/ActionConfirmDialog";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiFolder, mdiChevronLeft } from "@mdi/js";
import ProjectCard from "./components/ProjectCard";
import ProjectDialog from "./components/ProjectDialog";
import AddMemberDialog from "./components/AddMemberDialog";
import AssignResourceDialog from "./components/AssignResourceDialog";
import MemberList from "./components/MemberList";
import ResourceList from "./components/ResourceList";

export const Projects = () => {
    const { user } = useContext(UserContext);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);

    const [availableServers, setAvailableServers] = useState([]);
    const [availableStacks, setAvailableStacks] = useState([]);
    const [availableContainers, setAvailableContainers] = useState([]);
    const [availableDeployments, setAvailableDeployments] = useState([]);

    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [projectForm, setProjectForm] = useState({ name: "", description: "" });

    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [memberForm, setMemberForm] = useState({ accountId: null, permission: "view" });

    const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
    const [resourceForm, setResourceForm] = useState({ resourceType: "server", resourceId: null });

    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, text: "" });

    const { sendToast } = useToast();

    const loadProjects = useCallback(async () => {
        try {
            const data = await getRequest("projects");
            setProjects(data);
        } catch {
            sendToast("Error", "Failed to load projects");
        }
    }, [sendToast]);

    const loadProjectDetails = useCallback(async (projectId) => {
        try {
            const [membersData, resourcesData] = await Promise.all([
                getRequest(`projects/${projectId}/members`),
                getRequest(`projects/${projectId}/resources`),
            ]);
            setMembers(membersData);
            setResources(resourcesData);
        } catch {
            sendToast("Error", "Failed to load project details");
        }
    }, [sendToast]);

    const loadAvailableResources = useCallback(async () => {
        try {
            const [servers, stacks, containers, deployments] = await Promise.all([
                getRequest("servers"),
                getRequest("stacks"),
                getRequest("containers"),
                getRequest("deployments"),
            ]);
            setAvailableServers(servers);
            setAvailableStacks(stacks);
            setAvailableContainers(containers);
            setAvailableDeployments(deployments);
        } catch {}
    }, []);

    const loadUsers = useCallback(async () => {
        if (user?.role !== "admin") return;
        try {
            const data = await getRequest("users/list");
            setUsers(Array.isArray(data) ? data : data.users || []);
        } catch {}
    }, [user?.role]);

    useEffect(() => {
        loadProjects();
        loadAvailableResources();
        loadUsers();
    }, [loadProjects, loadAvailableResources, loadUsers]);

    useEffect(() => {
        if (selectedProject) loadProjectDetails(selectedProject.id);
    }, [selectedProject, loadProjectDetails]);

    const openCreateProject = () => {
        setEditProject(null);
        setProjectForm({ name: "", description: "" });
        setProjectDialogOpen(true);
    };

    const openEditProject = (project) => {
        setEditProject(project);
        setProjectForm({ name: project.name, description: project.description || "" });
        setProjectDialogOpen(true);
    };

    const handleProjectSubmit = async () => {
        if (!projectForm.name) {
            sendToast("Error", "Project name is required");
            return;
        }
        try {
            if (editProject) {
                await patchRequest(`projects/${editProject.id}`, projectForm);
                sendToast("Success", "Project updated");
            } else {
                await postRequest("projects", projectForm);
                sendToast("Success", "Project created");
            }
            setProjectDialogOpen(false);
            loadProjects();
            if (editProject && selectedProject?.id === editProject.id) {
                setSelectedProject({ ...selectedProject, ...projectForm });
            }
        } catch (error) {
            sendToast("Error", error.message || "Failed to save project");
        }
    };

    const handleDeleteProject = async () => {
        try {
            await deleteRequest(`projects/${deleteConfirm.id}`);
            sendToast("Success", "Project deleted");
            if (selectedProject?.id === deleteConfirm.id) setSelectedProject(null);
            loadProjects();
        } catch (error) {
            sendToast("Error", error.message || "Failed to delete project");
        }
        setDeleteConfirm({ open: false, type: null, id: null, text: "" });
    };

    const openAddMember = () => {
        setMemberForm({ accountId: null, permission: "view" });
        setMemberDialogOpen(true);
    };

    const handleAddMember = async () => {
        if (!memberForm.accountId) {
            sendToast("Error", "Please select a user");
            return;
        }
        try {
            await postRequest(`projects/${selectedProject.id}/members`, memberForm);
            sendToast("Success", "Member added");
            setMemberDialogOpen(false);
            loadProjectDetails(selectedProject.id);
        } catch (error) {
            sendToast("Error", error.message || "Failed to add member");
        }
    };

    const handleUpdatePermission = async (memberId, permission) => {
        try {
            await patchRequest(`projects/${selectedProject.id}/members/${memberId}`, { permission });
            loadProjectDetails(selectedProject.id);
        } catch (error) {
            sendToast("Error", error.message || "Failed to update permission");
        }
    };

    const handleRemoveMember = async () => {
        try {
            await deleteRequest(`projects/${selectedProject.id}/members/${deleteConfirm.id}`);
            sendToast("Success", "Member removed");
            loadProjectDetails(selectedProject.id);
        } catch (error) {
            sendToast("Error", error.message || "Failed to remove member");
        }
        setDeleteConfirm({ open: false, type: null, id: null, text: "" });
    };

    const openAddResource = () => {
        setResourceForm({ resourceType: "server", resourceId: null });
        setResourceDialogOpen(true);
    };

    const getResourceOptions = () => {
        switch (resourceForm.resourceType) {
            case "server":
                return availableServers.map(s => ({ label: s.name || s.host, value: s.id }));
            case "stack":
                return availableStacks.map(s => ({ label: s.name, value: s.id }));
            case "container":
                return availableContainers.map(c => ({ label: c.name || c.containerId, value: c.id }));
            case "deployment":
                return availableDeployments.map(d => ({ label: d.name || d.repoUrl, value: d.id }));
            default:
                return [];
        }
    };

    const handleAddResource = async () => {
        if (!resourceForm.resourceId) {
            sendToast("Error", "Please select a resource");
            return;
        }
        try {
            await postRequest(`projects/${selectedProject.id}/resources`, resourceForm);
            sendToast("Success", "Resource added");
            setResourceDialogOpen(false);
            loadProjectDetails(selectedProject.id);
        } catch (error) {
            sendToast("Error", error.message || "Failed to add resource");
        }
    };

    const handleRemoveResource = async () => {
        try {
            await deleteRequest(`projects/${selectedProject.id}/resources/${deleteConfirm.id}`);
            sendToast("Success", "Resource removed");
            loadProjectDetails(selectedProject.id);
        } catch (error) {
            sendToast("Error", error.message || "Failed to remove resource");
        }
        setDeleteConfirm({ open: false, type: null, id: null, text: "" });
    };

    const getResourceName = (resource) => {
        const { resourceType, resourceId } = resource;
        switch (resourceType) {
            case "server": return availableServers.find(s => s.id === resourceId)?.name || `Server #${resourceId}`;
            case "stack": return availableStacks.find(s => s.id === resourceId)?.name || `Stack #${resourceId}`;
            case "container": {
                const c = availableContainers.find(c => c.id === resourceId);
                return c?.name || c?.containerId || `Container #${resourceId}`;
            }
            case "deployment": {
                const d = availableDeployments.find(d => d.id === resourceId);
                return d?.name || d?.repoUrl || `Deployment #${resourceId}`;
            }
            default: return `${resourceType} #${resourceId}`;
        }
    };

    const availableUsers = users.filter(u =>
        u.role !== "admin" && !members.some(m => m.accountId === u.id)
    );
    const userOptions = availableUsers.map(u => ({
        label: `${u.firstName} ${u.lastName} (@${u.username})`,
        value: u.id,
    }));

    const isAdmin = user?.role === "admin";

    const handleDeleteConfirm = () => {
        if (deleteConfirm.type === "project") handleDeleteProject();
        else if (deleteConfirm.type === "member") handleRemoveMember();
        else if (deleteConfirm.type === "resource") handleRemoveResource();
    };

    return (
        <div className="projects-page">
            <ActionConfirmDialog
                open={deleteConfirm.open}
                setOpen={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
                text={deleteConfirm.text}
                onConfirm={handleDeleteConfirm}
            />

            <ProjectDialog
                open={projectDialogOpen}
                onClose={() => setProjectDialogOpen(false)}
                editProject={editProject}
                projectForm={projectForm}
                setProjectForm={setProjectForm}
                onSubmit={handleProjectSubmit}
            />

            <AddMemberDialog
                open={memberDialogOpen}
                onClose={() => setMemberDialogOpen(false)}
                userOptions={userOptions}
                memberForm={memberForm}
                setMemberForm={setMemberForm}
                onSubmit={handleAddMember}
            />

            <AssignResourceDialog
                open={resourceDialogOpen}
                onClose={() => setResourceDialogOpen(false)}
                resourceForm={resourceForm}
                setResourceForm={setResourceForm}
                resourceOptions={getResourceOptions()}
                onSubmit={handleAddResource}
            />

            {!selectedProject ? (
                <div className="projects-list-view">
                    <div className="section-header">
                        <div className="header-content">
                            <h2>Projects</h2>
                            <p>Organize resources and manage user access through projects</p>
                        </div>
                        {isAdmin && <Button text="New Project" icon={mdiPlus} onClick={openCreateProject} />}
                    </div>

                    <div className="projects-list">
                        {projects.length === 0 ? (
                            <div className="empty-state">
                                <Icon path={mdiFolder} />
                                <h2>No projects yet</h2>
                                <p>Create a project to organize resources and manage user access</p>
                            </div>
                        ) : (
                            projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    isAdmin={isAdmin}
                                    onClick={() => setSelectedProject(project)}
                                    onEdit={openEditProject}
                                    onDelete={(p) => setDeleteConfirm({
                                        open: true, type: "project", id: p.id,
                                        text: `Delete project "${p.name}"? All member and resource assignments will be removed.`,
                                    })}
                                />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="project-detail-view">
                    <div className="detail-header">
                        <button className="back-btn" onClick={() => setSelectedProject(null)}>
                            <Icon path={mdiChevronLeft} />
                            <span>Projects</span>
                        </button>
                        <h2>{selectedProject.name}</h2>
                        {selectedProject.description && <p className="project-description">{selectedProject.description}</p>}
                    </div>

                    <MemberList
                        members={members}
                        isAdmin={isAdmin}
                        onAddMember={openAddMember}
                        onUpdatePermission={handleUpdatePermission}
                        onRemoveMember={(member) => setDeleteConfirm({
                            open: true, type: "member", id: member.id,
                            text: `Remove ${member.account?.username || "this user"} from the project?`,
                        })}
                    />

                    <ResourceList
                        resources={resources}
                        isAdmin={isAdmin}
                        getResourceName={getResourceName}
                        onAddResource={openAddResource}
                        onRemoveResource={(resource) => setDeleteConfirm({
                            open: true, type: "resource", id: resource.id,
                            text: `Remove this ${resource.resourceType} from the project?`,
                        })}
                    />
                </div>
            )}
        </div>
    );
};
