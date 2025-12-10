// Mermaid utilities and initialization

// Shared mermaid configuration (DRY principle)
const MERMAID_CONFIG = {
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
};

// Constants for loading behavior
const MERMAID_LOAD_RETRY_INTERVAL = 50; // ms
const MERMAID_MAX_RETRIES = 100; // 5 seconds max
const DEBOUNCE_DELAY = 250; // ms

// State management
let themeObserver = null;
let retryCount = 0;

/**
 * Get current theme based on document attributes
 * @returns {string} 'dark' or 'default'
 */
function getCurrentTheme() {
    const isDark =
        document.documentElement.hasAttribute('dark') ||
        document.documentElement.classList.contains('dark-mode');
    return isDark ? 'dark' : 'default';
}

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Store original diagram content before mermaid processes it
 */
function storeOriginalContent() {
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((element) => {
        if (!element.hasAttribute('data-original-content')) {
            element.setAttribute(
                'data-original-content',
                element.textContent.trim(),
            );
        }
    });
}

/**
 * Show error message for failed diagrams
 * @param {HTMLElement} element - The diagram element
 * @param {Error} error - The error that occurred
 */
function showDiagramError(element, error) {
    console.error('Mermaid diagram render error:', error);
    element.classList.add('mermaid-error');
    element.innerHTML = `
        <div style="padding: 1rem; border: 2px solid #ff6b6b; border-radius: 4px; background: #ffe0e0; color: #c92a2a;">
            <strong>Diagram Render Error</strong>
            <details style="margin-top: 0.5rem;">
                <summary style="cursor: pointer;">Show diagram code</summary>
                <pre style="margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; overflow-x: auto;"><code>${element.getAttribute('data-original-content') || 'No content available'}</code></pre>
            </details>
        </div>
    `;
}

/**
 * Initialize mermaid with current theme
 * @param {boolean} startOnLoad - Whether to automatically render diagrams
 */
function initializeMermaid(startOnLoad = true) {
    try {
        const theme = getCurrentTheme();
        mermaid.initialize({
            ...MERMAID_CONFIG,
            startOnLoad: startOnLoad,
            theme: theme,
        });
    } catch (error) {
        console.error('Failed to initialize mermaid:', error);
        throw error;
    }
}

/**
 * Re-render all mermaid diagrams with current theme
 */
function reRenderMermaidDiagrams() {
    try {
        // Re-initialize mermaid with new theme
        initializeMermaid(false);

        // Find all mermaid diagrams and restore their original content
        const mermaidElements = document.querySelectorAll('.mermaid');
        mermaidElements.forEach((element) => {
            const originalContent = element.getAttribute(
                'data-original-content',
            );
            if (originalContent) {
                // Clear the element and restore original Mermaid markup
                element.innerHTML = '';
                element.textContent = originalContent;
                element.removeAttribute('data-processed');
                element.classList.remove('mermaid-error');
            }
        });

        // Re-run mermaid on all diagrams
        mermaid
            .run({
                querySelector: '.mermaid',
            })
            .catch((error) => {
                console.error('Error during mermaid re-render:', error);
                // Try to render individual diagrams to isolate errors
                mermaidElements.forEach((element) => {
                    if (!element.hasAttribute('data-processed')) {
                        try {
                            mermaid.run({
                                nodes: [element],
                            });
                        } catch (err) {
                            showDiagramError(element, err);
                        }
                    }
                });
            });
    } catch (error) {
        console.error('Failed to re-render mermaid diagrams:', error);
    }
}

// Debounced version of re-render for theme observer
const debouncedReRender = debounce(reRenderMermaidDiagrams, DEBOUNCE_DELAY);

/**
 * Setup theme change observer
 */
function setupThemeObserver() {
    // Clean up existing observer if any
    if (themeObserver) {
        themeObserver.disconnect();
    }

    // Create new observer for theme changes
    themeObserver = new MutationObserver(() => {
        debouncedReRender();
    });

    // Watch for changes to the root element's attributes
    themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-color-scheme', 'class', 'dark', 'light'],
    });
}

/**
 * Initialize mermaid diagrams
 */
function initMermaid() {
    if (typeof mermaid !== 'undefined') {
        try {
            // Store original content BEFORE Mermaid processes it
            storeOriginalContent();

            // Initialize mermaid with current theme
            initializeMermaid(true);

            // Setup theme change observer
            setupThemeObserver();

            // Reset retry count on success
            retryCount = 0;

            console.log('Mermaid initialized successfully');
        } catch (error) {
            console.error('Failed to initialize mermaid:', error);

            // Show error on all diagram elements
            const mermaidElements = document.querySelectorAll('.mermaid');
            mermaidElements.forEach((element) => {
                showDiagramError(element, error);
            });
        }
    } else {
        // Mermaid not ready yet, retry with limit
        retryCount++;

        if (retryCount < MERMAID_MAX_RETRIES) {
            setTimeout(initMermaid, MERMAID_LOAD_RETRY_INTERVAL);
        } else {
            console.error(
                `Mermaid failed to load after ${MERMAID_MAX_RETRIES} retries (${(MERMAID_MAX_RETRIES * MERMAID_LOAD_RETRY_INTERVAL) / 1000}s)`,
            );

            // Show error message on diagram placeholders
            const mermaidElements = document.querySelectorAll('.mermaid');
            mermaidElements.forEach((element) => {
                showDiagramError(
                    element,
                    new Error('Mermaid library failed to load'),
                );
            });
        }
    }
}

/**
 * Cleanup function for page unload
 */
function cleanup() {
    if (themeObserver) {
        themeObserver.disconnect();
        themeObserver = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMermaid);
} else {
    initMermaid();
}

// Cleanup on page unload (prevents memory leaks)
window.addEventListener('beforeunload', cleanup);

// For SPA scenarios (if applicable)
if (typeof window.addEventListener === 'function') {
    window.addEventListener('pagehide', cleanup);
}
