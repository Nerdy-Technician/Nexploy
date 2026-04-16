import "./styles.sass";
import { DialogProvider } from "@/common/components/Dialog";
import SelectBox from "@/common/components/SelectBox";
import Button from "@/common/components/Button";
import { Icon } from "@mdi/react";
import { mdiAccountPlus, mdiEye, mdiRocketLaunch, mdiShieldAccount } from "@mdi/js";

const PERMISSIONS = [
    { value: "view", label: "View", icon: mdiEye, description: "Read-only access to assigned resources" },
    { value: "deploy", label: "Deploy", icon: mdiRocketLaunch, description: "Can start, stop, restart, and build" },
    { value: "manage", label: "Manage", icon: mdiShieldAccount, description: "Full control over assigned resources" },
];

export const AddMemberDialog = ({ open, onClose, userOptions, memberForm, setMemberForm, onSubmit }) => {
    return (
        <DialogProvider open={open} onClose={onClose}>
            <div className="add-member-dialog">
                <h2>Add Member</h2>
                <div className="form-group">
                    <label>User</label>
                    <SelectBox
                        options={userOptions}
                        selected={memberForm.accountId}
                        setSelected={(v) => setMemberForm({ ...memberForm, accountId: v })}
                        searchable={true}
                    />
                </div>
                <div className="form-group">
                    <label>Permission</label>
                    <div className="permission-cards">
                        {PERMISSIONS.map(perm => (
                            <button
                                key={perm.value}
                                className={`permission-card ${memberForm.permission === perm.value ? "active" : ""} ${perm.value}`}
                                onClick={() => setMemberForm({ ...memberForm, permission: perm.value })}
                                type="button"
                            >
                                <Icon path={perm.icon} className="permission-card-icon" />
                                <span className="permission-card-label">{perm.label}</span>
                                <span className="permission-card-desc">{perm.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <Button text="Add Member" icon={mdiAccountPlus} onClick={onSubmit} />
            </div>
        </DialogProvider>
    );
};
