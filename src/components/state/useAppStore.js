import { useEffect, useMemo, useState } from 'react';
import { INITIAL_VISIBLE_COLUMNS } from '../constants';

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
