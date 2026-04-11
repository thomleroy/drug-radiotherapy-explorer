import React, { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useModalA11y } from './useModalA11y';

const Harness = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const ref = useModalA11y(open, () => {
    setOpen(false);
    onClose?.();
  });
  if (!open) return <button>opener</button>;
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      <button>first</button>
      <button>second</button>
      <button>third</button>
    </div>
  );
};

describe('useModalA11y', () => {
  test('auto-focuses the first focusable element on mount', async () => {
    render(<Harness />);
    // useEffect + setTimeout(0) — flush microtasks
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(document.activeElement).toBe(screen.getByText('first'));
  });

  test('Escape calls onClose', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('Tab on the last focusable wraps to the first', async () => {
    render(<Harness />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    const third = screen.getByText('third');
    third.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('first'));
  });

  test('Shift+Tab on the first focusable wraps to the last', async () => {
    render(<Harness />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    const first = screen.getByText('first');
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText('third'));
  });
});
