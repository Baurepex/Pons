(function () {
    'use strict';
    const GROQ_API_KEY = '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'; // <-- eintragen
    const GROQ_MODEL = 'llama-3.3-70b-versatile';
    let active = false;
    let dimEnabled = true; // Transparenz-Reduktion ein/aus
    console.log('[Pons Translator] loaded');

    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'x') {
            active = !active;
            console.log('[Info]', active ? 'Aktiv' : 'Pausiert');
            reattachAll();
        }
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'c') {
            dimEnabled = !dimEnabled;
            console.log('[Info] Transparenz:', dimEnabled ? 'An' : 'Aus');
            updateDim();
        }
    });

    function updateDim() {
        // Eingabefeld
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(el => {
            el.style.opacity = (active && dimEnabled) ? '0.1' : '1';
        });
        // Übersetzungsfeld
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.style.opacity = dimEnabled ? '0.25' : '1';
        }
    }

    function fetchTranslation(text, callback) {
        console.log('[Pons] send request for:', text);
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
            console.log('[Pons] Antwort:', json);
            callback(json.choices[0].message.content.trim());
        })
        .catch(err => {
            console.error('[Pons] Error:', err);
            callback(null);
        });
    }

    function insertTranslation(translation) {
        console.log('[Pons] Übersetzung:', translation);
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.textContent = translation;
            targetDiv.style.opacity = dimEnabled ? '0.25' : '1';
        } else {
            console.warn('[Pons] Target element not found!');
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
        console.log('[Pons] Text fields found:', editables.length);
        editables.forEach(el => {
            el.style.opacity = (active && dimEnabled) ? '0.1' : '1';
            attachListeners(el);
        });
    }

    const observer = new MutationObserver(() => reattachAll());
    observer.observe(document.body, { childList: true, subtree: true });
})();
