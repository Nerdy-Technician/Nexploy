import { useState } from "react";
import { DialogProvider } from "@/common/components/Dialog/Dialog.jsx";
import Button from "@/common/components/Button";
import { mdiConsole, mdiCheck } from "@mdi/js";
import composerize from "composerize";
import "./styles.sass";

export const ComposerizeDialog = ({ open, onClose, onConvert }) => {
    const [dockerCommand, setDockerCommand] = useState("");
    const [error, setError] = useState("");

    const handleConvert = () => {
        if (!dockerCommand.trim()) {
            setError("Please enter a docker run command");
            return;
        }

        try {
            const result = composerize(dockerCommand.trim());
            onConvert(result);
            setDockerCommand("");
            setError("");
            onClose();
        } catch {
            setError("Failed to convert. Make sure you entered a valid docker run command.");
        }
    };

    const handleClose = () => {
        setDockerCommand("");
        setError("");
        onClose();
    };

    return (
        <DialogProvider open={open} onClose={handleClose}>
            <div className="composerize-dialog">
                <h2>Convert Docker Run</h2>
                <p className="composerize-description">
                    Paste a <code>docker run</code> command below and it will be converted to a Docker Compose configuration.
                </p>
                <textarea
                    className="composerize-input"
                    placeholder="docker run -d -p 8080:80 --name my-app nginx:alpine"
                    value={dockerCommand}
                    onChange={(e) => {
                        setDockerCommand(e.target.value);
                        setError("");
                    }}
                    rows={5}
                    spellCheck={false}
                />
                {error && <span className="composerize-error">{error}</span>}
                <div className="composerize-actions">
                    <Button text="Cancel" type="secondary" onClick={handleClose} />
                    <Button
                        text="Convert & Apply"
                        icon={mdiCheck}
                        onClick={handleConvert}
                        disabled={!dockerCommand.trim()}
                    />
                </div>
            </div>
        </DialogProvider>
    );
};
