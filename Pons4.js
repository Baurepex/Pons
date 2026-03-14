(function () {
    'use strict';

    const GROQ_API_KEY = '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'; // <-- eintragen
    const GROQ_MODEL = 'llama-3.3-70b-versatile';

    let active = false;
    console.log('[Groq Translator] Geladen');

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'x') {
            active = !active;
            console.log('[Info]', active ? 'Aktiv' : 'Pausiert');
            reattachAll();
        }
    });

    function fetchTranslation(text, callback) {
        console.log('[Groq] Sende Anfrage für:', text);
        fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Latein-Übersetzer. Übersetze den lateinischen Text ins Deutsche. Antworte NUR mit der Übersetzung, ohne Erklärungen.'
                    },
                    {
                        role: 'user',
                        content: text.trim()
                    }
                ],
                temperature: 0
            })
        })
        .then(res => res.json())
        .then(json => {
            console.log('[Groq] Antwort:', json);
            callback(json.choices[0].message.content.trim());
        })
        .catch(err => {
            console.error('[Groq] Fehler:', err);
            callback(null);
        });
    }

    function insertTranslation(translation) {
        console.log('[Groq] Übersetzung:', translation);
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.textContent = translation;
        } else {
            console.warn('[Groq] Ziel-Element nicht gefunden!');
        }
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
        console.log('[Groq] Textfelder gefunden:', editables.length);
        editables.forEach(attachListeners);
    }

    const observer = new MutationObserver(() => reattachAll());
    observer.observe(document.body, { childList: true, subtree: true });
})();
