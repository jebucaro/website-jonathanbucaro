(function () {
    'use strict';

    var STORAGE_KEY = 'cookie_consent';

    function updateConsent(granted) {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                analytics_storage: granted ? 'granted' : 'denied',
            });
        }
    }

    function hideBanner(banner) {
        banner.classList.remove('site-notice--visible');
        banner.addEventListener('transitionend', function handler() {
            banner.style.display = 'none';
            banner.removeEventListener('transitionend', handler);
        });
    }

    function showBanner(banner) {
        banner.style.display = '';
        // Force reflow so the transition triggers
        banner.offsetHeight;
        banner.classList.add('site-notice--visible');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var consent = localStorage.getItem(STORAGE_KEY);
        var banner = document.getElementById('siteNotice');

        if (!banner) return;

        if (consent === 'granted') {
            updateConsent(true);
            return;
        }

        if (consent === 'denied') {
            return;
        }

        // No choice yet — show the banner
        showBanner(banner);

        document
            .getElementById('noticeAcceptBtn')
            .addEventListener('click', function () {
                localStorage.setItem(STORAGE_KEY, 'granted');
                updateConsent(true);
                hideBanner(banner);
            });

        document
            .getElementById('noticeDeclineBtn')
            .addEventListener('click', function () {
                localStorage.setItem(STORAGE_KEY, 'denied');
                updateConsent(false);
                hideBanner(banner);
            });
    });
})();
