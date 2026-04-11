import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

// Keyboard-shortcut help dialog. Triggered by the toolbar button or the
// "?" key (the parent component owns the keypress listener).
export const HelpModal = memo(({ show, onClose, isDarkMode, t, isMacPlatform }) => {
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;
  const titleId = 'help-dialog-title';
  const cmd = isMacPlatform ? '⌘' : 'Ctrl';
  const shortcuts = [
    { keys: [`${cmd}`, 'K'], label: t('shortcuts.focusSearch') },
    { keys: ['?'], label: t('shortcuts.help') },
    { keys: ['Esc'], label: t('shortcuts.close') },
    { keys: ['↑', '↓'], label: t('shortcuts.navigateSuggestions') },
    { keys: ['Enter'], label: t('shortcuts.selectSuggestion') },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`rounded-lg shadow-xl max-w-md w-full p-6
          ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white text-sfro-dark'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-xl font-bold">
            {t('shortcuts.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.close')}
            className={`rounded-full p-1
              ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}
            `}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-3">
          {shortcuts.map((sc) => (
            <li key={sc.label} className="flex justify-between items-center text-sm">
              <span>{sc.label}</span>
              <span className="flex gap-1">
                {sc.keys.map((k) => (
                  <kbd
                    key={k}
                    className={`px-1.5 py-0.5 rounded border text-[11px] font-mono font-semibold
                      ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
});

export default HelpModal;
