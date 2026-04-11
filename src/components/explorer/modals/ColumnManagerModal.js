import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';

// Accessible Column Manager modal: lets users toggle which columns are
// visible in the desktop drug table.
export const ColumnManagerModal = memo(({
  show,
  onClose,
  visibleColumns,
  onChange,
  isDarkMode,
  t,
  formatColumnName,
}) => {
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;

  const titleId = 'column-manager-title';
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
        onClick={(e) => e.stopPropagation()}
        className={`rounded-lg shadow-xl p-6 w-80 max-w-full mx-4
          ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id={titleId} className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
            {t('columnManager.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.close')}
            className={`rounded-full p-1 transition-colors
              ${isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(visibleColumns).map(([column, isVisible]) => (
            <label
              key={column}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded transition-colors
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
              `}
            >
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => onChange(column, !isVisible)}
                className="rounded text-sfro-primary focus:ring-sfro-primary h-4 w-4"
              />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatColumnName(column)}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-sfro-primary text-white rounded-md hover:bg-sfro-secondary focus:outline-none focus:ring-2 focus:ring-sfro-light"
          >
            {t('buttons.done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

export default ColumnManagerModal;
