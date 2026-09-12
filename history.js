const historyTable = document.getElementById("historyTable");

const emptyHistory = document.getElementById("emptyHistory");
const emptyHistoryTitle = document.getElementById("emptyHistoryTitle");
const emptyHistoryText = document.getElementById("emptyHistoryText");
const emptyHistoryAction = document.getElementById("emptyHistoryAction");

const statTotal = document.getElementById("statTotal");
const statSafe = document.getElementById("statSafe");
const statPhishing = document.getElementById("statPhishing");
const statConfidence = document.getElementById("statConfidence");

const ratioTrack = document.querySelector(".ratio-track");
const ratioSafeArc = document.getElementById("ratioSafeArc");
const ratioSafePercent = document.getElementById("ratioSafePercent");
const legendSafeCount = document.getElementById("legendSafeCount");
const legendDangerCount = document.getElementById("legendDangerCount");
const activityChart = document.getElementById("activityChart");

const RATIO_CIRCUMFERENCE = 2 * Math.PI * 50;

const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");

const searchInput = document.getElementById("searchInput");
const searchClearButton = document.getElementById("searchClearButton");
const historySearchWrapper = document.querySelector(".history-search");
const sortSelect = document.getElementById("sortSelect");
const exportCsvButton = document.getElementById("exportCsvButton");

const clearConfirmModal = document.getElementById("clearConfirmModal");
const modalScanCount = document.getElementById("modalScanCount");
const modalCancelButton = document.getElementById("modalCancelButton");
const modalConfirmButton = document.getElementById("modalConfirmButton");


/*
    Seed data — only used the very first time someone opens
    the History page, so it isn't empty. After that, real scans
    from the scanner (saved to localStorage via storage.js) take
    over. HISTORY_KEY, formatScanDate, etc. come from storage.js,
    loaded before this file.
*/

const SEED_HISTORY = [

    {
        id: "seed-1",
        url: "https://google.com",
        result: "SAFE",
        confidence: 98,
        riskScore: 2,
        date: "02/09/2026 10:30 PM"
    },

    {
        id: "seed-2",
        url: "https://example.com",
        result: "SAFE",
        confidence: 96,
        riskScore: 4,
        date: "02/09/2026 09:45 PM"
    },

    {
        id: "seed-3",
        url: "https://secure-login-paypal-verify.com",
        result: "PHISHING",
        confidence: 94,
        riskScore: 82,
        date: "01/09/2026 07:20 PM"
    },

    {
        id: "seed-4",
        url: "http://account-update-secure.info",
        result: "PHISHING",
        confidence: 91,
        riskScore: 76,
        date: "01/09/2026 05:10 PM"
    },

    {
        id: "seed-5",
        url: "https://github.com",
        result: "SAFE",
        confidence: 99,
        riskScore: 1,
        date: "31/08/2026 02:15 PM"
    }

];


function loadHistory() {

    const stored = readStoredHistory();

    if (stored === null) {

        writeStoredHistory(SEED_HISTORY);

        return SEED_HISTORY.slice();

    }

    // Backward compatibility: entries saved before individual
    // delete / sort-by-risk existed won't have an id or riskScore
    // yet. Backfill them once, in place, and persist the fix.
    let needsResave = false;

    stored.forEach(function (entry, index) {

        if (!entry.id) {
            entry.id = "legacy-" + Date.now() + "-" + index;
            needsResave = true;
        }

        if (typeof entry.riskScore !== "number") {
            entry.riskScore = entry.result === "PHISHING"
                ? entry.confidence
                : 100 - entry.confidence;
            needsResave = true;
        }

    });

    if (needsResave) writeStoredHistory(stored);

    return stored;

}


let scanHistory = loadHistory();

let activeFilter = "ALL";
let searchQuery = "";
let sortMode = "newest";


// Animates a <strong> stat from its current displayed value up to
// `end`, appending `suffix` (e.g. "%") once finished. Runs on every
// updateStats() call, including the very first render.
function animateStatValue(el, end, suffix) {

    suffix = suffix || "";

    const start = parseInt(el.textContent, 10) || 0;

    if (start === end) {
        el.textContent = end + suffix;
        return;
    }

    const duration = 500;
    const startTime = performance.now();

    function tick(now) {

        const progress = Math.min((now - startTime) / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        const current = Math.round(start + (end - start) * eased);

        el.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(tick);
        }

    }

    requestAnimationFrame(tick);

}

function updateStats() {

    const total = scanHistory.length;

    const safeCount = scanHistory.filter(function (s) {
        return s.result === "SAFE";
    }).length;

    const phishingCount = total - safeCount;

    const avgConfidence = total === 0
        ? 0
        : Math.round(
            scanHistory.reduce(function (sum, s) {
                return sum + s.confidence;
            }, 0) / total
        );

    animateStatValue(statTotal, total);
    animateStatValue(statSafe, safeCount);
    animateStatValue(statPhishing, phishingCount);
    animateStatValue(statConfidence, avgConfidence, "%");

    updateAnalytics(total, safeCount, phishingCount);

}


// ================= MINI ANALYTICS =================
// Safe-vs-suspicious ratio donut, plus a 7-day scan activity bar
// chart. Both reflect the full history regardless of the current
// search/filter/sort — they answer "how am I doing overall?", not
// "what am I currently looking at?".

function updateAnalytics(total, safeCount, phishingCount) {

    const safePercent = total === 0 ? 0 : Math.round((safeCount / total) * 100);

    ratioSafePercent.textContent = safePercent + "%";
    legendSafeCount.textContent = safeCount;
    legendDangerCount.textContent = phishingCount;

    ratioTrack.classList.toggle("is-empty", total === 0);

    ratioSafeArc.style.strokeDasharray = RATIO_CIRCUMFERENCE;
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            const offset = RATIO_CIRCUMFERENCE * (1 - safePercent / 100);
            ratioSafeArc.style.strokeDashoffset = offset;
        });
    });

    renderActivityChart();

}

// A stored date looks like "02/09/2026 10:30 PM" (see
// formatScanDate in storage.js) — the part before the space is
// already a DD/MM/YYYY key we can compare directly.
function dateKeyFromStored(dateStr) {
    return dateStr.split(" ")[0];
}

function dateKeyFromDate(d) {
    const pad = function (n) { return String(n).padStart(2, "0"); };
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
}

function renderActivityChart() {

    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {

        const d = new Date(today);
        d.setDate(today.getDate() - i);

        days.push({
            key: dateKeyFromDate(d),
            label: d.toLocaleDateString(undefined, { weekday: "short" }),
            count: 0
        });

    }

    scanHistory.forEach(function (scan) {

        const key = dateKeyFromStored(scan.date);

        const day = days.find(function (d) { return d.key === key; });

        if (day) day.count += 1;

    });

    const maxCount = Math.max.apply(null, days.map(function (d) { return d.count; }).concat([1]));

    activityChart.innerHTML = "";

    days.forEach(function (day) {

        const wrap = document.createElement("div");
        wrap.className = "activity-bar-wrap";

        const countLabel = document.createElement("span");
        countLabel.className = "activity-count";
        countLabel.textContent = day.count;

        const bar = document.createElement("div");
        bar.className = "activity-bar";
        bar.title = day.count + (day.count === 1 ? " scan" : " scans");

        const heightPercent = Math.round((day.count / maxCount) * 100);
        bar.style.height = (day.count === 0 ? 3 : Math.max(heightPercent, 6)) + "%";

        const dayLabel = document.createElement("span");
        dayLabel.className = "activity-day-label";
        dayLabel.textContent = day.label;

        wrap.appendChild(countLabel);
        wrap.appendChild(bar);
        wrap.appendChild(dayLabel);

        activityChart.appendChild(wrap);

    });

}


// Small trash-icon used on each row's delete button.
const DELETE_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m3 0l-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
        <path d="M10 11v6M14 11v6" />
    </svg>
`;

// Small copy-icon used on each row's copy-URL button.
const COPY_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="12" height="12" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
`;

// Swapped in briefly after a successful copy, for the icon-morph
// feedback (mirrors the same pattern on the Home page result card).
const COPY_SUCCESS_ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 13l4 4L19 7" />
    </svg>
`;

// Applies the current search + result filter, then the current
// sort mode. Shared by the table render and the CSV export so
// both always agree on "what's currently visible".
function getVisibleHistory() {

    const filtered = scanHistory.filter(function (scan) {

        if (activeFilter !== "ALL" && scan.result !== activeFilter) return false;

        if (searchQuery && !scan.url.toLowerCase().includes(searchQuery)) return false;

        return true;

    });

    // scanHistory itself is always kept newest-first (new scans are
    // unshifted in), so "newest" needs no reordering and "oldest"
    // is just its reverse — no date parsing required.
    if (sortMode === "oldest") {
        filtered.reverse();
    } else if (sortMode === "risk-desc") {
        filtered.sort(function (a, b) { return b.riskScore - a.riskScore; });
    } else if (sortMode === "confidence-desc") {
        filtered.sort(function (a, b) { return b.confidence - a.confidence; });
    }

    return filtered;

}

function deleteHistoryEntry(id) {

    scanHistory = scanHistory.filter(function (s) { return s.id !== id; });

    writeStoredHistory(scanHistory);

    updateStats();
    displayHistory();

    if (window.showToast) window.showToast("Scan deleted", "success");

}

function displayHistory() {

    historyTable.innerHTML = "";

    const visible = getVisibleHistory();


    if (visible.length === 0) {

        emptyHistory.classList.remove("hidden");

        if (scanHistory.length === 0) {

            emptyHistoryTitle.textContent = "No scan history";
            emptyHistoryText.textContent = "You haven't scanned any URLs yet.";
            emptyHistoryAction.textContent = "Scan a URL";
            emptyHistoryAction.href = "index.html";
            emptyHistoryAction.dataset.mode = "scan";

        } else {

            emptyHistoryTitle.textContent = "No matching scans";
            emptyHistoryText.textContent = "Try a different search term or filter.";
            emptyHistoryAction.textContent = "Clear filters";
            emptyHistoryAction.href = "#";
            emptyHistoryAction.dataset.mode = "clear-filters";

        }

        return;
    }


    emptyHistory.classList.add("hidden");


    visible.forEach(function (scan, index) {

        const row = document.createElement("tr");

        row.style.animationDelay = Math.min(index * 40, 400) + "ms";


        let resultBadge;


        if (scan.result === "SAFE") {

            resultBadge = `
                <span class="safe-badge">
                    <svg class="badge-icon" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="3"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                    SAFE
                </span>
            `;

        } else {

            resultBadge = `
                <span class="phishing-badge">
                    <svg class="badge-icon" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="3"
                         stroke-linecap="round">
                        <path d="M6 6L18 18" />
                        <path d="M18 6L6 18" />
                    </svg>
                    SUSPICIOUS
                </span>
            `;

        }


        row.innerHTML = `

            <td class="url-cell">
                <span class="url-text">${scan.url}</span>
                <button class="row-copy-btn" type="button" aria-label="Copy URL" data-tooltip="Copy URL">
                    ${COPY_ICON}
                </button>
            </td>

            <td>
                ${resultBadge}
            </td>

            <td class="confidence-text">
                <span class="mobile-label">Confidence:</span>
                ${scan.confidence}%
            </td>

            <td>
                ${scan.date}
            </td>

            <td class="actions-cell">
                <button class="row-delete-btn" type="button" aria-label="Delete this scan" data-tooltip="Delete scan">
                    ${DELETE_ICON}
                </button>
            </td>

        `;

        row.querySelector(".row-delete-btn").addEventListener("click", function () {

            row.classList.add("row-removing");

            setTimeout(function () {
                deleteHistoryEntry(scan.id);
            }, 200);

        });

        row.querySelector(".row-copy-btn").addEventListener("click", function () {

            const copyBtn = row.querySelector(".row-copy-btn");
            const originalHTML = copyBtn.innerHTML;

            copyTextToClipboard(scan.url);

            copyBtn.innerHTML = COPY_SUCCESS_ICON;
            copyBtn.classList.add("copied");

            setTimeout(function () {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove("copied");
            }, 1400);

        });


        historyTable.appendChild(row);

    });

}


filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        activeFilter = button.dataset.filter;

        displayHistory();

    });

});


const clearHistoryButton = document.getElementById("clearHistoryButton");

clearHistoryButton.addEventListener("click", function () {

    modalScanCount.textContent = scanHistory.length;

    clearConfirmModal.classList.remove("hidden");

});

function closeClearModal() {

    clearConfirmModal.classList.add("hidden");

}

modalCancelButton.addEventListener("click", closeClearModal);

// Clicking the dimmed overlay (not the box itself) also cancels.
clearConfirmModal.addEventListener("click", function (event) {

    if (event.target === clearConfirmModal) closeClearModal();

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && !clearConfirmModal.classList.contains("hidden")) {
        closeClearModal();
    }

});

modalConfirmButton.addEventListener("click", function () {

    localStorage.removeItem(HISTORY_KEY);

    scanHistory = [];

    updateStats();
    displayHistory();

    closeClearModal();

    if (window.showToast) window.showToast("Scan history cleared", "success");

});


emptyHistoryAction.addEventListener("click", function (event) {

    if (emptyHistoryAction.dataset.mode !== "clear-filters") return;

    event.preventDefault();

    searchInput.value = "";
    searchQuery = "";
    syncSearchState();

    sortSelect.value = "newest";
    sortMode = "newest";

    filterButtons.forEach(function (btn) {
        btn.classList.toggle("active", btn.dataset.filter === "ALL");
    });
    activeFilter = "ALL";

    displayHistory();

});


// ================= SEARCH =================

function syncSearchState() {
    historySearchWrapper.classList.toggle("has-value", searchInput.value.length > 0);
}

syncSearchState();

searchInput.addEventListener("input", function () {

    searchQuery = searchInput.value.trim().toLowerCase();

    syncSearchState();

    displayHistory();

});

searchClearButton.addEventListener("click", function () {

    searchInput.value = "";
    searchQuery = "";

    syncSearchState();
    searchInput.focus();

    displayHistory();

});


// ================= SORT =================

sortSelect.addEventListener("change", function () {

    sortMode = sortSelect.value;

    displayHistory();

});


// ================= CSV EXPORT =================

function csvField(value) {

    const str = String(value);

    return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;

}

exportCsvButton.addEventListener("click", function () {

    const visible = getVisibleHistory();

    if (visible.length === 0) {
        if (window.showToast) window.showToast("Nothing to export", "error");
        return;
    }

    const rows = [["URL", "Result", "Confidence", "Risk Score", "Date & Time"]];

    visible.forEach(function (scan) {

        rows.push([scan.url, scan.result, scan.confidence + "%", scan.riskScore, scan.date]);

    });

    const csvContent = rows.map(function (row) {
        return row.map(csvField).join(",");
    }).join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "phishguard-scan-history.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);

    if (window.showToast) window.showToast("CSV exported", "success");

});


updateStats();
displayHistory();
