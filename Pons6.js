(function () {
    'use strict';
    const GROQ_API_KEY = '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'; // <-- eintragen
    const GROQ_MODEL = 'llama-3.3-70b-versatile';
    let active = false;
    let dimEnabled = true;

    // Unabhängige Opacity für beide Felder (1.0 = voll sichtbar)
    let opacityInput = 1.0;
    let opacityOutput = 0.25;

    // Aktuell ausgewähltes Feld: 'input' oder 'output'
    let selectedField = 'input';

    console.log('[Pons Translator] loaded');

    // Kleines Status-HUD
    const hud = document.createElement('div');
    hud.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 99999;
        background: rgba(0,0,0,0.75); color: white;
        font: 13px monospace; padding: 8px 12px; border-radius: 8px;
        pointer-events: none; opacity: 0; transition: opacity 0.3s;
    `;
    document.body.appendChild(hud);
    let hudTimeout;
    function showHud(msg) {
        hud.textContent = msg;
        hud.style.opacity = '1';
        clearTimeout(hudTimeout);
        hudTimeout = setTimeout(() => hud.style.opacity = '0', 1500);
    }

    document.addEventListener('keydown', (e) => {
        if (!e.shiftKey || !e.altKey) return;
        const key = e.key.toLowerCase();

        // Translator ein/aus
        if (key === 'x') {
            active = !active;
            console.log('[Info]', active ? 'Aktiv' : 'Pausiert');
            showHud(active ? '🟢 Translator AN' : '🔴 Translator AUS');
            reattachAll();
        }

        // Transparenz ein/aus
        if (key === 'c') {
            dimEnabled = !dimEnabled;
            showHud(dimEnabled ? '🔅 Dimmen AN' : '🔆 Dimmen AUS');
            applyAllOpacities();
        }

        // Feld wählen
        if (key === '1') {
            selectedField = 'input';
            showHud('✏️ Eingabefeld gewählt');
        }
        if (key === '2') {
            selectedField = 'output';
            showHud('📄 Übersetzungsfeld gewählt');
        }

        // Opacity anpassen
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            adjustOpacity(+0.1);
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            adjustOpacity(-0.1);
        }
    });

    function adjustOpacity(delta) {
        if (selectedField === 'input') {
            opacityInput = Math.min(1, Math.max(0, opacityInput + delta));
            showHud(`✏️ Eingabe: ${Math.round(opacityInput * 100)}%`);
        } else {
            opacityOutput = Math.min(1, Math.max(0, opacityOutput + delta));
            showHud(`📄 Übersetzung: ${Math.round(opacityOutput * 100)}%`);
        }
        applyAllOpacities();
    }

    function applyAllOpacities() {
        // Eingabefelder
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(el => {
            el.style.opacity = dimEnabled ? opacityInput : '1';
        });
        // Übersetzungsfeld
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.style.opacity = dimEnabled ? opacityOutput : '1';
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
            targetDiv.style.opacity = dimEnabled ? opacityOutput : '1';
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
            attachListeners(el);
        });
        applyAllOpacities();
    }

    const observer = new MutationObserver(() => reattachAll());
    observer.observe(document.body, { childList: true, subtree: true });
})();
