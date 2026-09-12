// ================= SHARED HISTORY STORAGE =================
// Used by both script.js (saving new scans) and history.js
// (reading / clearing scans), so the key, shape, and date
// format only live in one place.

const HISTORY_KEY = "phishguard_scan_history";
const MAX_HISTORY_ENTRIES = 100;

function formatScanDate(date) {

    const pad = function (n) { return String(n).padStart(2, "0"); };

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}/${month}/${year} ${pad(hours)}:${minutes} ${ampm}`;

}

// Reads raw history from localStorage. Returns null if nothing
// has been saved yet (caller decides whether to seed).
function readStoredHistory() {

    try {

        return JSON.parse(localStorage.getItem(HISTORY_KEY));

    } catch {

        return null;

    }

}

function writeStoredHistory(history) {

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

}

function saveScanToHistory(url, analysis) {

    let history = readStoredHistory();

    if (!Array.isArray(history)) history = [];

    // riskScore was added alongside the Home page's risk gauge —
    // fall back to a reasonable estimate if an older caller ever
    // passes an analysis object without it.
    const riskScore = typeof analysis.riskScore === "number"
        ? analysis.riskScore
        : (analysis.isSafe ? 100 - analysis.confidence : analysis.confidence);

    history.unshift({
        id: "scan-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
        url: url,
        result: analysis.isSafe ? "SAFE" : "PHISHING",
        confidence: analysis.confidence,
        riskScore: riskScore,
        date: formatScanDate(new Date())
    });

    history = history.slice(0, MAX_HISTORY_ENTRIES);

    writeStoredHistory(history);

}


// ================= CLIPBOARD COPY (with toast feedback) =================
// Shared by the result card's "copy URL" button and each history
// row's copy button. Falls back to a hidden-textarea + execCommand
// approach on browsers/contexts without the async Clipboard API
// (e.g. non-HTTPS pages), so the button still works either way.

function copyTextToClipboard(text) {

    function onSuccess() {
        if (window.showToast) window.showToast("URL copied to clipboard", "success");
    }

    function onFailure() {
        if (window.showToast) window.showToast("Couldn't copy the URL", "error");
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(text).then(onSuccess, function () {

            if (legacyCopyFallback(text)) onSuccess();
            else onFailure();

        });

    } else if (legacyCopyFallback(text)) {

        onSuccess();

    } else {

        onFailure();

    }

}

function legacyCopyFallback(text) {

    try {

        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const ok = document.execCommand("copy");

        document.body.removeChild(textarea);

        return ok;

    } catch {

        return false;

    }

}
