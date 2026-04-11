import { useEffect, useRef } from 'react';

// Accessible modal dialog behaviour: ESC to close, focus trap with Tab,
// auto-focus the first focusable element and restore focus to the
// previously focused element on unmount. Returns a ref that should be
// attached to the dialog container.
export const useModalA11y = (isOpen, onClose) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused =
      typeof document !== 'undefined' ? document.activeElement : null;

    const getFocusable = () => {
      const node = containerRef.current;
      if (!node) return [];
      return Array.from(
        node.querySelectorAll(
          'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
        )
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    };

    const focusTimer = setTimeout(() => {
      const focusables = getFocusable();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (containerRef.current) {
        containerRef.current.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
};
