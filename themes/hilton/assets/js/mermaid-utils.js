// Mermaid utilities and initialization
window.mermaidInstances = window.mermaidInstances || [];

function getCurrentTheme() {
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');
    return isDark ? 'dark' : 'default';
}

function getThemeVariables() {
    const rootStyles = getComputedStyle(document.documentElement);
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');

    // Read colors from CSS variables
    const primaryColor =
        rootStyles.getPropertyValue('--primary-color').trim() || '#ffc71d';
    const backgroundColor = rootStyles
        .getPropertyValue('--background-color')
        .trim();
    const textColor = rootStyles.getPropertyValue('--text-color').trim();
    const headingColor = rootStyles
        .getPropertyValue('--heading-font-color')
        .trim();
    const borderColor = rootStyles.getPropertyValue('--border-color').trim();
    const calloutBlue =
        rootStyles.getPropertyValue('--callout-blue').trim() || '#4d65dc';
    const calloutGreen =
        rootStyles.getPropertyValue('--callout-green').trim() || '#2db47d';

    if (isDark) {
        return {
            primaryColor: primaryColor,
            primaryTextColor: '#fff',
            primaryBorderColor: '#dda000',
            secondaryColor: calloutGreen,
            secondaryTextColor: '#fff',
            secondaryBorderColor: '#1f8f5f',
            background: backgroundColor,
            mainBkg: backgroundColor,
            textColor: textColor,
            lineColor: '#999',
            nodeBorder: '#666',
            clusterBkg: '#22222a',
            clusterBorder: '#444',
            titleColor: headingColor,
            edgeLabelBackground: backgroundColor,
            tertiaryColor: '#2f3135',
            noteBkgColor: '#22222a',
            noteTextColor: textColor,
            noteBorderColor: borderColor,
        };
    } else {
        return {
            primaryColor: primaryColor,
            primaryTextColor: '#111',
            primaryBorderColor: '#dda000',
            secondaryColor: calloutBlue,
            secondaryTextColor: '#fff',
            secondaryBorderColor: '#3d52b8',
            background: backgroundColor,
            mainBkg: backgroundColor,
            textColor: textColor,
            lineColor: '#666',
            nodeBorder: '#999',
            clusterBkg: '#f5f5f5',
            clusterBorder: '#ccc',
            titleColor: headingColor,
            edgeLabelBackground: backgroundColor,
            tertiaryColor: '#eaecef',
            noteBkgColor: '#eaecef',
            noteTextColor: textColor,
            noteBorderColor: borderColor,
        };
    }
}

function initMermaid() {
    if (typeof mermaid !== 'undefined') {
        // IMPORTANT: Store original content BEFORE Mermaid processes it
        const mermaidElements = document.querySelectorAll('.mermaid');
        mermaidElements.forEach((element) => {
            if (!element.hasAttribute('data-original-content')) {
                element.setAttribute(
                    'data-original-content',
                    element.textContent.trim(),
                );
            }
        });

        const theme = getCurrentTheme();
        const themeVariables = getThemeVariables();

        mermaid.initialize({
            startOnLoad: true,
            theme: 'base',
            themeVariables: themeVariables,
            securityLevel: 'strict',
            fontFamily: 'Noto Sans Display, sans-serif',
        });

        // Listen for theme changes
        const observer = new MutationObserver(() => {
            reRenderMermaidDiagrams();
        });

        // Watch for changes to the root element's attributes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-color-scheme', 'class', 'dark', 'light'],
        });
    } else {
        // Mermaid not ready yet, try again in 50ms
        setTimeout(initMermaid, 50);
    }
}

function reRenderMermaidDiagrams() {
    const theme = getCurrentTheme();
    const themeVariables = getThemeVariables();

    // Re-initialize mermaid with new theme
    mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: themeVariables,
        securityLevel: 'strict',
        fontFamily: 'Noto Sans Display, sans-serif',
    });

    // Find all mermaid diagrams and restore their original content
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((element) => {
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            // Clear the element and restore original Mermaid markup
            element.innerHTML = '';
            element.textContent = originalContent;
            element.removeAttribute('data-processed');
        }
    });

    // Re-run mermaid on all diagrams
    mermaid.run({
        querySelector: '.mermaid',
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMermaid);
} else {
    initMermaid();
}
