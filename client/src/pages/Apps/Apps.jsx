import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiPackageVariant, mdiStorefront, mdiDownloadBox } from "@mdi/js";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Store from "./pages/Store";
import Installed from "./pages/Installed";
import TabSwitcher from "@/common/components/TabSwitcher";

export const Apps = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const deepLinkMatch = /^\/apps\/([^/]+)\/([^/]+)$/.exec(location.pathname);
    const deepLinkSource = deepLinkMatch?.[1];
    const deepLinkSlug = deepLinkMatch?.[2];
    const isDeepLink = deepLinkMatch && deepLinkSource !== "store" && deepLinkSource !== "installed";

    const pages = [
        { title: "Store", routeKey: "store", content: <Store deepLinkSource={isDeepLink ? deepLinkSource : null} deepLinkSlug={isDeepLink ? deepLinkSlug : null} />, icon: mdiStorefront },
        { title: "Installed", routeKey: "installed", content: <Installed />, icon: mdiDownloadBox },
    ];

    const currentPage = isDeepLink
        ? pages[0]
        : pages.find(page => location.pathname.endsWith(page.routeKey));

    if (!currentPage) return <Navigate to="/apps/store" />;
    
    return (
        <div className="apps-page">
            <div className="apps-header">
                <div className="header-content">
                    <div className="header-icon">
                        <Icon path={mdiPackageVariant} />
                    </div>
                    <div className="header-text">
                        <h1>App Store</h1>
                        <p>Discover and manage your applications</p>
                    </div>
                </div>
                <TabSwitcher
                    tabs={pages.map(p => ({ key: p.routeKey, label: p.title, icon: p.icon }))}
                    activeTab={currentPage?.routeKey}
                    onTabChange={(key) => navigate(`/apps/${key}`)}
                />
            </div>

            <div className="apps-content">
                {currentPage.content}
            </div>
        </div>
    )
}
