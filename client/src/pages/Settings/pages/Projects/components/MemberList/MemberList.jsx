import "./styles.sass";
import Button from "@/common/components/Button";
import { Icon } from "@mdi/react";
import {
    mdiAccountGroup,
    mdiAccountPlus,
    mdiShieldAccount,
    mdiAccount,
    mdiClose,
    mdiEye,
    mdiCloudUploadOutline,
} from "@mdi/js";

const PERMISSIONS = [
    { value: "view", label: "View", icon: mdiEye },
    { value: "deploy", label: "Deploy", icon: mdiCloudUploadOutline },
    { value: "manage", label: "Manage", icon: mdiShieldAccount },
];

export const MemberList = ({ members, isAdmin, onAddMember, onUpdatePermission, onRemoveMember }) => {
    return (
        <div className="member-list-section">
            <div className="section-header">
                <div className="header-content">
                    <h3><Icon path={mdiAccountGroup} /> Members</h3>
                </div>
                {isAdmin && <Button text="Add Member" icon={mdiAccountPlus} onClick={onAddMember} type="secondary" />}
            </div>

            <div className="member-list">
                {members.length === 0 ? (
                    <div className="empty-state small">
                        <p>No members assigned yet</p>
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member.id} className="member-item">
                            <div className="member-info">
                                <Icon
                                    path={member.account?.role === "admin" ? mdiShieldAccount : mdiAccount}
                                    className={`member-icon ${member.account?.role === "admin" ? "admin" : ""}`}
                                />
                                <div className="member-details">
                                    <span className="member-name">
                                        {member.account ? `${member.account.firstName} ${member.account.lastName}` : `User #${member.accountId}`}
                                    </span>
                                    <span className="member-username">@{member.account?.username}</span>
                                </div>
                            </div>
                            <div className="member-actions">
                                {isAdmin ? (
                                    <div className="permission-toggle">
                                        {PERMISSIONS.map(perm => (
                                            <button
                                                key={perm.value}
                                                className={`perm-chip ${perm.value} ${member.permission === perm.value ? "active" : ""}`}
                                                onClick={() => onUpdatePermission(member.id, perm.value)}
                                                title={perm.label}
                                                type="button"
                                            >
                                                <Icon path={perm.icon} />
                                                <span>{perm.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className={`permission-badge ${member.permission}`}>
                                        <Icon path={PERMISSIONS.find(p => p.value === member.permission)?.icon} />
                                        {member.permission}
                                    </span>
                                )}
                                {isAdmin && (
                                    <button className="action-btn delete-btn" onClick={() => onRemoveMember(member)} title="Remove">
                                        <Icon path={mdiClose} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
