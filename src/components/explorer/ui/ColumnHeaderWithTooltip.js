import React, { memo } from 'react';

// Sortable column header with hover tooltip for the long label.
// When `sortable` is true, renders an interactive button cycling
// asc → desc → off and shows a ▲/▼/↕ glyph.
export const ColumnHeaderWithTooltip = memo(({
  title,
  longTitle,
  isDarkMode,
  sortable = false,
  sortKey,
  currentSort,
  onSort,
}) => {
  const isActive = sortable && currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const inner = (
    <span className="inline-flex items-center gap-1">
      <span>{title}</span>
      {sortable && (
        <span className="text-[10px] leading-none" aria-hidden="true">
          {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}
        </span>
      )}
    </span>
  );

  const content = sortable ? (
    <button
      type="button"
      onClick={() => onSort?.(sortKey)}
      className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-sfro-primary rounded
        ${isActive ? 'text-sfro-primary' : ''}
      `}
    >
      {inner}
    </button>
  ) : (
    inner
  );

  return (
    <div className="relative group">
      {content}
      <div
        className={`invisible group-hover:visible absolute z-50 -left-2 top-full mt-1 p-2 text-xs rounded shadow-lg whitespace-nowrap
          ${isDarkMode
            ? 'bg-gray-700 text-gray-200'
            : 'bg-gray-800 text-white'
          }`}
      >
        {longTitle}
      </div>
    </div>
  );
});

export default ColumnHeaderWithTooltip;
