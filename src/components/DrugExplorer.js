import React, { useState, useEffect, useCallback, useMemo, useRef, memo, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle, Info, ExternalLink, Settings, Filter, X, Globe, Mail, Moon, Sun, AlertCircle } from 'lucide-react';
import { allDrugs } from '../data/drugs';
import { motion, AnimatePresence } from 'framer-motion';
import { referencesData } from '../data/references';
import DotsOverlay from '../components/ui/DotsOverlay';
import { translations } from './translations';
import LanguageToggle from './LanguageToggle';
import { protocolsStaticData, extractUniqueData } from '../data/protocoleRTCT';

// Constants - moved outside the component to avoid recreation on renders
const INITIAL_VISIBLE_COLUMNS = {
  name: true,
  commercial: true,
  administration: true,
  class: true,
  category: true,
  halfLife: true,
  normofractionatedRT: true,
  palliativeRT: true,
  stereotacticRT: true,
  intracranialRT: true
};

// Category colors - updated for dark mode support
const CATEGORY_COLORS = {
  light: {
    chemotherapy: 'bg-sfro-light text-sfro-dark border-sfro-primary',
    endocrine: 'bg-purple-50 text-purple-800 border-purple-200',
    targeted: 'bg-orange-50 text-orange-800 border-orange-200',
    immunotherapy: 'bg-green-50 text-green-800 border-green-200'
  },
  dark: {
    chemotherapy: 'bg-sfro-primary/20 text-sfro-light border-sfro-primary',
    endocrine: 'bg-purple-900/30 text-purple-300 border-purple-600',
    targeted: 'bg-orange-900/30 text-orange-300 border-orange-600',
    immunotherapy: 'bg-green-900/30 text-green-300 border-green-600'
  }
};

// Cell colors - memoized function for performance
const getCellColor = (value, isDark = false) => {
  if (value === '0' || value.includes('0 (except')) {
    return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800';
  }
  if (value.includes('48h')) {
    return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
  }
  if (value.includes('days')) {
    return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800';
  }
  return '';
};

// Debounce hook for performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Drug Explorer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              The application encountered an unexpected error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-sfro-primary text-white px-6 py-2 rounded-lg hover:bg-sfro-secondary transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a global store using a simplified Zustand-like pattern
const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (updater) => {
      const newState = typeof updater === 'function' ? updater(state) : updater;
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

// Global store for app state
const useAppStore = (() => {
  const store = createStore({
    isDarkMode: false,
    lang: 'en',
    searchTerm: '',
    selectedCategory: 'all',
    halfLifeFilter: 'all',
    classFilter: 'all',
    selectedOrgan: 'all',
    selectedMolecule: 'all',
    sortConfig: { key: null, direction: 'asc' },
    visibleColumns: INITIAL_VISIBLE_COLUMNS,
    viewMode: 'drugs',
    protocolsData: [],
    organsData: [],
    moleculesData: [],
    isLoadingProtocols: false,
    favorites: [],
    recentSearches: []
  });

  return () => {
    const [state, setState] = useState(store.getState());

    useEffect(() => {
      const unsubscribe = store.subscribe(setState);
      return unsubscribe;
    }, []);

    const actions = useMemo(() => ({
      setDarkMode: (isDark) => store.setState({ isDarkMode: isDark }),
      setLang: (lang) => store.setState({ lang }),
      setSearchTerm: (term) => {
        store.setState({ searchTerm: term });
        // Add to recent searches if not empty
        if (term.trim()) {
          const current = store.getState().recentSearches;
          const updated = [term, ...current.filter(s => s !== term)].slice(0, 5);
          store.setState({ recentSearches: updated });
        }
      },
      setFilters: (filters) => store.setState(filters),
      setSortConfig: (config) => store.setState({ sortConfig: config }),
      setVisibleColumns: (columns) => store.setState({ visibleColumns: columns }),
      setViewMode: (mode) => store.setState({ viewMode: mode }),
      setProtocolsData: (data) => store.setState({ protocolsData: data }),
      setOrgansData: (data) => store.setState({ organsData: data }),
      setMoleculesData: (data) => store.setState({ moleculesData: data }),
      setLoadingProtocols: (loading) => store.setState({ isLoadingProtocols: loading }),
      addFavorite: (drugId) => {
        const current = store.getState().favorites;
        if (!current.includes(drugId)) {
          store.setState({ favorites: [...current, drugId] });
        }
      },
      removeFavorite: (drugId) => {
        const current = store.getState().favorites;
        store.setState({ favorites: current.filter(id => id !== drugId) });
      }
    }), []);

    return [state, actions];
  };
})();

// About content in both languages
const ABOUT_CONTENT = {
  fr: {
    title: "À propos de ce projet",
    content: `**Démarche et objectif de ce projet**

Ce site est le fruit d'un travail collaboratif mené sous l'égide de la **Société Française de Radiothérapie Oncologique (SFRO)**. Son objectif est d'évaluer et de synthétiser les interactions entre les **traitements systémiques en oncologie** (chimiothérapies, thérapies ciblées, immunothérapies, hormonothérapies) et la **radiothérapie, qu'elle soit curative ou palliative**, **normofractionnée ou hypofractionnée, quel que soit la technique** : radiothérapie conformationnelle en 3D **(RT3D),** radiothérapie avec modulation d'intensité **(RCMI/IMRT)** et radiothérapie stéréotaxique **(SBRT/SRS)**

La combinaison de la radiothérapie avec certains agents thérapeutiques peut potentialiser son effet, mais aussi en accroître la toxicité. Ce projet vise à fournir aux cliniciens une **synthèse claire et précise** des recommandations existantes, basée sur les données de la littérature et les avis d'experts. L'article complet en en ligne sur le site de la revue Cancer Radiothérapie sous l'égide de la **Société Française de Radiothérapie Oncologique (SFRO)**: http://www.sfro.fr 

**Construction et accessibilité**

L'ensemble des informations présentées ici a été rassemblé et analysé par un **groupe de travail**. Chaque molécule a été évaluée selon :

• **Sa demi-vie et son mécanisme d'action**
• **Son interaction avec la radiothérapie** (effet radiosensibilisant, toxicités accrues)
• **Les recommandations de poursuite ou d'arrêt**
• **Les types de radiothérapie concernés**
• **Les publications scientifiques et recommandations officielles**

Ce site est proposé en **anglais et en français en accès libre** afin de garantir une **diffusion large et accessible**. Ces recommandations sont rédigées selon les données acquises de la science, qui restent parfois limitées ou inexistantes pour certains médicaments. Elles n'engagent pas la responsabilité de leurs auteurs.

Vous pouvez suggérer **l'ajout d'une nouvelle molécule, un commentaire ou une nouvelle référence bibliographique utile** via la boîte de contact. Nous essayerons de **mettre à jour ce site régulièrement**.

**Les auteurs :**

• **Dr Chloé Buchalet** (Département d'oncologie radiothérapie, Institut du Cancer de Montpellier, Montpellier, France)
• **Dr Constance Golfier** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)
• **Dr Jean-Christophe Faivre** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)
• **Pr Christophe Hennequin** (Service de cancérologie-radiothérapie, Hôpital Saint-Louis, Paris, France)
• **Dr Thomas Leroy** (Département d'oncologie radiothérapie, Centre de Cancérologie des Dentellières, Valenciennes, France)
• **Dr Johann Marcel** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)`
  },
  en: {
    title: "About this Project",
    content: `**Approach and Objective of this Project**

This site is the result of a collaborative effort led under the aegis of the **French Society of radiation Oncology (Société Française de Radiothérapie Oncologique (SFRO))**. Its objective is to evaluate and synthesize the interactions between systemic oncology treatments (chemotherapy, targeted therapies, immunotherapies, hormone therapies) and radiotherapy, whether curative or palliative, normofractionated or hypofractionated, regardless of the technique used: **3D conformal radiotherapy (3D-CRT), intensity-modulated radiotherapy (IMRT), and stereotactic radiotherapy (SBRT/SRS)**.

The combination of radiotherapy with certain therapeutic agents can enhance its effect but also increase toxicity. This project aims to provide clinicians with a **clear and precise synthesis** of existing recommendations, based on literature data and expert opinions. The full article is available online on the *Cancer Radiothérapie* journal website, under the auspices of the **Société Française de Radiothérapie Oncologique (SFRO)**: http://www.sfro.fr

**Development and Accessibility**

The information presented on this site has been collected and analyzed by a dedicated working group. Each molecule has been evaluated based on:

• **Its half-life and mechanism of action**
• **Its interaction with radiotherapy** (radiosensitizing effect, increased toxicity)
• **Recommendations for continuation or discontinuation**
• **Types of radiotherapy concerned**
• **Scientific publications and official recommendations**

This site is available in **English and French, free of charge**, to ensure broad and easy access. The recommendations are based on currently available scientific data, which may be limited or even nonexistent for certain medications. These recommendations **do not engage the responsibility of their authors**.

You can suggest the **addition of a new drug, a comment, or a relevant bibliographic reference** via the contact form. We will strive to update this site regularly.

**Authors:**

• **Dr. Chloé Buchalet** (*Department of Radiation Oncology, Institut du Cancer de Montpellier, Montpellier, France*)
• **Dr. Constance Golfier** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)
• **Dr. Jean-Christophe Faivre** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)
• **Prof. Christophe Hennequin** (*Department of Oncology-Radiotherapy, Hôpital Saint-Louis, Paris, France*)
• **Dr. Thomas Leroy** (*Department of Radiation Oncology, Centre de Cancérologie des Dentellières, Valenciennes, France*)
• **Dr. Johann Marcel** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)`
  }
};

// Default translations with performance keys
const DEFAULT_TRANSLATIONS = {
  en: {
    title: "Drug & Radiotherapy Explorer",
    subtitle: "Explore drug interactions with radiotherapy treatments",
    search: "Search by name, INN, or brand name...",
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
      dci: "INN",
      commercial: "Brand Name",
      administration: "Administration",
      administration_short: "Admin",
      class: "Class",
      category: "Category",
      category_short: "Cat",
      halfLife: "Half-life",
      halfLife_short: "Half-life",
      normofractionatedRT: "Normofractionated RT",
      normofractionatedRT_short: "Norm RT",
      palliativeRT: "Palliative RT",
      palliativeRT_short: "Pal RT",
      stereotacticRT: "Stereotactic RT",
      stereotacticRT_short: "Ster RT",
      intracranialRT: "Intracranial RT",
      intracranialRT_short: "IC RT"
    },
    buttons: {
      manageColumns: "Manage Columns",
      exportCSV: "Export CSV",
      done: "Done",
      close: "Close",
      applyFilters: "Apply Filters",
      drugExplorer: "Drugs",
      protocolsExplorer: "RT-CT Protocols",
      addToFavorites: "Add to Favorites",
      removeFromFavorites: "Remove from Favorites"
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
      viewReferences: "View References",
      noReferences: "No references available"
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
    radiotherapyTiming: "Radiotherapy Timing",
    protocol: {
      allOrgans: "All Organs",
      allMolecules: "All Molecules",
      organ: "Organ",
      condition: "Condition",
      molecule: "Molecule",
      route: "Route",
      modality: "Administration Modality",
      timing: "Start relative to RT",
      legendGroup: "Organ grouping",
    },
    protocolsSearch: "Search by molecule or organ...",
    loading: "Loading protocols...",
    noProtocolResults: "No protocols found matching your criteria",
    theme: {
      light: "Light mode",
      dark: "Dark mode",
      toggle: "Toggle theme"
    },
    performance: {
      loadingFallback: "Loading...",
      errorRetry: "Retry"
    }
  },
  fr: {
    title: "Explorateur Médicaments & Radiothérapie",
    subtitle: "Explorez les interactions des médicaments avec les traitements de radiothérapie",
    search: "Rechercher par nom, DCI ou nom commercial...",
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
      dci: "DCI",
      commercial: "Nom Commercial",
      administration: "Administration",
      administration_short: "Admin",
      class: "Classe",
      category: "Catégorie",
      category_short: "Cat",
      halfLife: "Demi-vie",
      halfLife_short: "Demi-vie",
      normofractionatedRT: "RT Normofractionnée",
      normofractionatedRT_short: "RT Normo",
      palliativeRT: "RT Palliative",
      palliativeRT_short: "RT Pal",
      stereotacticRT: "RT Stéréotaxique",
      stereotacticRT_short: "RT Stéréo",
      intracranialRT: "RT Intracrânienne",
      intracranialRT_short: "RT IC"
    },
    buttons: {
      manageColumns: "Gérer les Colonnes",
      exportCSV: "Exporter CSV",
      done: "Terminé",
      close: "Fermer",
      applyFilters: "Appliquer les Filtres",
      drugExplorer: "Médicaments",
      protocolsExplorer: "Protocoles de RT-CT",
      addToFavorites: "Ajouter aux Favoris",
      removeFromFavorites: "Retirer des Favoris"
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
      viewReferences: "Voir les Références",
      noReferences: "Aucune référence disponible"
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
    radiotherapyTiming: "Planification de la Radiothérapie",
    protocol: {
      allOrgans: "Tous les organes",
      allMolecules: "Toutes les molécules",
      organ: "Organe",
      condition: "Condition",
      molecule: "Molécule",
      route: "Voie",
      modality: "Modalités d'administration",
      timing: "Début par rapport à la RT",
      legendGroup: "Groupement par organe",
    },
    protocolsSearch: "Rechercher par molécule ou organe...",
    loading: "Chargement des protocoles...",
    noProtocolResults: "Aucun protocole ne correspond à vos critères",
    theme: {
      light: "Mode clair",
      dark: "Mode sombre",
      toggle: "Basculer le thème"
    },
    performance: {
      loadingFallback: "Chargement...",
      errorRetry: "Réessayer"
    }
  }
};

// Memoized Badge component for performance
const Badge = memo(({ children, color, onClick }) => (
  <motion.span
    initial={{ scale: 0.95 }}
    whileHover={{ scale: 1.05 }}
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${color}`}
    onClick={onClick}
  >
    {children}
  </motion.span>
));

// Column Header with Tooltip component
const ColumnHeaderWithTooltip = memo(({ title, longTitle, isDarkMode }) => (
  <div className="relative group">
    <span>{title}</span>
    <div className={`invisible group-hover:visible absolute z-50 -left-2 top-full mt-1 p-2 text-xs rounded shadow-lg whitespace-nowrap
      ${isDarkMode 
        ? 'bg-gray-700 text-gray-200' 
        : 'bg-gray-800 text-white'
      }`}>
      {longTitle}
    </div>
  </div>
));

// Memoized Drug Card component for performance
const DrugCard = memo(({ 
  drug, 
  isDarkMode, 
  onDrugClick, 
  isFavorite, 
  onToggleFavorite,
  t, 
  translateDrugClass, 
  CATEGORY_COLORS 
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
        <h3 className={`text-lg font-semibold cursor-pointer hover:underline
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
            color={CATEGORY_COLORS[isDarkMode ? 'dark' : 'light'][drug.category] || 
              (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200')}
          >
            {t(`categories.${drug.category}`) || drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
          <button
            onClick={() => onToggleFavorite(drug.name)}
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
            {['normofractionatedRT', 'palliativeRT', 'stereotacticRT', 'intracranialRT'].map(field => (
              <div key={field} className={`rounded-md p-2 ${getCellColor(drug[field], isDarkMode)} text-sm`}>
                <span className="font-medium">{t(`columns.${field}`)}:</span> {drug[field]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
));

// Memoized Search Suggestions component
const SearchSuggestions = memo(({ 
  suggestions, 
  showSuggestions, 
  selectedIndex, 
  onSelect, 
  isDarkMode, 
  t, 
  suggestionsRef 
}) => {
  if (!showSuggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      ref={suggestionsRef}
      className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-md shadow-lg border max-h-64 overflow-y-auto
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-white border-gray-200'
        }`}
    >
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`px-4 py-2 cursor-pointer flex items-center justify-between
            ${selectedIndex === index 
              ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
              : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
            }`}
          onClick={() => onSelect(suggestion)}
        >
          <div className="flex items-center">
            <Search className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
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
             t('columns.class')}
          </span>
        </div>
      ))}
    </motion.div>
  );
});

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sfro-primary border-r-transparent mr-3"></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

// Function to render markdown-like text (moved outside component)
const renderMarkdownContent = (content, isDarkMode) => {
  return content.split('\n').map((line, index) => {
    // Handle headers (lines starting with **)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      const headerText = line.slice(2, -2);
      return (
        <h3 key={index} className={`text-lg font-bold mt-6 mb-3
          ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
        `}>
          {headerText}
        </h3>
      );
    }
    
    // Handle bullet points (support both • and -)
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const bulletContent = line.slice(2);
      // Handle bold text within bullets
      const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
      return (
        <li key={index} className={`ml-4 mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {parts.map((part, partIndex) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={partIndex} className={isDarkMode ? 'text-gray-100' : 'text-sfro-dark'}>
                  {part.slice(2, -2)}
                </strong>
              : part
          )}
        </li>
      );
    }
    
    // Handle regular paragraphs with links and bold text
    if (line.trim()) {
      // Split by both bold text and URLs
      const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s\)]+)/g);
      return (
        <p key={index} className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIndex} className={isDarkMode ? 'text-gray-100' : 'text-sfro-dark'}>
                {part.slice(2, -2)}
              </strong>;
            }
            if (part.startsWith('http')) {
              return (
                <a 
                  key={partIndex} 
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {part}
                </a>
              );
            }
            return part;
          })}
        </p>
      );
    }
    
    // Empty lines
    return <div key={index} className="mb-2"></div>;
  });
};

// Memoized About Popup component
const AboutPopup = memo(({ show, onClose, content, lang, isDarkMode, t }) => {
  if (!show) return null;

  const aboutData = content[lang];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20 }}
        className={`rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
          ${isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
          }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`sticky top-0 border-b px-6 py-4 rounded-t-lg
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
              {aboutData.title}
            </h2>
            <button 
              onClick={onClose}
              className={`rounded-full p-2 transition-colors
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              <X size={24} />
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

// Memoized References Popup component
const ReferencesPopup = memo(({ references, onClose, isDarkMode, t }) => {
  if (!references) return null;

  // Handle the case when no references are available
  if (references === "no-references") {
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
          className={`p-6 rounded-lg max-w-md m-4
            ${isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
            }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {t('references.title')}
            </h3>
            <button 
              onClick={onClose}
              className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
            >
              <X size={24} />
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
  }

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
        className={`p-6 rounded-lg max-w-4xl m-4 max-h-[80vh] overflow-y-auto
          ${isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
          }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {t('references.title')}
          </h3>
          <button 
            onClick={onClose}
            className={isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}
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
                {fullReference?.url && (
                  <a 
                    href={fullReference.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`ml-4 flex items-center ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
});

// Main DrugExplorer component
const DrugExplorer = () => {
  // Global state management
  const [state, actions] = useAppStore();
  
  // Local UI states that don't need global management
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('drug-explorer-theme');
    const savedLang = localStorage.getItem('drug-explorer-lang');
    const savedFavorites = JSON.parse(localStorage.getItem('drug-explorer-favorites') || '[]');
    
    if (savedTheme) actions.setDarkMode(savedTheme === 'dark');
    if (savedLang && ['fr', 'en'].includes(savedLang)) actions.setLang(savedLang);
    if (savedFavorites.length > 0) {
      // Initialize favorites if needed
    }
  }, [actions]);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('drug-explorer-theme', state.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('drug-explorer-lang', state.lang);
    localStorage.setItem('drug-explorer-favorites', JSON.stringify(state.favorites));
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', state.isDarkMode);
    document.documentElement.lang = state.lang;
  }, [state.isDarkMode, state.lang, state.favorites]);

  // Enhanced translation function with memoization
  const t = useCallback((key) => {
    const keys = key.split('.');
    const sources = [
      translations[state.lang],
      DEFAULT_TRANSLATIONS[state.lang],
      state.lang !== 'en' ? DEFAULT_TRANSLATIONS['en'] : null
    ];
    
    for (const source of sources) {
      if (!source) continue;
      
      let value = source;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) return value;
    }
    
    return key;
  }, [state.lang]);

  // Memoized drug class translation
  const translateDrugClass = useCallback((className) => {
    if (state.lang === 'en') return className;
    return className; // Simplified for performance
  }, [state.lang]);

  // Generate search suggestions with performance optimization
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return [];

    const suggestions = [];
    const searchLower = debouncedSearchTerm.toLowerCase();
    const maxSuggestions = 8;

    // Use a more efficient search algorithm
    const addSuggestion = (text, type, drug = null) => {
      if (suggestions.length >= maxSuggestions) return false;
      
      const existing = suggestions.find(s => s.text.toLowerCase() === text.toLowerCase());
      if (!existing && text.toLowerCase().includes(searchLower)) {
        suggestions.push({
          text,
          type,
          drug,
          highlight: text.toLowerCase().indexOf(searchLower)
        });
        return true;
      }
      return false;
    };

    // Optimized search through drugs
    for (const drug of allDrugs) {
      if (suggestions.length >= maxSuggestions) break;
      
      if (drug.name?.toLowerCase().includes(searchLower)) {
        if (!addSuggestion(drug.name, 'drug', drug)) continue;
      }
      if (drug.commercial?.toLowerCase().includes(searchLower)) {
        if (!addSuggestion(drug.commercial, 'commercial', drug)) continue;
      }
      if (drug.class?.toLowerCase().includes(searchLower)) {
        if (!addSuggestion(drug.class, 'class')) continue;
      }
    }

    // Sort by relevance
    return suggestions.sort((a, b) => {
      if (a.highlight === 0 && b.highlight !== 0) return -1;
      if (b.highlight === 0 && a.highlight !== 0) return 1;
      const typeOrder = { drug: 0, commercial: 1, dci: 2, class: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [debouncedSearchTerm]);

  // Optimized filtering and sorting with memoization
  const filteredAndSortedDrugs = useMemo(() => {
    let filtered = allDrugs;

    // Apply filters only if they have values
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(drug => 
        drug.name?.toLowerCase().includes(searchLower) || 
        drug.commercial?.toLowerCase().includes(searchLower) ||
        drug.class?.toLowerCase().includes(searchLower)
      );
    }

    if (state.selectedCategory !== 'all') {
      filtered = filtered.filter(drug => drug.category === state.selectedCategory);
    }

    if (state.halfLifeFilter !== 'all') {
      filtered = filtered.filter(drug => {
        const halfLife = parseFloat(drug.halfLife) || 0;
        return state.halfLifeFilter === 'short' ? halfLife <= 24 : halfLife > 24;
      });
    }

    if (state.classFilter !== 'all') {
      filtered = filtered.filter(drug => drug.class === state.classFilter);
    }

    // Apply sorting
    if (state.sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = state.sortConfig.key === 'halfLife' 
          ? parseFloat(a[state.sortConfig.key]) || 0
          : a[state.sortConfig.key];
        const bValue = state.sortConfig.key === 'halfLife'
          ? parseFloat(b[state.sortConfig.key]) || 0
          : b[state.sortConfig.key];

        if (aValue < bValue) return state.sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return state.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    debouncedSearchTerm, 
    state.selectedCategory, 
    state.halfLifeFilter, 
    state.classFilter, 
    state.sortConfig
  ]);

  // Performance optimized statistics
  const stats = useMemo(() => {
    const counts = filteredAndSortedDrugs.reduce((acc, drug) => {
      acc.total++;
      acc[drug.category] = (acc[drug.category] || 0) + 1;
      return acc;
    }, { total: 0 });

    return [
      { 
        label: t('categories.all'),
        value: counts.total,
        color: state.isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-sfro-light text-sfro-dark'
      },
      { 
        label: t('categories.chemotherapy'),
        value: counts.chemotherapy || 0,
        color: state.isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-800'
      },
      { 
        label: t('categories.endocrine'),
        value: counts.endocrine || 0,
        color: state.isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-800'
      },
      { 
        label: t('categories.targeted'),
        value: counts.targeted || 0,
        color: state.isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-50 text-orange-800'
      },
      { 
        label: t('categories.immunotherapy'),
        value: counts.immunotherapy || 0,
        color: state.isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-800'
      }
    ];
  }, [filteredAndSortedDrugs, t, state.isDarkMode]);

  // Memoized unique drug classes
  const uniqueDrugClasses = useMemo(() => 
    [...new Set(allDrugs.map(drug => drug.class))].sort(),
    []
  );

  // Event handlers with useCallback for performance
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    actions.setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  }, [actions]);

  const selectSuggestion = useCallback((suggestion) => {
    actions.setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }, [actions]);

  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(searchSuggestions[selectedSuggestionIndex]);
        } else {
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, searchSuggestions, selectedSuggestionIndex, selectSuggestion]);

  const toggleDarkMode = useCallback(() => {
    actions.setDarkMode(!state.isDarkMode);
  }, [actions, state.isDarkMode]);

  const handleDrugClick = useCallback((drug) => {
    if (drug.references) {
      setSelectedReferences(drug.references);
    } else {
      setSelectedReferences("no-references");
    }
  }, []);

  const toggleFavorite = useCallback((drugId) => {
    if (state.favorites.includes(drugId)) {
      actions.removeFavorite(drugId);
    } else {
      actions.addFavorite(drugId);
    }
  }, [state.favorites, actions]);

  // Format column names for better display
  const formatColumnName = useCallback((column) => {
    return t(`columns.${column}`);
  }, [t]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTableScroll = useCallback((e) => {
    setIsTableScrolled(e.target.scrollTop > 0);
  }, []);

  // CSV download handler
  const downloadCSV = useCallback(() => {
    try {
      const header = "Drug Name,Commercial Name,Administration,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
      const rows = filteredAndSortedDrugs.map(drug => 
        `"${drug.name}","${drug.commercial}","${drug.administration}","${drug.class}","${drug.category}","${drug.halfLife}","${drug.normofractionatedRT}","${drug.palliativeRT}","${drug.stereotacticRT}","${drug.intracranialRT}","${drug.references || ''}"`
      ).join('\n');
      const csv = header + rows;
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
  }, [filteredAndSortedDrugs]);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen transition-colors duration-300
        ${state.isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
      `}>
        <Card className={`w-full max-w-7xl mx-auto my-8 shadow-xl transition-colors duration-300
          ${state.isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white'
          }`}>
          <CardHeader className="relative overflow-hidden bg-gradient-to-br from-[#00BFF3] via-[#0080A5] to-[#006080] text-white rounded-t-xl">
            {/* Controls in header */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAbout(true)}
                aria-label={t('footer.about')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-sfro-primary px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">{t('footer.about')}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                aria-label={t('theme.toggle')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-lg shadow-md transition-all duration-200"
              >
                {state.isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
              
              <LanguageToggle lang={state.lang} setLang={actions.setLang} />
            </div>

            {/* Header content */}
            <div className="relative py-6 px-4 sm:px-6 md:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                  <div className="flex-grow text-center sm:text-left">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
                      {t('title')}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
                      {t('subtitle')}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-4">
                    <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <img 
                        src="/sfro-logo.png" 
                        alt="SFRO Logo" 
                        className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto"
                        loading="lazy"
                      />
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <img 
                        src="/sfjro-logo.jpg" 
                        alt="SFjRO Logo" 
                        className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className={`p-6 space-y-6 transition-colors duration-300
            ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'}
          `}>
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

            {/* Search bar with autocomplete */}
            <div className={`rounded-lg shadow-sm p-6 space-y-4 transition-colors duration-300
              ${state.isDarkMode ? 'bg-gray-700' : 'bg-white'}
            `}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-3.5 h-5 w-5 ${state.isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('search')}
                    value={state.searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => state.searchTerm.length >= 2 && setShowSuggestions(true)}
                    className={`pl-10 h-12 w-full border-2 transition-colors rounded-lg
                      ${state.isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary' 
                        : 'border-gray-200 hover:border-sfro-primary focus:border-sfro-primary focus:ring-2 focus:ring-sfro-light'
                      }`}
                  />
                  <AnimatePresence>
                    <SearchSuggestions 
                      suggestions={searchSuggestions}
                      showSuggestions={showSuggestions}
                      selectedIndex={selectedSuggestionIndex}
                      onSelect={selectSuggestion}
                      isDarkMode={state.isDarkMode}
                      t={t}
                      suggestionsRef={suggestionsRef}
                    />
                  </AnimatePresence>
                </div>

                {/* Filters */}
                <select
                  value={state.selectedCategory}
                  onChange={(e) => actions.setFilters({ selectedCategory: e.target.value })}
                  className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
                    ${state.isDarkMode 
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
                  value={state.halfLifeFilter}
                  onChange={(e) => actions.setFilters({ halfLifeFilter: e.target.value })}
                  className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
                    ${state.isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary' 
                      : 'bg-white border-gray-200 hover:border-sfro-primary focus:border-sfro-primary'
                    }`}
                >
                  <option value="all">{t('halfLife.all')}</option>
                  <option value="short">{t('halfLife.short')}</option>
                  <option value="long">{t('halfLife.long')}</option>
                </select>

                <select
                  value={state.classFilter}
                  onChange={(e) => actions.setFilters({ classFilter: e.target.value })}
                  className={`h-12 w-full border-2 rounded-lg px-4 transition-colors cursor-pointer
                    ${state.isDarkMode 
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
              </div>
            </div>

            {/* Action buttons */}
            <div className={`flex ${isMobileView ? 'justify-center' : 'justify-between'} gap-4 flex-wrap`}>
              <div className="flex gap-2">
                {/* Column manager button (desktop only) */}
                {!isMobileView && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowColumnManager(!showColumnManager)}
                    className={`flex items-center gap-2 border px-6 py-3 rounded-lg font-medium transition-colors shadow-sm
                      ${state.isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
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
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isMobileView ? (
                <motion.div 
                  key="mobile-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredAndSortedDrugs.length > 0 ? (
                    filteredAndSortedDrugs.map((drug, index) => (
                      <DrugCard 
                        key={`${drug.name}-${index}`} 
                        drug={drug}
                        isDarkMode={state.isDarkMode}
                        onDrugClick={handleDrugClick}
                        isFavorite={state.favorites.includes(drug.name)}
                        onToggleFavorite={toggleFavorite}
                        t={t}
                        translateDrugClass={translateDrugClass}
                        CATEGORY_COLORS={CATEGORY_COLORS}
                      />
                    ))
                  ) : (
                    <div className={`text-center py-12 ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('noResults')}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="desktop-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`overflow-x-auto overflow-y-auto max-h-[600px] border rounded-lg shadow-lg
                    ${state.isDarkMode ? 'border-gray-600' : 'border-gray-200'}
                  `}
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
                          className={`rounded-lg shadow-xl p-6 w-80 max-w-full mx-4
                            ${state.isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
                          `}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-semibold ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
                              {t('columnManager.title')}
                            </h3>
                            <button 
                              onClick={() => setShowColumnManager(false)}
                              className={`rounded-full p-1 transition-colors
                                ${state.isDarkMode 
                                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(state.visibleColumns).map(([column, isVisible]) => (
                              <label key={column} className={`flex items-center space-x-3 cursor-pointer p-2 rounded transition-colors
                                ${state.isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                              `}>
                                <input 
                                  type="checkbox"
                                  checked={isVisible}
                                  onChange={() => actions.setVisibleColumns({
                                    ...state.visibleColumns,
                                    [column]: !isVisible
                                  })}
                                  className="rounded text-sfro-primary focus:ring-sfro-primary h-4 w-4"
                                />
                                <span className={`text-sm font-medium ${state.isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {formatColumnName(column)}
                                </span>
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

                  <table className={`w-full border-collapse min-w-[1200px]
                    ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  `}>
                    <thead className={`sticky top-0 z-10 transition-shadow
                      ${state.isDarkMode ? 'bg-gray-700' : 'bg-sfro-light'}
                      ${isTableScrolled ? 'shadow-md' : ''}
                    `}>
                      <tr>
                        {state.visibleColumns.name && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[160px] w-[20%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.name')} 
                              longTitle={t('columns.name')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.commercial && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[120px] w-[15%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.commercial')} 
                              longTitle={t('columns.commercial')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.administration && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.administration_short') || "Admin"} 
                              longTitle={t('columns.administration')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.class && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[120px] w-[15%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.class')} 
                              longTitle={t('columns.class')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.category && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.category_short') || "Cat"} 
                              longTitle={t('columns.category')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.halfLife && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.halfLife_short') || "Half-life"} 
                              longTitle={t('columns.halfLife')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.normofractionatedRT && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[90px] w-[9%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.normofractionatedRT_short') || "Norm RT"} 
                              longTitle={t('columns.normofractionatedRT')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.palliativeRT && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[90px] w-[9%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.palliativeRT_short') || "Pall RT"} 
                              longTitle={t('columns.palliativeRT')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.stereotacticRT && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[90px] w-[9%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.stereotacticRT_short') || "Stereo RT"} 
                              longTitle={t('columns.stereotacticRT')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                        {state.visibleColumns.intracranialRT && (
                          <th className={`px-3 py-2 text-left text-xs font-semibold min-w-[90px] w-[9%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip 
                              title={t('columns.intracranialRT_short') || "IC RT"} 
                              longTitle={t('columns.intracranialRT')}
                              isDarkMode={state.isDarkMode}
                            />
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${state.isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                      {filteredAndSortedDrugs.length > 0 ? (
                        filteredAndSortedDrugs.map((drug, index) => (
                          <tr 
                            key={index} 
                            className={`transition-colors duration-150 ease-in-out text-xs
                              ${state.isDarkMode 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-50'
                              }`}
                          >
                            {state.visibleColumns.name && (
                              <td className={`px-3 py-2 whitespace-normal font-medium
                                ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                              `}>
                                <button 
                                  onClick={() => handleDrugClick(drug)}
                                  className={`text-left cursor-pointer hover:underline
                                    ${state.isDarkMode 
                                      ? 'text-blue-400 hover:text-blue-300' 
                                      : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                >
                                  {drug.name}
                                </button>
                              </td>
                            )}
                            {state.visibleColumns.commercial && (
                              <td className={`px-3 py-2 whitespace-normal
                                ${state.isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                              `}>
                                {drug.commercial}
                              </td>
                            )}
                            {state.visibleColumns.administration && (
                              <td className={`px-3 py-2 whitespace-normal
                                ${state.isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                              `}>
                                {drug.administration}
                              </td>
                            )}
                            {state.visibleColumns.class && (
                              <td className={`px-3 py-2 whitespace-normal truncate max-w-[200px]
                                ${state.isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                              `}>
                                <span title={drug.class}>
                                  {translateDrugClass(drug.class)}
                                </span>
                              </td>
                            )}
                            {state.visibleColumns.category && (
                              <td className="px-3 py-2">
                                <Badge 
                                  color={CATEGORY_COLORS[state.isDarkMode ? 'dark' : 'light'][drug.category] || 
                                    (state.isDarkMode ? 'bg-gray-600 text-gray-300 border-gray-500' : 'bg-gray-50 text-gray-800 border-gray-200')}
                                >
                                  {drug.category.substring(0, 3)}
                                </Badge>
                              </td>
                            )}
                            {state.visibleColumns.halfLife && (
                              <td className={`px-3 py-2 whitespace-normal
                                ${state.isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                              `}>
                                {drug.halfLife}
                              </td>
                            )}
                            {state.visibleColumns.normofractionatedRT && (
                              <td className={`px-3 py-2 whitespace-pre-wrap text-xs break-words max-w-[150px] ${getCellColor(drug.normofractionatedRT, state.isDarkMode)}`}>
                                {drug.normofractionatedRT}
                              </td>
                            )}
                            {state.visibleColumns.palliativeRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.palliativeRT, state.isDarkMode)}`}>
                                {drug.palliativeRT}
                              </td>
                            )}
                            {state.visibleColumns.stereotacticRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.stereotacticRT, state.isDarkMode)}`}>
                                {drug.stereotacticRT}
                              </td>
                            )}
                            {state.visibleColumns.intracranialRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.intracranialRT, state.isDarkMode)}`}>
                                {drug.intracranialRT}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td 
                            colSpan={Object.values(state.visibleColumns).filter(Boolean).length} 
                            className={`px-3 py-8 text-center
                              ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                            `}
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
            <div className={`flex flex-wrap gap-4 text-sm mt-4 p-4 rounded-lg shadow-sm
              ${state.isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}
            `}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${state.isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
                <span>{t('legend.noDelay')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${state.isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}></div>
                <span>{t('legend.shortDelay')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${state.isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}></div>
                <span>{t('legend.longDelay')}</span>
              </div>
            </div>
          </CardContent>

          {/* Footer */}
          <div className={`border-t mt-8 p-6 transition-colors
            ${state.isDarkMode 
              ? 'border-gray-700 bg-gray-700 text-gray-300' 
              : 'border-gray-200 bg-sfro-light text-sfro-dark'
            }`}>
            <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
              <div>
                © {new Date().getFullYear()} SFRO - Société Française de Radiothérapie Oncologique
              </div>
              <div className="flex items-center gap-6">
                <a href="mailto:contact@sfro.fr" className={`transition-colors flex items-center gap-2
                  ${state.isDarkMode ? 'hover:text-blue-400' : 'hover:text-sfro-primary'}
                `}>
                  <Mail className="h-4 w-4" />
                  contact
                </a>
                <div className="flex gap-4">
                  <a href="#" className={`transition-colors
                    ${state.isDarkMode ? 'hover:text-blue-400' : 'hover:text-sfro-primary'}
                  `}>
                    {t('footer.legal')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* About and References Popups */}
        <AnimatePresence>
          {showAbout && (
            <AboutPopup 
              show={showAbout}
              onClose={() => setShowAbout(false)}
              content={ABOUT_CONTENT}
              lang={state.lang}
              isDarkMode={state.isDarkMode}
              t={t}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedReferences && (
            <ReferencesPopup 
              references={selectedReferences}
              onClose={() => setSelectedReferences(null)}
              isDarkMode={state.isDarkMode}
              t={t}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default DrugExplorer;