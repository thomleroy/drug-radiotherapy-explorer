import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import { isSafeHttpUrl } from '../../../utils/security';
import { parseReferenceTokens } from '../../../utils/text';
import { referencesData } from '../../../data/references';

// Renders a "no references available" message inside the same dialog
// chrome as the populated state — extracted to keep the main component
// readable.
const renderEmptyState = ({ dialogRef, titleId, isDarkMode, t, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
      className={`p-6 rounded-lg max-w-md m-4
        ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
      `}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 id={titleId} className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {t('references.title')}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('buttons.close')}
          className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>
      <div className={`p-4 rounded-lg text-center
        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
      `}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          {t('references.noReferences')}
        </p>
      </div>
    </motion.div>
  </div>
);

// Memoized References dialog. Defensive against undefined / non-string
// references and the "[None]" sentinel.
export const ReferencesPopup = memo(({ references, onClose, isDarkMode, t }) => {
  const isOpen = Boolean(references);
  const dialogRef = useModalA11y(isOpen, onClose);
  const titleId = 'references-dialog-title';

  if (!references) return null;

  if (references === 'no-references') {
    return renderEmptyState({ dialogRef, titleId, isDarkMode, t, onClose });
  }

  const refArray = parseReferenceTokens(references);

  if (refArray.length === 0) {
    return renderEmptyState({ dialogRef, titleId, isDarkMode, t, onClose });
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
        className={`p-6 rounded-lg max-w-4xl m-4 max-h-[80vh] overflow-y-auto
          ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id={titleId} className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {t('references.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.close')}
            className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4">
          {refArray.map((refNumber, index) => {
            const fullReference = referencesData[refNumber];
            const hasSafeUrl = fullReference?.url && isSafeHttpUrl(fullReference.url);
            return (
              <motion.div
                key={`ref-${refNumber}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between
                  ${isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <div>
                  <div className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
                    Reference [{refNumber}]
                  </div>
                  <div className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    {fullReference?.text || `Reference text not available for [${refNumber}]`}
                  </div>
                </div>
                {hasSafeUrl && (
                  <a
                    href={fullReference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-4 flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    <span className="ml-2 text-sm">{t('references.openArticle')}</span>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
});

export default ReferencesPopup;
