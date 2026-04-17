import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, Info, Settings, X, Mail } from 'lucide-react';
import { allDrugs } from '../data/drugCatalog';
import protocolsData from '../data/ctProtocols.json';

import { motion, AnimatePresence } from 'framer-motion';
import { escapeCsvField } from '../utils/security';
import { highlightMatch, formatDataDate, getCellColor } from '../utils/text';
import { translations } from './translations';
import { DATA_LAST_UPDATED } from '../buildMeta';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import FilterPanel from './FilterPanel';
import FavoritesPanel from './FavoritesPanel';
import useAppStore from './state/useAppStore';
import { CATEGORY_COLORS } from './constants';
import { useDebounce } from './explorer/hooks/useDebounce';
import { ErrorBoundary } from './explorer/modals/ErrorBoundary';
import { AboutPopup } from './explorer/modals/AboutPopup';
import { HelpModal } from './explorer/modals/HelpModal';
import { ColumnManagerModal } from './explorer/modals/ColumnManagerModal';
import { ReferencesPopup } from './explorer/modals/ReferencesPopup';
import { DrugCard } from './explorer/cards/DrugCard';
import { SearchSuggestions } from './explorer/search/SearchSuggestions';
import { Badge } from './explorer/ui/Badge';
import { LoadingFallback } from './explorer/ui/LoadingFallback';
import { ColumnHeaderWithTooltip } from './explorer/ui/ColumnHeaderWithTooltip';
import { ABOUT_CONTENT } from './explorer/content/aboutContent';


// Last-updated date for the footer (computed once at module load).
const dataLastUpdatedDisplay = formatDataDate(DATA_LAST_UPDATED);

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

  // Resolve a dotted i18n key against the active language, falling back to
  // English when a translation is missing, and finally returning the raw
  // key as a debugging aid for unknown identifiers.
  const t = useCallback((key) => {
    const segments = key.split('.');
    const lookup = (lang) => {
      let value = translations[lang];
      for (const seg of segments) {
        if (value && typeof value === 'object') {
          value = value[seg];
        } else {
          return undefined;
        }
      }
      return value;
    };
    const primary = lookup(state.lang);
    if (primary !== undefined) return primary;
    if (state.lang !== 'en') {
      const fallback = lookup('en');
      if (fallback !== undefined) return fallback;
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

  // Clicking a drug name opens the references dialog directly.
  // (We previously routed through an intermediate detail panel, but the
  // bibliography is what users actually want — the rest of the data is
  // already visible in the row.)
  const handleDrugClick = useCallback((drug) => {
    setSelectedReferences(drug.references || 'no-references');
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
      if (import.meta.env.DEV) {
        console.error('Error downloading CSV:', error);
      }
      setToast({ type: 'error', message: t('toast.csvError') });
    }
  }, [filteredAndSortedDrugs, selectedProtocol, protocolFilteredDrugs, t]);

  // Excel export using the SheetJS xlsx package. We dynamic-import the
  // library only when the user actually clicks the button so the ~90kb
  // payload is kept out of the initial bundle.
  //
  // We avoid XLSX.writeFile() on purpose: its internal `write_dl` helper
  // relies on global sniffing (_fs, IE_SaveFile, saveAs, URL.createObjectURL,
  // …) that Vite/Rolldown tree-shaking can narrow down in ways that silently
  // no-op the download. Instead we call XLSX.write() to get the raw bytes
  // and handle the Blob + anchor click ourselves — the same pattern the CSV
  // export uses, which is testable and environment-independent.
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

      // Generate the .xlsx bytes in memory — `type: 'array'` returns a
      // Uint8Array with no Node Buffer / fs dependency.
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `drug-radiotherapy-data-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToast({ type: 'success', message: t('toast.xlsxSuccess') });
    } catch (error) {
      if (import.meta.env.DEV) {
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
                title={t('footer.about')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-sfro-primary px-2 sm:px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <Info className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline text-sm font-medium">{t('footer.about')}</span>
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
                        isFavorite={state.favorites.includes(drug.id)}
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