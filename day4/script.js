const textarea = document.getElementById("note-text");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

function updateCounts() {
    const text = textarea.value;

    const characters = text.length;

    const words = text.trim() === ""
        ? 0
        : text.trim().split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;

    charCount.classList.remove("warning", "over");

    if (characters > 200) {
        charCount.classList.add("over");
    } else if (characters > 180) {
        charCount.classList.add("warning");
    }
}

textarea.addEventListener("input", function () {
    updateCounts();

    localStorage.setItem("draft", textarea.value);
});

clearBtn.addEventListener("click", function () {
    textarea.value = "";

    updateCounts();

    localStorage.removeItem("draft");
});

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "Light mode";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "Dark mode";
        localStorage.setItem("theme", "light");
    }
});

textarea.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        textarea.value = "";

        updateCounts();

        localStorage.removeItem("draft");
    }
});

window.addEventListener("load", function () {
    const savedDraft = localStorage.getItem("draft");
    const savedTheme = localStorage.getItem("theme");

    if (savedDraft) {
        textarea.value = savedDraft;
    }

    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "Light mode";
    }

    updateCounts();
});