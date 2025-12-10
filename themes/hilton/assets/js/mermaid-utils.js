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
 * Store original diagram content and prepare elements for rendering
 */
function storeOriginalContent() {
    const mermaidElements = document.querySelectorAll('.mermaid');
    mermaidElements.forEach((element) => {
        if (!element.hasAttribute('data-original-content')) {
            const content = element.textContent.trim();
            element.setAttribute('data-original-content', content);

            // Extract diagram title from first comment line for accessibility
            const titleMatch = content.match(/%%\s*([^\n]+)/);
            if (titleMatch) {
                element.setAttribute(
                    'data-diagram-title',
                    titleMatch[1].trim(),
                );
            }

            // Add loading state
            element.classList.add('mermaid-loading');
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
 * Get theme for a specific diagram element
 * @param {HTMLElement} element - The diagram element
 * @returns {string} Theme name
 */
function getDiagramTheme(element) {
    // Check for per-diagram theme override
    const customTheme = element.getAttribute('data-mermaid-theme');
    if (customTheme) {
        return customTheme;
    }
    // Fall back to global theme
    return getCurrentTheme();
}

/**
 * Initialize mermaid with current theme
 * @param {boolean} startOnLoad - Whether to automatically render diagrams
 * @param {string} theme - Optional theme override
 */
function initializeMermaid(startOnLoad = true, theme = null) {
    try {
        const selectedTheme = theme || getCurrentTheme();
        mermaid.initialize({
            ...MERMAID_CONFIG,
            startOnLoad: startOnLoad,
            theme: selectedTheme,
        });
    } catch (error) {
        console.error('Failed to initialize mermaid:', error);
        throw error;
    }
}

/**
 * Add accessibility attributes to rendered diagram
 * @param {HTMLElement} element - The diagram container element
 */
function addAccessibilityAttributes(element) {
    const svg = element.querySelector('svg');
    if (!svg) return;

    // Get title from data attribute or generate generic one
    const title =
        element.getAttribute('data-diagram-title') ||
        'Diagram: ' + (svg.getAttribute('aria-roledescription') || 'Diagram');

    // Add ARIA attributes
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', title);

    // Add title element if not present
    if (!svg.querySelector('title')) {
        const titleElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'title',
        );
        titleElement.textContent = title;
        svg.insertBefore(titleElement, svg.firstChild);
    }
}

/**
 * Mark diagram as rendered and add accessibility
 * @param {HTMLElement} element - The diagram element
 */
function markAsRendered(element) {
    element.classList.remove('mermaid-loading');
    element.classList.add('mermaid-rendered');
    addAccessibilityAttributes(element);
}

/**
 * Render individual diagrams with custom themes
 */
function renderDiagramsWithCustomThemes() {
    const mermaidElements = document.querySelectorAll('.mermaid');
    const diagramsByTheme = new Map();

    // Group diagrams by theme
    mermaidElements.forEach((element) => {
        const theme = getDiagramTheme(element);
        if (!diagramsByTheme.has(theme)) {
            diagramsByTheme.set(theme, []);
        }
        diagramsByTheme.get(theme).push(element);
    });

    // Render each theme group
    const renderPromises = [];
    diagramsByTheme.forEach((elements, theme) => {
        // Re-initialize with this theme
        initializeMermaid(false, theme);

        // Prepare elements
        elements.forEach((element) => {
            element.classList.add('mermaid-loading');
            element.classList.remove('mermaid-rendered', 'mermaid-error');
            const originalContent = element.getAttribute(
                'data-original-content',
            );
            if (originalContent) {
                element.innerHTML = '';
                element.textContent = originalContent;
                element.removeAttribute('data-processed');
            }
        });

        // Render this group
        const promise = mermaid
            .run({
                nodes: elements,
            })
            .then(() => {
                elements.forEach((element) => {
                    if (element.hasAttribute('data-processed')) {
                        markAsRendered(element);
                    }
                });
            })
            .catch((error) => {
                console.error(
                    `Error rendering diagrams with theme ${theme}:`,
                    error,
                );
                elements.forEach((element) => {
                    if (!element.hasAttribute('data-processed')) {
                        showDiagramError(element, error);
                    }
                });
            });

        renderPromises.push(promise);
    });

    return Promise.all(renderPromises);
}

/**
 * Re-render all mermaid diagrams with current theme
 */
function reRenderMermaidDiagrams() {
    try {
        renderDiagramsWithCustomThemes().catch((error) => {
            console.error('Failed to re-render mermaid diagrams:', error);
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

            // Wait for diagrams to render, then mark as complete
            setTimeout(() => {
                const mermaidElements = document.querySelectorAll('.mermaid');
                mermaidElements.forEach((element) => {
                    if (
                        element.hasAttribute('data-processed') &&
                        !element.classList.contains('mermaid-error')
                    ) {
                        markAsRendered(element);
                    }
                });
            }, 100);

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
