// Mermaid utilities and initialization
window.mermaidInstances = window.mermaidInstances || [];

function getCurrentTheme() {
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');
    return isDark ? 'dark' : 'default';
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

        mermaid.initialize({
            startOnLoad: true,
            theme: theme,
            securityLevel: 'strict',
            gantt: {
                useMaxWidth: false,
                fontSize: 12,
                sectionFontSize: 14,
                numberSectionStyles: 4,
                leftPadding: 100,
                gridLineStartPadding: 50,
            },
            journey: {
                useMaxWidth: false,
                diagramMarginX: 50,
                diagramMarginY: 20,
                boxMargin: 20,
                boxTextMargin: 5,
                width: 200,
            },
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

    // Re-initialize mermaid with new theme
    mermaid.initialize({
        startOnLoad: false,
        theme: theme,
        securityLevel: 'strict',
        gantt: {
            useMaxWidth: false,
            fontSize: 12,
            sectionFontSize: 14,
            numberSectionStyles: 4,
            leftPadding: 100,
            gridLineStartPadding: 50,
        },
        journey: {
            useMaxWidth: false,
            diagramMarginX: 50,
            diagramMarginY: 20,
            boxMargin: 20,
            boxTextMargin: 5,
            width: 200,
        },
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
