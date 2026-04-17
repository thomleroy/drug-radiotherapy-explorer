// Single source of truth for all UI translations.
// Add a new key here, in BOTH languages, and use it via the t() helper
// in DrugExplorer.js.
//
// The drugClasses map (French only) is consumed by translateDrugClass()
// to localize the chemo/targeted-therapy class labels coming from the
// catalog data — it doesn't need an English mirror because the catalog
// is already in English.
export const translations = {
  en: {
    title: "Radiosync",
    subtitle: "Explore drug interactions with radiotherapy treatments",
    search: "Search by name, INN, or brand name...",
    tableHint: "Click on the drug name to display its associated references.",
    tableHintShort: "Click a drug name to see its references",
    noResults: "No drugs found matching your criteria",
    radiotherapyTiming: "Radiotherapy Timing",
    protocolsSearch: "Search by molecule or organ...",
    loading: "Loading protocols...",
    noProtocolResults: "No protocols found matching your criteria",
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
      title: "Legend",
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
    accessibility: {
      skipToContent: "Skip to main content"
    },
    protocol: {
      allOrgans: "All Organs",
      allMolecules: "All Molecules",
      organ: "Organ",
      condition: "Condition",
      molecule: "Molecule",
      route: "Route",
      modality: "Administration Modality",
      timing: "Start relative to RT",
      legendGroup: "Organ grouping"
    },
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
      contact: "Contact",
      legal: "Legal",
      lastUpdated: "Last updated"
    }
  },
  fr: {
    title: "Radiosync",
    subtitle: "Explorez les interactions des médicaments avec les traitements de radiothérapie",
    search: "Rechercher par nom, DCI ou nom commercial...",
    tableHint: "Cliquez sur le nom de la molécule pour afficher les références associées.",
    tableHintShort: "Cliquez sur un nom de molécule pour voir ses références",
    noResults: "Aucun médicament ne correspond à vos critères",
    radiotherapyTiming: "Planification de la Radiothérapie",
    protocolsSearch: "Rechercher par molécule ou organe...",
    loading: "Chargement des protocoles...",
    noProtocolResults: "Aucun protocole ne correspond à vos critères",
    categories: {
      all: "Toutes les Catégories",
      chemotherapy: "Chimiothérapie",
      endocrine: "Hormonothérapie",
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
      title: "Légende",
      noDelay: "Aucun délai requis",
      shortDelay: "Délai court (≤48h)",
      longDelay: "Délai long (jours)"
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
    accessibility: {
      skipToContent: "Passer au contenu principal"
    },
    protocol: {
      allOrgans: "Tous les organes",
      allMolecules: "Toutes les molécules",
      organ: "Organe",
      condition: "Condition",
      molecule: "Molécule",
      route: "Voie",
      modality: "Modalités d'administration",
      timing: "Début par rapport à la RT",
      legendGroup: "Groupement par organe"
    },
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
    footer: {
      about: "À propos",
      contact: "Contact",
      legal: "Mentions légales",
      lastUpdated: "Dernière mise à jour"
    },
    drugClasses: {
      // Topoisomerase inhibitors
      "Topoisomerases 1 inhibitors": "Inhibiteurs de la topoisomérase 1",
      "Topoisomerases 2 inhibitors": "Inhibiteurs de la topoisomérase 2",
      // Base analogues
      "Purine analogues": "Analogues des purines",
      "Pyrimidine analogues": "Analogues des pyrimidines",
      "Antifolates": "Antifolates",
      // Alkylating agents
      "Platinum based drugs": "Dérivés du platine",
      "Nitrogen mustards": "Moutardes azotées",
      "Nitrosea urea": "Nitroso-urées",
      "Alcaloid": "Alcaloides",
      "Various": "Divers",
      // Antimitotics
      "Taxanes": "Taxanes",
      "Halichondrins": "Halichondrines",
      "Vinca alkaloids": "Vinca-alcaloïdes",
      // Endocrine therapy
      "LH-RH agonists": "Agonistes de la LH-RH",
      "LH-RH antagonists": "Antagonistes de la LH-RH",
      "Anti-androgens receptor": "Anti-androgènes",
      "Cytochrome P450 C17 inhibitor": "Inhibiteur du cytochrome P450 C17",
      "Anti estrogens receptor": "Anti-œstrogènes",
      "Anti-aromatases": "Anti-aromatases",
      // Targeted therapies
      "Tyrosine kinase inhibitors": "Inhibiteurs de tyrosine kinase",
      "Tyrosine kinase inhibitors (ALK)": "Inhibiteurs de tyrosine kinase (ALK)",
      "Tyrosine kinase inhibitors (BCR-ABL)": "Inhibiteurs de tyrosine kinase (BCR-ABL)",
      "Tyrosine kinase inhibitors (BTK)": "Inhibiteurs de tyrosine kinase (BTK)",
      "Tyrosine kinase inhibitors (EGFR)": "Inhibiteurs de tyrosine kinase (EGFR)",
      "Tyrosine kinase inhibitors (FGFR)": "Inhibiteurs de tyrosine kinase (FGFR)",
      "Tyrosine kinase inhibitors (FGFR2)": "Inhibiteurs de tyrosine kinase (FGFR2)",
      "Tyrosine kinase inhibitors (FLT3)": "Inhibiteurs de tyrosine kinase (FLT3)",
      "Tyrosine kinase inhibitors (HER2)": "Inhibiteurs de tyrosine kinase (HER2)",
      "Tyrosine kinase inhibitors (JAK)": "Inhibiteurs de tyrosine kinase (JAK)",
      "Tyrosine kinase inhibitors (MEK)": "Inhibiteurs de tyrosine kinase (MEK)",
      "Tyrosine kinase inhibitors (MET)": "Inhibiteurs de tyrosine kinase (MET)",
      "Tyrosine kinase inhibitors (MET, RET, ROS1, VEGFR)": "Inhibiteurs de tyrosine kinase (MET, RET, ROS1, VEGFR)",
      "Tyrosine kinase inhibitors (RET fusion)": "Inhibiteurs de tyrosine kinase (fusion RET)",
      "Tyrosine kinase inhibitors (TRK)": "Inhibiteurs de tyrosine kinase (TRK)",
      "Tyrosine kinase inhibitors (VEGFR)": "Inhibiteurs de tyrosine kinase (VEGFR)",
      "Tyrosine kinase inhibitors (c-Kit, FGFR, PDGFR, VEGFR)": "Inhibiteurs de tyrosine kinase (c-Kit, FGFR, PDGFR, VEGFR)",
      "Tyrosine kinase inhibitors (c-Kit, FLT3, PDGFR, VEGFR)": "Inhibiteurs de tyrosine kinase (c-Kit, FLT3, PDGFR, VEGFR)",
      // Monoclonal antibodies
      "Monoclonal antibodies (CD20)": "Anticorps monoclonaux (CD20)",
      "Monoclonal antibodies (EGFR)": "Anticorps monoclonaux (EGFR)",
      "Monoclonal antibodies (VEGFR)": "Anticorps monoclonaux (VEGFR)",
      // Other targeted therapies
      "Bcl-2 inhibitors": "Inhibiteurs de Bcl-2",
      "BRAF inhibitors": "Inhibiteurs de BRAF",
      "PARP inhibitors": "Inhibiteurs de PARP",
      "Proteasome inhibitors": "Inhibiteurs du protéasome",
      "CDK4/6 inhibitors": "Inhibiteurs de CDK4/6",
      "KRAS G12C inhibitors": "Inhibiteurs de KRAS G12C",
      "SMO protein inhibitors": "Inhibiteurs de la protéine SMO",
      "PI3K inhibitors": "Inhibiteurs de PI3K",
      "PI3K inhibitors (CD38)": "Inhibiteurs de PI3K (CD38)",
      // Immunotherapy
      "Immunomodulators": "Immunomodulateurs",
      "Antibody-drug conjugates": "Anticorps conjugués",
      "Antibody-drug conjugates (CD30)": "Anticorps conjugués (CD30)",
      "Antibody-drug conjugates (HER2)": "Anticorps conjugués (HER2)",
      "Antibody-drug conjugates (Nectin 4)": "Anticorps conjugués (Nectine 4)",
      "Antibody-drug conjugates (TROP2)": "Anticorps conjugués (TROP2)",
      "PD1 inhibitors": "Inhibiteurs de PD1",
      "PDL1 inhibitors": "Inhibiteurs de PDL1",
      "CTLA4 inhibitors": "Inhibiteurs de CTLA4",
      "Recombinant fusion protein (VEGF)": "Protéine de fusion recombinante (VEGF)",
      // Misc
      "Unspecified": "Non spécifié",
      "BRAF inhibitors, HDAC inhibitors": "Inhibiteurs de BRAF et HDAC",
      "CDK4/6 inhibitors, IDH-1 inhibitors, IDH-2 inhibitors": "Inhibiteurs de CDK4/6, IDH-1 et IDH-2",
      "Proteasome inhibitors, PI3K inhibitors": "Inhibiteurs du protéasome et PI3K"
    }
  }
};
