// Mermaid utilities and initialization
window.mermaidInstances = window.mermaidInstances || [];

function getCurrentTheme() {
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');
    return isDark ? 'dark' : 'default';
}

function getThemeVariables() {
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');

    if (isDark) {
        return {
            primaryColor: '#BB2528',
            primaryTextColor: '#fff',
            primaryBorderColor: '#7C0000',
            secondaryColor: '#006100',
            secondaryTextColor: '#fff',
            secondaryBorderColor: '#004d00',
            background: '#1f2020',
            mainBkg: '#1f2020',
            textColor: '#ddd',
            lineColor: '#999',
            nodeBorder: '#777',
            clusterBkg: '#2a2a2a',
            clusterBorder: '#666',
            titleColor: '#F8F8F8',
            edgeLabelBackground: '#1f2020',
            tertiaryColor: '#3a3a3a',
        };
    } else {
        return {
            primaryColor: '#ffc71d',
            primaryTextColor: '#222',
            primaryBorderColor: '#dda000',
            secondaryColor: '#4CAF50',
            secondaryTextColor: '#fff',
            secondaryBorderColor: '#388E3C',
            background: '#fff',
            mainBkg: '#fff',
            textColor: '#222',
            lineColor: '#666',
            nodeBorder: '#999',
            clusterBkg: '#f9f9f9',
            clusterBorder: '#ccc',
            titleColor: '#222',
            edgeLabelBackground: '#fff',
            tertiaryColor: '#f0f0f0',
        };
    }
}

function initMermaid() {
    if (typeof mermaid !== 'undefined') {
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

    // Find all mermaid diagrams and re-render them
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((element, index) => {
        // Store the original content
        const originalContent = element.getAttribute('data-original-content');
        if (originalContent) {
            element.textContent = originalContent;
            element.removeAttribute('data-processed');
        } else {
            // First time, store the content
            element.setAttribute(
                'data-original-content',
                element.textContent.trim(),
            );
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
