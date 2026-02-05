(function () {
    function detectLanguage() {
        var path = window.location.pathname || '';
        if (path.indexOf('/es/') === 0) {
            return 'es';
        }
        return 'en';
    }

    function setLanguageContent() {
        var lang = detectLanguage();
        var errorText = document.getElementById('errorText');
        var homeButton = document.getElementById('homeButton');

        if (lang === 'es') {
            document.documentElement.lang = 'es';
            document.title = '404 - Página no encontrada | Jonathan Búcaro';
            if (errorText)
                errorText.textContent =
                    'La página solicitada no pudo ser encontrada.';
            if (homeButton) {
                homeButton.textContent = 'Regresar al Inicio';
                homeButton.href = '/es/';
            }
            return;
        }

        document.documentElement.lang = 'en';
        document.title = '404 - Page Not Found | Jonathan Búcaro';
        if (errorText)
            errorText.textContent = 'The requested page could not be found.';
        if (homeButton) {
            homeButton.textContent = 'Return to Home';
            homeButton.href = '/';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setLanguageContent);
    } else {
        setLanguageContent();
    }
})();
