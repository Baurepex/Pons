(function () {
    'use strict';

    const GEMINI_API_KEY = 'AIzaSyAj4BjgU_KGGLFTGD65i08ccgmYAuN76Lg'; // <-- eintragen
    const GEMINI_MODEL = 'gemini-2.0-flash';

    let active = false;
    console.log('on');

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'x') {
            active = !active;
            console.log('[Info]', active ? 'Aktiv' : 'Pausiert');
            reattachAll();
        }
    });

    function fetchTranslation(text, callback) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Übersetze den folgenden lateinischen Text ins Deutsche. Antworte NUR mit der Übersetzung, ohne Erklärungen oder Anmerkungen.\n\n${text.trim()}`
                    }]
                }],
                generationConfig: { temperature: 0 }
            })
        })
            .then(res => res.json())
            .then(json => callback(json.candidates[0].content.parts[0].text.trim()))
            .catch(() => callback(null));
    }

    function insertTranslation(translation) {
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) targetDiv.textContent = translation;
    }

    function handler(e) {
        if (e.key !== 'Enter') return;
        const editable = e.currentTarget;
        const text = editable.innerText;
        if (active) {
            e.preventDefault();
            e.stopPropagation();
            fetchTranslation(text, (translation) => {
                if (translation) insertTranslation(translation);
            });
        }
    }

    function attachListeners(editable) {
        editable.removeEventListener('keydown', handler);
        editable.addEventListener('keydown', handler);
    }

    function reattachAll() {
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(attachListeners);
    }

    const observer = new MutationObserver(() => reattachAll());
    observer.observe(document.body, { childList: true, subtree: true });
})();
