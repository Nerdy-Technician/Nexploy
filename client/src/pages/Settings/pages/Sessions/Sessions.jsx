import "./styles.sass";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/common/contexts/UserContext.jsx";
import { deleteRequest, getRequest } from "@/common/utils/RequestUtil.js";
import { UAParser } from "ua-parser-js";
import { Icon } from "@mdi/react";
import { mdiCellphone, mdiMonitor, mdiTablet } from "@mdi/js";
import Button from "@/common/components/Button";

export const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const {logout: logoutMyself, login, user} = useContext(UserContext);

    const parser = new UAParser();

    const getIconFromDevice = (device) => {
        switch (device) {
            case "wearable":
            case "mobile":
                return mdiCellphone;
            case "tablet":
                return mdiTablet;
            case "console":
            case "smarttv":
            case "embedded":
            case undefined:
            default:
                return mdiMonitor;
        }
    };

    const loadSessions = () => {
        getRequest("sessions/list").then(response => {
            setSessions(response);
        });
    }

    const logout = (sessionId) => {
        deleteRequest(`sessions/${sessionId}`).then(() => {
            login();
            loadSessions();
        });
    }

    useEffect(() => {
        loadSessions();
    }, [user]);

    return (
        <div className="sessions-page">
            <div className="sessions-header">
                <h2>Sessions</h2>
            </div>

            <div className="vertical-list">
                {sessions.map(session => (
                    <div className="item" key={session.id}>
                        <div className="left-section">
                            <div className={`icon ${session.current ? "success" : "primary"}`}>
                                <Icon path={getIconFromDevice(parser.setUA(session.userAgent).getDevice().type)} />
                            </div>
                            <div className="details">
                                <h3>
                                    {parser.setUA(session.userAgent).getBrowser().name} on {parser.getOS().name}
                                </h3>
                                <p>
                                    {session.current
                                        ? "Current session"
                                        : `Last activity: ${new Date(session.lastActivity).toLocaleString()} from ${session.ip}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="right-section">
                            <Button
                                text={session.current ? "Logout" : "Revoke"}
                                type="danger"
                                onClick={() => session.current ? logoutMyself() : logout(session.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};