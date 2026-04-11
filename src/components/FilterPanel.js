import React from 'react';

const FilterPanel = ({
  selectedCategory,
  classFilter,
  halfLifeFilter,
  onCategoryChange,
  onClassChange,
  onHalfLifeChange,
  uniqueDrugClasses,
  isDarkMode,
  t,
  translateDrugClass,
}) => {
  const selectClasses = `h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
    ${isDarkMode
      ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary'
      : 'bg-white border-gray-200 hover:border-sfro-primary focus:border-sfro-primary'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <select
        value={selectedCategory}
        onChange={onCategoryChange}
        aria-label={t('categories.all')}
        className={selectClasses}
      >
        <option value="all">{t('categories.all')}</option>
        <option value="chemotherapy">{t('categories.chemotherapy')}</option>
        <option value="endocrine">{t('categories.endocrine')}</option>
        <option value="targeted">{t('categories.targeted')}</option>
        <option value="immunotherapy">{t('categories.immunotherapy')}</option>
      </select>

      <select
        value={classFilter}
        onChange={onClassChange}
        aria-label={t('drugClass.all')}
        className={selectClasses}
      >
        <option value="all">{t('drugClass.all')}</option>
        {uniqueDrugClasses.map((drugClass) => (
          <option key={drugClass} value={drugClass}>
            {translateDrugClass(drugClass)}
          </option>
        ))}
      </select>

      <select
        value={halfLifeFilter}
        onChange={onHalfLifeChange}
        aria-label={t('halfLife.all')}
        className={selectClasses}
      >
        <option value="all">{t('halfLife.all')}</option>
        <option value="short">{t('halfLife.short')}</option>
        <option value="long">{t('halfLife.long')}</option>
      </select>
    </div>
  );
};

export default FilterPanel;
