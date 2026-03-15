(function () {
    'use strict';
    const GROQ_API_KEY = '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'; // <-- eintragen
    const GROQ_MODEL = 'llama-3.3-70b-versatile';
    let active = false;
    let dimEnabled = true;

    let opacityInput = 0.1;
    let opacityOutput = 0.25;

    let selectedField = 'input';

    console.log('[Pons Translator] loaded');

    document.addEventListener('keydown', (e) => {
        if (!e.shiftKey || !e.altKey) return;

        if (e.code === 'KeyX') {
            active = !active;
            console.log('[Info]', active ? 'Active' : 'Paused');
            reattachAll();
        }

        if (e.code === 'KeyC') {
            dimEnabled = !dimEnabled;
            console.log('[Info] Dim:', dimEnabled ? 'On' : 'Off');
            applyAllOpacities();
        }

        if (e.code === 'Digit1') {
            selectedField = 'input';
            console.log('[Info] Field: Input');
        }
        if (e.code === 'Digit2') {
            selectedField = 'output';
            console.log('[Info] Field: Output');
        }

        if (e.code === 'ArrowUp') {
            e.preventDefault();
            adjustOpacity(+0.1);
        }
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            adjustOpacity(-0.1);
        }
    });

    function adjustOpacity(delta) {
        if (selectedField === 'input') {
            opacityInput = Math.min(1, Math.max(0, opacityInput + delta));
            console.log('[Pons] Input opacity:', Math.round(opacityInput * 100) + '%');
        } else {
            opacityOutput = Math.min(1, Math.max(0, opacityOutput + delta));
            console.log('[Pons] Output opacity:', Math.round(opacityOutput * 100) + '%');
        }
        applyAllOpacities();
    }

    function applyAllOpacities() {
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(el => {
            el.style.opacity = (active && dimEnabled) ? opacityInput : '1';
        });

        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.style.opacity = (active && dimEnabled) ? opacityOutput : '1';
        }
    }

    function fetchTranslation(text, callback) {
        console.log('[Pons] Sending request for:', text);
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
            console.log('[Pons] Response:', json);
            callback(json.choices[0].message.content.trim());
        })
        .catch(err => {
            console.error('[Pons] Error:', err);
            callback(null);
        });
    }

    function insertTranslation(translation) {
        console.log('[Pons] Translation:', translation);
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (targetDiv) {
            targetDiv.textContent = translation;
            targetDiv.style.opacity = (active && dimEnabled) ? opacityOutput : '1';
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
        editables.forEach(el => attachListeners(el));
        applyAllOpacities();
    }

    const observer = new MutationObserver(() => reattachAll());
    observer.observe(document.body, { childList: true, subtree: true });
})();
