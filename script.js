/* ==========================================
   PLANTPULSE AI - FRONTEND JAVASCRIPT
========================================== */

const API_URL = "http://127.0.0.1:5000";


/* ==========================================
   GET ELEMENTS
========================================== */

const leafInput = document.getElementById("leafInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");

const previewBox = document.getElementById("previewBox");
const preview = document.getElementById("preview");
const fileName = document.getElementById("fileName");

const clearBtn = document.getElementById("clearBtn");
const analyzeBtn = document.getElementById("analyzeBtn");

const loading = document.getElementById("loading");

const resultSection = document.getElementById("result");

const resultImage = document.getElementById("resultImage");
const heatmapImage = document.getElementById("heatmapImage");

const originalTab = document.getElementById("originalTab");
const heatmapTab = document.getElementById("heatmapTab");

const diseaseName = document.getElementById("diseaseName");

const confidenceValue =
    document.getElementById("confidenceValue");

const confidenceBar =
    document.getElementById("confidenceBar");

const affectedValue =
    document.getElementById("affectedValue");

const severityValue =
    document.getElementById("severityValue");

const saveScanBtn =
    document.getElementById("saveScanBtn");

const newScanBtn =
    document.getElementById("newScanBtn");

const historyList =
    document.getElementById("historyList");

const chart =
    document.getElementById("chart");

const trendText =
    document.getElementById("trendText");


let selectedFile = null;
let currentResult = null;


/* ==========================================
   BROWSE BUTTON
========================================== */

browseBtn.addEventListener("click", function () {
    leafInput.click();
});


/* ==========================================
   FILE SELECT
========================================== */

leafInput.addEventListener("change", function () {

    if (this.files.length === 0) {
        return;
    }

    handleFile(this.files[0]);

});


/* ==========================================
   DRAG & DROP
========================================== */

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const files = event.dataTransfer.files;

    if (files.length > 0) {
        handleFile(files[0]);
    }

});


/* ==========================================
   HANDLE FILE
========================================== */

function handleFile(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert(
            "Please upload a JPG, JPEG or PNG image."
        );

        return;
    }


    selectedFile = file;

    fileName.textContent = file.name;


    const reader = new FileReader();


    reader.onload = function (event) {

        preview.src = event.target.result;

        previewBox.classList.remove("hidden");

        dropZone.classList.add("hidden");

        resultSection.classList.add("hidden");

    };


    reader.readAsDataURL(file);
}


/* ==========================================
   CLEAR IMAGE
========================================== */

clearBtn.addEventListener("click", function () {

    resetScanner();

});


function resetScanner() {

    selectedFile = null;

    leafInput.value = "";

    preview.src = "";

    fileName.textContent = "Leaf Image";

    previewBox.classList.add("hidden");

    dropZone.classList.remove("hidden");

    loading.classList.add("hidden");

    resultSection.classList.add("hidden");

}


/* ==========================================
   ANALYZE BUTTON
========================================== */

analyzeBtn.addEventListener("click", async function () {

    if (!selectedFile) {

        alert("Please select a plant leaf image first.");

        return;
    }


    const formData = new FormData();

    formData.append("image", selectedFile);


    previewBox.classList.add("hidden");

    loading.classList.remove("hidden");

    resultSection.classList.add("hidden");


    try {

        const response = await fetch(
            `${API_URL}/predict`,
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Analysis failed."
            );

        }


        currentResult = data;

        displayResult(data);


    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to PlantPulse AI backend.\n\n" +
            "Make sure the Flask server is running."
        );

        previewBox.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");

    }

});


/* ==========================================
   DISPLAY RESULT
========================================== */

function displayResult(data) {

    resultSection.classList.remove("hidden");


    /* Disease */

    diseaseName.textContent =
        data.disease || "Unknown";


    /* Confidence */

    const confidence =
        Number(data.confidence || 0);

    const roundedConfidence =
        Math.round(confidence);


    confidenceValue.textContent =
        `${roundedConfidence}%`;


    confidenceBar.style.width =
        `${Math.min(100, Math.max(0, roundedConfidence))}%`;


    /* Affected area */

    const affected =
        Number(data.affected_area || 0);

    affectedValue.textContent =
        `${Math.round(affected)}%`;


    /* Severity */

    severityValue.textContent =
        data.severity || "Unknown";


    /* Original image */

    if (data.image_url) {

        resultImage.src =
            `${API_URL}${data.image_url}`;

    } else {

        resultImage.src =
            preview.src;

    }


    /* Heatmap */

    if (data.heatmap_url) {

        heatmapImage.src =
            `${API_URL}${data.heatmap_url}`;

    } else {

        heatmapImage.src = "";

    }


    showOriginal();


    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ==========================================
   ORIGINAL TAB
========================================== */

originalTab.addEventListener("click", function () {

    showOriginal();

});


function showOriginal() {

    originalTab.classList.add("active");

    heatmapTab.classList.remove("active");

    resultImage.classList.remove("hidden");

    heatmapImage.classList.add("hidden");

}


/* ==========================================
   HEATMAP TAB
========================================== */

heatmapTab.addEventListener("click", function () {

    if (!heatmapImage.src) {

        alert(
            "Heatmap is not available for this analysis."
        );

        return;
    }


    heatmapTab.classList.add("active");

    originalTab.classList.remove("active");

    resultImage.classList.add("hidden");

    heatmapImage.classList.remove("hidden");

});


/* ==========================================
   SAVE SCAN
========================================== */

saveScanBtn.addEventListener("click", async function () {

    if (!currentResult) {

        alert("There is no analysis to save.");

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/save`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    disease: currentResult.disease,

                    confidence:
                        currentResult.confidence,

                    affected_area:
                        currentResult.affected_area,

                    severity:
                        currentResult.severity

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Unable to save scan."
            );

        }


        alert("Scan saved successfully.");

        loadHistory();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to save the scan. " +
            "Make sure the backend is running."
        );

    }

});


/* ==========================================
   NEW SCAN
========================================== */

newScanBtn.addEventListener("click", function () {

    resetScanner();

    document
        .getElementById("scan")
        .scrollIntoView({
            behavior: "smooth"
        });

});


/* ==========================================
   LOAD HISTORY
========================================== */

async function loadHistory() {

    try {

        const response = await fetch(
            `${API_URL}/history`
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error("History request failed.");
        }


        renderHistory(data.scans);

    } catch (error) {

        console.error(
            "History error:",
            error
        );

    }

}


/* ==========================================
   RENDER HISTORY
========================================== */

function renderHistory(history) {

    if (!Array.isArray(history) || history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                🌱
                <p>No previous scans available.</p>
            </div>
        `;

        chart.innerHTML = "";

        trendText.textContent =
            "No scans yet";

        return;
    }


    historyList.innerHTML = "";


    const recentHistory =
        history.slice(0, 8);


    recentHistory.forEach(function (item) {

        const div =
            document.createElement("div");


        div.className =
            "history-item";


        const date =
            item.created_at
                ? new Date(item.created_at)
                    .toLocaleString()
                : "Unknown date";


        div.innerHTML = `

            <div class="history-item-top">

                <strong>
                    ${escapeHTML(item.disease || "Unknown")}
                </strong>

                <small>
                    ${escapeHTML(date)}
                </small>

            </div>

            <div class="history-item-details">

                <span>
                    Confidence:
                    ${Math.round(Number(item.confidence || 0))}%
                </span>

                <span>
                    Affected:
                    ${Math.round(Number(item.affected_area || 0))}%
                </span>

                <span>
                    ${escapeHTML(item.severity || "Unknown")}
                </span>

            </div>
        `;


        historyList.appendChild(div);

    });


    renderChart(history);

}


/* ==========================================
   RENDER CHART
========================================== */

function renderChart(history) {

    chart.innerHTML = "";


    const recent =
        history
            .slice()
            .reverse()
            .slice(-8);


    recent.forEach(function (item) {

        const affected =
            Math.min(
                100,
                Math.max(
                    0,
                    Number(item.affected_area || 0)
                )
            );


        const bar =
            document.createElement("div");


        bar.className =
            "chart-bar";


        bar.style.height =
            `${Math.max(5, affected)}%`;


        const label =
            document.createElement("span");


        label.textContent =
            `${Math.round(affected)}%`;


        bar.appendChild(label);

        chart.appendChild(bar);

    });


    if (recent.length >= 2) {

        const first =
            Number(
                recent[0].affected_area || 0
            );

        const last =
            Number(
                recent[recent.length - 1].affected_area || 0
            );


        if (last > first) {

            trendText.textContent =
                "Affected area increased";

        } else if (last < first) {

            trendText.textContent =
                "Affected area decreased";

        } else {

            trendText.textContent =
                "Affected area unchanged";

        }

    } else {

        trendText.textContent =
            "One scan recorded";

    }

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ==========================================
   STARTUP
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHistory();

    }
);