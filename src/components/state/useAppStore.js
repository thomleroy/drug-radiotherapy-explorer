import { useMemo, useSyncExternalStore } from 'react';
import { INITIAL_VISIBLE_COLUMNS } from '../constants';

const STORAGE_KEY = 'drug-explorer-store';
const PERSISTED_KEYS = [
  'isDarkMode',
  'lang',
  'visibleColumns',
  'favorites',
  'recentSearches',
  'selectedCategory',
  'halfLifeFilter',
  'classFilter',
  'viewMode'
];

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getPreferredTheme = () => {
  if (!isBrowser) return false;
  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
  return Boolean(mediaQuery?.matches);
};

const getPreferredLanguage = () => {
  if (!isBrowser) return 'en';
  return navigator.language?.startsWith('fr') ? 'fr' : 'en';
};

const loadPersistedState = () => {
  if (!isBrowser) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const persistState = (state) => {
  if (!isBrowser) return;
  const toPersist = PERSISTED_KEYS.reduce((acc, key) => {
    acc[key] = state[key];
    return acc;
  }, {});
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {
    // Persistence is best-effort; ignore storage errors
  }
};

const createStore = (initialState) => {
  let state = initialState;
  const listeners = new Set();

  return {
    getState: () => state,
    setState: (updater) => {
      const newState = typeof updater === 'function' ? updater(state) : updater;
      state = { ...state, ...newState };
      persistState(state);
      listeners.forEach(listener => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
};

const useAppStore = (() => {
  const store = createStore({
    isDarkMode: getPreferredTheme(),
    lang: getPreferredLanguage(),
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
    recentSearches: [],
    ...loadPersistedState()
  });

  return () => {
    const state = useSyncExternalStore(store.subscribe, store.getState, () => store.getState());

    const actions = useMemo(() => ({
      setDarkMode: (isDark) => store.setState({ isDarkMode: isDark }),
      setLang: (lang) => store.setState({ lang }),
      setSearchTerm: (term) => {
        store.setState({ searchTerm: term });
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
      setFavorites: (favorites) => store.setState({ favorites }),
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

export default useAppStore;
