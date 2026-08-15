window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());

gtag('config', '{{ .Site.Config.Services.GoogleAnalytics.ID }}', {
    anonymize_ip: true,
});

// gtag.js loads off the critical path: on first real interaction, or on
// browser idle shortly after window load for visitors who never interact.
// The calls above only queue into dataLayer, which lives in memory — if the
// tab closes before gtag.js has loaded and drained that queue, the visit is
// never sent and disappears from reports entirely. Keep this fallback short:
// it does NOT hide the script from synthetic audits (Lighthouse/PSI don't
// scroll or click, so they always hit this timeout path anyway), so a longer
// delay only costs real quick-bounce visits for no measured benefit.
(function () {
    var gtagInjected = false;
    function loadGtag() {
        if (gtagInjected) {
            return;
        }
        gtagInjected = true;
        var script = document.createElement('script');
        script.async = true;
        script.src =
            'https://www.googletagmanager.com/gtag/js?id={{ .Site.Config.Services.GoogleAnalytics.ID }}';
        document.head.appendChild(script);
    }

    var interactionEvents = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
    function onInteraction() {
        interactionEvents.forEach(function (evt) {
            window.removeEventListener(evt, onInteraction);
        });
        loadGtag();
    }
    interactionEvents.forEach(function (evt) {
        window.addEventListener(evt, onInteraction, {
            passive: true,
            once: true,
        });
    });

    function scheduleGtag() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadGtag, { timeout: 2000 });
        } else {
            setTimeout(loadGtag, 2000);
        }
    }
    if (document.readyState === 'complete') {
        scheduleGtag();
    } else {
        window.addEventListener('load', scheduleGtag);
    }
})();
