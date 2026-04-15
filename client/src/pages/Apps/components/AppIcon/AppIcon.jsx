import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiDotsHorizontal, mdiPackageVariant } from "@mdi/js";

const resolveIcon = (ref) => {
    if (!ref) return null;
    if (typeof ref === "string" && ref.includes("/")) {
        const [source, slug] = ref.split("/");
        return `/api/apps/${source}/${slug}/logo`;
    }
    return null;
};

export const AppIcon = ({ app, size = "medium" }) => {
    const isBundle = app.type === "bundle" && app.applications;

    if (!isBundle) {
        if (app.hasLogo) {
            return <img src={`/api/apps/${app.source}/${app.slug}/logo`} alt={app.name} className={`app-icon app-icon-${size}`} />;
        }
        return (
            <div className={`app-icon app-icon-${size} app-icon-placeholder`}>
                <Icon path={mdiPackageVariant} />
            </div>
        );
    }

    const firstIcon = resolveIcon(app.applications[0]);
    const secondIcon = resolveIcon(app.applications[1]);
    const hasMore = app.applications.length > 2;

    return (
        <div className={`bundle-icon bundle-icon-${size}`}>
            <div className="bundle-bubble bubble-first">
                {firstIcon ? <img src={firstIcon} alt="" /> : <Icon path={mdiPackageVariant} />}
            </div>
            <div className="bundle-bubble bubble-second">
                {hasMore ? (
                    <Icon path={mdiDotsHorizontal} />
                ) : (
                    secondIcon ? <img src={secondIcon} alt="" /> : <Icon path={mdiPackageVariant} />
                )}
            </div>
        </div>
    );
};
