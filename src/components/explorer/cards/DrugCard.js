import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { getCellColor } from '../../../utils/text';

// Memoized card view used by the mobile / tablet layout. Receives every
// piece of state as props so it can be safely memoized.
export const DrugCard = memo(({
  drug,
  isDarkMode,
  onDrugClick,
  isFavorite,
  onToggleFavorite,
  t,
  translateDrugClass,
  CATEGORY_COLORS,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow
      ${isDarkMode
        ? 'bg-gray-800 border border-gray-700'
        : 'bg-white'
      }`}
  >
    <div className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`text-lg font-semibold cursor-pointer hover:underline
            ${isDarkMode
              ? 'text-gray-200 hover:text-blue-400'
              : 'text-sfro-dark hover:text-blue-600'
            }`}
          onClick={() => onDrugClick(drug)}
        >
          {drug.name}
        </h3>
        <div className="flex gap-2">
          <Badge
            color={
              CATEGORY_COLORS[isDarkMode ? 'dark' : 'light'][drug.category] ||
              (isDarkMode
                ? 'bg-gray-700 text-gray-300 border-gray-600'
                : 'bg-gray-50 text-gray-800 border-gray-200')
            }
          >
            {t(`categories.${drug.category}`) ||
              drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
          <button
            onClick={() => onToggleFavorite(drug.id)}
            className={`p-1 rounded-full transition-colors
              ${isFavorite
                ? 'text-red-500 hover:text-red-700'
                : (isDarkMode ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500')
              }`}
            aria-label={isFavorite ? t('buttons.removeFromFavorites') : t('buttons.addToFavorites')}
          >
            ♡
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <span className={`w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('columns.commercial')}:
          </span>
          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
            {drug.commercial}
          </span>
        </div>

        <div className="flex items-center text-sm">
          <span className={`w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('columns.class')}:
          </span>
          <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
            {translateDrugClass(drug.class)}
          </span>
        </div>

        <div className={`border-t pt-3 mt-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
            {t('radiotherapyTiming') || 'Radiotherapy Timing'}
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {['normofractionatedRT', 'palliativeRT', 'stereotacticRT', 'intracranialRT'].map((field) => (
              <div
                key={field}
                className={`rounded-md p-2 ${getCellColor(drug[field], isDarkMode)} text-sm`}
              >
                <span className="font-medium">{t(`columns.${field}`)}:</span>{' '}
                {drug[field]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

export default DrugCard;
