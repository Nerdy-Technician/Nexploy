import "./styles.sass";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import { getRequest, deleteRequest, patchRequest, postRequest } from "@/common/utils/RequestUtil.js";
import Button from "@/common/components/Button";
import PaginatedTable from "@/common/components/PaginatedTable";
import Icon from "@mdi/react";
import {
    mdiAccount,
    mdiDotsVertical,
    mdiLock,
    mdiShieldAccount,
    mdiKey,
    mdiSecurity,
    mdiAccountRemove,
    mdiLogin,
    mdiPlus,
    mdiMagnify,
    mdiAccountCircleOutline,
} from "@mdi/js";
import CreateUserDialog from "./components/CreateUserDialog";
import { ContextMenu, ContextMenuItem, useContextMenu } from "@/common/components/ContextMenu";
import { ActionConfirmDialog } from "@/common/components/ActionConfirmDialog/ActionConfirmDialog.jsx";
import PasswordChange from "@/pages/Settings/pages/Account/dialogs/PasswordChange";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 25;

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { user, overrideToken } = useContext(UserContext);
    const navigate = useNavigate();

    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
    const [contextUserId, setContextUserId] = useState(null);
    const [passwordChangeDialogOpen, setPasswordChangeDialogOpen] = useState(false);
    const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
    const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

    const contextMenu = useContextMenu();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getRequest("users/list");
            const allUsers = Array.isArray(response) ? response : (response.users || []);
            const totalCount = Array.isArray(response) ? response.length : (response.total || allUsers.length);

            const filtered = debouncedSearch
                ? allUsers.filter(u =>
                    `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(debouncedSearch.toLowerCase())
                )
                : allUsers;

            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            setUsers(filtered.slice(offset, offset + ITEMS_PER_PAGE));
            setTotal(filtered.length);
        } catch (error) {
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openContextMenu = (e, userId) => {
        e.stopPropagation();
        setContextUserId(userId);
        contextMenu.open(e);
    };

    const deleteUser = (userId) => {
        deleteRequest(`users/${userId}`).then(() => {
            loadUsers();
        });
    };

    const updateRole = (userId, role) => {
        patchRequest(`users/${userId}/role`, { role: role }).then(() => {
            loadUsers();
        });
    };

    const loginAsUser = (userId) => {
        postRequest(`users/${userId}/login`).then(response => {
            overrideToken(response.token);
            navigate("/servers");
        });
    };

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const pagination = useMemo(() => ({
        total,
        currentPage,
        itemsPerPage: ITEMS_PER_PAGE,
    }), [total, currentPage]);

    const contextUser = users.find(u => u.id === contextUserId);

    const columns = useMemo(() => [
        {
            key: "user",
            label: "User",
            icon: mdiAccountCircleOutline,
            className: "user-cell-wrapper",
            render: (currentUser) => (
                <div className="user-cell">
                    <div className={`user-icon ${currentUser.role === "admin" ? "primary" : "default"}`}>
                        <Icon path={currentUser.role === "admin" ? mdiShieldAccount : mdiAccount} />
                    </div>
                    <div className="user-info">
                        <span className="name">{currentUser.firstName} {currentUser.lastName}</span>
                        <span className="username">@{currentUser.username}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "role",
            label: "Role",
            icon: mdiShieldAccount,
            mobileLabel: "Role",
            render: (currentUser) => (
                <span className={`role-badge ${currentUser.role}`}>
                    {currentUser.role === "admin" ? "Admin" : "User"}
                </span>
            ),
        },
        {
            key: "totp",
            label: "Two-Factor",
            icon: mdiLock,
            mobileLabel: "2FA",
            render: (currentUser) => (
                <div className={`totp-badge ${currentUser.totpEnabled ? "enabled" : "disabled"}`}>
                    <Icon path={mdiLock} />
                    <span>{currentUser.totpEnabled ? "Enabled" : "Disabled"}</span>
                </div>
            ),
        },
        {
            key: "actions",
            label: "",
            className: "actions-cell",
            render: (currentUser) => (
                <Icon
                    path={mdiDotsVertical}
                    className="menu-trigger"
                    onClick={(e) => openContextMenu(e, currentUser.id)}
                />
            ),
        },
    ], []);

    return (
        <div className="users-page">
            <CreateUserDialog open={createUserDialogOpen} onClose={() => setCreateUserDialogOpen(false)}
                              loadUsers={loadUsers} />

            <ActionConfirmDialog open={confirmDeleteDialogOpen} setOpen={setConfirmDeleteDialogOpen}
                                 onConfirm={() => deleteUser(contextUserId)}
                                 text="Are you sure you want to delete this user?" />
            <ActionConfirmDialog open={promoteDialogOpen} setOpen={setPromoteDialogOpen}
                                 onConfirm={() => updateRole(contextUserId, "admin")}
                                 text="Are you sure you want to promote this user to admin?" />
            <ActionConfirmDialog open={demoteDialogOpen} setOpen={setDemoteDialogOpen}
                                 onConfirm={() => updateRole(contextUserId, "user")}
                                 text="Are you sure you want to demote this user?" />

            <PasswordChange open={passwordChangeDialogOpen} onClose={() => setPasswordChangeDialogOpen(false)}
                            accountId={contextUserId} />

            <div className="users-header">
                <h2>Users ({total})</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <Icon path={mdiMagnify} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setCreateUserDialogOpen(true)} text="Create New User" icon={mdiPlus} />
                </div>
            </div>

            <PaginatedTable
                data={users}
                columns={columns}
                pagination={pagination}
                onPageChange={handlePageChange}
                getRowKey={(user) => user.id}
                loading={loading}
                emptyState={{
                    icon: mdiAccount,
                    title: debouncedSearch ? "No matching users" : "No users found",
                    subtitle: debouncedSearch ? "Try adjusting your search query." : "Create a new user to get started.",
                }}
            />

            <ContextMenu
                isOpen={contextMenu.isOpen}
                position={contextMenu.position}
                onClose={contextMenu.close}
                trigger={contextMenu.triggerRef}
            >
                <ContextMenuItem
                    icon={mdiKey}
                    label="Change Password"
                    onClick={() => setPasswordChangeDialogOpen(true)}
                />

                {contextUser?.role === "user" && user?.id !== contextUserId && (
                    <ContextMenuItem
                        icon={mdiSecurity}
                        label="Promote to Admin"
                        onClick={() => setPromoteDialogOpen(true)}
                    />
                )}

                {contextUser?.role === "admin" && user?.id !== contextUserId && (
                    <ContextMenuItem
                        icon={mdiAccount}
                        label="Demote to User"
                        onClick={() => setDemoteDialogOpen(true)}
                    />
                )}

                {user?.id !== contextUserId && (
                    <>
                        <ContextMenuItem
                            icon={mdiLogin}
                            label="Login as User"
                            onClick={() => loginAsUser(contextUserId)}
                        />
                        <ContextMenuItem
                            icon={mdiAccountRemove}
                            label="Delete User"
                            onClick={() => setConfirmDeleteDialogOpen(true)}
                            danger
                        />
                    </>
                )}
            </ContextMenu>
        </div>
    );
};
