window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());

gtag('config', '{{ .Site.Config.Services.GoogleAnalytics.ID }}', {
    anonymize_ip: true,
});

// gtag.js loads off the critical path: after window load, on browser idle.
// The calls above only queue into dataLayer; gtag.js drains the queue
// whenever it arrives, so nothing is lost by loading late.
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
