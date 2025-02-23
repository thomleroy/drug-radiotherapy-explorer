export const translations = {
  en: {
    title: "Radiosync",
    subtitle: "A web-app to know when and how long to stop anticancer therapies before radiotherapy",
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
      short: "Short (≤24h)",
      long: "Long (>24h)"
    },
    drugClass: {
      all: "All Classes"
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
      exportCSV: "Export to CSV",
      close: "Close",
      done: "Done"
    },
    legend: {
      title: "Legend",
      noDelay: "No delay required (0)",
      shortDelay: "48h delay",
      longDelay: "Multiple days delay"
    },
    columnManager: {
      title: "Visible Columns"
    },
    footer: {
      about: "About",
      contact: "Contact",
      legal: "Legal Notice"
    }
  },
  fr: {
    title: "Radiosync",
    subtitle: "Une application web pour savoir quand et combien de temps arrêter les thérapies anticancéreuses avant la radiothérapie",
    search: "Rechercher des médicaments...",
    categories: {
      all: "Toutes les catégories",
      chemotherapy: "Chimiothérapie",
      endocrine: "Thérapie endocrine",
      targeted: "Thérapie ciblée",
      immunotherapy: "Immunothérapie"
    },
    halfLife: {
      all: "Toutes les demi-vies",
      short: "Courte (≤24h)",
      long: "Longue (>24h)"
    },
    drugClass: {
      all: "Toutes les classes"
    },
    columns: {
      name: "Nom du médicament",
      class: "Classe",
      category: "Catégorie",
      halfLife: "Demi-vie",
      normofractionatedRT: "RT normofractionnée",
      palliativeRT: "RT palliative",
      stereotacticRT: "RT stéréotaxique",
      intracranialRT: "RT intracrânienne"
    },
    buttons: {
      manageColumns: "Gérer les colonnes",
      exportCSV: "Exporter en CSV",
      close: "Fermer",
      done: "Terminé"
    },
    legend: {
      title: "Légende",
      noDelay: "Pas de délai requis (0)",
      shortDelay: "Délai de 48h",
      longDelay: "Délai de plusieurs jours"
    },
    columnManager: {
      title: "Colonnes visibles"
    },
    footer: {
      about: "À propos",
      contact: "Contact",
      legal: "Mentions légales"
    },
    drugClasses: {
    // Inhibiteurs de la topoisomérase
    "Topoisomerases 1 inhibitors": "Inhibiteurs de la topoisomérase 1",
    "Topoisomerases 2 inhibitors": "Inhibiteurs de la topoisomérase 2",
    
    // Analogues de bases
    "Purine analogues": "Analogues des purines",
    "Pyrimidine analogues": "Analogues des pyrimidines",
    "Antifolates": "Antifolates",
    
    // Agents alkylants
    "Platinum based drugs": "Dérivés du platine",
    "Nitrogen mustards": "Moutardes azotées",
    "Nitrosea urea": "Nitroso-urées",
    "Alcaloid": "Alcaloides",
    "Various": "Divers",
    
    // Antimitotiques
    "Taxanes": "Taxanes",
    "Halichondrins": "Halichondrines",
    "Vinca alkaloids": "Vinca-alcaloïdes",

    // Thérapie endocrine
    "LH-RH agonists": "Agonistes de la LH-RH",
    "LH-RH antagonists": "Antagonistes de la LH-RH",
    "Anti-androgens receptor": "Anti-androgènes",
    "Cytochrome P450 C17 inhibitor": "Inhibiteur du cytochrome P450 C17",
    "Anti estrogens receptor": "Anti-œstrogènes",
    "Anti-aromatases": "Anti-aromatases",

    // Thérapies ciblées
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

    // Anticorps monoclonaux
    "Monoclonal antibodies (CD20)": "Anticorps monoclonaux (CD20)",
    "Monoclonal antibodies (EGFR)": "Anticorps monoclonaux (EGFR)",
    "Monoclonal antibodies (VEGFR)": "Anticorps monoclonaux (VEGFR)",
    
    // Autres thérapies ciblées
    "Bcl-2 inhibitors": "Inhibiteurs de Bcl-2",
    "BRAF inhibitors": "Inhibiteurs de BRAF",
    "PARP inhibitors": "Inhibiteurs de PARP",
    "Proteasome inhibitors": "Inhibiteurs du protéasome",
    "CDK4/6 inhibitors": "Inhibiteurs de CDK4/6",
    "KRAS G12C inhibitors": "Inhibiteurs de KRAS G12C",
    "SMO protein inhibitors": "Inhibiteurs de la protéine SMO",
    "PI3K inhibitors": "Inhibiteurs de PI3K",
    "PI3K inhibitors (CD38)": "Inhibiteurs de PI3K (CD38)",

    // Immunothérapie
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
    
    // Divers
    "Unspecified": "Non spécifié",
    "BRAF inhibitors, HDAC inhibitors": "Inhibiteurs de BRAF et HDAC",
    "CDK4/6 inhibitors, IDH-1 inhibitors, IDH-2 inhibitors": "Inhibiteurs de CDK4/6, IDH-1 et IDH-2",
    "Proteasome inhibitors, PI3K inhibitors": "Inhibiteurs du protéasome et PI3K"
},
categories: {
    all: "Toutes les catégories",
    chemotherapy: "Chimiothérapie",
    endocrine: "Hormonothérapie",
    targeted: "Thérapie ciblée",
    immunotherapy: "Immunothérapie"
  }
  }
};