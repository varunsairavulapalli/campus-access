
const noticeInput = document.getElementById("noticeInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const readBtn = document.getElementById("readBtn");
const charCount = document.getElementById("charCount");
const message = document.getElementById("message");
const results = document.getElementById("results");

const summaryElement = document.getElementById("summary");
const datesElement = document.getElementById("dates");
const actionsElement = document.getElementById("actions");

const API_URL = "http://localhost:8086/api/notices/analyze";

noticeInput.addEventListener("input", () => {
    charCount.textContent =
        `${noticeInput.value.length} / 20000 characters`;
});

analyzeBtn.addEventListener("click", analyzeNotice);

clearBtn.addEventListener("click", () => {
    noticeInput.value = "";
    charCount.textContent = "0 / 20000 characters";
    message.textContent = "";
    message.className = "message";
    results.hidden = true;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
});

async function analyzeNotice() {
    const notice = noticeInput.value.trim();

    if (!notice) {
        showMessage("Please paste a college notice first.", true);
        noticeInput.focus();
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    showMessage("Processing your notice. Please wait.", false);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=UTF-8"
            },
            body: notice
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not analyze the notice.");
        }

        summaryElement.textContent = data.summary || "No summary available.";

        renderList(datesElement, data.dates, "No dates detected.");
        renderList(actionsElement, data.actions, "No action items detected.");

        results.hidden = false;
        showMessage("Notice processed successfully.", false);

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        showMessage(
            "Unable to connect to the backend. Make sure Spring Boot is running at localhost:8086.",
            true
        );
        console.error(error);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = "<span>✦</span> Analyze Notice";
    }
}

function renderList(element, items, emptyMessage) {
    element.replaceChildren();

    const listItems = Array.isArray(items) ? items : [];

    if (listItems.length === 0) {
        const li = document.createElement("li");
        li.textContent = emptyMessage;
        element.appendChild(li);
        return;
    }

    listItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        element.appendChild(li);
    });
}

function showMessage(text, isError) {
    message.textContent = text;
    message.className = isError ? "message error" : "message";
}

readBtn.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
        showMessage("Text-to-speech is not supported in this browser.", true);
        return;
    }

    window.speechSynthesis.cancel();

    const spokenText = [
        "Notice summary.",
        summaryElement.textContent,
        "Important dates.",
        datesElement.innerText,
        "Action items.",
        actionsElement.innerText
    ].join(" ");

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
});
