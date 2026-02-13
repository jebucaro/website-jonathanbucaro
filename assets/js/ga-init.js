// Initialize Google Analytics 4 with privacy settings
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

// Set Consent Mode v2 defaults (deny all until user consents)
gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
});

gtag('js', new Date());

// Configure GA4 with privacy-respecting settings
gtag('config', '{{ .Site.Config.Services.GoogleAnalytics.ID }}', {
    anonymize_ip: true,
});
