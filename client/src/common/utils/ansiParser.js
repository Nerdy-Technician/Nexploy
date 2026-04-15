const ANSI_COLORS = {
    30: "#6b7280",
    31: "#ef4444",
    32: "#22c55e",
    33: "#eab308",
    34: "#3b82f6",
    35: "#a855f7",
    36: "#06b6d4",
    37: "#e5e7eb",
    90: "#9ca3af",
    91: "#f87171",
    92: "#4ade80",
    93: "#facc15",
    94: "#60a5fa",
    95: "#c084fc",
    96: "#22d3ee",
    97: "#ffffff",
};

const ANSI_BG_COLORS = {
    40: "#6b7280",
    41: "#ef4444",
    42: "#22c55e",
    43: "#eab308",
    44: "#3b82f6",
    45: "#a855f7",
    46: "#06b6d4",
    47: "#e5e7eb",
    100: "#9ca3af",
    101: "#f87171",
    102: "#4ade80",
    103: "#facc15",
    104: "#60a5fa",
    105: "#c084fc",
    106: "#22d3ee",
    107: "#ffffff",
};

export const parseAnsi = (text) => {
    if (!text) return [];

    const segments = [];
    const regex = /\x1b\[([0-9;]*)m/g;
    let lastIndex = 0;
    let currentStyle = {};

    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            const chunk = text.slice(lastIndex, match.index);
            if (chunk) segments.push({ text: chunk, style: { ...currentStyle } });
        }
        const codes = match[1] ? match[1].split(";").map(Number) : [0];
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            if (code === 0) {
                currentStyle = {};
            } else if (code === 1) {
                currentStyle.fontWeight = "bold";
            } else if (code === 2) {
                currentStyle.opacity = "0.7";
            } else if (code === 3) {
                currentStyle.fontStyle = "italic";
            } else if (code === 4) {
                currentStyle.textDecoration = "underline";
            } else if (code >= 30 && code <= 37) {
                currentStyle.color = ANSI_COLORS[code];
            } else if (code >= 90 && code <= 97) {
                currentStyle.color = ANSI_COLORS[code];
            } else if (code === 39) {
                delete currentStyle.color;
            } else if (code >= 40 && code <= 47) {
                currentStyle.backgroundColor = ANSI_BG_COLORS[code];
            } else if (code >= 100 && code <= 107) {
                currentStyle.backgroundColor = ANSI_BG_COLORS[code];
            } else if (code === 49) {
                delete currentStyle.backgroundColor;
            } else if (code === 38 && codes[i + 1] === 5) {
                currentStyle.color = get256Color(codes[i + 2]);
                i += 2;
            } else if (code === 48 && codes[i + 1] === 5) {
                currentStyle.backgroundColor = get256Color(codes[i + 2]);
                i += 2;
            }
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        const chunk = text.slice(lastIndex);
        if (chunk) segments.push({ text: chunk, style: { ...currentStyle } });
    }

    return segments;
};

function get256Color(n) {
    if (n == null) return undefined;
    if (n >= 0 && n <= 7) {
        const colors = ["#6b7280", "#ef4444", "#22c55e", "#eab308", "#3b82f6", "#a855f7", "#06b6d4", "#e5e7eb"];
        return colors[n];
    }
    if (n >= 8 && n <= 15) {
        const colors = ["#9ca3af", "#f87171", "#4ade80", "#facc15", "#60a5fa", "#c084fc", "#22d3ee", "#ffffff"];
        return colors[n - 8];
    }
    if (n >= 16 && n <= 231) {
        const idx = n - 16;
        const r = Math.floor(idx / 36);
        const g = Math.floor((idx % 36) / 6);
        const b = idx % 6;
        const toHex = (v) => (v === 0 ? 0 : 55 + v * 40).toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    if (n >= 232 && n <= 255) {
        const v = (8 + (n - 232) * 10).toString(16).padStart(2, "0");
        return `#${v}${v}${v}`;
    }
    return undefined;
}

export const parseLogLines = (text) => {
    if (!text) return [];
    const lines = text.split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    return lines.map((line, i) => ({
        lineNumber: i + 1,
        segments: parseAnsi(line),
    }));
};
