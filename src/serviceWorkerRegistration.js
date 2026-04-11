// Lightweight service worker registration. Only runs in production builds
// (a service worker would interfere with HMR during development) and only
// in browsers that actually support it.

export const registerServiceWorker = () => {
  if (typeof window === 'undefined') return;
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  // Defer until after the page has loaded so we don't compete with the
  // initial render for network/CPU resources.
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    const swUrl = `${base.replace(/\/$/, '')}/service-worker.js`;
    navigator.serviceWorker.register(swUrl).catch((error) => {
      // Service worker is a progressive enhancement; never block the app.
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Service worker registration failed:', error);
      }
    });
  });
};
