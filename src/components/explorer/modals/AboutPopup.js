import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import { renderMarkdownContent } from '../../../utils/markdown';

// Memoized About dialog. The bilingual content lives in
// src/components/explorer/content/aboutContent.js and is rendered
// through a tiny markdown helper.
export const AboutPopup = memo(({ show, onClose, content, lang, isDarkMode, t }) => {
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;

  const aboutData = content[lang];
  const titleId = 'about-dialog-title';

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
        transition={{ type: 'spring', damping: 20 }}
        className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
          ${isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 border-b px-6 py-4 rounded-t-lg
          ${isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
          }`}>
          <div className="flex justify-between items-center">
            <h2 id={titleId} className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
              {aboutData.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('buttons.close')}
              className={`rounded-full p-2 transition-colors
                ${isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              <X size={24} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="prose max-w-none">
            {renderMarkdownContent(aboutData.content, isDarkMode)}
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default AboutPopup;
