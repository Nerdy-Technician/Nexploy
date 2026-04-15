import { useEffect, useRef, useMemo } from "react";
import { parseLogLines } from "@/common/utils/ansiParser.js";
import Icon from "@mdi/react";
import { mdiRefresh } from "@mdi/js";
import "./styles.sass";

const TAIL_OPTIONS = [50, 100, 200, 500, 1000];

export const LogViewer = ({ 
    logs, 
    loading, 
    onRefresh, 
    onTailChange, 
    tailLines = 200,
    liveMode = false,
    onLiveModeToggle,
    liveLogs = ""
}) => {
    const containerRef = useRef(null);

    const parsedLines = useMemo(() => {
        const text = liveMode ? liveLogs : logs;
        return parseLogLines(text);
    }, [logs, liveLogs, liveMode]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [parsedLines]);

    return (
        <div className="log-viewer">
            <div className="log-toolbar">
                <div className="toolbar-left">
                    <div className="tail-selector">
                        <span className="tail-label">Lines</span>
                        <select 
                            value={tailLines} 
                            onChange={(e) => onTailChange?.(parseInt(e.target.value, 10))}
                            disabled={liveMode}
                        >
                            {TAIL_OPTIONS.map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        className={`toolbar-btn${liveMode ? " active" : ""}`}
                        onClick={onLiveModeToggle}
                    >
                        {liveMode ? "Stop" : "Follow"}
                    </button>
                </div>
                <div className="toolbar-right">
                    <button 
                        className="toolbar-btn" 
                        onClick={onRefresh} 
                        disabled={loading || liveMode}
                        title="Refresh"
                    >
                        <Icon path={mdiRefresh} />
                    </button>
                </div>
            </div>
            <div className="log-content" ref={containerRef}>
                {loading && !liveMode ? (
                    <div className="log-empty">Loading logs...</div>
                ) : parsedLines.length === 0 ? (
                    <div className="log-empty">No logs available</div>
                ) : (
                    <div className="log-lines">
                        {parsedLines.map((line) => (
                            <div key={line.lineNumber} className="log-line">
                                <span className="line-number">{line.lineNumber}</span>
                                <span className="line-text">
                                    {line.segments.length === 0 ? " " : line.segments.map((seg, j) => (
                                        <span key={j} style={seg.style}>{seg.text}</span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
