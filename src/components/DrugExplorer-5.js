import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle, Info, ExternalLink, Settings, Filter, X, Globe, Mail } from 'lucide-react';
import { allDrugs } from '../data/drugs';
import { motion, AnimatePresence } from 'framer-motion';
import { referencesData } from '../data/references';
import DotsOverlay from '../components/ui/DotsOverlay';
import { translations } from './translations';
import LanguageToggle from './LanguageToggle';

// Constants - moved outside the component to avoid recreation on renders
const INITIAL_VISIBLE_COLUMNS = {
  name: true,
  class: true,
  category: true,
  halfLife: true,
  normofractionatedRT: true,
  palliativeRT: true,
  stereotacticRT: true,
  intracranialRT: true
};

// Category colors - moved to a constant outside the component
const CATEGORY_COLORS = {
  chemotherapy: 'bg-sfro-light text-sfro-dark border-sfro-primary',
  endocrine: 'bg-purple-50 text-purple-800 border-purple-200',
  targeted: 'bg-orange-50 text-orange-800 border-orange-200',
  immunotherapy: 'bg-green-50 text-green-800 border-green-200'
};

// Cell colors - moved to a constant outside the component
const getCellColor = (value) => {
  if (value === '0' || value.includes('0 (except')) return 'bg-green-100 text-green-800';
  if (value.includes('48h')) return 'bg-yellow-100 text-yellow-800';
  if (value.includes('days')) return 'bg-red-100 text-red-800';
  return '';
};

// Default translations if missing from the translations file
const DEFAULT_TRANSLATIONS = {
  en: {
    title: "Drug & Radiotherapy Explorer",
    subtitle: "Explore drug interactions with radiotherapy treatments",
    search: "Search drugs...",
    categories: {
      all: "All Categories",
      chemotherapy: "Chemotherapy",
      endocrine: "Endocrine Therapy",
      targeted: "Targeted Therapy",
      immunotherapy: "Immunotherapy"
    },
    halfLife: {
      all: "All Half-lives",
      short: "Short Half-life (≤24h)",
      long: "Long Half-life (>24h)"
    },
    drugClass: {
      all: "All Drug Classes"
    },
    columns: {
      name: "Drug Name",
      class: "Class",
      category: "Category",
      halfLife: "Half-life",
      normofractionatedRT: "Normofractionated RT",
      palliativeRT: "Palliative RT",
      stereotacticRT: "Stereotactic RT",
      intracranialRT: "Intracranial RT"
    },
    buttons: {
      manageColumns: "Manage Columns",
      exportCSV: "Export CSV",
      done: "Done",
      close: "Close",
      applyFilters: "Apply Filters"
    },
    legend: {
      noDelay: "No delay required",
      shortDelay: "Short delay (≤48h)",
      longDelay: "Long delay (days)"
    },
    footer: {
      about: "About",
      legal: "Legal"
    },
    references: {
      title: "References",
      openArticle: "Open Article",
      viewReferences: "View References"
    },
    columnManager: {
      title: "Manage Columns"
    },
    filters: {
      title: "Filters"
    },
    noResults: "No drugs found matching your criteria",
    accessibility: {
      skipToContent: "Skip to main content"
    },
    radiotherapyTiming: "Radiotherapy Timing"
  },
  fr: {
    title: "Explorateur Médicaments & Radiothérapie",
    subtitle: "Explorez les interactions des médicaments avec les traitements de radiothérapie",
    search: "Rechercher des médicaments...",
    categories: {
      all: "Toutes les Catégories",
      chemotherapy: "Chimiothérapie",
      endocrine: "Thérapie Endocrine",
      targeted: "Thérapie Ciblée",
      immunotherapy: "Immunothérapie"
    },
    halfLife: {
      all: "Toutes les Demi-vies",
      short: "Demi-vie Courte (≤24h)",
      long: "Demi-vie Longue (>24h)"
    },
    drugClass: {
      all: "Toutes les Classes de Médicaments"
    },
    columns: {
      name: "Nom du Médicament",
      class: "Classe",
      category: "Catégorie",
      halfLife: "Demi-vie",
      normofractionatedRT: "RT Normofractionnée",
      palliativeRT: "RT Palliative",
      stereotacticRT: "RT Stéréotaxique",
      intracranialRT: "RT Intracrânienne"
    },
    buttons: {
      manageColumns: "Gérer les Colonnes",
      exportCSV: "Exporter CSV",
      done: "Terminé",
      close: "Fermer",
      applyFilters: "Appliquer les Filtres"
    },
    legend: {
      noDelay: "Aucun délai requis",
      shortDelay: "Délai court (≤48h)",
      longDelay: "Délai long (jours)"
    },
    footer: {
      about: "À propos",
      legal: "Mentions légales"
    },
    references: {
      title: "Références",
      openArticle: "Ouvrir l'Article",
      viewReferences: "Voir les Références"
    },
    columnManager: {
      title: "Gérer les Colonnes"
    },
    filters: {
      title: "Filtres"
    },
    noResults: "Aucun médicament ne correspond à vos critères",
    accessibility: {
      skipToContent: "Passer au contenu principal"
    },
    radiotherapyTiming: "Planification de la Radiothérapie"
  }
};

// Additional module for drug class translations - more extensive than what might be in the translations file
const DRUG_CLASS_TRANSLATIONS = {
  fr: {
    'Alkylating Agent': 'Agent Alkylant',
    'Antimetabolite': 'Antimétabolite',
    'Anthracycline': 'Anthracycline',
    'Topoisomerase Inhibitor': 'Inhibiteur de Topoisomérase',
    'Microtubule Agent': 'Agent Microtubulaire',
    'Platinum Compound': 'Composé de Platine',
    'PARP Inhibitor': 'Inhibiteur de PARP',
    'CDK4/6 Inhibitor': 'Inhibiteur de CDK4/6',
    'EGFR Inhibitor': 'Inhibiteur d\'EGFR',
    'VEGF Inhibitor': 'Inhibiteur de VEGF',
    'HER2 Inhibitor': 'Inhibiteur de HER2',
    'Anti-Androgen': 'Anti-Androgène',
    'Aromatase Inhibitor': 'Inhibiteur d\'Aromatase',
    'Immune Checkpoint Inhibitor': 'Inhibiteur de Point de Contrôle Immunitaire',
    'mTOR Inhibitor': 'Inhibiteur de mTOR',
    'Taxane': 'Taxane',
    'Tyrosine Kinase Inhibitor': 'Inhibiteur de Tyrosine Kinase',
    'BRAF Inhibitor': 'Inhibiteur de BRAF',
    'MEK Inhibitor': 'Inhibiteur de MEK',
    'Proteasome Inhibitor': 'Inhibiteur du Protéasome',
    'Selective Estrogen Receptor Modulator': 'Modulateur Sélectif des Récepteurs aux Œstrogènes',
    'Selective Estrogen Receptor Degrader': 'Dégradeur Sélectif des Récepteurs aux Œstrogènes',
    'BTK Inhibitor': 'Inhibiteur de BTK',
    'PI3K Inhibitor': 'Inhibiteur de PI3K',
    'ALK Inhibitor': 'Inhibiteur d\'ALK',
    'JAK Inhibitor': 'Inhibiteur de JAK',
    'Anti-PD-1': 'Anti-PD-1',
    'Anti-PD-L1': 'Anti-PD-L1',
    'Anti-CTLA-4': 'Anti-CTLA-4',
    'Monoclonal Antibody': 'Anticorps Monoclonal',
    'Antibody-Drug Conjugate': 'Conjugué Anticorps-Médicament',
    'Vinca Alkaloid': 'Alcaloïde de Pervenche',
    'GnRH Analog': 'Analogue de la GnRH',
    'Multikinase Inhibitor': 'Inhibiteur Multikinase'
  }
};

const DrugExplorer = () => {
  // State management - grouped logically
  // UI States
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [zoomedCell, setZoomedCell] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Language State - Try to get from localStorage initially
  const [lang, setLang] = useState(() => {
    const savedLang = typeof window !== 'undefined' 
      ? localStorage.getItem('drug-explorer-lang') 
      : null;
    return (savedLang === 'fr' || savedLang === 'en') ? savedLang : 'en';
  });

  // Function to access nested object properties safely by path
  const getNestedValue = useCallback((obj, path) => {
    if (!obj || typeof obj !== 'object') return undefined;
    
    let current = obj;
    for (const key of path) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    
    return current;
  }, []);
  
  // Enhanced translation function with fallbacks
  const t = useCallback((key) => {
    // Split the key into path segments
    const keys = key.split('.');
    
    // Try sources in order: translations file → DEFAULT_TRANSLATIONS for current language → DEFAULT_TRANSLATIONS for English
    const sources = [
      translations[lang],
      DEFAULT_TRANSLATIONS[lang],
      lang !== 'en' ? DEFAULT_TRANSLATIONS['en'] : null
    ];
    
    // Try each source
    for (const source of sources) {
      if (!source) continue;
      
      const value = getNestedValue(source, keys);
      if (value !== undefined) return value;
    }
    
    // Last resort: return the key itself
    return key;
  }, [lang, getNestedValue]);
  
  // Function to translate drug class names
  const translateDrugClass = useCallback((className) => {
    if (lang === 'en') return className;
    
    // Try in translations file
    const fromTranslations = getNestedValue(translations[lang], ['drugClasses', className]);
    if (fromTranslations) return fromTranslations;
    
    // Try in specialized drug class translations
    const specializedTranslation = DRUG_CLASS_TRANSLATIONS[lang]?.[className];
    if (specializedTranslation) return specializedTranslation;
    
    // Default to original class name
    return className;
  }, [lang, getNestedValue]);

  // Save language preference when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('drug-explorer-lang', lang);
      
      // Update document language for accessibility
      document.documentElement.lang = lang;
      
      // Add direction attribute for RTL languages if needed in the future
      document.documentElement.dir = 'ltr';
    }
  }, [lang]);
  
  // Add event listener for system color scheme changes
  useEffect(() => {
    const handleColorSchemeChange = (e) => {
      // Could be used to switch between light/dark themes
      const isDarkMode = e.matches;
      // Implementation for theme switching would go here
    };
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      colorSchemeQuery.addEventListener('change', handleColorSchemeChange);
      
      return () => {
        colorSchemeQuery.removeEventListener('change', handleColorSchemeChange);
      };
    }
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and sort drugs - optimized with useMemo to avoid recomputing on every render
  const filteredAndSortedDrugs = useMemo(() => {
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

  // Calculate statistics - moved to useMemo to avoid recalculation
  const stats = useMemo(() => [
    { 
      label: t('categories.all'),
      value: filteredAndSortedDrugs.length,
      color: 'bg-sfro-light text-sfro-dark'
    },
    { 
      label: t('categories.chemotherapy'),
      value: filteredAndSortedDrugs.filter(d => d.category === 'chemotherapy').length,
      color: 'bg-blue-50 text-blue-800'
    },
    { 
      label: t('categories.endocrine'),
      value: filteredAndSortedDrugs.filter(d => d.category === 'endocrine').length,
      color: 'bg-purple-50 text-purple-800'
    },
    { 
      label: t('categories.targeted'),
      value: filteredAndSortedDrugs.filter(d => d.category === 'targeted').length,
      color: 'bg-orange-50 text-orange-800'
    },
    { 
      label: t('categories.immunotherapy'),
      value: filteredAndSortedDrugs.filter(d => d.category === 'immunotherapy').length,
      color: 'bg-green-50 text-green-800'
    }
  ], [filteredAndSortedDrugs, t]);

  // Unique drug classes - memoized to avoid recalculation
  const uniqueDrugClasses = useMemo(() => 
    [...new Set(allDrugs.map(drug => drug.class))].sort(),
    []
  );

  // Format CSV data for export
  const formatForCSV = useCallback((data) => {
    const header = "Drug Name,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
    const rows = data.map(drug => 
      `${drug.name},${drug.class},${drug.category},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
    ).join('\n');
    return header + rows;
  }, []);

  // Handle sorting
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // CSV download handler
  const downloadCSV = useCallback(() => {
    try {
      const csv = formatForCSV(filteredAndSortedDrugs);
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
  }, [filteredAndSortedDrugs, formatForCSV]);

  // Component for Tooltip with animation
  const Tooltip = useCallback(({ children, content }) => (
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
  ), []);

  // Component for Badge with animation
  const Badge = useCallback(({ children, color }) => (
    <motion.span
      initial={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {children}
    </motion.span>
  ), []);

  // Drug Card component - extracted for better readability
  const DrugCard = useCallback(({ drug }) => (
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
          <Badge color={CATEGORY_COLORS[drug.category] || 'bg-gray-50 text-gray-800 border-gray-200'}>
            {t(`categories.${drug.category}`) || drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">{t('columns.class')}:</span>
            <Tooltip content={drug.class}>
              <span>
                {translateDrugClass(drug.class)}
              </span>
            </Tooltip>
          </div>

          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">{t('columns.halfLife')}:</span>
            <span className="text-gray-900">{drug.halfLife}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <h4 className="text-sm font-medium text-sfro-dark mb-2">{t('radiotherapyTiming') || 'Radiotherapy Timing'}</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className={`rounded-md p-2 ${getCellColor(drug.normofractionatedRT)} text-sm`}>
                <span className="font-medium">{t('columns.normofractionatedRT')}:</span> {drug.normofractionatedRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.palliativeRT)} text-sm`}>
                <span className="font-medium">{t('columns.palliativeRT')}:</span> {drug.palliativeRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.stereotacticRT)} text-sm`}>
                <span className="font-medium">{t('columns.stereotacticRT')}:</span> {drug.stereotacticRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.intracranialRT)} text-sm`}>
                <span className="font-medium">{t('columns.intracranialRT')}:</span> {drug.intracranialRT}
              </div>
            </div>
          </div>

          {drug.references && (
            <div className="mt-2 text-xs text-gray-500">
              <button 
                onClick={() => setSelectedReferences(drug.references)}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {t('references.viewReferences') || 'View References'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  ), [Badge, Tooltip, setSelectedReferences, t, translateDrugClass]);

  // References Popup component - extracted for better readability
  const ReferencesPopup = useCallback(({ references, onClose }) => {
    if (!references) return null;

    const refArray = references.split(',').map(ref => ref.replace(/[\[\]]/g, '').trim());
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white p-6 rounded-lg max-w-4xl m-4 max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{t('references.title')}</h3>
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
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
  }, [t]);

  // Mobile Filters component - extracted for better readability
  const MobileFilters = useCallback(({ show, onClose }) => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: show ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-sfro-dark">{t('filters.title')}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <span className="sr-only">{t('buttons.close')}</span>
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
          {uniqueDrugClasses.map(drugClass => (
            <option key={drugClass} value={drugClass}>
              {translateDrugClass(drugClass)}
            </option>
          ))}
        </select>
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-sfro-primary text-white rounded-lg hover:bg-sfro-secondary transition-colors"
        >
          {t('buttons.applyFilters') || 'Apply Filters'}
        </button>
      </div>
    </motion.div>
  ), [t, searchTerm, selectedCategory, halfLifeFilter, classFilter, uniqueDrugClasses, translateDrugClass]);

  // Format column names for better display
  const formatColumnName = useCallback((column) => {
    return t(`columns.${column}`);
  }, [t]);

  // Handle table scroll detection for sticky header effect
  const handleTableScroll = useCallback((e) => {
    setIsTableScrolled(e.target.scrollTop > 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="w-full max-w-7xl mx-auto my-8 shadow-xl">
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-[#00BFF3] via-[#0080A5] to-[#006080] text-white rounded-t-xl">
          {/* Language toggle */}
          <div className="absolute top-4 right-4 z-20">
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>

          {/* Decorative background */}
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
          
          {/* Header content */}
          <div className="relative py-6 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                {/* Title and subtitle */}
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
              {/* Search input */}
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

              {/* Category filter */}
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

              {/* Half-life filter */}
              <select
                value={halfLifeFilter}
                onChange={(e) => setHalfLifeFilter(e.target.value)}
                className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
              >
                <option value="all">{t('halfLife.all')}</option>
                <option value="short">{t('halfLife.short')}</option>
                <option value="long">{t('halfLife.long')}</option>
              </select>

              {/* Class filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
              >
                <option value="all">{t('drugClass.all')}</option>
                {uniqueDrugClasses.map(drugClass => (
                  <option key={drugClass} value={drugClass}>
                    {translateDrugClass(drugClass)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className={`flex ${isMobileView ? 'justify-center' : 'justify-end'} gap-4`}>
            {/* Column manager button (desktop only) */}
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

            {/* Export CSV button */}
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

          {/* Mobile/Desktop view toggle */}
          <AnimatePresence mode="wait">
            {isMobileView ? (
              /* Mobile view - card list */
              <motion.div 
                key="mobile-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredAndSortedDrugs.map((drug, index) => (
                  <DrugCard key={`${drug.name}-${index}`} drug={drug} />
                ))}
                
                {/* Show filters button (mobile only) */}
                <motion.button
                  className="fixed bottom-6 right-6 bg-sfro-primary text-white rounded-full p-4 shadow-lg z-40"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="h-6 w-6" />
                </motion.button>
                
                {/* Mobile filters panel */}
                <AnimatePresence>
                  {showMobileFilters && (
                    <MobileFilters 
                      show={showMobileFilters} 
                      onClose={() => setShowMobileFilters(false)} 
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Desktop view - table */
              <motion.div 
                key="desktop-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg shadow-lg"
                onScroll={handleTableScroll}
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
                            {t('buttons.done')}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Data table */}
                <table className="w-full border-collapse bg-white table-fixed">
                  <thead className={`sticky top-0 bg-sfro-light z-10 ${isTableScrolled ? 'shadow-md' : ''}`}>
                    <tr>
                      {visibleColumns.name && (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">
                          <button 
                            className="flex items-center hover:text-sfro-primary" 
                            onClick={() => requestSort('name')}
                          >
                            {t('columns.name')} 
                            {sortConfig.key === 'name' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {visibleColumns.class && (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">
                          <button 
                            className="flex items-center hover:text-sfro-primary" 
                            onClick={() => requestSort('class')}
                          >
                            {t('columns.class')}
                            {sortConfig.key === 'class' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {visibleColumns.category && (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
                          <button 
                            className="flex items-center hover:text-sfro-primary" 
                            onClick={() => requestSort('category')}
                          >
                            {t('columns.category')}
                            {sortConfig.key === 'category' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {visibleColumns.halfLife && (
                        <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">
                          <button 
                            className="flex items-center hover:text-sfro-primary" 
                            onClick={() => requestSort('halfLife')}
                          >
                            {t('columns.halfLife')}
                            {sortConfig.key === 'halfLife' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
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
                    {filteredAndSortedDrugs.length > 0 ? (
                      filteredAndSortedDrugs.map((drug, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-gray-50 transition-colors duration-150 ease-in-out text-xs"
                        >
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
                                <span>
                                  {translateDrugClass(drug.class)}
                                </span>
                              </Tooltip>
                            </td>
                          )}
                          {visibleColumns.category && (
                            <td className="px-3 py-2">
                              <Badge color={CATEGORY_COLORS[drug.category] || 'bg-gray-50 text-gray-800 border-gray-200'}>
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
                      ))
                    ) : (
                      <tr>
                        <td 
                          colSpan={Object.values(visibleColumns).filter(Boolean).length} 
                          className="px-3 py-8 text-center text-gray-500"
                        >
                          {t('noResults')}
                        </td>
                      </tr>
                    )}
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
              © {new Date().getFullYear()} SFRO - Société Française de Radiothérapie Oncologique
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
      <AnimatePresence>
        {selectedReferences && (
          <ReferencesPopup 
            references={selectedReferences}
            onClose={() => setSelectedReferences(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Accessibility skip link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-sfro-primary focus:rounded"
      >
        {t('accessibility.skipToContent')}
      </a>
    </div>
  );
};
export default DrugExplorer;


