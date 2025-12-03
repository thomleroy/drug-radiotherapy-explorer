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

// About content in both languages
const ABOUT_CONTENT = {
  fr: {
    title: "À propos de ce projet",
    content: `**Démarche et objectif de ce projet**

Ce site est le fruit d'un travail collaboratif mené sous l'égide de la **Société Française de Radiothérapie Oncologique (SFRO)**. Son objectif est d'évaluer et de synthétiser les interactions entre les **traitements systémiques en oncologie** (chimiothérapies, thérapies ciblées, immunothérapies, hormonothérapies) et la **radiothérapie, qu'elle soit curative ou palliative**, **normofractionnée ou hypofractionnée, quel que soit la technique** : radiothérapie conformationnelle en 3D **(RT3D),** radiothérapie avec modulation d'intensité **(RCMI/IMRT)** et radiothérapie stéréotaxique **(SBRT/SRS)**

La combinaison de la radiothérapie avec certains agents thérapeutiques peut potentialiser son effet, mais aussi en accroître la toxicité. Ce projet vise à fournir aux cliniciens une **synthèse claire et précise** des recommandations existantes, basée sur les données de la littérature et les avis d'experts. L'article complet en en ligne sur le site de la revue Cancer Radiothérapie sous l'égide de la **Société Française de Radiothérapie Oncologique (SFRO). (http://www.sfro.fr)**

**Construction et accessibilité**

L'ensemble des informations présentées ici a été rassemblé et analysé par un **groupe de travail**. Chaque molécule a été évaluée selon :

- **Sa demi-vie et son mécanisme d'action**
- **Son interaction avec la radiothérapie** (effet radiosensibilisant, toxicités accrues)
- **Les recommandations de poursuite ou d'arrêt**
- **Les types de radiothérapie concernés**
- **Les publications scientifiques et recommandations officielles**

Ce site est proposé en **anglais et en français en accès libre** afin de garantir une **diffusion large et accessible**. Ces recommandations sont rédigées selon les données acquises de la science, qui restent parfois limitées ou inexistantes pour certains médicaments. Elles n'engagent pas la responsabilité de leurs auteurs.

Vous pouvez suggérer **l'ajout d'une nouvelle molécule, un commentaire ou une nouvelle référence bibliographique utile** via la boîte de contact. Nous essayerons de **mettre à jour ce site régulièrement**.

**Les auteurs :**

- **Dr Chloé Buchalet** (Département d'oncologie radiothérapie, Institut du Cancer de Montpellier, Montpellier, France)
- **Dr Constance Golfier** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)
- **Dr Jean-Christophe Faivre** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)
- **Pr Christophe Hennequin** (Service de cancérologie-radiothérapie, Hôpital Saint-Louis, Paris, France)
- **Dr Thomas Leroy** (Département d'oncologie radiothérapie, Centre de Cancérologie des Dentellières, Valenciennes, France)
- **Dr Johann Marcel** (Département d'oncologie radiothérapie et curiethérapie, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France)`
  },
  en: {
    title: "About this Project",
    content: `**Approach and Objective of this Project**

This site is the result of a collaborative effort led under the aegis of the **French Society of radiation Oncology (Société Française de Radiothérapie Oncologique (SFRO))**. Its objective is to evaluate and synthesize the interactions between systemic oncology treatments (chemotherapy, targeted therapies, immunotherapies, hormone therapies) and radiotherapy, whether curative or palliative, normofractionated or hypofractionated, regardless of the technique used: **3D conformal radiotherapy (3D-CRT), intensity-modulated radiotherapy (IMRT), and stereotactic radiotherapy (SBRT/SRS)**.

The combination of radiotherapy with certain therapeutic agents can enhance its effect but also increase toxicity. This project aims to provide clinicians with a **clear and precise synthesis** of existing recommendations, based on literature data and expert opinions. The full article is available online on the *Cancer Radiothérapie* journal website, under the auspices of the **Société Française de Radiothérapie Oncologique (SFRO)**. **(http://www.sfro.fr)**

**Development and Accessibility**

The information presented on this site has been collected and analyzed by a dedicated working group. Each molecule has been evaluated based on:

- **Its half-life and mechanism of action**
- **Its interaction with radiotherapy** (radiosensitizing effect, increased toxicity)
- **Recommendations for continuation or discontinuation**
- **Types of radiotherapy concerned**
- **Scientific publications and official recommendations**

This site is available in **English and French, free of charge**, to ensure broad and easy access. The recommendations are based on currently available scientific data, which may be limited or even nonexistent for certain medications. These recommendations **do not engage the responsibility of their authors**.

You can suggest the **addition of a new drug, a comment, or a relevant bibliographic reference** via the contact form. We will strive to update this site regularly.

**Authors:**

- **Dr. Chloé Buchalet** (*Department of Radiation Oncology, Institut du Cancer de Montpellier, Montpellier, France*)
- **Dr. Constance Golfier** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)
- **Dr. Jean-Christophe Faivre** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)
- **Prof. Christophe Hennequin** (*Department of Oncology-Radiotherapy, Hôpital Saint-Louis, Paris, France*)
- **Dr. Thomas Leroy** (*Department of Radiation Oncology, Centre de Cancérologie des Dentellières, Valenciennes, France*)
- **Dr. Johann Marcel** (*Department of Radiation Oncology and Brachytherapy, Institut de Cancérologie de Lorraine, Vandœuvre-Lès-Nancy, France*)`
  }
};

// Default translations if missing from the translations file
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
      protocolsExplorer: "RT-CT Protocols"
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
    noProtocolResults: "No protocols found matching your criteria"
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
      protocolsExplorer: "Protocoles de RT-CT"
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
    noProtocolResults: "Aucun protocole ne correspond à vos critères"
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
  const [showAbout, setShowAbout] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(INITIAL_VISIBLE_COLUMNS);
  const [viewMode, setViewMode] = useState('drugs'); // 'drugs' or 'protocols'
  const [protocolsData, setProtocolsData] = useState([]);
  const [organsData, setOrgansData] = useState([]);
  const [moleculesData, setMoleculesData] = useState([]);
  const [isLoadingProtocols, setIsLoadingProtocols] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedOrgan, setSelectedOrgan] = useState('all');
  const [selectedMolecule, setSelectedMolecule] = useState('all');
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

  const ColumnHeaderWithTooltip = useCallback(({ title, longTitle }) => (
    <div className="relative group">
      <span>{title}</span>
      <div className="invisible group-hover:visible absolute z-50 -left-2 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap">
        {longTitle}
      </div>
    </div>
  ), []);

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
  
  // Effet pour charger automatiquement les protocoles quand on est en mode Protocoles
  useEffect(() => {
    if (viewMode === 'protocols' && protocolsData.length === 0 && !isLoadingProtocols) {
      loadProtocols();
    }
  }, [viewMode, protocolsData.length, isLoadingProtocols]);

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
      
      // Recherche dans tous les champs pertinents : nom, DCI, nom commercial et classe
      const matchesSearch = (drug.name && drug.name.toLowerCase().includes(searchLower)) || 
                          (drug.dci && drug.dci.toLowerCase().includes(searchLower)) ||
                          (drug.commercial && drug.commercial.toLowerCase().includes(searchLower)) ||
                          (drug.class && drug.class.toLowerCase().includes(searchLower));
      
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

  // Filtrer et trier les protocoles de radiothérapie
  const filteredAndSortedProtocols = useMemo(() => {
    if (protocolsData.length === 0) return [];
    
    let filteredProtocols = protocolsData.filter(protocol => {
      const searchLower = searchTerm.toLowerCase();
      
      // Recherche dans tous les champs pertinents
      const matchesSearch = 
        (protocol.condition && protocol.condition.toLowerCase().includes(searchLower)) || 
        (protocol.molecule && protocol.molecule.toLowerCase().includes(searchLower)) ||
        (protocol.organ && protocol.organ.toLowerCase().includes(searchLower)) ||
        (protocol.route && protocol.route.toLowerCase().includes(searchLower)) ||
        (protocol.modalityAdministration && protocol.modalityAdministration.toLowerCase().includes(searchLower));
      
      const matchesOrgan = selectedOrgan === 'all' || protocol.organ === selectedOrgan;
      const matchesMolecule = selectedMolecule === 'all' || protocol.molecule === selectedMolecule;
      
      return matchesSearch && matchesOrgan && matchesMolecule;
    });
    
    if (sortConfig.key) {
      filteredProtocols.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredProtocols;
  }, [protocolsData, searchTerm, selectedOrgan, selectedMolecule, sortConfig]);

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
  
// Modification de la fonction loadProtocols avec plus de logging et de gestion d'erreurs

const loadProtocols = useCallback(() => {
    // Ne pas recharger si déjà chargé
    if (protocolsData.length > 0) return;
    
    // Simuler un chargement
    setIsLoadingProtocols(true);
    
    try {
      // Utiliser les données statiques
      const protocols = protocolsStaticData;
      const { organsList, moleculesList } = extractUniqueData(protocols);
      
      // Mettre à jour les états
      setProtocolsData(protocols);
      setOrgansData(organsList);
      setMoleculesData(moleculesList);
      
    } catch (error) {
      console.error("Erreur lors du chargement des protocoles:", error);
    } finally {
      // Simuler la fin du chargement
      setIsLoadingProtocols(false);
    }
  }, [protocolsData.length, setProtocolsData, setOrgansData, setMoleculesData, setIsLoadingProtocols]);

  // Format CSV data for export
  const formatForCSV = useCallback((data) => {
    if (viewMode === 'drugs') {
      const header = "Drug Name,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
      const rows = data.map(drug => 
        `${drug.name},${drug.class},${drug.category},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
      ).join('\n');
      return header + rows;
    } else {
      const header = "Organe,Condition,Molécule,Voie,Modalités d'administration,Début par rapport à la radiothérapie\n";
      const rows = data.map(protocol => 
        `"${protocol.organ}","${protocol.condition}","${protocol.molecule}","${protocol.route}","${protocol.modalityAdministration}","${protocol.timing}"`
      ).join('\n');
      return header + rows;
    }
  }, [viewMode]);

  // CSV download handler
  const downloadCSV = useCallback(() => {
    try {
      const data = viewMode === 'drugs' ? filteredAndSortedDrugs : filteredAndSortedProtocols;
      const csv = formatForCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = viewMode === 'drugs' 
        ? `drug-radiotherapy-data-${new Date().toISOString().split('T')[0]}.csv`
        : `protocoles-radiochimiotherapie-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }, [viewMode, filteredAndSortedDrugs, filteredAndSortedProtocols, formatForCSV]);

  // Handle sorting
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

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
initial={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {children}
    </motion.span>
  ), []);

  // Handle drug name click to show references or no references message
  const handleDrugClick = useCallback((drug) => {
    if (drug.references) {
      setSelectedReferences(drug.references);
    } else {
      // Show "No references available" message
      setSelectedReferences("no-references");
    }
  }, []);

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
          <h3 className="text-lg font-semibold text-sfro-dark cursor-pointer hover:text-blue-600 hover:underline" onClick={() => handleDrugClick(drug)}>
            {drug.name}
          </h3>
          <Badge color={CATEGORY_COLORS[drug.category] || 'bg-gray-50 text-gray-800 border-gray-200'}>
            {t(`categories.${drug.category}`) || drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">{t('columns.commercial')}:</span>
            <span className="text-gray-900">{drug.commercial}</span>
          </div>

          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">{t('columns.administration')}:</span>
            <span className="text-gray-900">{drug.administration}</span>
          </div>

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
        </div>
      </div>
    </motion.div>
  ), [Badge, Tooltip, handleDrugClick, t, translateDrugClass]);

  // About Popup component
const AboutPopup = useCallback(({ show, onClose }) => {
  if (!show) return null;

  const aboutData = ABOUT_CONTENT[lang];
  
  // Function to render markdown-like text
  const renderContent = (content) => {
    return content.split('\n').map((line, index) => {
      // Handle headers (lines starting with **)
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        const headerText = line.slice(2, -2);
        return (
          <h3 key={index} className="text-lg font-bold text-sfro-dark mt-6 mb-3">
            {headerText}
          </h3>
        );
      }
      
      // Handle bullet points
      if (line.startsWith('• ')) {
        const bulletContent = line.slice(2);
        // Handle bold text within bullets
        const parts = bulletContent.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={index} className="ml-4 mb-2 text-gray-700">
            {parts.map((part, partIndex) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={partIndex} className="text-sfro-dark">{part.slice(2, -2)}</strong>
                : part
            )}
          </li>
        );
      }
      
      // Handle regular paragraphs
      if (line.trim()) {
        // Handle bold text in paragraphs
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {parts.map((part, partIndex) => 
              part.startsWith('**') && part.endsWith('**') 
                ? <strong key={partIndex} className="text-sfro-dark">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      }
      
      // Empty lines
      return <div key={index} className="mb-2"></div>;
    });
  };

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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-sfro-dark">{aboutData.title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-6">
          <div className="prose max-w-none">
            {renderContent(aboutData.content)}
          </div>
        </div>
      </motion.div>
    </div>
  );
}, [lang]);

  // References Popup component - extracted for better readability
  const ReferencesPopup = useCallback(({ references, onClose }) => {
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
            className="bg-white p-6 rounded-lg max-w-md m-4"
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
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">{t('references.noReferences')}</p>
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
          placeholder={viewMode === 'drugs' ? t('search') : (t('protocolsSearch') || "Rechercher par molécule ou organe...")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        {viewMode === 'drugs' ? (
          // Filtres pour médicaments
          <>
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
              {uniqueDrugClasses.map(drugClass => (
                <option key={drugClass} value={drugClass}>
                  {translateDrugClass(drugClass)}
                </option>
              ))}
            </select>
          </>
        ) : (
          // Filtres pour protocoles
          <>
            <select
              value={selectedOrgan}
              onChange={(e) => setSelectedOrgan(e.target.value)}
              className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
            >
              <option value="all">{t('protocol.allOrgans') || "Tous les organes"}</option>
              {organsData.map(organ => (
                <option key={organ} value={organ}>
                  {organ}
                </option>
              ))}
            </select>

            <select
              value={selectedMolecule}
              onChange={(e) => setSelectedMolecule(e.target.value)}
              className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
            >
              <option value="all">{t('protocol.allMolecules') || "Toutes les molécules"}</option>
              {moleculesData.map(molecule => (
                <option key={molecule} value={molecule}>
                  {molecule}
                </option>
              ))}
            </select>
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-sfro-primary text-white rounded-lg hover:bg-sfro-secondary transition-colors"
        >
          {t('buttons.applyFilters') || 'Apply Filters'}
        </button>
      </div>
    </motion.div>
  ), [t, viewMode, searchTerm, selectedCategory, halfLifeFilter, classFilter, uniqueDrugClasses, 
      translateDrugClass, organsData, moleculesData, selectedOrgan, selectedMolecule]);
      
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
          {/* Language toggle and About button */}
<div className="absolute top-4 right-4 z-20 flex items-center gap-2">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowAbout(true)}
    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-sfro-primary px-3 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
  >
    <Info className="h-4 w-4" />
    <span className="text-sm font-medium">{t('footer.about')}</span>
  </motion.button>
  <LanguageToggle lang={lang} setLang={setLang} />
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
             {/* Logos */}
                <div className="flex-shrink-0 flex gap-4">
                  {/* Original Logo */}
                  <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <img 
                      src="/sfro-logo.png" 
                      alt="SFRO Logo" 
                      className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto"
                    />
                  </div>
                  
                  {/* New SFjRO Logo */}
                  <div className="bg-white/95 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <img 
                      src="/sfjro-logo.jpg" 
                      alt="SFjRO Logo" 
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
            {viewMode === 'drugs' ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('protocolsSearch') || "Rechercher par molécule ou organe..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 w-full border-2 border-gray-200 hover:border-sfro-primary focus:border-sfro-primary focus:ring-2 focus:ring-sfro-light transition-colors rounded-lg"
                  />
                </div>

                {/* Organ filter */}
                <select
                  value={selectedOrgan}
                  onChange={(e) => setSelectedOrgan(e.target.value)}
                  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
                >
                  <option value="all">{t('protocol.allOrgans') || "Tous les organes"}</option>
                  {organsData.map(organ => (
                    <option key={organ} value={organ}>
                      {organ}
                    </option>
                  ))}
                </select>

                {/* Molecule filter */}
                <select
                  value={selectedMolecule}
                  onChange={(e) => setSelectedMolecule(e.target.value)}
                  className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
                >
                  <option value="all">{t('protocol.allMolecules') || "Toutes les molécules"}</option>
                  {moleculesData.map(molecule => (
                    <option key={molecule} value={molecule}>
                      {molecule}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* View Toggle and Action buttons */}
          <div className={`flex ${isMobileView ? 'justify-center' : 'justify-between'} gap-4 flex-wrap`}>
            {/* View Toggle */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode('drugs')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  viewMode === 'drugs' 
                    ? 'bg-sfro-primary text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('buttons.drugExplorer') || "Médicaments"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  loadProtocols();
                  setViewMode('protocols');
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  viewMode === 'protocols' 
                    ? 'bg-sfro-primary text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('buttons.protocolsExplorer') || "Protocoles de radiochimiothérapie"}
                {isLoadingProtocols && (
                  <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                )}
              </motion.button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Column manager button (desktop only) */}
              {!isMobileView && viewMode === 'drugs' && (
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
          </div>

          {/* Mobile/Desktop view toggle */}
          <AnimatePresence mode="wait">
            {viewMode === 'drugs' ? (
              // Vue pour les médicaments
              isMobileView ? (
                /* Mobile view - card list */
                <motion.div 
                  key="mobile-view-drugs"
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
                  key="desktop-view-drugs"
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
                  <table className="w-full border-collapse bg-white min-w-[1200px]">
                    <thead className={`sticky top-0 bg-sfro-light z-10 ${isTableScrolled ? 'shadow-md' : ''}`}>
                      <tr>
                        {visibleColumns.name && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[160px] w-[20%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.name')} 
                              longTitle={t('columns.name')}
                            />
                          </th>
                        )}
                        {visibleColumns.commercial && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[120px] w-[15%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.commercial')} 
                              longTitle={t('columns.commercial')}
                            />
                          </th>
                        )}
                        {visibleColumns.administration && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[80px] w-[8%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.administration_short') || "Admin"} 
                              longTitle={t('columns.administration')}
                            />
                          </th>
                        )}
                        {visibleColumns.class && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[120px] w-[15%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.class')} 
                              longTitle={t('columns.class')}
                            />
                          </th>
                        )}
                        {visibleColumns.category && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[80px] w-[8%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.category_short') || "Cat"} 
                              longTitle={t('columns.category')}
                            />
                          </th>
                        )}
                        {visibleColumns.halfLife && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[80px] w-[8%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.halfLife_short') || "Half-life"} 
                              longTitle={t('columns.halfLife')}
                            />
                          </th>
                        )}
                        {visibleColumns.normofractionatedRT && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[90px] w-[9%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.normofractionatedRT_short') || "Norm RT"} 
                              longTitle={t('columns.normofractionatedRT')}
                            />
                          </th>
                        )}
                        {visibleColumns.palliativeRT && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[90px] w-[9%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.palliativeRT_short') || "Pall RT"} 
                              longTitle={t('columns.palliativeRT')}
                            />
                          </th>
                        )}
                        {visibleColumns.stereotacticRT && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[90px] w-[9%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.stereotacticRT_short') || "Stereo RT"} 
                              longTitle={t('columns.stereotacticRT')}
                            />
                          </th>
                        )}
                        {visibleColumns.intracranialRT && (
                          <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark min-w-[90px] w-[9%]">
                            <ColumnHeaderWithTooltip 
                              title={t('columns.intracranialRT_short') || "IC RT"} 
                              longTitle={t('columns.intracranialRT')}
                            />
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
                                  onClick={() => handleDrugClick(drug)}
                                  className="text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                  {drug.name}
                                </button>
                              </td>
                            )}
                            {visibleColumns.commercial && (
                              <td className="px-3 py-2 whitespace-normal text-gray-500">
                                {drug.commercial}
                              </td>
                            )}
                            {visibleColumns.administration && (
                              <td className="px-3 py-2 whitespace-normal text-gray-500">
                                {drug.administration}
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
                              <td className={`px-3 py-2 whitespace-pre-wrap text-xs break-words max-w-[150px] ${getCellColor(drug.normofractionatedRT)}`}>
                                {drug.normofractionatedRT}
                              </td>
                            )}
                            {visibleColumns.palliativeRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.palliativeRT)}`}>
                                {drug.palliativeRT}
                              </td>
                            )}
                            {visibleColumns.stereotacticRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.stereotacticRT)}`}>
                                {drug.stereotacticRT}
                              </td>
                            )}
                            {visibleColumns.intracranialRT && (
                              <td className={`px-3 py-2 whitespace-normal break-words max-w-[150px] ${getCellColor(drug.intracranialRT)}`}>
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
              )
            ) : (
  <motion.div 
    key="protocols-view"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg shadow-lg"
    onScroll={handleTableScroll}
  >
    {isLoadingProtocols ? (
      <div className="flex justify-center items-center p-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sfro-primary border-r-transparent"></div>
        <span className="ml-4 text-gray-600">{t('loading') || "Chargement des protocoles..."}</span>
      </div>
    ) : (
      <table className="w-full border-collapse bg-white min-w-[1200px]">
      <thead className={`sticky top-0 z-10 ${isTableScrolled ? 'shadow-md' : ''}`}>
        <tr className="bg-sfro-light">
          {[
            { key: 'organ', label: t('protocol.organ') || "Organe" },
            { key: 'condition', label: t('protocol.condition') || "Condition" },
            { key: 'molecule', label: t('protocol.molecule') || "Molécule" },
            { key: 'route', label: t('protocol.route') || "Voie" },
            { key: 'modalityAdministration', label: t('protocol.modality') || "Modalités d'administration" },
            { key: 'timing', label: t('protocol.timing') || "Début par rapport à la RT" }
          ].map((column) => (
            <th 
              key={column.key}
              className="px-4 py-3 text-left text-xs font-bold text-sfro-dark uppercase tracking-wider 
                         border-b-2 border-sfro-primary hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => requestSort(column.key)}
            >
              <div className="flex items-center justify-between">
                {column.label}
                {sortConfig.key === column.key && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {filteredAndSortedProtocols.length > 0 ? (
          filteredAndSortedProtocols.map((protocol, index) => {
            // Vérifier si c'est un nouveau groupe d'organe
            const isNewOrgan = index === 0 || protocol.organ !== filteredAndSortedProtocols[index - 1].organ;
            const isNewCondition = isNewOrgan || protocol.condition !== filteredAndSortedProtocols[index - 1].condition;
            
            return (
              <motion.tr 
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  hover:bg-gray-50 transition-colors duration-150 ease-in-out text-xs
                  ${isNewOrgan ? 'border-t-2 border-t-sfro-primary' : ''}
                `}
              >
                {/* Colonne Organe */}
                <td className={`px-4 py-3 whitespace-normal font-medium 
                  ${isNewOrgan ? 'text-sfro-primary font-bold' : 'text-gray-500'}`}>
                  {isNewOrgan ? protocol.organ : ''}
                </td>

                {/* Colonne Condition */}
                <td className={`px-4 py-3 whitespace-normal 
                  ${isNewCondition ? 'text-sfro-dark font-semibold' : 'text-gray-400'}`}>
                  {isNewCondition ? protocol.condition : ''}
                </td>

                {/* Autres colonnes */}
                <td className="px-4 py-3 whitespace-normal text-gray-800 font-medium">
                  <Tooltip content={protocol.molecule}>
                    <span className="truncate max-w-[200px] inline-block">
                      {protocol.molecule}
                    </span>
                  </Tooltip>
                </td>

                <td className="px-4 py-3 whitespace-normal text-gray-600">
                  <Badge color="bg-blue-50 text-blue-800 border-blue-200">
                    {protocol.route}
                  </Badge>
                </td>

                <td className="px-4 py-3 whitespace-normal text-gray-700">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-100 rounded-md p-2 text-xs"
                  >
                    {protocol.modalityAdministration}
                  </motion.div>
                </td>

                <td className="px-4 py-3 whitespace-normal text-gray-600">
                  <motion.span
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-green-50 text-green-800 rounded-full px-3 py-1 text-xs"
                  >
                    {protocol.timing}
                  </motion.span>
                </td>
              </motion.tr>
            );
          })
        ) : (
          <tr>
            <td 
              colSpan={6} 
              className="px-4 py-12 text-center text-gray-500 text-lg"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Info className="h-12 w-12 text-sfro-primary opacity-50" />
                <p>{t('noProtocolResults') || "Aucun protocole ne correspond à vos critères"}</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
        </table>
    )}
  </motion.div>
)}
 </AnimatePresence>

{/* Légende des protocoles */}
{protocolsData.length > 0 && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4 bg-gray-50 p-4 rounded-lg shadow-sm"
  >
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-sfro-primary rounded-full"></div>
      <span>{t('protocol.legendGroup') || "Groupement par organe"}</span>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-4 h-4 bg-sfro-dark rounded-full"></div>
      <span>{t('protocol.legendCondition') || "Conditions spécifiques"}</span>
    </div>
  </motion.div>
)}

      
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
                <a href="#" className="hover:text-sfro-primary transition-colors">{t('footer.legal')}</a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* About Popup */}
<AnimatePresence>
  {showAbout && (
    <AboutPopup 
      show={showAbout}
      onClose={() => setShowAbout(false)}
    />
  )}
</AnimatePresence>


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