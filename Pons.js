Neuer Chat
// PONS Latin Translator – Stable Toggle Version (Shift+Alt+X)
(function() {
    'use strict';
    let active = false;
    let currentTranslation = null;
    console.log('on');
    // Toggle durch Tastenkombination (Shift + Alt + X)
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'x') {
            active = !active;
            console.log('[Info]', active ? 'A' : 'P');
            reattachAll();
        }
    });
    function fetchTranslation(text, callback) {
        const url = https://translate.googleapis.com/translate_a/single?client=gtx&sl=la&tl=de&dt=t&q=${encodeURIComponent(text.trim())};
        fetch(url)
            .then(res => res.json())
            .then(json => callback(json[0].map(x => x[0]).join('')))
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
                currentTranslation = translation;
                insertTranslation(translation);
            });
        } else {
            currentTranslation = null;
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
    const observer = new MutationObserver(() => {
        reattachAll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

Mehr anzeigen
This is a userscript for translating Latin text to German using Google Translate API. Here's what it does:

Key Features
Toggle Activation: Press Shift + Alt + X to enable/disable the translator

When active, pressing Enter in editable fields translates Latin → German instead of submitting
Console logs show "A" (active) or "P" (paused) status
Translation Flow:

Detects Enter key in contenteditable divs
Intercepts the event when active
Fetches translation from Google Translate API (sl=la for Latin, tl=de for German)
Displays result in a specific target div (.text-p2.text-gray-dark.mt-1.text-right)
Dynamic Listener Management:

Uses MutationObserver to reattach event listeners when DOM changes
Prevents duplicate listeners with removeEventListener before adding new ones
Potential Issues
API Limitations: Uses unofficial Google Translate endpoint (translate_a/single) which may be rate-limited or unreliable
Hardcoded Selector: Target div selector is very specific and may break if the page structure changes
Event Bubbling: Uses stopPropagation() which might interfere with other scripts
No Error Feedback: Failed translations silently fail (callback gets null but nothing is shown to user)
Improvements to Consider
Add visual indicator showing active/inactive state
Error handling with user feedback
More flexible target element selection
Consider using official translation APIs for reliability
The script appears designed for a specific website (likely a Latin learning platform) where you want to quickly translate practice sentences without submitting them.

// PONS Latin Translator Dot Trigger – Vanilla JS Version
// Kann direkt aus der Konsole oder als Bookmarklet geladen werden
(function() {
    'use strict';
    let currentTranslation = null;
    function fetchTranslation(text, callback) {
        console.log('[Debug] Übersetzung angefragt für:', text);
        const url = https://translate.googleapis.com/translate_a/single?client=gtx&sl=la&tl=de&dt=t&q=${encodeURIComponent(text.slice(1).trim())};
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

bitte übernehme vom ersten code die Problemlösung, dass der übersetzter nach wiederholtem benutzen nicht mehr funktioniert. Immer wenn ich die tastenkombination drücke beim ersten code, läd der code glaube ich nochmal, oder? Das bitte hier einfügen

Mehr anzeigen
Ja genau! Der erste Code nutzt reattachAll() beim Toggle, um alle Listener neu zu setzen. Das löst das Problem. Hier die verbesserte Version:

javascript
// PONS Latin Translator Dot Trigger – Stable Version
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
    
    function handler(e) {
        if (e.key !== 'Enter') return;
        const editable = e.currentTarget;
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
    
    function attachListeners(editable) {
        editable.removeEventListener('keydown', handler); // Alte Listener entfernen
        editable.addEventListener('keydown', handler);    // Neu anhängen
    }
    
    function reattachAll() {
        const editables = document.querySelectorAll('div[contenteditable="true"]');
        editables.forEach(attachListeners);
        console.log('[Debug] Listener neu angehängt auf', editables.length, 'Elemente');
    }
    
    // Beobachter für neue Editables
    const observer = new MutationObserver(() => {
        reattachAll();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('[Info] PONS Latin Dot Translator aktiviert');
})();
Änderungen:
handler Funktion ausgelagert – Gleiche Funktion wird wiederverwendet
removeEventListener vor addEventListener – Verhindert doppelte Listener
reattachAll() Funktion – Wird vom MutationObserver aufgerufen
Kein dataset.listenerAttached – Nicht mehr nötig, da wir aktiv entfernen/neu anhängen
Das removeEventListener ist der Schlüssel: Es entfernt alte Listener, bevor neue angehängt werden. Dadurch gibt es keine Duplikate mehr, die das wiederholte Benutzen stören könnten.








