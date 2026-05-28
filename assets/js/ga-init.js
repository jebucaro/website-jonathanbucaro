window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

gtag('js', new Date());

gtag('config', '{{ .Site.Config.Services.GoogleAnalytics.ID }}', {
    anonymize_ip: true,
});
