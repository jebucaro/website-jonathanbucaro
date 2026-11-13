document.documentElement.classList.add('js');

// Resolves the color scheme and reflects it on <html> ([dark] + .dark-mode,
// which the stylesheet keys on) and on <meta name="color-scheme"> (which CSS
// maps to the color-scheme property, so native UI follows too).
//
// Inlined in <head> so it runs before first paint. common.js calls it again
// when the user toggles, another tab changes the stored value, or the OS
// preference changes. Pass 'light', 'dark' or null to apply an override
// directly; omit the argument to read it from localStorage.
window.applyColorScheme = function (override) {
    var root = document.documentElement;
    var pinned = root.getAttribute('data-color-scheme'); // site param

    if (pinned !== 'light' && pinned !== 'dark') {
        pinned = override;
        if (pinned === undefined) {
            try {
                pinned = localStorage.getItem('theme');
            } catch (e) {
                // Storage blocked: follow the system preference.
            }
        }
        if (pinned !== 'light' && pinned !== 'dark') pinned = null;
    }

    var dark = pinned
        ? pinned === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;

    root.toggleAttribute('dark', dark);
    root.classList.toggle('dark-mode', dark);

    var meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.content = pinned || 'light dark';
};

window.applyColorScheme();
