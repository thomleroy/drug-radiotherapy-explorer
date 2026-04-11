// Lightweight service worker registration. Only runs in production builds
// (a service worker would interfere with HMR during development) and only
// in browsers that actually support it.

export const registerServiceWorker = () => {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') return;
  if (!('serviceWorker' in navigator)) return;

  // Defer until after the page has loaded so we don't compete with the
  // initial render for network/CPU resources.
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    navigator.serviceWorker.register(swUrl).catch((error) => {
      // Service worker is a progressive enhancement; never block the app.
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('Service worker registration failed:', error);
      }
    });
  });
};
