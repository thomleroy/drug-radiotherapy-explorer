import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, Info, ExternalLink, Settings, X, Mail, AlertCircle } from 'lucide-react';
import { allDrugs } from '../data/drugCatalog';
import protocolsData from '../data/ctProtocols.json';

import { motion, AnimatePresence } from 'framer-motion';
import { referencesData } from '../data/references';
import { escapeCsvField, isSafeHttpUrl } from '../utils/security';
import { translations } from './translations';
import { DATA_LAST_UPDATED } from '../buildMeta';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import FilterPanel from './FilterPanel';
import FavoritesPanel from './FavoritesPanel';
import useAppStore from './state/useAppStore';
import { CATEGORY_COLORS } from './constants';


// Format the last-updated date once. Falls back gracefully when the
// generator hasn't run (e.g. during ad-hoc test runs).
const formatDataDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};
const dataLastUpdatedDisplay = formatDataDate(DATA_LAST_UPDATED);

// Some catalog entries use "[None]" / "None" / "N/A" as a sentinel meaning
// "no bibliography for this molecule". Returns true only when at least one
// real reference token is present.
const hasMeaningfulReferences = (raw) => {
  if (typeof raw !== 'string' || raw.length === 0) return false;
  const NONE_TOKENS = new Set(['none', 'na', 'n/a']);
  return raw
    .split(',')
    .map((token) => token.replace(/[[\]]/g, '').trim())
    .filter(Boolean)
    .some((token) => !NONE_TOKENS.has(token.toLowerCase()));
};

// Highlight a substring match (case-insensitive) by wrapping it in a <mark>.
// Returns an array of React nodes. Plain string input with empty query
// is returned unchanged.
const highlightMatch = (text, query) => {
  if (!query || typeof text !== 'string' || typeof query !== 'string') return text;
  const q = query.trim();
  if (q.length === 0) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);
  return [
    before,
    <mark
      key="hl"
      className="bg-yellow-200 text-inherit rounded px-0.5 dark:bg-yellow-600/50"
    >
      {match}
    </mark>,
    after,
  ];
};

// Cell colors - memoized function for performance
const getCellColor = (value, isDark = false) => {
  if (typeof value !== 'string') return '';
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

// Bilingual fallback strings used before the translation system is reachable.
const ERROR_BOUNDARY_STRINGS = {
  en: {
    title: "Oops! Something went wrong",
    description: "The application encountered an unexpected error. Please refresh the page.",
    refresh: "Refresh Page"
  },
  fr: {
    title: "Oups ! Une erreur est survenue",
    description: "L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page.",
    refresh: "Rafraîchir la page"
  }
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
    // Keep console for dev inspection; optional hook for external reporters (Sentry, etc.)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Drug Explorer Error:', error, errorInfo);
    }
    if (typeof window !== 'undefined' && typeof window.__errorHandler === 'function') {
      try {
        window.__errorHandler(error, errorInfo);
      } catch {
        // Never let the reporter itself crash the boundary.
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Pick a language from localStorage defensively; fallback to English on any failure.
      let lang = 'en';
      try {
        const stored = typeof window !== 'undefined'
          ? window.localStorage.getItem('drug-explorer-lang')
          : null;
        if (stored === 'fr' || stored === 'en') lang = stored;
      } catch {
        lang = 'en';
      }
      const strings = ERROR_BOUNDARY_STRINGS[lang];
      const showDetails = process.env.NODE_ENV !== 'production' && this.state.error;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{strings.title}</h2>
            <p className="text-gray-600 mb-4">{strings.description}</p>
            {showDetails && (
              <pre className="text-left text-xs bg-gray-100 text-gray-700 p-3 rounded mb-4 overflow-auto max-h-40">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-sfro-primary text-white px-6 py-2 rounded-lg hover:bg-sfro-secondary transition-colors"
            >
              {strings.refresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    tableHint: "Click on the drug name to display its associated references.",
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
      exportXLSX: "Export Excel",
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
    references: {
      title: "References",
      openArticle: "Open Article",
      viewReferences: "View References",
      noReferences: "No references available"
    },
    columnManager: {
      title: "Manage Columns"
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
    },
    errorBoundary: {
      title: "Oops! Something went wrong",
      description: "The application encountered an unexpected error. Please refresh the page.",
      refresh: "Refresh Page"
    },
    toast: {
      csvSuccess: "CSV exported successfully",
      csvError: "Failed to export CSV",
      xlsxSuccess: "Excel file exported successfully",
      xlsxError: "Failed to export Excel file",
      linkCopied: "Link copied to clipboard",
      linkCopyError: "Could not copy link",
      dismiss: "Dismiss"
    },
    searchResults: {
      count: "{count} results found"
    },
    tableHintShort: "Click a drug name to see its references",
    filtersMeta: {
      title: "Filters",
      active: "Active filters",
      reset: "Reset filters",
      none: "No filter",
      search: "Search",
      category: "Category",
      class: "Class",
      halfLife: "Half-life",
      protocol: "Protocol",
      copyLink: "Copy link",
      clearRecent: "Clear recent searches",
      noResultsHint: "No drug matches the current filters. Try removing one or",
      noResultsAction: "reset all filters"
    },
    shortcuts: {
      title: "Keyboard shortcuts",
      focusSearch: "Focus search",
      help: "Open help",
      close: "Close dialog",
      navigateSuggestions: "Navigate suggestions",
      selectSuggestion: "Pick a suggestion",
      sortColumn: "Sort by column",
      reset: "Reset filters"
    },
    footer: {
      about: "About",
      legal: "Legal",
      lastUpdated: "Last updated"
    },
    details: {
      title: "Drug details",
      radiotherapyTimings: "Radiotherapy timings",
      administration: "Administration",
      halfLife: "Half-life",
      class: "Class",
      category: "Category",
      commercial: "Commercial name",
      seeReferences: "View references"
    }
  },
  fr: {
    title: "Explorateur Médicaments & Radiothérapie",
    subtitle: "Explorez les interactions des médicaments avec les traitements de radiothérapie",
    tableHint: "Cliquez sur le nom de la molécule pour afficher les références associées.",
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
      exportXLSX: "Exporter Excel",
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
      legal: "Mentions légales",
      lastUpdated: "Dernière mise à jour"
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
    },
    errorBoundary: {
      title: "Oups ! Une erreur est survenue",
      description: "L'application a rencontré une erreur inattendue. Veuillez rafraîchir la page.",
      refresh: "Rafraîchir la page"
    },
    toast: {
      csvSuccess: "Export CSV réussi",
      csvError: "Échec de l'export CSV",
      xlsxSuccess: "Export Excel réussi",
      xlsxError: "Échec de l'export Excel",
      linkCopied: "Lien copié dans le presse-papiers",
      linkCopyError: "Impossible de copier le lien",
      dismiss: "Fermer"
    },
    searchResults: {
      count: "{count} résultats trouvés"
    },
    tableHintShort: "Cliquez sur un nom de molécule pour voir ses références",
    filtersMeta: {
      title: "Filtres",
      active: "Filtres actifs",
      reset: "Réinitialiser les filtres",
      none: "Aucun filtre",
      search: "Recherche",
      category: "Catégorie",
      class: "Classe",
      halfLife: "Demi-vie",
      protocol: "Protocole",
      copyLink: "Copier le lien",
      clearRecent: "Effacer les recherches récentes",
      noResultsHint: "Aucune molécule ne correspond aux filtres actuels. Essayez d'en retirer un, ou",
      noResultsAction: "réinitialisez tous les filtres"
    },
    shortcuts: {
      title: "Raccourcis clavier",
      focusSearch: "Focus sur la recherche",
      help: "Ouvrir l'aide",
      close: "Fermer la modale",
      navigateSuggestions: "Naviguer dans les suggestions",
      selectSuggestion: "Choisir une suggestion",
      sortColumn: "Trier par colonne",
      reset: "Réinitialiser les filtres"
    },
    details: {
      title: "Détails de la molécule",
      radiotherapyTimings: "Délais de radiothérapie",
      administration: "Administration",
      halfLife: "Demi-vie",
      class: "Classe",
      category: "Catégorie",
      commercial: "Nom commercial",
      seeReferences: "Voir les références"
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
const ColumnHeaderWithTooltip = memo(({
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

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }) => (
  <div
    className="flex items-center justify-center p-8"
    role="status"
    aria-live="polite"
  >
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sfro-primary border-r-transparent mr-3"
      aria-hidden="true"
    ></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

// Custom hook: accessible modal dialog behavior (ESC to close, focus trap,
// focus restoration to the previously focused element). Returns a ref that
// should be attached to the dialog container.
const useModalA11y = (isOpen, onClose) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused =
      typeof document !== 'undefined' ? document.activeElement : null;

    const getFocusable = () => {
      const node = containerRef.current;
      if (!node) return [];
      return Array.from(
        node.querySelectorAll(
          'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
        )
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    };

    // Auto-focus the first focusable element (usually the close button).
    const focusTimer = setTimeout(() => {
      const focusables = getFocusable();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (containerRef.current) {
        containerRef.current.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = getFocusable();
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {
          // Ignore focus restoration errors.
        }
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
};

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
      const parts = line.split(/(\*\*.*?\*\*|https?:\/\/[^\s)]+)/g);
      return (
        <p key={index} className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={partIndex} className={isDarkMode ? 'text-gray-100' : 'text-sfro-dark'}>
                {part.slice(2, -2)}
              </strong>;
            }
            if (part.startsWith('http')) {
              // Only render as link when the URL is explicitly http(s).
              if (isSafeHttpUrl(part)) {
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
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;

  const aboutData = content[lang];
  const titleId = 'about-dialog-title';

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
            <h2 id={titleId} className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
              {aboutData.title}
            </h2>
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

// Memoized keyboard-shortcut help dialog. Triggered by the toolbar button
// or by pressing "?" anywhere in the app (outside of a text input).
const HelpModal = memo(({ show, onClose, isDarkMode, t, isMacPlatform }) => {
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;
  const titleId = 'help-dialog-title';
  const cmd = isMacPlatform ? '⌘' : 'Ctrl';
  const shortcuts = [
    { keys: [`${cmd}`, 'K'], label: t('shortcuts.focusSearch') },
    { keys: ['?'], label: t('shortcuts.help') },
    { keys: ['Esc'], label: t('shortcuts.close') },
    { keys: ['↑', '↓'], label: t('shortcuts.navigateSuggestions') },
    { keys: ['Enter'], label: t('shortcuts.selectSuggestion') },
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
        className={`rounded-lg shadow-xl max-w-md w-full p-6
          ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white text-sfro-dark'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-xl font-bold">
            {t('shortcuts.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.close')}
            className={`rounded-full p-1
              ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}
            `}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="space-y-3">
          {shortcuts.map((sc) => (
            <li key={sc.label} className="flex justify-between items-center text-sm">
              <span>{sc.label}</span>
              <span className="flex gap-1">
                {sc.keys.map((k) => (
                  <kbd
                    key={k}
                    className={`px-1.5 py-0.5 rounded border text-[11px] font-mono font-semibold
                      ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
});

// Memoized accessible Column Manager modal. Uses the same a11y hook as
// the other dialogs (focus trap, ESC close, focus restoration).
const ColumnManagerModal = memo(({
  show,
  onClose,
  visibleColumns,
  onChange,
  isDarkMode,
  t,
  formatColumnName,
}) => {
  const dialogRef = useModalA11y(show, onClose);
  if (!show) return null;

  const titleId = 'column-manager-title';
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
        onClick={(e) => e.stopPropagation()}
        className={`rounded-lg shadow-xl p-6 w-80 max-w-full mx-4
          ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id={titleId} className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}`}>
            {t('columnManager.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('buttons.close')}
            className={`rounded-full p-1 transition-colors
              ${isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(visibleColumns).map(([column, isVisible]) => (
            <label
              key={column}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded transition-colors
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
              `}
            >
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => onChange(column, !isVisible)}
                className="rounded text-sfro-primary focus:ring-sfro-primary h-4 w-4"
              />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatColumnName(column)}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-sfro-primary text-white rounded-md hover:bg-sfro-secondary focus:outline-none focus:ring-2 focus:ring-sfro-light"
          >
            {t('buttons.done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
});

// Memoized Drug Detail Popup — a compact read-only panel that shows all
// available information about a single drug plus a shortcut to its
// associated bibliographic references.
const DrugDetailPopup = memo(({ drug, onClose, onOpenReferences, isDarkMode, t, translateDrugClass }) => {
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

// Memoized References Popup component
const ReferencesPopup = memo(({ references, onClose, isDarkMode, t }) => {
  const isOpen = Boolean(references);
  const dialogRef = useModalA11y(isOpen, onClose);
  const titleId = 'references-dialog-title';

  if (!references) return null;

  // Handle the case when no references are available
  if (references === 'no-references') {
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
          className={`p-6 rounded-lg max-w-md m-4
            ${isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white'
            }`}
          onClick={e => e.stopPropagation()}
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
  }

  // Defensive parsing: references may be undefined, not a string, or contain
  // stray brackets/whitespace. Some entries use "None" / "N/A" as a sentinel
  // meaning "no bibliography" — drop them so we don't render bogus rows.
  const NONE_TOKENS = new Set(['none', 'na', 'n/a']);
  const refArray = typeof references === 'string'
    ? references
        .split(',')
        .map((ref) => ref.replace(/[[\]]/g, '').trim())
        .filter(Boolean)
        .filter((ref) => !NONE_TOKENS.has(ref.toLowerCase()))
    : [];

  // After cleanup, fall back to the "no references available" UI when the
  // resulting list is empty.
  if (refArray.length === 0) {
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
          ${isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white'
          }`}
        onClick={e => e.stopPropagation()}
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

// Main DrugExplorer component
const DrugExplorer = () => {
  // Global state management
  const [state, actions] = useAppStore();
  
  // Local UI states that don't need global management
  // Bump the table → cards breakpoint up to lg (1024px) so the dense
  // 1200px-wide drug table doesn't force horizontal scroll on tablets.
  const initialIsMobileView = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  const [isMobileView, setIsMobileView] = useState(initialIsMobileView);
  const [isTableScrolled, setIsTableScrolled] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState(null);
  const [selectedDrugDetail, setSelectedDrugDetail] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  // Transient toast notification ({ type: 'success'|'error', message: string } | null)
  const [toast, setToast] = useState(null);
  // Initial loading state (data is synchronous, but we render a brief fallback
  // for perceived performance and to hide the large table until first paint).
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  // 🔽 AJOUTER CECI
  // Protocole sélectionné et sa liste de drogues
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const protocolDrugs = useMemo(() => {
    if (!selectedProtocol) return [];
    const found = protocolsData.find(p => p.protocol === selectedProtocol);
    return found ? found.drugs : [];
  }, [selectedProtocol]);
  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  // Initialize from localStorage (defensive: ignore corrupted/unexpected values).
  // Falls back to the user's system preferences when nothing is stored yet.
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('drug-explorer-theme');
      const savedLang = localStorage.getItem('drug-explorer-lang');

      if (savedTheme === 'dark' || savedTheme === 'light') {
        actions.setDarkMode(savedTheme === 'dark');
      } else if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        actions.setDarkMode(true);
      }

      if (savedLang === 'fr' || savedLang === 'en') {
        actions.setLang(savedLang);
      } else if (typeof navigator !== 'undefined') {
        const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (browserLang.startsWith('fr')) {
          actions.setLang('fr');
        }
      }
    } catch {
      // Storage unavailable (private mode, disabled): just use defaults.
    }
  }, [actions]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('drug-explorer-theme', state.isDarkMode ? 'dark' : 'light');
      localStorage.setItem('drug-explorer-lang', state.lang);
    } catch {
      // Storage unavailable: state is still kept in memory.
    }

    // Apply theme to document
    document.documentElement.classList.toggle('dark', state.isDarkMode);
    document.documentElement.lang = state.lang;
  }, [state.isDarkMode, state.lang]);

  // Track the user's reduced-motion preference so Framer Motion transitions
  // can be opted out of. This keeps animations available for users who want
  // them while respecting those who cannot tolerate motion.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  // Release the initial loading state shortly after mount so the first paint
  // can focus on the header + card skeleton rather than the full drug table.
  // Users opting out of motion get an immediate flip instead.
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInitialLoading(false);
      return undefined;
    }
    const timer = setTimeout(() => setIsInitialLoading(false), 120);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Bootstrap filters and search from URL query params so shared links
  // land on the right view. Runs once on mount.
  const urlHydratedRef = useRef(false);
  useEffect(() => {
    if (urlHydratedRef.current) return;
    urlHydratedRef.current = true;
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const category = params.get('category');
      const cls = params.get('class');
      const halfLife = params.get('halfLife');
      const sort = params.get('sort');
      const dir = params.get('dir');

      if (q) actions.setSearchTerm(q);
      const filterPatch = {};
      if (category && ['all', 'chemotherapy', 'endocrine', 'targeted', 'immunotherapy'].includes(category)) {
        filterPatch.selectedCategory = category;
      }
      if (cls) filterPatch.classFilter = cls;
      if (halfLife && ['all', 'short', 'long'].includes(halfLife)) {
        filterPatch.halfLifeFilter = halfLife;
      }
      if (Object.keys(filterPatch).length > 0) {
        actions.setFilters(filterPatch);
      }
      if (sort && (dir === 'asc' || dir === 'desc')) {
        actions.setSortConfig({ key: sort, direction: dir });
      }
    } catch {
      // Malformed URL: ignore and use defaults.
    }
  }, [actions]);

  // Keep URL query params in sync with filters/search/sort so the current
  // view is shareable. Uses replaceState to avoid polluting history.
  useEffect(() => {
    if (!urlHydratedRef.current) return;
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams();
      if (state.searchTerm && state.searchTerm.length >= 2) {
        params.set('q', state.searchTerm);
      }
      if (state.selectedCategory !== 'all') {
        params.set('category', state.selectedCategory);
      }
      if (state.classFilter !== 'all') {
        params.set('class', state.classFilter);
      }
      if (state.halfLifeFilter !== 'all') {
        params.set('halfLife', state.halfLifeFilter);
      }
      if (state.sortConfig.key) {
        params.set('sort', state.sortConfig.key);
        params.set('dir', state.sortConfig.direction);
      }
      const query = params.toString();
      const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(null, '', next);
      }
    } catch {
      // Non-fatal: URL sync is a nice-to-have.
    }
  }, [
    state.searchTerm,
    state.selectedCategory,
    state.classFilter,
    state.halfLifeFilter,
    state.sortConfig,
  ]);

  // Auto-dismiss toasts after a few seconds.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Global keyboard shortcuts:
  //  - Cmd/Ctrl+K → focus the search input
  //  - ?         → open the help dialog (only when not typing in a field)
  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      const tag = target?.tagName;
      const isTyping =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;

      const isK = event.key === 'k' || event.key === 'K';
      if (isK && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (searchInputRef.current && typeof searchInputRef.current.focus === 'function') {
          searchInputRef.current.focus();
          searchInputRef.current.select?.();
        }
        return;
      }

      if (event.key === '?' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setShowHelp(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  // Memoized drug class translation. Falls back to the English label if no
  // French translation is available for a given class.
  const translateDrugClass = useCallback((className) => {
    if (state.lang === 'en') return className;
    const map = translations.fr?.drugClasses;
    if (map && Object.prototype.hasOwnProperty.call(map, className)) {
      return map[className];
    }
    return className;
  }, [state.lang]);

  // Generate search suggestions with performance optimization.
  // When the query is empty, fall back to the user's recent searches so
  // the input doubles as a quick-history panel.
  const searchSuggestions = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
      if (state.recentSearches && state.recentSearches.length > 0) {
        return state.recentSearches.map((text) => ({
          text,
          type: 'recent',
          highlight: 0,
        }));
      }
      return [];
    }

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
  // 🔽 AJOUT : suggestions de protocoles
  for (const protocol of protocolsData) {
    if (suggestions.length >= maxSuggestions) break;
    if (protocol.protocol.toLowerCase().includes(searchLower)) {
      const exists = suggestions.find(
        s => s.text.toLowerCase() === protocol.protocol.toLowerCase()
      );
      if (!exists) {
        suggestions.push({
          text: protocol.protocol,
          type: 'protocol',
          highlight: 0, // ou 1, selon ce que tu utilises déjà
        });
      }
    }
  }

    // Sort by relevance
      // Tri final
  return suggestions.sort((a, b) => {
    if (a.highlight === 0 && b.highlight !== 0) return -1;
    if (b.highlight === 0 && a.highlight !== 0) return 1;
    const typeOrder = { protocol: -1, drug: 0, commercial: 1, dci: 2, class: 3 };
    return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
  });

  }, [debouncedSearchTerm, state.recentSearches]);

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

    if (state.classFilter !== 'all') {
      filtered = filtered.filter(drug => drug.class === state.classFilter);
    }

    // Half-life filter: "short" (≤24h) vs "long" (>24h). We parse the
    // numeric prefix from drug.halfLife strings like "12h", "3 days", etc.
    if (state.halfLifeFilter !== 'all') {
      filtered = filtered.filter((drug) => {
        const raw = typeof drug.halfLife === 'string' ? drug.halfLife.toLowerCase() : '';
        const match = raw.match(/([\d.]+)/);
        if (!match) return false;
        let hours = parseFloat(match[1]);
        if (!Number.isFinite(hours)) return false;
        if (raw.includes('day')) hours *= 24;
        if (raw.includes('week')) hours *= 24 * 7;
        if (raw.includes('min')) hours /= 60;
        if (state.halfLifeFilter === 'short') return hours <= 24;
        if (state.halfLifeFilter === 'long') return hours > 24;
        return true;
      });
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
    state.classFilter,
    state.halfLifeFilter,
    state.sortConfig
  ]);

  // Keep document.title in sync with the current language and the visible
  // result count once the user starts filtering.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hasActiveFilter =
      (state.searchTerm && state.searchTerm.length >= 2) ||
      state.selectedCategory !== 'all' ||
      state.classFilter !== 'all' ||
      state.halfLifeFilter !== 'all';
    if (hasActiveFilter) {
      const label = state.lang === 'fr' ? 'résultats' : 'results';
      document.title = `Radiosync — ${filteredAndSortedDrugs.length} ${label}`;
    } else {
      document.title = 'Radiosync';
    }
  }, [
    state.lang,
    state.searchTerm,
    state.selectedCategory,
    state.classFilter,
    state.halfLifeFilter,
    filteredAndSortedDrugs.length,
  ]);

const protocolFilteredDrugs = useMemo(() => {
  if (!selectedProtocol) return null;
  if (!protocolDrugs.length) return [];
  const names = protocolDrugs.map(d => d.generic.toLowerCase());

  return filteredAndSortedDrugs.filter(drug =>
    names.includes(drug.name?.toLowerCase()) ||
    names.includes(drug.dci?.toLowerCase())
  );
}, [selectedProtocol, protocolDrugs, filteredAndSortedDrugs]);

const displayedDrugs = useMemo(() => {
  if (selectedProtocol && protocolFilteredDrugs) {
    return protocolFilteredDrugs;
  }
  return filteredAndSortedDrugs;
}, [selectedProtocol, protocolFilteredDrugs, filteredAndSortedDrugs]);


  // Performance optimized statistics
  const stats = useMemo(() => {
    const counts = displayedDrugs.reduce((acc, drug) => {
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
  }, [displayedDrugs, t, state.isDarkMode]);

  // Memoized unique drug classes
  const uniqueDrugClasses = useMemo(() => 
    [...new Set(allDrugs.map(drug => drug.class))].sort(),
    []
  );

  // Event handlers with useCallback for performance
  const handleSearchChange = useCallback((e) => {
    // Defensive length cap: prevents pathological regex/filter costs on very
    // long pastes and keeps the input aligned with the maxLength attribute.
    const value = (e.target.value || '').slice(0, 100);
    actions.setSearchTerm(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  }, [actions]);

  const selectSuggestion = useCallback((suggestion) => {
  if (suggestion.type === 'protocol') {
    // On sélectionne un protocole : on vide le champ de recherche
    setSelectedProtocol(suggestion.text);
    actions.setSearchTerm('');
  } else {
    // Comportement habituel pour les drogues, DCI, classes, etc.
    setSelectedProtocol(null);
    actions.setSearchTerm(suggestion.text);
  }
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
      default:
        break;
    }
  }, [showSuggestions, searchSuggestions, selectedSuggestionIndex, selectSuggestion]);

  const toggleDarkMode = useCallback(() => {
    actions.setDarkMode(!state.isDarkMode);
  }, [actions, state.isDarkMode]);

  // Clicking a drug name opens the detail panel. From there, users can
  // open the dedicated references popup if they need the bibliography.
  const handleDrugClick = useCallback((drug) => {
    setSelectedDrugDetail(drug);
  }, []);

  // Toggle sort by column: asc → desc → none
  const handleSort = useCallback((key) => {
    const current = state.sortConfig;
    let next;
    if (current.key !== key) {
      next = { key, direction: 'asc' };
    } else if (current.direction === 'asc') {
      next = { key, direction: 'desc' };
    } else {
      next = { key: null, direction: 'asc' };
    }
    actions.setSortConfig(next);
  }, [state.sortConfig, actions]);

  // Reset all filters and the search term.
  const resetFilters = useCallback(() => {
    actions.setSearchTerm('');
    actions.setFilters({
      selectedCategory: 'all',
      classFilter: 'all',
      halfLifeFilter: 'all',
    });
    actions.setSortConfig({ key: null, direction: 'asc' });
    setSelectedProtocol(null);
  }, [actions]);

  // Compute the list of active filter chips. Each chip knows how to clear
  // itself so the user can drop filters one by one.
  const hasActiveFilters =
    (state.searchTerm && state.searchTerm.length >= 1) ||
    state.selectedCategory !== 'all' ||
    state.classFilter !== 'all' ||
    state.halfLifeFilter !== 'all' ||
    Boolean(selectedProtocol);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (state.searchTerm) {
      chips.push({
        key: 'search',
        label: `${t('filtersMeta.search')}: ${state.searchTerm}`,
        onClear: () => actions.setSearchTerm(''),
      });
    }
    if (state.selectedCategory !== 'all') {
      chips.push({
        key: 'category',
        label: `${t('filtersMeta.category')}: ${t(`categories.${state.selectedCategory}`)}`,
        onClear: () => actions.setFilters({ selectedCategory: 'all' }),
      });
    }
    if (state.classFilter !== 'all') {
      chips.push({
        key: 'class',
        label: `${t('filtersMeta.class')}: ${translateDrugClass(state.classFilter)}`,
        onClear: () => actions.setFilters({ classFilter: 'all' }),
      });
    }
    if (state.halfLifeFilter !== 'all') {
      chips.push({
        key: 'halfLife',
        label: `${t('filtersMeta.halfLife')}: ${t(`halfLife.${state.halfLifeFilter}`)}`,
        onClear: () => actions.setFilters({ halfLifeFilter: 'all' }),
      });
    }
    if (selectedProtocol) {
      chips.push({
        key: 'protocol',
        label: `${t('filtersMeta.protocol')}: ${selectedProtocol}`,
        onClear: () => setSelectedProtocol(null),
      });
    }
    return chips;
  }, [
    state.searchTerm,
    state.selectedCategory,
    state.classFilter,
    state.halfLifeFilter,
    selectedProtocol,
    t,
    actions,
    translateDrugClass,
  ]);

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
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
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

  // Detect macOS to display the right keyboard shortcut hint (⌘ vs Ctrl).
  const isMacPlatform = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || navigator.platform || '');
  }, []);

  // Copy the current shareable URL (with all filters) to the clipboard.
  const copyShareLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-secure contexts.
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setToast({ type: 'success', message: t('toast.linkCopied') });
    } catch {
      setToast({ type: 'error', message: t('toast.linkCopyError') });
    }
  }, [t]);

  // Clear the in-memory recent searches (also wipes them from the suggestion
  // listbox). The store helper does the actual work.
  const clearRecentSearches = useCallback(() => {
    actions.setRecentSearches?.([]);
  }, [actions]);

  // CSV download handler (CSV-injection safe, UTF-8 BOM for Excel)
  const downloadCSV = useCallback(() => {
    try {
      const columns = [
        'name',
        'commercial',
        'administration',
        'class',
        'category',
        'halfLife',
        'normofractionatedRT',
        'palliativeRT',
        'stereotacticRT',
        'intracranialRT',
        'references'
      ];
      const headerLabels = [
        'Drug Name',
        'Commercial Name',
        'Administration',
        'Class',
        'Category',
        'Half-life',
        'Normofractionated RT',
        'Palliative RT',
        'Stereotactic RT',
        'Intracranial RT',
        'References'
      ];
      const header = headerLabels.map(escapeCsvField).join(',');
      const dataset = ((selectedProtocol && protocolFilteredDrugs) || filteredAndSortedDrugs) || [];
      const rows = dataset.map((drug) =>
        columns.map((col) => escapeCsvField(drug[col] ?? '')).join(',')
      );
      // BOM + CRLF line endings for best Excel compatibility (esp. French accents).
      const csv = '\uFEFF' + [header, ...rows].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `drug-radiotherapy-data-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setToast({ type: 'success', message: t('toast.csvSuccess') });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error downloading CSV:', error);
      }
      setToast({ type: 'error', message: t('toast.csvError') });
    }
  }, [filteredAndSortedDrugs, selectedProtocol, protocolFilteredDrugs, t]);

  // Excel export using the SheetJS xlsx package. We dynamic-import the
  // library only when the user actually clicks the button so the ~90kb
  // payload is kept out of the initial bundle.
  const downloadXLSX = useCallback(async () => {
    try {
      const XLSX = await import('xlsx');
      const dataset = ((selectedProtocol && protocolFilteredDrugs) || filteredAndSortedDrugs) || [];
      const rows = dataset.map((drug) => ({
        'Drug Name': drug.name ?? '',
        'Commercial Name': drug.commercial ?? '',
        'Administration': drug.administration ?? '',
        'Class': drug.class ?? '',
        'Category': drug.category ?? '',
        'Half-life': drug.halfLife ?? '',
        'Normofractionated RT': drug.normofractionatedRT ?? '',
        'Palliative RT': drug.palliativeRT ?? '',
        'Stereotactic RT': drug.stereotacticRT ?? '',
        'Intracranial RT': drug.intracranialRT ?? '',
        'References': drug.references ?? '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Radiosync');
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `drug-radiotherapy-data-${today}.xlsx`);
      setToast({ type: 'success', message: t('toast.xlsxSuccess') });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error downloading XLSX:', error);
      }
      setToast({ type: 'error', message: t('toast.xlsxError') });
    }
  }, [filteredAndSortedDrugs, selectedProtocol, protocolFilteredDrugs, t]);

  if (isInitialLoading) {
    return (
      <ErrorBoundary>
        <div
          className={`min-h-screen transition-colors duration-300 flex items-center justify-center
            ${state.isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
          `}
        >
          <LoadingFallback message={t('performance.loadingFallback')} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <FavoritesPanel
        favorites={state.favorites}
        onInitializeFavorites={actions.setFavorites}
      >
        <div
          id="main-content"
          className={`min-h-screen transition-colors duration-300
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
                <Info className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">{t('footer.about')}</span>
              </motion.button>

              {/* Keyboard shortcuts help (also openable via the "?" key) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(true)}
                aria-label={t('shortcuts.title')}
                title={t('shortcuts.title')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-sfro-primary w-9 h-9 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center font-bold"
              >
                ?
              </motion.button>

              <ThemeToggle
                isDarkMode={state.isDarkMode}
                onToggle={toggleDarkMode}
                label={t('theme.toggle')}
              />

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
{/* Vue mobile : petites cartes en ligne, scroll horizontal */}
<div className="sm:hidden -mx-2">
  <div className="flex gap-2 px-2 overflow-x-auto pb-1">
    {stats.map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          ${stat.color} 
          rounded-lg px-3 py-2 shadow-sm flex-shrink-0
          min-w-[110px] max-w-[130px]
        `}
      >
        <p className="text-[10px] font-medium truncate">
          {stat.label}
        </p>
        <p className="text-lg font-bold mt-0.5">
          {stat.value}
        </p>
      </motion.div>
    ))}
  </div>
</div>

{/* Vue ≥ sm : grille comme avant */}
<div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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


{/* Search bar with autocomplete + protocol panel */}
<div className={`rounded-lg shadow-sm p-6 space-y-4 transition-colors duration-300
  ${state.isDarkMode ? 'bg-gray-700' : 'bg-white'}
`}>
  <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
    
    {/* Colonne gauche : recherche + filtres */}
    <div className="flex-1 min-w-0 space-y-4">
      {/* Barre de recherche */}
      <div
        className="relative"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="drug-search-listbox"
        aria-expanded={showSuggestions && searchSuggestions.length > 0}
      >
        <Search
          className={`absolute left-3 top-3.5 h-5 w-5 ${
            state.isDarkMode ? 'text-gray-400' : 'text-gray-400'
          }`}
          aria-hidden="true"
        />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={t('search')}
          value={state.searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (state.searchTerm.length >= 2 || (state.recentSearches && state.recentSearches.length > 0)) {
              setShowSuggestions(true);
            }
          }}
          maxLength={100}
          aria-label={t('search')}
          aria-describedby="search-shortcut-hint"
          aria-autocomplete="list"
          aria-controls="drug-search-listbox"
          aria-activedescendant={
            showSuggestions && selectedSuggestionIndex >= 0
              ? `drug-search-listbox-option-${selectedSuggestionIndex}`
              : undefined
          }
          className={`pl-10 pr-16 h-12 w-full border-2 transition-colors rounded-lg
            ${
              state.isDarkMode
                ? 'bg-gray-600 border-gray-500 text-gray-100 hover:border-sfro-primary focus:border-sfro-primary'
                : 'border-gray-200 hover:border-sfro-primary focus:border-sfro-primary focus:ring-2 focus:ring-sfro-light'
            }`}
        />
        {/* Keyboard shortcut hint — hidden on small screens */}
        <kbd
          id="search-shortcut-hint"
          aria-label={t('shortcuts.focusSearch')}
          className={`hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border pointer-events-none select-none
            ${state.isDarkMode
              ? 'bg-gray-700 border-gray-500 text-gray-300'
              : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
        >
          {isMacPlatform ? '⌘' : 'Ctrl'}+K
        </kbd>
        <AnimatePresence>
          <SearchSuggestions
            suggestions={searchSuggestions}
            showSuggestions={showSuggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelect={selectSuggestion}
            isDarkMode={state.isDarkMode}
            t={t}
            suggestionsRef={suggestionsRef}
            listboxId="drug-search-listbox"
            onClearRecent={clearRecentSearches}
          />
        </AnimatePresence>
        {/* Live region announcing the result count to assistive technologies */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {state.searchTerm.length >= 2
            ? t('searchResults.count').replace('{count}', filteredAndSortedDrugs.length)
            : ''}
        </div>
      </div>

      {/* Filtres (catégorie / classe / demi-vie) */}
      <FilterPanel
        selectedCategory={state.selectedCategory}
        classFilter={state.classFilter}
        halfLifeFilter={state.halfLifeFilter}
        onCategoryChange={(e) =>
          actions.setFilters({ selectedCategory: e.target.value })
        }
        onClassChange={(e) =>
          actions.setFilters({ classFilter: e.target.value })
        }
        onHalfLifeChange={(e) =>
          actions.setFilters({ halfLifeFilter: e.target.value })
        }
        uniqueDrugClasses={uniqueDrugClasses}
        isDarkMode={state.isDarkMode}
        t={t}
        translateDrugClass={translateDrugClass}
      />

      {/* Active filter chips + reset / copy-link buttons */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-medium ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('filtersMeta.active')}:
          </span>
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClear}
              aria-label={`${chip.label} — ${t('buttons.close')}`}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors
                ${state.isDarkMode
                  ? 'bg-sfro-primary/20 border-sfro-primary/40 text-sfro-light hover:bg-sfro-primary/30'
                  : 'bg-sfro-light border-sfro-primary/30 text-sfro-dark hover:bg-sfro-primary/10'
                }`}
            >
              <span>{chip.label}</span>
              <X size={12} aria-hidden="true" />
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={copyShareLink}
              className={`text-xs font-medium underline
                ${state.isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-sfro-primary'}
              `}
            >
              {t('filtersMeta.copyLink')}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className={`text-xs font-medium underline
                ${state.isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-sfro-primary'}
              `}
            >
              {t('filtersMeta.reset')}
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Colonne droite : panneau protocole */}
    {selectedProtocol && protocolDrugs.length > 0 && (
      <div
        className={`
          w-full xl:w-80 2xl:w-96 
          shrink-0 
          rounded-2xl border shadow-lg p-4 xl:p-5 space-y-3
          transition-colors duration-300
          ${
            state.isDarkMode
              ? 'bg-slate-800/80 border-slate-700 text-slate-50'
              : 'bg-white border-slate-200 text-slate-900'
          }
        `}
      >
        {/* Titre + badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                ${
                  state.isDarkMode
                    ? 'bg-sky-500/20 text-sky-200'
                    : 'bg-sky-100 text-sky-700'
                }
              `}
            >
              Rx
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider opacity-70">
                Protocole sélectionné
              </span>
              <span className="font-semibold truncate max-w-[14rem]">
                {selectedProtocol}
              </span>
            </div>
          </div>

          <span
            className={`
              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
              ${
                state.isDarkMode
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-slate-100 text-slate-700'
              }
            `}
          >
            {protocolDrugs.length} molécule
            {protocolDrugs.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Ligne séparatrice */}
        <div
          className={`
            h-px my-1
            ${state.isDarkMode ? 'bg-slate-700/80' : 'bg-slate-200'}
          `}
        />

        {/* Liste des drogues */}
        <div className="max-h-56 overflow-auto pr-1 space-y-1.5">
          {protocolDrugs.map((d, idx) => (
            <div
              key={idx}
              className={`
                text-xs rounded-xl px-2.5 py-1.5 flex flex-col
                ${
                  state.isDarkMode
                    ? 'bg-slate-800/80'
                    : 'bg-slate-50'
                }
              `}
            >
              <span className="font-medium">{d.generic}</span>
              {d.brand && (
                <span className="text-[11px] opacity-70">
                  {d.brand}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Petit footer */}
        <div
          className={`
            pt-1 border-t text-[11px] opacity-70 mt-1 border-dashed
            ${state.isDarkMode ? 'border-slate-700' : 'border-slate-200'}
          `}
        >
          Cliquer sur une molécule dans le tableau pour voir les détails complets.
        </div>
      </div>
    )}
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
{/* Hint: click to view references */}



                {/* Export buttons — labels include the visible row count so
                    users know exactly how many drugs will be exported. */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadCSV}
                  title={`${t('buttons.exportCSV')} (${displayedDrugs.length})`}
                  className="flex items-center gap-2 bg-sfro-primary hover:bg-sfro-secondary transition-colors px-6 py-3 rounded-lg text-white shadow-sm font-medium"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {t('buttons.exportCSV')}
                  <span className="text-xs opacity-80">({displayedDrugs.length})</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadXLSX}
                  title={`${t('buttons.exportXLSX')} (${displayedDrugs.length})`}
                  className={`flex items-center gap-2 transition-colors px-6 py-3 rounded-lg shadow-sm font-medium
                    ${state.isDarkMode
                      ? 'bg-gray-600 hover:bg-gray-500 text-white border border-gray-500'
                      : 'bg-white hover:bg-gray-50 text-sfro-dark border border-gray-300'
                    }`}
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                  {t('buttons.exportXLSX')}
                  <span className="text-xs opacity-80">({displayedDrugs.length})</span>
                </motion.button>
              </div>
            </div>
<div className={`text-sm mb-2 ${state.isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
  {t('tableHint')}
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
                  {displayedDrugs.length > 0 ? (
                    displayedDrugs.map((drug, index) => (
                      <DrugCard
                        key={drug.id}
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
                    <div className={`flex flex-col items-center gap-2 text-center py-12
                      ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                    `}>
                      <Search className="h-10 w-10 opacity-40" aria-hidden="true" />
                      <p className="font-medium">{t('noResults')}</p>
                      {hasActiveFilters && (
                        <p className="text-xs">
                          {t('filtersMeta.noResultsHint')}{' '}
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="underline font-medium hover:text-sfro-primary"
                          >
                            {t('filtersMeta.noResultsAction')}
                          </button>
                          .
                        </p>
                      )}
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
                  <table className={`w-full border-collapse min-w-[1200px]
                    ${state.isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  `}>
                    <thead className={`sticky top-0 z-10 transition-shadow
                      ${state.isDarkMode ? 'bg-gray-700' : 'bg-sfro-light'}
                      ${isTableScrolled ? 'shadow-md' : ''}
                    `}>
                      <tr>
                        {state.visibleColumns.name && (
                          <th
                            scope="col"
                            aria-sort={
                              state.sortConfig.key === 'name'
                                ? state.sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                : 'none'
                            }
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[160px] w-[20%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <div className="flex items-center gap-1">
                              <ColumnHeaderWithTooltip
                                title={t('columns.name')}
                                longTitle={t('columns.name')}
                                isDarkMode={state.isDarkMode}
                                sortable
                                sortKey="name"
                                currentSort={state.sortConfig}
                                onSort={handleSort}
                              />
                              <span
                                className="relative group inline-flex items-center"
                                title={t('tableHintShort')}
                              >
                                <Info
                                  className={`h-3.5 w-3.5 cursor-help ${state.isDarkMode ? 'text-gray-400' : 'text-sfro-primary'}`}
                                  aria-label={t('tableHintShort')}
                                />
                                <span
                                  role="tooltip"
                                  className={`invisible group-hover:visible absolute left-5 top-full mt-1 p-2 text-[11px] font-normal rounded shadow-lg max-w-[220px] z-50
                                    ${state.isDarkMode
                                      ? 'bg-gray-700 text-gray-200'
                                      : 'bg-gray-800 text-white'
                                    }`}
                                >
                                  {t('tableHintShort')}
                                </span>
                              </span>
                            </div>
                          </th>
                        )}
                        {state.visibleColumns.commercial && (
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[120px] w-[15%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip
                              title={t('columns.commercial')}
                              longTitle={t('columns.commercial')}
                              isDarkMode={state.isDarkMode}
                              sortable
                              sortKey="commercial"
                              currentSort={state.sortConfig}
                              onSort={handleSort}
                            />
                          </th>
                        )}
                        {state.visibleColumns.administration && (
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
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
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[120px] w-[15%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip
                              title={t('columns.class')}
                              longTitle={t('columns.class')}
                              isDarkMode={state.isDarkMode}
                              sortable
                              sortKey="class"
                              currentSort={state.sortConfig}
                              onSort={handleSort}
                            />
                          </th>
                        )}
                        {state.visibleColumns.category && (
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip
                              title={t('columns.category_short') || "Cat"}
                              longTitle={t('columns.category')}
                              isDarkMode={state.isDarkMode}
                              sortable
                              sortKey="category"
                              currentSort={state.sortConfig}
                              onSort={handleSort}
                            />
                          </th>
                        )}
                        {state.visibleColumns.halfLife && (
                          <th
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-semibold min-w-[80px] w-[8%]
                            ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                          `}>
                            <ColumnHeaderWithTooltip
                              title={t('columns.halfLife_short') || "Half-life"}
                              longTitle={t('columns.halfLife')}
                              isDarkMode={state.isDarkMode}
                              sortable
                              sortKey="halfLife"
                              currentSort={state.sortConfig}
                              onSort={handleSort}
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
                      {displayedDrugs.length > 0 ? (
                        displayedDrugs.map((drug, index) => (
                          <tr
                            key={drug.id}
                            className={`transition-colors duration-150 ease-in-out text-xs
                              ${state.isDarkMode 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-50'
                              }`}
                          >
                            {state.visibleColumns.name && (
                              <th
                                scope="row"
                                className={`px-3 py-2 whitespace-normal font-medium text-left
                                  ${state.isDarkMode ? 'text-gray-200' : 'text-sfro-dark'}
                                `}
                              >
                                <button
                                  onClick={() => handleDrugClick(drug)}
                                  className={`text-left cursor-pointer hover:underline font-medium
                                    ${state.isDarkMode
                                      ? 'text-blue-400 hover:text-blue-300'
                                      : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                >
                                  {highlightMatch(drug.name, debouncedSearchTerm)}
                                </button>
                              </th>
                            )}
                            {state.visibleColumns.commercial && (
                              <td className={`px-3 py-2 whitespace-normal
                                ${state.isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                              `}>
                                {highlightMatch(drug.commercial, debouncedSearchTerm)}
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
                            className={`px-3 py-12 text-center
                              ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                            `}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search className="h-10 w-10 opacity-40" aria-hidden="true" />
                              <p className="font-medium">{t('noResults')}</p>
                              {hasActiveFilters && (
                                <p className="text-xs">
                                  {t('filtersMeta.noResultsHint')}{' '}
                                  <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="underline font-medium hover:text-sfro-primary"
                                  >
                                    {t('filtersMeta.noResultsAction')}
                                  </button>
                                  .
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend — color + glyph so the mapping survives on grayscale
                printers and for users with colour-vision deficiencies. */}
            <div
              className={`flex flex-wrap gap-4 text-sm mt-4 p-4 rounded-lg shadow-sm
                ${state.isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'}
              `}
              role="list"
              aria-label={t('legend.title') || 'Legend'}
            >
              <div className="flex items-center gap-2" role="listitem">
                <span
                  aria-hidden="true"
                  className={`inline-flex w-5 h-5 items-center justify-center rounded text-[11px] font-bold
                    ${state.isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}
                  `}
                >
                  ✓
                </span>
                <span>{t('legend.noDelay')}</span>
              </div>
              <div className="flex items-center gap-2" role="listitem">
                <span
                  aria-hidden="true"
                  className={`inline-flex w-5 h-5 items-center justify-center rounded text-[11px] font-bold
                    ${state.isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}
                  `}
                >
                  ⏱
                </span>
                <span>{t('legend.shortDelay')}</span>
              </div>
              <div className="flex items-center gap-2" role="listitem">
                <span
                  aria-hidden="true"
                  className={`inline-flex w-5 h-5 items-center justify-center rounded text-[11px] font-bold
                    ${state.isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}
                  `}
                >
                  !
                </span>
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
              <div className="flex flex-col items-center md:items-start gap-1">
                <div>
                  © {new Date().getFullYear()} SFRO - Société Française de Radiothérapie Oncologique
                </div>
                {dataLastUpdatedDisplay && (
                  <div className="text-xs opacity-80">
                    {t('footer.lastUpdated')} : {dataLastUpdatedDisplay}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6">
                <a href="mailto:contact@sfro.fr" className={`transition-colors flex items-center gap-2
                  ${state.isDarkMode ? 'hover:text-blue-400' : 'hover:text-sfro-primary'}
                `}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  contact
                </a>
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

        <AnimatePresence>
          {selectedDrugDetail && (
            <DrugDetailPopup
              drug={selectedDrugDetail}
              onClose={() => setSelectedDrugDetail(null)}
              onOpenReferences={(refs) => {
                setSelectedDrugDetail(null);
                setSelectedReferences(refs);
              }}
              isDarkMode={state.isDarkMode}
              t={t}
              translateDrugClass={translateDrugClass}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          <ColumnManagerModal
            show={showColumnManager}
            onClose={() => setShowColumnManager(false)}
            visibleColumns={state.visibleColumns}
            onChange={(column, value) =>
              actions.setVisibleColumns({ ...state.visibleColumns, [column]: value })
            }
            isDarkMode={state.isDarkMode}
            t={t}
            formatColumnName={formatColumnName}
          />
        </AnimatePresence>

        <AnimatePresence>
          <HelpModal
            show={showHelp}
            onClose={() => setShowHelp(false)}
            isDarkMode={state.isDarkMode}
            t={t}
            isMacPlatform={isMacPlatform}
          />
        </AnimatePresence>

        {/* Toast notifications (success/error feedback, auto-dismiss) */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              role="status"
              aria-live="polite"
              className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm
                ${toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
                }`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label={t('toast.dismiss')}
                className="opacity-80 hover:opacity-100"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FavoritesPanel>
    </ErrorBoundary>
  );
};

export default DrugExplorer;