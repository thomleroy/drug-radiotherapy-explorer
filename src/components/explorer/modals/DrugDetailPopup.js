import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useModalA11y } from '../hooks/useModalA11y';
import { getCellColor, hasMeaningfulReferences } from '../../../utils/text';

// Compact read-only panel that shows all information for a single drug,
// plus a shortcut to its bibliography (when present).
export const DrugDetailPopup = memo(({
  drug,
  onClose,
  onOpenReferences,
  isDarkMode,
  t,
  translateDrugClass,
}) => {
  const isOpen = Boolean(drug);
  const dialogRef = useModalA11y(isOpen, onClose);
  const titleId = 'drug-detail-dialog-title';

  if (!drug) return null;

  const timings = [
    { key: 'normofractionatedRT', label: t('columns.normofractionatedRT'), value: drug.normofractionatedRT },
    { key: 'palliativeRT', label: t('columns.palliativeRT'), value: drug.palliativeRT },
    { key: 'stereotacticRT', label: t('columns.stereotacticRT'), value: drug.stereotacticRT },
    { key: 'intracranialRT', label: t('columns.intracranialRT'), value: drug.intracranialRT },
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
        transition={{ type: 'spring', damping: 20 }}
        className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto
          ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`sticky top-0 border-b px-6 py-4 rounded-t-lg flex justify-between items-center
            ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}
        >
          <div>
            <h2 id={titleId} className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
              {drug.name}
            </h2>
            {drug.commercial && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {drug.commercial}
              </p>
            )}
          </div>
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

        <div className="p-6 space-y-6">
          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3
              ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            `}>
              {t('details.title')}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {drug.administration && (
                <div>
                  <dt className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('details.administration')}
                  </dt>
                  <dd className={isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}>
                    {drug.administration}
                  </dd>
                </div>
              )}
              {drug.halfLife && (
                <div>
                  <dt className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('details.halfLife')}
                  </dt>
                  <dd className={isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}>
                    {drug.halfLife}
                  </dd>
                </div>
              )}
              {drug.class && (
                <div>
                  <dt className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('details.class')}
                  </dt>
                  <dd className={isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}>
                    {translateDrugClass(drug.class)}
                  </dd>
                </div>
              )}
              {drug.category && (
                <div>
                  <dt className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('details.category')}
                  </dt>
                  <dd className={isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}>
                    {t(`categories.${drug.category}`)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className={`text-xs font-semibold uppercase tracking-wide mb-3
              ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            `}>
              {t('details.radiotherapyTimings')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timings.map((timing) => (
                <div
                  key={timing.key}
                  className={`rounded-lg p-3 border ${getCellColor(timing.value, isDarkMode)}
                    ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}
                  `}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide mb-1 opacity-80">
                    {timing.label}
                  </div>
                  <div className="text-sm font-medium">
                    {timing.value || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasMeaningfulReferences(drug.references) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onOpenReferences(drug.references)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sfro-primary hover:bg-sfro-secondary text-white font-medium transition-colors"
              >
                <ExternalLink size={16} aria-hidden="true" />
                {t('details.seeReferences')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});

export default DrugDetailPopup;
