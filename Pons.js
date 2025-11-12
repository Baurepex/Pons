// PONS Latin Translator Dot Trigger – Vanilla JS Version
// Kann direkt aus der Konsole oder als Bookmarklet geladen werden

(function() {
    'use strict';

    let currentTranslation = null;

    function fetchTranslation(text, callback) {
        console.log('[Debug] Übersetzung angefragt für:', text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=la&tl=de&dt=t&q=${encodeURIComponent(text.slice(1).trim())}`;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                const translation = json[0].map(x => x[0]).join('');
                console.log('[Debug] Übersetzung erhalten:', translation);
                callback(translation);
            })
            .catch(err => {
                console.error('[Debug] Übersetzungsfehler:', err);
                callback(null);
            });
    }

    function insertTranslation(translation) {
        const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
        if (!targetDiv) return;
        targetDiv.textContent = translation;
    }

    function attachListeners(editable) {
        if (editable.dataset.listenerAttached) return;
        editable.dataset.listenerAttached = "true";

        editable.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = editable.innerText;
                console.log('[Debug] Enter gedrückt, Text:', text);

                if (text.startsWith('.')) { // Punkt als Trigger
                    e.preventDefault();
                    e.stopPropagation();
                    fetchTranslation(text, (translation) => {
                        currentTranslation = translation;
                        insertTranslation(translation);
                    });
                } else {
                    currentTranslation = null;
                    const targetDiv = document.querySelector('.text-p2.text-gray-dark.mt-1.text-right');
                    if (targetDiv) targetDiv.textContent = 'In dieser Sprachkombination bieten wir nur ein Wörterbuch an';
                }
            }
        });
    }

    // Beobachter für neue Editables
    const observer = new MutationObserver(() => {
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(attachListeners);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Info] PONS Latin Dot Translator aktiviert');
})();
