import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle, Info, ExternalLink } from 'lucide-react';
import { allDrugs } from '../data/drugs';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Filter, X } from 'lucide-react'; // Ajoutez aux imports existants
import { referencesData, formatReference } from '../data/references';
import DotsOverlay from '../components/ui/DotsOverlay';
import { Globe, Mail } from 'lucide-react';
import { translations } from './translations';
import LanguageToggle from './LanguageToggle';

const DrugExplorer = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [lang, setLang] = useState('en');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [classFilter, setClassFilter] = useState('all')
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    class: true,
    category: true,
    halfLife: true,
    normofractionatedRT: true,
    palliativeRT: true,
    stereotacticRT: true,
    intracranialRT: true
  });
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [zoomedCell, setZoomedCell] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState(null);
const t = (key) => {
  const keys = key.split('.');
  let value = translations[lang];
  for (const k of keys) {
    // Add a check to handle nested translations safely
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return the original key if translation not found
    }
  }
  return value || key;
};
  // Gestionnaire de redimensionnement responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Composant Tooltip amélioré avec animation
  const Tooltip = ({ children, content }) => (
    <div className="relative inline-block">
      <div className="group">
        {children}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="invisible group-hover:visible absolute z-50 w-64 p-2 mt-2 text-sm text-white bg-sfro-dark rounded-lg shadow-lg"
        >
          {content}
        </motion.div>
      </div>
    </div>
  );

  // Fonction pour obtenir les couleurs selon la catégorie
  const getCategoryColor = (category) => {
    const colors = {
      chemotherapy: 'bg-sfro-light text-sfro-dark border-sfro-primary',
      endocrine: 'bg-purple-50 text-purple-800 border-purple-200',
      targeted: 'bg-orange-50 text-orange-800 border-orange-200',
      immunotherapy: 'bg-green-50 text-green-800 border-green-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  // Fonction pour formater les données pour l'export CSV
  const formatForCSV = useCallback((data) => {
    const header = "Drug Name,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
    const rows = data.map(drug => 
      `${drug.name},${drug.class},${drug.category},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
    ).join('\n');
    return header + rows;
  }, []);

  // Fonction de tri améliorée avec gestion des types de données
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const ReferencesPopup = ({ references, onClose }) => {
  if (!references) return null;

  const refArray = references.split(',').map(ref => ref.replace(/[\[\]]/g, '').trim());
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg max-w-4xl m-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">References</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          {refArray.map((refNumber, index) => {
            const fullReference = referencesData[refNumber];
            return (
              <div 
                key={index} 
                className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sfro-dark mb-2">Reference [{refNumber}]</div>
                  <div className="text-gray-800 leading-relaxed">
                    {fullReference?.text || `Reference text not available for [${refNumber}]`}
                  </div>
                </div>
                {fullReference?.url && (
                  <a 
                    href={fullReference.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-4 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span className="ml-2 text-sm">Open Article</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

  // Fonction pour obtenir la couleur des cellules avec accessibilité améliorée
  const getCellColor = useCallback((value) => {
    if (value === '0' || value.includes('0 (except')) return 'bg-green-100 text-green-800';
    if (value.includes('48h')) return 'bg-yellow-100 text-yellow-800';
    if (value.includes('days')) return 'bg-red-100 text-red-800';
    return '';
  }, []);

  // Fonction de filtrage améliorée avec performances optimisées
  const filterAndSortDrugs = useCallback(() => {
    let filteredDrugs = allDrugs.filter(drug => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = drug.name.toLowerCase().includes(searchLower) || 
                         drug.class.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      const matchesHalfLife = halfLifeFilter === 'all' || 
        (halfLifeFilter === 'short' && parseFloat(drug.halfLife) <= 24) ||
        (halfLifeFilter === 'long' && parseFloat(drug.halfLife) > 24);
      const matchesClass = classFilter === 'all' || drug.class === classFilter;
return matchesSearch && matchesCategory && matchesHalfLife && matchesClass;
    });

    if (sortConfig.key) {
      filteredDrugs.sort((a, b) => {
        if (sortConfig.key === 'halfLife') {
          const aValue = parseFloat(a[sortConfig.key]) || 0;
          const bValue = parseFloat(b[sortConfig.key]) || 0;
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredDrugs;
  }, [searchTerm, selectedCategory, halfLifeFilter, classFilter, sortConfig]);

  // Fonction de téléchargement améliorée avec gestion des erreurs
  const downloadCSV = useCallback(() => {
    try {
      const csv = formatForCSV(filterAndSortDrugs());
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `drug-radiotherapy-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }, [filterAndSortDrugs, formatForCSV]);

  // Stats calculées pour le dashboard
  const stats = [
    { 
      label: t('categories.all'),
      value: filterAndSortDrugs().length,
      color: 'bg-sfro-light text-sfro-dark'
    },
    { 
      label: t('categories.chemotherapy'),
      value: filterAndSortDrugs().filter(d => d.category === 'chemotherapy').length,
      color: 'bg-blue-50 text-blue-800'
    },
    { 
      label: t('categories.endocrine'),
      value: filterAndSortDrugs().filter(d => d.category === 'endocrine').length,
      color: 'bg-purple-50 text-purple-800'
    },
    { 
      label: t('categories.targeted'),
      value: filterAndSortDrugs().filter(d => d.category === 'targeted').length,
      color: 'bg-orange-50 text-orange-800'
    },
    { 
      label: t('categories.immunotherapy'),
      value: filterAndSortDrugs().filter(d => d.category === 'immunotherapy').length,
      color: 'bg-green-50 text-green-800'
    }
  ];

  // Composant pour les badges avec animation
  const Badge = ({ children, color }) => (
    <motion.span
      initial={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {children}
    </motion.span>
  );

  const DrugCard = ({ drug }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-sfro-dark">
            {drug.name}
          </h3>
          <Badge color={getCategoryColor(drug.category)}>
            {drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Class:</span>
            <Tooltip content={drug.class}>
              <span className="text-gray-900">
                {drug.class.length > 30 ? `${drug.class.substring(0, 30)}...` : drug.class}
              </span>
            </Tooltip>
          </div>

          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Half-life:</span>
            <span className="text-gray-900">{drug.halfLife}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <h4 className="text-sm font-medium text-sfro-dark mb-2">Radiotherapy Timing</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className={`rounded-md p-2 ${getCellColor(drug.normofractionatedRT)} text-sm`}>
                <span className="font-medium">Normofractionated:</span> {drug.normofractionatedRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.palliativeRT)} text-sm`}>
                <span className="font-medium">Palliative:</span> {drug.palliativeRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.stereotacticRT)} text-sm`}>
                <span className="font-medium">Stereotactic:</span> {drug.stereotacticRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.intracranialRT)} text-sm`}>
                <span className="font-medium">Intracranial:</span> {drug.intracranialRT}
              </div>
            </div>
          </div>

          {drug.references && (
            <div className="mt-2 text-xs text-gray-500">
              <button 
                onClick={() => setSelectedReferences(drug.references)}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                View References
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Composant pour le menu de filtres sur mobile
  const MobileFilters = ({ show, onClose }) => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: show ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-sfro-dark">Filters</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <span className="sr-only">Close filters</span>
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
>
  <option value="all">{t('categories.all')}</option>
  <option value="chemotherapy">{t('categories.chemotherapy')}</option>
  <option value="endocrine">{t('categories.endocrine')}</option>
  <option value="targeted">{t('categories.targeted')}</option>
  <option value="immunotherapy">{t('categories.immunotherapy')}</option>
</select>

<select
  value={classFilter}
  onChange={(e) => setClassFilter(e.target.value)}
  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
>
  <option value="all">{t('drugClass.all')}</option>
  {[...new Set(allDrugs.map(drug => drug.class))].sort().map(drugClass => (
    <option key={drugClass} value={drugClass}>
      {lang === 'fr' && translations.fr.drugClasses?.[drugClass] 
        ? translations.fr.drugClasses[drugClass] 
        : drugClass}
    </option>
  ))}
</select>
      </div>
    </motion.div>
  );

  const formatColumnName = (column) => {
    return t(`columns.${column}`);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="w-full max-w-7xl mx-auto my-8 shadow-xl">
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-[#00BFF3] via-[#0080A5] to-[#006080] text-white rounded-t-xl">
  {/* Position absolue pour le toggle de langue */}
  <div className="absolute top-4 right-4 z-20">
    <LanguageToggle lang={lang} setLang={setLang} />
  </div>

  {/* Fond décoratif avec motif et animation */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent animate-pulse" />
    <div 
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    />
  </div>
  
  <div className="relative py-6 px-4 sm:px-6 md:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        {/* Texte et Titre */}
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <img 
              src="/sfro-logo.png" 
              alt="SFRO Logo" 
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Dashboard statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.color} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search bar and filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full border-2 border-gray-200 hover:border-sfro-primary focus:border-sfro-primary focus:ring-2 focus:ring-sfro-light transition-colors rounded-lg"
                />
              </div>

              <select
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
>
  <option value="all">{t('categories.all')}</option>
  <option value="chemotherapy">{t('categories.chemotherapy')}</option>
  <option value="endocrine">{t('categories.endocrine')}</option>
  <option value="targeted">{t('categories.targeted')}</option>
  <option value="immunotherapy">{t('categories.immunotherapy')}</option>
</select>

              <select
  value={halfLifeFilter}
  onChange={(e) => setHalfLifeFilter(e.target.value)}
  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
>
  <option value="all">{t('halfLife.all')}</option>
  <option value="short">{t('halfLife.short')}</option>
  <option value="long">{t('halfLife.long')}</option>
</select>

              <select
  value={classFilter}
  onChange={(e) => setClassFilter(e.target.value)}
  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
>
  <option value="all">{t('drugClass.all')}</option>
  {[...new Set(allDrugs.map(drug => drug.class))].sort().map(drugClass => (
    <option key={drugClass} value={drugClass}>
      {t(`drugClasses.${drugClass}`) || drugClass}
    </option>
  ))}
</select>
            </div>
          </div>

          {/* Action buttons */}
<div className="flex justify-end gap-4">
  {!isMobileView && (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setShowColumnManager(!showColumnManager)}
      className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors px-6 py-3 rounded-lg text-gray-700 shadow-sm font-medium"
    >
      <Settings className="h-5 w-5" />
      {t('buttons.manageColumns')}
    </motion.button>
  )}

  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={downloadCSV}
    className="flex items-center gap-2 bg-sfro-primary hover:bg-sfro-secondary transition-colors px-6 py-3 rounded-lg text-white shadow-sm font-medium"
  >
    <Download className="h-5 w-5" />
    {t('buttons.exportCSV')}
  </motion.button>
</div>

          {/* Conditional Mobile/Desktop View */}
          <AnimatePresence>
            {isMobileView ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filterAndSortDrugs().map((drug, index) => (
                  <DrugCard key={`${drug.name}-${index}`} drug={drug} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg shadow-lg"
              >
 

{/* Column Manager Modal */}
<AnimatePresence>
  {showColumnManager && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl p-6 w-80 max-w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-sfro-dark">{t('columnManager.title')}</h3>
          <button 
            onClick={() => setShowColumnManager(false)}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(visibleColumns).map(([column, isVisible]) => (
            <label key={column} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input 
                type="checkbox"
                checked={isVisible}
                onChange={() => setVisibleColumns(prev => ({...prev, [column]: !prev[column]}))}
                className="rounded text-sfro-primary focus:ring-sfro-primary h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">{formatColumnName(column)}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowColumnManager(false)}
            className="px-4 py-2 bg-sfro-primary text-white rounded-md hover:bg-sfro-secondary focus:outline-none focus:ring-2 focus:ring-sfro-light"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

                <table className="w-full border-collapse bg-white table-fixed">
                  <thead className="sticky top-0 bg-sfro-light z-10">
  <tr>
    {visibleColumns.name && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">
        <button className="flex items-center hover:text-sfro-primary" onClick={() => requestSort('name')}>
          {t('columns.name')} <HelpCircle className="ml-1 h-3 w-3" />
        </button>
      </th>
    )}
    {visibleColumns.class && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">
        {t('columns.class')}
      </th>
    )}
    {visibleColumns.category && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.category')}
      </th>
    )}
    {visibleColumns.halfLife && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.halfLife')}
      </th>
    )}
    {visibleColumns.normofractionatedRT && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.normofractionatedRT')}
      </th>
    )}
    {visibleColumns.palliativeRT && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.palliativeRT')}
      </th>
    )}
    {visibleColumns.stereotacticRT && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.stereotacticRT')}
      </th>
    )}
    {visibleColumns.intracranialRT && (
      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
        {t('columns.intracranialRT')}
      </th>
    )}
  </tr>
</thead>
                  <tbody className="divide-y divide-gray-200">
                    {filterAndSortDrugs().map((drug, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out text-xs">
                        {visibleColumns.name && (
                          <td className="px-3 py-2 whitespace-normal font-medium text-sfro-dark">
                            <button 
                              onClick={() => drug.references && setSelectedReferences(drug.references)}
                              className={`text-left ${drug.references ? 'text-blue-600 hover:text-blue-800 hover:underline' : ''}`}
                            >
                              {drug.name}
                            </button>
                          </td>
                        )}
                        {visibleColumns.class && (
  <td className="px-3 py-2 whitespace-normal text-gray-500 truncate max-w-[200px]">
    <Tooltip content={drug.class}>
      {lang === 'fr' 
        ? (t(`drugClasses.${drug.class}`) || drug.class) 
        : drug.class}
    </Tooltip>
  </td>
)}
                        {visibleColumns.category && (
                          <td className="px-3 py-2">
                            <Badge color={getCategoryColor(drug.category)}>
                              {drug.category.substring(0, 3)}
                            </Badge>
                          </td>
                        )}
                        {visibleColumns.halfLife && (
                          <td className="px-3 py-2 whitespace-normal text-gray-500">{drug.halfLife}</td>
                        )}
                        {visibleColumns.normofractionatedRT && (
                          <td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.normofractionatedRT)}`}>
                            {drug.normofractionatedRT}
                          </td>
                        )}
                        {visibleColumns.palliativeRT && (
                          <td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.palliativeRT)}`}>
                            {drug.palliativeRT}
                          </td>
                        )}
                        {visibleColumns.stereotacticRT && (
                          <td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.stereotacticRT)}`}>
                            {drug.stereotacticRT}
                          </td>
                        )}
                        {visibleColumns.intracranialRT && (
                          <td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.intracranialRT)}`}>
                            {drug.intracranialRT}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border rounded"></div>
              <span>{t('legend.noDelay')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
              <span>{t('legend.shortDelay')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border rounded"></div>
              <span>{t('legend.longDelay')}</span>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
<div className="border-t border-gray-200 mt-8 p-6 bg-sfro-light">
  <div className="flex flex-col md:flex-row justify-between items-center text-sm text-sfro-dark space-y-4 md:space-y-0">
    <div>
      © 2025 SFRO - Société Française de Radiothérapie Oncologique
    </div>
    <div className="flex items-center gap-6">
      
      <a href="mailto:contact@sfro.fr" className="hover:text-sfro-primary transition-colors flex items-center gap-2">
        <Mail className="h-4 w-4" />
        contact
      </a>
      <div className="flex gap-4">
        <a href="#" className="hover:text-sfro-primary transition-colors">{t('footer.about')}</a>
        <a href="#" className="hover:text-sfro-primary transition-colors">{t('footer.legal')}</a>
      </div>
    </div>
  </div>
</div>
      </Card>

      {/* References Popup */}
      <ReferencesPopup 
        references={selectedReferences}
        onClose={() => setSelectedReferences(null)}
      />
    </div>
  );
};

export default DrugExplorer;