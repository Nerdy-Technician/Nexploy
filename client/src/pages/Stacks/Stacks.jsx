import "./styles.sass";
import Icon from "@mdi/react";
import { mdiLayers, mdiPlus } from "@mdi/js";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AllStacks from "./pages/AllStacks";
import StackEditor from "./pages/StackEditor";
import Button from "@/common/components/Button";

export const Stacks = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isEditPage = location.pathname.includes("/stacks/edit/");

    return (
        <div className="stacks-page">
            {!isEditPage && (
                <div className="stacks-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <Icon path={mdiLayers} />
                        </div>
                        <div className="header-text">
                            <h1>Stacks</h1>
                            <p>Manage your container orchestration</p>
                        </div>
                    </div>
                    <div className="header-actions">
                        <Button
                            text="Create Stack"
                            icon={mdiPlus}
                            onClick={() => navigate("/stacks/edit/new")}
                        />
                    </div>
                </div>
            )}

            <div className={`stacks-content ${!isEditPage ? "has-padding" : ""}`}>
                <Routes>
                    <Route path="all" element={<AllStacks />} />
                    <Route path="edit/:id" element={<StackEditor />} />
                    <Route path="*" element={<Navigate to="/stacks/all" replace />} />
                </Routes>
            </div>
        </div>
    );
};
