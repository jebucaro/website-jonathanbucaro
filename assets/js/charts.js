// Chart.js bundle, loaded only on pages that used the chart shortcode.
// chart-utils.js evaluates before this module's body sets window.Chart,
// so its first init pass always misses and its 50ms retry completes the
// initialization once window.Chart exists.
import { Chart, registerables } from 'chart.js';
import './chart-utils.js';

Chart.register(...registerables);

// Export for global use
window.Chart = Chart;
