import "./styles.sass";
import { DialogProvider } from "@/common/components/Dialog";
import IconInput from "@/common/components/IconInput";
import Button from "@/common/components/Button";
import { mdiFormTextbox, mdiTextBoxOutline, mdiPlus, mdiPencil } from "@mdi/js";

export const ProjectDialog = ({ open, onClose, editProject, projectForm, setProjectForm, onSubmit }) => {
    return (
        <DialogProvider open={open} onClose={onClose}>
            <div className="project-dialog" onKeyDown={(e) => e.key === "Enter" && onSubmit()}>
                <h2>{editProject ? "Edit Project" : "Create Project"}</h2>
                <div className="form-group">
                    <label>Name</label>
                    <IconInput
                        type="text"
                        icon={mdiFormTextbox}
                        value={projectForm.name}
                        setValue={(v) => setProjectForm({ ...projectForm, name: v })}
                        placeholder="My Project"
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <IconInput
                        type="text"
                        icon={mdiTextBoxOutline}
                        value={projectForm.description}
                        setValue={(v) => setProjectForm({ ...projectForm, description: v })}
                        placeholder="Optional description"
                    />
                </div>
                <Button text={editProject ? "Save" : "Create"} icon={editProject ? mdiPencil : mdiPlus} onClick={onSubmit} />
            </div>
        </DialogProvider>
    );
};
