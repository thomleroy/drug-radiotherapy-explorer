import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Listbox of search suggestions. When the only suggestions are "recent"
// queries, also renders a footer that lets the user clear them.
export const SearchSuggestions = memo(({
  suggestions,
  showSuggestions,
  selectedIndex,
  onSelect,
  isDarkMode,
  t,
  suggestionsRef,
  listboxId,
  onClearRecent,
}) => {
  if (!showSuggestions || suggestions.length === 0) return null;

  const isRecent = suggestions.every((s) => s.type === 'recent');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      ref={suggestionsRef}
      className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-md shadow-lg border max-h-72 overflow-hidden
        ${isDarkMode
          ? 'bg-gray-800 border-gray-600'
          : 'bg-white border-gray-200'
        }`}
    >
      <ul
        id={listboxId}
        role="listbox"
        aria-label={t('search')}
        className="list-none p-0 max-h-64 overflow-y-auto"
      >
        {suggestions.map((suggestion, index) => {
          const isSelected = selectedIndex === index;
          return (
            <li
              key={`${suggestion.type}-${suggestion.text}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={isSelected}
              className={`px-4 py-2 cursor-pointer flex items-center justify-between
                ${isSelected
                  ? (isDarkMode ? 'bg-sfro-primary/20 text-white' : 'bg-sfro-light text-sfro-dark')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
                }`}
              onMouseDown={(e) => {
                // Prevent input blur before click handler runs.
                e.preventDefault();
                onSelect(suggestion);
              }}
            >
              <div className="flex items-center">
                <Search className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} aria-hidden="true" />
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                  {suggestion.text}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded
                ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}
              `}>
                {suggestion.type === 'drug' ? t('columns.name') :
                 suggestion.type === 'commercial' ? t('columns.commercial') :
                 suggestion.type === 'dci' ? t('columns.dci') :
                 suggestion.type === 'protocol' ? 'Protocol' :
                 suggestion.type === 'recent' ? '↻' :
                 t('columns.class')}
              </span>
            </li>
          );
        })}
      </ul>
      {isRecent && onClearRecent && (
        <div
          className={`border-t px-4 py-2 text-right
            ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}
          `}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onClearRecent();
            }}
            className={`text-xs font-medium underline
              ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-sfro-primary'}
            `}
          >
            {t('filtersMeta.clearRecent')}
          </button>
        </div>
      )}
    </motion.div>
  );
});

export default SearchSuggestions;
