// Initialize Google Analytics 4 with privacy settings
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());

// Configure GA4 with privacy-respecting settings
gtag('config', '{{ .Site.Config.Services.GoogleAnalytics.ID }}', {
    anonymize_ip: true,
    storage: 'none',
    client_storage: 'sessionStorage',
});
