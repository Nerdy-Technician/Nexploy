import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiPlus, mdiServerOutline } from "@mdi/js";
import AllServers from "./pages/AllServers";
import { useState } from "react";
import Button from "@/common/components/Button";
import ServerDialog from "./components/ServerDialog";

export const Servers = () => {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleServerCreated = () => {
        setRefreshKey(prev => prev + 1);
    };
    
    return (
        <div className="servers-page">
            <div className="servers-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Icon path={mdiServerOutline} />
                    </div>
                    <div className="header-text">
                        <h1>Servers</h1>
                        <p>Manage your infrastructure</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Button 
                        text="Add Server" 
                        icon={mdiPlus}
                        onClick={() => setShowAddDialog(true)}
                    />
                </div>
            </div>

            <div className="servers-content">
                <AllServers key={refreshKey} />
            </div>

            <ServerDialog 
                open={showAddDialog} 
                onClose={() => setShowAddDialog(false)}
                onServerCreated={handleServerCreated}
            />
        </div>
    )
}
