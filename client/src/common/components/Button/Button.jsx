import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiLoading } from "@mdi/js";

export const Button = ({onClick, text, icon, disabled, type, buttonType, loading}) => {
    return (
        <button className={"btn" + (type ? " type-" + type : "")} onClick={onClick} disabled={disabled || loading} type={buttonType}>
            {loading ? <Icon path={mdiLoading} spin={true} /> : icon ? <Icon path={icon} /> : null}
            <span>{text}</span>
        </button>
    );
}