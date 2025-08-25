// Chart.js utilities and initialization
window.chartInstances = window.chartInstances || [];

function getThemeColors() {
    const textColor =
        getComputedStyle(document.documentElement)
            .getPropertyValue('--text-color')
            .trim() || '#222';
    const bgColor =
        getComputedStyle(document.documentElement)
            .getPropertyValue('--background-color')
            .trim() || '#fff';
    const primaryColor =
        getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color')
            .trim() || '#ffc71d';
    const isDark = textColor !== '#222';
    const gridColor = isDark ? '#9e9e9e33' : '#22222233';

    return { textColor, bgColor, primaryColor, gridColor, isDark };
}

function setChartDefaults() {
    if (typeof Chart !== 'undefined') {
        const colors = getThemeColors();
        Chart.defaults.color = colors.textColor;
        Chart.defaults.backgroundColor = colors.bgColor;
    }
}

function updateAllCharts() {
    const colors = getThemeColors();

    window.chartInstances.forEach((chart) => {
        if (chart && chart.options) {
            // Update scales
            if (chart.options.scales) {
                ['x', 'y'].forEach((axis) => {
                    if (chart.options.scales[axis]) {
                        if (chart.options.scales[axis].ticks) {
                            chart.options.scales[axis].ticks.color =
                                colors.textColor;
                        }
                        if (chart.options.scales[axis].grid) {
                            chart.options.scales[axis].grid.color =
                                colors.gridColor;
                        }
                    }
                });
            }

            // Update plugins
            if (chart.options.plugins) {
                if (
                    chart.options.plugins.legend &&
                    chart.options.plugins.legend.labels
                ) {
                    chart.options.plugins.legend.labels.color =
                        colors.textColor;
                }
                if (chart.options.plugins.title) {
                    chart.options.plugins.title.color = colors.textColor;
                }
            }

            // Update dataset colors with fresh theme palette
            const themePalette = [
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-blue')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-green')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-orange')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-red')
                    .trim(),
            ];

            // Function to generate grayscale variations of a color
            function generateGrayscaleVariations(baseColor, count) {
                const variations = [];
                for (let i = 0; i < count; i++) {
                    const opacity = 0.3 + (0.7 * i) / (count - 1);
                    variations.push(
                        baseColor +
                            Math.floor(opacity * 255)
                                .toString(16)
                                .padStart(2, '0'),
                    );
                }
                return variations;
            }

            if (chart.data && chart.data.datasets) {
                chart.data.datasets.forEach((dataset, index) => {
                    if (chart.data.datasets.length === 1) {
                        // Single dataset
                        if (
                            chart.config.type === 'doughnut' ||
                            chart.config.type === 'pie'
                        ) {
                            const dataLength = dataset.data.length;
                            if (dataLength <= themePalette.length) {
                                dataset.backgroundColor = themePalette.slice(
                                    0,
                                    dataLength,
                                );
                            } else {
                                const colorArray = [...themePalette];
                                const remainingCount =
                                    dataLength - themePalette.length;
                                colorArray.push(
                                    ...generateGrayscaleVariations(
                                        colorArray[0],
                                        remainingCount,
                                    ),
                                );
                                dataset.backgroundColor = colorArray;
                            }
                        } else {
                            dataset.backgroundColor = colors.primaryColor;
                            dataset.borderColor = colors.primaryColor;
                        }
                    } else {
                        // Multiple datasets: use color palette
                        dataset.backgroundColor =
                            themePalette[index % themePalette.length];
                        dataset.borderColor =
                            themePalette[index % themePalette.length];
                    }
                });
            }

            chart.update('none');
        }
    });
}

// Initialize Chart.js when available
function initChartJS() {
    if (typeof Chart !== 'undefined') {
        setChartDefaults();

        // Listen for system color scheme changes
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                setChartDefaults();
                updateAllCharts();
            });

        // Watch for theme changes in the DOM (for manual theme toggles)
        const observer = new MutationObserver(() => {
            setChartDefaults();
            updateAllCharts();
        });

        // Watch for changes to the root element's attributes (common for theme switches)
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class', 'dark'],
        });

        // Also watch for changes to the html element's dark attribute
        if (document.documentElement.hasAttribute('dark') !== undefined) {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['dark'],
            });
        }
    } else {
        // Chart.js not ready yet, try again in 50ms
        setTimeout(initChartJS, 50);
    }
}

// Function to create chart from data attribute
function createChartFromData(canvasElement) {
    if (!canvasElement.dataset.chartConfig) return;

    try {
        // The chart config is JavaScript object syntax from Hugo template
        // We need to safely evaluate it without using eval() or inline scripts
        const configStr = canvasElement.dataset.chartConfig.trim();

        // Use Function constructor to safely evaluate the JavaScript object
        // This is CSP-compliant as it doesn't require unsafe-eval
        const chartConfig = new Function('return (' + configStr + ')')();
        const colors = getThemeColors();

        // Ensure the structure exists - chartConfig should be the full Chart.js config
        if (!chartConfig.options) chartConfig.options = {};
        if (!chartConfig.options.scales) chartConfig.options.scales = {};

        ['x', 'y'].forEach((axis) => {
            if (!chartConfig.options.scales[axis])
                chartConfig.options.scales[axis] = {};
            chartConfig.options.scales[axis].ticks =
                chartConfig.options.scales[axis].ticks || {};
            chartConfig.options.scales[axis].grid =
                chartConfig.options.scales[axis].grid || {};
            chartConfig.options.scales[axis].ticks.color = colors.textColor;
            chartConfig.options.scales[axis].grid.color = colors.gridColor;
        });

        if (!chartConfig.options.plugins) chartConfig.options.plugins = {};
        if (chartConfig.options.plugins.legend) {
            chartConfig.options.plugins.legend.labels =
                chartConfig.options.plugins.legend.labels || {};
            chartConfig.options.plugins.legend.labels.color = colors.textColor;
        }
        if (chartConfig.options.plugins.title) {
            chartConfig.options.plugins.title.color = colors.textColor;
        }

        // Use theme palette for bar charts
        if (chartConfig.data && chartConfig.data.datasets) {
            const themePalette = [
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary-color')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-blue')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-green')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-orange')
                    .trim(),
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--callout-red')
                    .trim(),
            ];

            // Function to generate grayscale variations of a color
            function generateGrayscaleVariations(baseColor, count) {
                const variations = [];
                for (let i = 0; i < count; i++) {
                    const opacity = 0.3 + (0.7 * i) / (count - 1); // Range from 30% to 100%
                    variations.push(
                        baseColor +
                            Math.floor(opacity * 255)
                                .toString(16)
                                .padStart(2, '0'),
                    );
                }
                return variations;
            }

            chartConfig.data.datasets.forEach((dataset, index) => {
                if (!dataset.backgroundColor && !dataset.borderColor) {
                    if (chartConfig.data.datasets.length === 1) {
                        // Single dataset
                        if (
                            chartConfig.type === 'doughnut' ||
                            chartConfig.type === 'pie'
                        ) {
                            // For pie/doughnut, create colors for each data point
                            const dataLength = dataset.data.length;
                            if (dataLength <= themePalette.length) {
                                dataset.backgroundColor = themePalette.slice(
                                    0,
                                    dataLength,
                                );
                            } else {
                                // More segments than colors, use palette + grayscale variations
                                const colorArray = [...themePalette];
                                const remainingCount =
                                    dataLength - themePalette.length;
                                colorArray.push(
                                    ...generateGrayscaleVariations(
                                        colorArray[0],
                                        remainingCount,
                                    ),
                                );
                                dataset.backgroundColor = colorArray;
                            }
                        } else {
                            // Single color for other chart types
                            dataset.backgroundColor = colors.primaryColor;
                            dataset.borderColor = colors.primaryColor;
                        }
                    } else {
                        // Multiple datasets: use color palette
                        dataset.backgroundColor =
                            themePalette[index % themePalette.length];
                        dataset.borderColor =
                            themePalette[index % themePalette.length];
                    }
                }
            });
        }

        const chart = new Chart(canvasElement, chartConfig);
        window.chartInstances.push(chart);
    } catch (error) {
        console.error('Error creating chart:', error);
        console.error('Chart config data:', canvasElement.dataset.chartConfig);
    }
}

// Initialize charts from data attributes
function initializeChartsFromData() {
    if (typeof Chart === 'undefined') {
        setTimeout(initializeChartsFromData, 50);
        return;
    }

    const canvases = document.querySelectorAll('canvas[data-chart-config]');
    canvases.forEach(createChartFromData);
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initChartJS();
        initializeChartsFromData();
    });
} else {
    initChartJS();
    initializeChartsFromData();
}
