

(function() {
    'use strict';

    let active = false;
    let currentTranslation = null;

    console.log('on');

 
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'x') {
            active = !active;
            console.log('[Info]', active ? 'A' : 'P');
            reattachAll();
        }
    });

    function fetchTranslation(text, callback) {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=la&tl=de&dt=t&q=${encodeURIComponent(text.trim())}`;
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
