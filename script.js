// ================= DOM ELEMENTS =================

const urlInput = document.getElementById("urlInput");
const inputWrapper = document.querySelector(".input-wrapper");
const scanButton = document.getElementById("scanButton");
const clearButton = document.getElementById("clearButton");
const pasteButton = document.getElementById("pasteButton");

const exampleChips = document.querySelectorAll(".example-chip");

const scanner = document.querySelector(".scanner");
const message = document.getElementById("message");

const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");

const loading = document.getElementById("loading");
const resultCard = document.getElementById("resultCard");

const resultIcon = document.getElementById("resultIcon");
const resultTitle = document.getElementById("resultTitle");
const resultUrl = document.getElementById("resultUrl");
const copyUrlButton = document.getElementById("copyUrlButton");

const confidenceValue = document.getElementById("confidenceValue");
const riskValue = document.getElementById("riskValue");
const resultMessage = document.getElementById("resultMessage");

const riskScoreGauge = document.getElementById("riskScoreGauge");
const riskScoreValue = document.getElementById("riskScoreValue");
const gaugeFill = document.getElementById("gaugeFill");

const reasonsHeading = document.getElementById("reasonsHeading");
const reasonsList = document.getElementById("reasonsList");
const techDetailsList = document.getElementById("techDetailsList");

const scanAgain = document.getElementById("scanAgain");

const scanSteps = ["step1", "step2", "step3", "step4"];

const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 50;


// ================= BACKEND CONFIGURATION =================

const BACKEND_URL = "http://127.0.0.1:5000";


// ================= INPUT STATE =================

function syncInputState() {

    inputWrapper.classList.toggle(
        "has-value",
        urlInput.value.length > 0
    );

}

syncInputState();

urlInput.addEventListener("input", syncInputState);


// ================= RESULT ICONS =================

const CHECK_ICON = `
    <svg class="icon-check"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2.5"
         stroke-linecap="round"
         stroke-linejoin="round">
        <path d="M5 13l4 4L19 7" />
    </svg>
`;

const CROSS_ICON = `
    <svg class="icon-cross"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2.5"
         stroke-linecap="round">
        <path class="line1" d="M6 6L18 18" />
        <path class="line2" d="M18 6L6 18" />
    </svg>
`;

const REASON_ICON_POSITIVE = `
    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2.5"
         stroke-linecap="round"
         stroke-linejoin="round">
        <path d="M5 13l4 4L19 7" />
    </svg>
`;

const REASON_ICON_NEGATIVE = `
    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2.2"
         stroke-linecap="round"
         stroke-linejoin="round">
        <path d="M12 9v4M12 16.5v.01" />
        <path d="M10.3 3.9L2.5 18a1.8 1.8 0 001.5 2.7h16a1.8 1.8 0 001.5-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z" />
    </svg>
`;


// ================= LIVE ENGINE STATUS =================

function setEngineStatus(state) {

    statusPill.classList.remove(
        "state-scanning",
        "state-safe",
        "state-danger"
    );

    if (state === "scanning") {

        statusPill.classList.add("state-scanning");

        statusText.textContent = "Scanning link…";

    } else if (state === "safe") {

        statusPill.classList.add("state-safe");

        statusText.textContent =
            "Verdict ready — looks safe";

    } else if (state === "danger") {

        statusPill.classList.add("state-danger");

        statusText.textContent =
            "Verdict ready — suspicious";

    } else {

        statusText.textContent =
            "Detection engine online";

    }

}


// ================= SCANNER ANIMATION =================

scanner.addEventListener("animationend", function (event) {

    if (event.animationName === "shake-error") {

        scanner.classList.remove("shake");

    }

});


// ================= SHAKE ERROR =================

function shakeScanner() {

    scanner.classList.remove("shake");

    void scanner.offsetWidth;

    scanner.classList.add("shake");

}


// ================= SCAN BUTTON =================

scanButton.addEventListener("click", function () {

    const url = urlInput.value.trim();

    // Empty URL

    if (url === "") {

        message.textContent =
            "Please enter a URL.";

        shakeScanner();

        urlInput.focus();

        return;
    }


    // URL validation

    let parsedURL;

    try {

        parsedURL = new URL(url);

        if (
            parsedURL.protocol !== "http:" &&
            parsedURL.protocol !== "https:"
        ) {

            throw new Error();

        }

    } catch {

        message.textContent =
            "Please enter a valid URL (example: https://example.com).";

        shakeScanner();

        urlInput.focus();

        return;
    }


    // Clear previous message

    message.textContent = "";


    // Engine status

    setEngineStatus("scanning");


    // Hide scanner

    scanner.style.setProperty(
        "display",
        "none",
        "important"
    );


    // Reset loading steps

    scanSteps.forEach(function (id) {

        document
            .getElementById(id)
            .classList.remove("active", "done");

    });


    loading.classList.remove("hidden");


    // Hide previous result

    resultCard.classList.add("hidden");


    // Start scan

    runScanSteps(function () {

        showResult(url);

    });

});


// ================= STAGED SCAN ANIMATION =================

function runScanSteps(onComplete) {

    let index = 0;

    function advance() {

        if (index > 0) {

            document
                .getElementById(scanSteps[index - 1])
                .classList.replace(
                    "active",
                    "done"
                );

        }

        if (index === scanSteps.length) {

            onComplete();

            return;

        }

        document
            .getElementById(scanSteps[index])
            .classList.add("active");

        index += 1;

        setTimeout(advance, 480);

    }

    advance();

}


// =========================================================
// ================= ML BACKEND RESULT ====================
// =========================================================

async function showResult(url) {

    try {

        // Send URL to Flask backend

        const response = await fetch(
            `${BACKEND_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    url: url
                })
            }
        );


        // Convert backend response to JSON

        const data = await response.json();


        // Check backend error

        if (!response.ok) {

            throw new Error(
                data.error || "Prediction failed"
            );

        }


        // -----------------------------------------
        // GET ML PREDICTION
        // -----------------------------------------

        const prediction =
            String(data.prediction || "")
                .toLowerCase();


        const confidence =
            Math.round(
                Number(data.confidence || 0) * 100
            );


        // Backend returns:
        // legitimate = safe
        // phishing   = suspicious

        const isSafe =
            prediction === "legitimate";


        // -----------------------------------------
        // RISK SCORE
        // -----------------------------------------

        const riskScore = isSafe
            ? Math.max(0, 100 - confidence)
            : confidence;


        // -----------------------------------------
        // RISK LEVEL
        // -----------------------------------------

        let riskLevel = "LOW";

        if (riskScore >= 50) {

            riskLevel = "HIGH";

        } else if (riskScore >= 25) {

            riskLevel = "MEDIUM";

        }


        // -----------------------------------------
        // RESULT OBJECT
        // -----------------------------------------

        const analysis = {

            isSafe: isSafe,

            confidence: confidence,

            riskLevel: riskLevel,

            riskScore: riskScore,

            reasons: isSafe
                ? [
                    {
                        positive: true,
                        label:
                            "ML model classified this URL as legitimate"
                    },
                    {
                        positive: true,
                        label:
                            "URL analysis completed successfully"
                    }
                ]
                : [
                    {
                        positive: false,
                        label:
                            "ML model classified this URL as phishing"
                    },
                    {
                        positive: false,
                        label:
                            "Suspicious URL detected by the trained model"
                    }
                ],

            technical: {

                "URL": url,

                "Prediction": prediction,

                "ML Confidence":
                    confidence + "%"

            }

        };


        // -----------------------------------------
        // SAVE HISTORY
        // -----------------------------------------

        saveScanToHistory(
            url,
            analysis
        );


        // -----------------------------------------
        // HIDE LOADING
        // -----------------------------------------

        loading.classList.add("hidden");


        // -----------------------------------------
        // RESULT URL
        // -----------------------------------------

        resultUrl.textContent = url;


        // -----------------------------------------
        // CONFIDENCE
        // -----------------------------------------

        confidenceValue.textContent =
            confidence + "%";


        // -----------------------------------------
        // RISK LEVEL
        // -----------------------------------------

        riskValue.textContent =
            riskLevel;

        riskValue.className =
            "risk-" +
            riskLevel.toLowerCase();


        // -----------------------------------------
        // CONFIDENCE BAR
        // -----------------------------------------

        const confidenceBar =
            document.getElementById(
                "confidenceBar"
            );


        if (confidenceBar) {

            confidenceBar.style.width = "0%";

            requestAnimationFrame(function () {

                requestAnimationFrame(function () {

                    confidenceBar.style.width =
                        confidence + "%";

                });

            });

        }


        // -----------------------------------------
        // RISK SCORE GAUGE
        // -----------------------------------------

        riskScoreGauge.classList.remove(
            "risk-low",
            "risk-medium",
            "risk-high"
        );


        riskScoreGauge.classList.add(
            "risk-" +
            riskLevel.toLowerCase()
        );


        riskScoreValue.textContent =
            riskScore;


        gaugeFill.style.strokeDasharray =
            GAUGE_CIRCUMFERENCE;


        gaugeFill.style.strokeDashoffset =
            GAUGE_CIRCUMFERENCE;


        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                const offset =
                    GAUGE_CIRCUMFERENCE *
                    (1 - riskScore / 100);


                gaugeFill.style.strokeDashoffset =
                    offset;

            });

        });


        // -----------------------------------------
        // DETECTION REASONS
        // -----------------------------------------

        reasonsList.innerHTML = "";


        analysis.reasons.forEach(
            function (reason, index) {

                const li =
                    document.createElement("li");


                li.className =
                    reason.positive
                        ? "positive"
                        : "negative";


                li.style.animationDelay =
                    (index * 70) + "ms";


                li.innerHTML =
                    (
                        reason.positive
                            ? REASON_ICON_POSITIVE
                            : REASON_ICON_NEGATIVE
                    )
                    +
                    "<span>"
                    +
                    reason.label
                    +
                    "</span>";


                reasonsList.appendChild(li);

            }
        );


        // -----------------------------------------
        // TECHNICAL DETAILS
        // -----------------------------------------

        techDetailsList.innerHTML = "";


        Object.keys(
            analysis.technical
        ).forEach(function (label) {

            const dt =
                document.createElement("dt");


            dt.textContent =
                label;


            const dd =
                document.createElement("dd");


            dd.textContent =
                analysis.technical[label];


            techDetailsList.appendChild(dt);

            techDetailsList.appendChild(dd);

        });


        // -----------------------------------------
        // SAFE RESULT
        // -----------------------------------------

        if (analysis.isSafe) {

            resultCard.classList.remove(
                "is-danger"
            );

            resultCard.classList.add(
                "is-safe"
            );


            resultIcon.innerHTML =
                CHECK_ICON;


            resultTitle.textContent =
                "SAFE WEBSITE";


            resultMessage.textContent =
                "The ML model classified this URL as legitimate.";


            reasonsHeading.textContent =
                "Why is it safe?";


            setEngineStatus("safe");

        }


        // -----------------------------------------
        // PHISHING RESULT
        // -----------------------------------------

        else {

            resultCard.classList.remove(
                "is-safe"
            );

            resultCard.classList.add(
                "is-danger"
            );


            resultIcon.innerHTML =
                CROSS_ICON;


            resultTitle.textContent =
                "SUSPICIOUS WEBSITE";


            resultMessage.textContent =
                "The ML model detected this URL as potentially phishing.";


            reasonsHeading.textContent =
                "Why is it suspicious?";


            setEngineStatus("danger");

        }


        // -----------------------------------------
        // SHOW RESULT
        // -----------------------------------------

        resultCard.classList.remove(
            "hidden"
        );


    } catch (error) {

        console.error(
            "Backend prediction error:",
            error
        );


        // Hide loading

        loading.classList.add(
            "hidden"
        );


        // Show scanner again

        scanner.style.setProperty(
            "display",
            "flex",
            "important"
        );


        setEngineStatus(
            "online"
        );


        message.textContent =
            "Unable to connect to the PhishGuard AI backend.";


        shakeScanner();

    }

}


// ================= SCAN AGAIN =================

scanAgain.addEventListener(
    "click",
    function () {

        resultCard.classList.add(
            "hidden"
        );


        scanner.style.setProperty(
            "display",
            "flex",
            "important"
        );


        setEngineStatus(
            "online"
        );


        urlInput.value = "";

        syncInputState();


        message.textContent = "";


        urlInput.focus();

    }
);


// ================= CLEAR BUTTON =================

clearButton.addEventListener(
    "click",
    function () {

        urlInput.value = "";

        syncInputState();

        message.textContent = "";

        urlInput.focus();

    }
);


// ================= COPY URL BUTTON =================

if (copyUrlButton) {

    const copyUrlButtonOriginalHTML =
        copyUrlButton.innerHTML;


    let copyUrlRevertTimer = null;


    copyUrlButton.addEventListener(
        "click",
        function () {

            copyTextToClipboard(
                resultUrl.textContent.trim()
            );


            clearTimeout(
                copyUrlRevertTimer
            );


            copyUrlButton.innerHTML =
                REASON_ICON_POSITIVE;


            copyUrlButton.classList.add(
                "copied"
            );


            copyUrlRevertTimer =
                setTimeout(
                    function () {

                        copyUrlButton.innerHTML =
                            copyUrlButtonOriginalHTML;


                        copyUrlButton.classList.remove(
                            "copied"
                        );

                    },
                    1400
                );

        }
    );

}


// ================= PASTE BUTTON =================

if (
    pasteButton &&
    navigator.clipboard &&
    navigator.clipboard.readText
) {

    pasteButton.addEventListener(
        "click",
        async function () {

            try {

                const text =
                    await navigator.clipboard.readText();


                urlInput.value =
                    text.trim();


                syncInputState();


                message.textContent = "";


                urlInput.focus();


                if (
                    window.showToast
                ) {

                    window.showToast(
                        "Pasted from clipboard",
                        "success"
                    );

                }

            } catch {

                message.textContent =
                    "Couldn't read the clipboard — please paste manually.";

            }

        }
    );

} else if (pasteButton) {

    pasteButton.style.display =
        "none";

}


// ================= EXAMPLE URL CHIPS =================

exampleChips.forEach(
    function (chip) {

        chip.addEventListener(
            "click",
            function () {

                urlInput.value =
                    chip.dataset.url;


                syncInputState();


                message.textContent = "";


                urlInput.focus();

            }
        );

    }
);


// ================= ENTER KEY =================

urlInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            scanButton.click();

        }

    }
);