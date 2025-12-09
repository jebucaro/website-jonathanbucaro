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
            // Gitgraph branch colors (lightened for dark mode)
            git0: '#818cf8',
            git1: '#a78bfa',
            git2: '#f472b6',
            git3: '#fbbf24',
            git4: '#34d399',
            git5: '#2dd4bf',
            git6: '#fb923c',
            git7: '#94a3b8',
            // Gitgraph branch label colors
            gitBranchLabel0: '#ffffff',
            gitBranchLabel1: '#ffffff',
            gitBranchLabel2: '#ffffff',
            gitBranchLabel3: '#ffffff',
            gitBranchLabel4: '#ffffff',
            gitBranchLabel5: '#ffffff',
            gitBranchLabel6: '#ffffff',
            gitBranchLabel7: '#ffffff',
            // Journey diagram fill types (task score colors, lightened for dark mode)
            fillType0: '#ffd54f',
            fillType1: '#818cf8',
            fillType2: '#ffb74d',
            fillType3: '#34d399',
            fillType4: '#ffa726',
            fillType5: '#ff8a80',
            fillType6: '#ff7d8f',
            fillType7: '#ff6b6b',
            // Pie chart colors (diverse palette for dark mode)
            pie1: '#ffd54f',
            pie2: '#818cf8',
            pie3: '#34d399',
            pie4: '#fbbf24',
            pie5: '#f472b6',
            pie6: '#a78bfa',
            pie7: '#2dd4bf',
            pie8: '#fb923c',
            pie9: '#ef5350',
            pie10: '#4ade80',
            pie11: '#8b5cf6',
            pie12: '#14b8a6',
            // Sequence diagram colors
            actorBkg: backgroundColor,
            actorBorder: '#818cf8',
            actorTextColor: textColor,
            actorLineColor: '#999',
            signalColor: textColor,
            signalTextColor: textColor,
            labelBoxBkgColor: '#818cf8',
            labelBoxBorderColor: '#6366f1',
            labelTextColor: '#ffffff',
            loopTextColor: textColor,
            activationBorderColor: '#818cf8',
            activationBkgColor: '#34d399',
            sequenceNumberColor: '#ffffff',
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
            // Gitgraph branch colors (saturated for light mode)
            git0: '#6366f1',
            git1: '#8b5cf6',
            git2: '#ec4899',
            git3: '#f59e0b',
            git4: '#10b981',
            git5: '#14b8a6',
            git6: '#f97316',
            git7: '#64748b',
            // Gitgraph branch label colors (adaptive based on branch color)
            gitBranchLabel0: '#ffffff',
            gitBranchLabel1: '#ffffff',
            gitBranchLabel2: '#ffffff',
            gitBranchLabel3: '#111111',
            gitBranchLabel4: '#ffffff',
            gitBranchLabel5: '#ffffff',
            gitBranchLabel6: '#ffffff',
            gitBranchLabel7: '#ffffff',
            // Journey diagram fill types (task score colors)
            fillType0: '#ffc71d',
            fillType1: '#6366f1',
            fillType2: '#ffa500',
            fillType3: '#10b981',
            fillType4: '#ff8c00',
            fillType5: '#ff6b6b',
            fillType6: '#ee5a6f',
            fillType7: '#e74c3c',
            // Pie chart colors (diverse palette for light mode)
            pie1: '#ffc71d',
            pie2: '#6366f1',
            pie3: '#10b981',
            pie4: '#f59e0b',
            pie5: '#ec4899',
            pie6: '#8b5cf6',
            pie7: '#14b8a6',
            pie8: '#f97316',
            pie9: '#ef4444',
            pie10: '#22c55e',
            pie11: '#7c3aed',
            pie12: '#0891b2',
            // Sequence diagram colors
            actorBkg: backgroundColor,
            actorBorder: '#6366f1',
            actorTextColor: textColor,
            actorLineColor: '#666',
            signalColor: textColor,
            signalTextColor: textColor,
            labelBoxBkgColor: '#6366f1',
            labelBoxBorderColor: '#4f46e5',
            labelTextColor: '#ffffff',
            loopTextColor: textColor,
            activationBorderColor: '#6366f1',
            activationBkgColor: '#10b981',
            sequenceNumberColor: '#ffffff',
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
