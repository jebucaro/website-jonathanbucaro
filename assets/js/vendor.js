// Vendor libraries from modern/ESM entry points — js.Build (esbuild) bundles
// these directly, skipping each package's pre-transpiled dist build.
import Lightense from 'lightense-images/src/index.js';
import reframe from 'reframe.js/dist/reframe.es.js';
import { tns } from 'tiny-slider/src/tiny-slider.js';

// Export for global use
window.Lightense = Lightense;
window.reframe = reframe;
window.tns = tns;
