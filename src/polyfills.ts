/**
 * Polyfill for browser support (e.g., support for IE11)
 * Add or remove polyfills based on your target browsers.
 */

// Zone.js is essential for Angular apps
import 'zone.js';  // Included with Angular CLI.

if (typeof document === 'undefined') {
  (window as any).global = window;
  (window as any).process = { env: { DEBUG: undefined } };
}
