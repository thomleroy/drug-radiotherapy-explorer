import React from 'react';

const FilterPanel = ({
  selectedCategory,
  halfLifeFilter,
  classFilter,
  onCategoryChange,
  onHalfLifeChange,
  onClassChange,
  uniqueDrugClasses,
  isDarkMode,
  t,
  translateDrugClass
}) => (
  <>
    <select
      value={selectedCategory}
      onChange={onCategoryChange}
      className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
        ${isDarkMode
          ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary'
          : 'bg-white border-gray-200 hover:border-sfro-primary focus:border-sfro-primary'
        }`}
    >
      <option value="all">{t('categories.all')}</option>
      <option value="chemotherapy">{t('categories.chemotherapy')}</option>
      <option value="endocrine">{t('categories.endocrine')}</option>
      <option value="targeted">{t('categories.targeted')}</option>
      <option value="immunotherapy">{t('categories.immunotherapy')}</option>
    </select>

    <select
      value={halfLifeFilter}
      onChange={onHalfLifeChange}
      className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
        ${isDarkMode
          : 'bg-white border-gray-200 hover:border-sfro-primary focus:border-sfro-primary'
  

    <select
      value={classFilter}
      onChange={onClassChange}
      className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
        ${isDarkMode
          ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary'
          : 'bg-white border-gray-200 hover:border-sfro-primary focus:border-sfro-primary'
        }`}
    >
      <option value="all">{t('drugClass.all')}</option>
      {uniqueDrugClasses.map(drugClass => (
        <option key={drugClass} value={drugClass}>
          {translateDrugClass(drugClass)}
        </option>
      ))}
    </select>
  </>
);

export default FilterPanel;
