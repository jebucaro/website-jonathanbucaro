// Import vendor libraries directly from node_modules
import Lightense from 'lightense-images/dist/lightense.js';
import reframe from 'reframe.js/dist/reframe.js';
import { tns } from 'tiny-slider/dist/tiny-slider.js';
import LazyLoad from 'vanilla-lazyload/dist/lazyload.js';
import smoothscroll from 'smoothscroll-polyfill/dist/smoothscroll.js';
import { Chart, registerables } from 'chart.js';
import mermaid from 'mermaid';

// Initialize smoothscroll polyfill
smoothscroll.polyfill();

// Register Chart.js components
Chart.register(...registerables);

// Export for global use
window.Lightense = Lightense;
window.reframe = reframe;
window.tns = tns;
window.LazyLoad = LazyLoad;
window.Chart = Chart;
window.mermaid = mermaid;

// Basic library initializations that don't conflict with common.js
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
        // Initialize LazyLoad for basic lazy loading
        const lazyLoadInstance = new LazyLoad({
            elements_selector: '.lazy',
        });

        // Make LazyLoad instance available globally
        window.lazyLoadInstance = lazyLoadInstance;
    });
}
