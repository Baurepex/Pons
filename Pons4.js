(function() {
    'use strict';

    const API_KEY = "AIzaSyC7Y3B9QbrpbS4uff9jOvbMICMJ1t2Gdhg";

    let active = false;
    let currentTranslation = null;

    console.log("on");

    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === "x") {
            active = !active;
            console.log("[Info]", active ? "A" : "P");
            reattachAll();
        }
    });

    async function fetchTranslation(text, callback) {
        try {

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `Übersetze den folgenden lateinischen Text exakt ins Deutsche.
Gib ausschließlich die deutsche Übersetzung zurück, ohne Erklärung:

${text.trim()}`
                            }]
                        }]
                    })
                }
            );

            const data = await response.json();

            const translation =
                data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

            callback(translation);

        } catch (err) {
            console.error("Gemini error:", err);
            callback(null);
        }
    }

    function insertTranslation(translation) {
        const targetDiv = document.querySelector(
            ".text-p2.text-gray-dark.mt-1.text-right"
        );

        if (targetDiv && translation) {
            targetDiv.textContent = translation;
        }
    }

    function handler(e) {
        if (e.key !== "Enter") return;

        const editable = e.currentTarget;
        const text = editable.innerText;

        if (active) {
            e.preventDefault();
            e.stopPropagation();

            fetchTranslation(text, (translation) => {
                currentTranslation = translation;
                insertTranslation(translation);
            });

        } else {
            currentTranslation = null;
        }
    }

    function attachListeners(editable) {
        editable.removeEventListener("keydown", handler);
        editable.addEventListener("keydown", handler);
    }

    function reattachAll() {
        const editables = document.querySelectorAll(
            'div[contenteditable="true"]'
        );

        editables.forEach(attachListeners);
    }

    const observer = new MutationObserver(() => {
        reattachAll();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
