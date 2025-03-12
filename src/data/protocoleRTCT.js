// Protocoles de Radiothérapie et Chimiothérapie (RTCT)
export const protocolsStaticData = [
  // Neurologie
  {
    organ: 'Neurologie',
    condition: 'Glioblastome',
    molecule: 'Témozolomide',
    route: 'Per Os',
    modalityAdministration: 'Traitement continu J1/7 jours le matin',
    timing: 'Pendant RT'
  },

  // ORL
  {
    organ: 'ORL',
    condition: 'Cancer ORL',
    molecule: 'Cisplatine (CDDP)',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43 toutes les 3 semaines',
    timing: 'J1'
  },
  {
    organ: 'ORL',
    condition: 'Cancer ORL',
    molecule: 'Cetuximab (ERBITUX)',
    route: 'IV',
    modalityAdministration: 'Hebdomadaire, 8 injections au total',
    timing: '8 jours avant RT'
  },
  {
    organ: 'ORL',
    condition: 'Cancer ORL',
    molecule: 'Cisplatine (CDDP) hebdomadaire',
    route: 'IV',
    modalityAdministration: 'Hebdomadaire',
    timing: 'J1 J8 J15 J22 J43 J50 J57'
  },
  {
    organ: 'ORL',
    condition: 'Cancer ORL',
    molecule: 'Carboplatine',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },

  // Protocoles spécifiques
  {
    organ: 'ORL',
    condition: 'Protocole SANTAL',
    molecule: 'Cisplatine (CDDP)',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },
  {
    organ: 'ORL',
    condition: 'Protocole NIVO POST OP',
    molecule: 'Cisplatine (CDDP)',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },
  {
    organ: 'ORL',
    condition: 'Protocole NIVO POST OP',
    molecule: 'Nivolumab (OPDIVO)',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: '14 jours avant RT-CT'
  },
  {
    organ: 'ORL',
    condition: 'Protocole DEBIO TRILYNX',
    molecule: 'Cisplatine (CDDP)',
    route: 'IV / Per os',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },

  // Digestif - Œsophage
  {
    organ: 'Œsophage',
    condition: 'Cancer de l\'œsophage',
    molecule: 'FOLFOX (Oxaliplatine - Leucovorine - 5FU)',
    route: 'IV',
    modalityAdministration: 'J1, 5FU J2 à J4 perfusion continue',
    timing: 'Tous les 14 jours'
  },
  {
    organ: 'Œsophage',
    condition: 'Cancer de l\'œsophage',
    molecule: 'Cisplatine (CDDP) - 5FU',
    route: 'IV',
    modalityAdministration: 'Cisplatine J1, 5FU J1 à J5 perfusion continue',
    timing: '1ère et 5ème semaine'
  },
  {
    organ: 'Œsophage',
    condition: 'Cancer de l\'œsophage',
    molecule: 'Carboplatine - Paclitaxel (TAXOL)',
    route: 'IV',
    modalityAdministration: 'Hebdomadaire',
    timing: 'J1 pré-opératoire'
  },

  // Digestif - Estomac
  {
    organ: 'Estomac',
    condition: 'Cancer de l\'estomac',
    molecule: 'LV5FU2',
    route: 'IV',
    modalityAdministration: 'J1 à J4 et 3 derniers jours de RT',
    timing: 'J1'
  },
  {
    organ: 'Estomac',
    condition: 'Cancer de l\'estomac',
    molecule: 'Capécitabine (XELODA)',
    route: 'Per Os',
    modalityAdministration: 'Traitement continu J1/7 jours matin et soir',
    timing: 'J1'
  },

  // Digestif - Rectum
  {
    organ: 'Rectum',
    condition: 'Cancer du rectum',
    molecule: 'Capécitabine (XELODA)',
    route: 'Per Os',
    modalityAdministration: 'Traitement continu uniquement les jours d\'irradiation',
    timing: 'J1/7 jours matin et soir'
  },

  // Digestif - Canal anal
  {
    organ: 'Canal anal',
    condition: 'Cancer du canal anal',
    molecule: 'Mitomycine - 5FU',
    route: 'IV',
    modalityAdministration: 'Mitomycine J1, 5FU J1 à J5 perfusion continue',
    timing: '2 cures à J1 et J29'
  },
  {
    organ: 'Canal anal',
    condition: 'Cancer du canal anal',
    molecule: 'Mitomycine - Capécitabine (XELODA)',
    route: 'IV/Per Os',
    modalityAdministration: 'Mitomycine J1, XELODA per os matin et soir',
    timing: 'Jours d\'irradiation'
  },

  // Gynécologie - Col utérin
  {
    organ: 'Col utérin',
    condition: 'Cancer du col utérin',
    molecule: 'Cisplatine (CDDP) hebdomadaire',
    route: 'IV',
    modalityAdministration: 'Hebdomadaire',
    timing: 'J1'
  },
  {
    organ: 'Col utérin',
    condition: 'Protocole COLIBRI',
    molecule: 'Nivolumab (OPDIVO) - Ipilimumab (YERVOY) - Cisplatine',
    route: 'IV',
    modalityAdministration: 'Combinaison de traitements',
    timing: 'J-30, J-15 avant RT'
  },
  {
    organ: 'Col utérin, endomètre, vulve',
    condition: 'Cancer gynécologique',
    molecule: 'Cisplatine (CDDP) - 5FU',
    route: 'IV',
    modalityAdministration: 'Cisplatine J1, 5FU J1 à J5 perfusion continue',
    timing: 'Tous les 21 jours'
  },

  // Vessie
  {
    organ: 'Vessie',
    condition: 'Cancer de la vessie',
    molecule: 'Cisplatine (CDDP)',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },
  {
    organ: 'Vessie',
    condition: 'Cancer de la vessie',
    molecule: 'Carboplatine',
    route: 'IV',
    modalityAdministration: 'J1 J22 J43',
    timing: 'J1'
  },

  // Poumon - CBNPC
  {
    organ: 'Poumon',
    condition: 'CBNPC non à petites cellules',
    molecule: 'Carboplatine - Paclitaxel (TAXOL)',
    route: 'IV',
    modalityAdministration: 'Hebdomadaire',
    timing: 'Dès que possible'
  },
  {
    organ: 'Poumon',
    condition: 'CBNPC non à petites cellules',
    molecule: 'Cisplatine (CDDP) - Vinorelbine (NAVELBINE)',
    route: 'IV',
    modalityAdministration: 'Cisplatine J1, Navelbine J1 J8',
    timing: 'Dès que possible'
  },
  {
    organ: 'Poumon',
    condition: 'CBNPC non à petites cellules',
    molecule: 'Cisplatine (CDDP) - Étoposide (VP16)',
    route: 'IV',
    modalityAdministration: 'Cisplatine J1 J8 J29 J36, Étoposide J1 à J5 et J29 à J36',
    timing: 'Dès que possible'
  },
  {
    organ: 'Poumon',
    condition: 'CBNPC non à petites cellules',
    molecule: 'Cisplatine (CDDP) - Pemetrexed (ALIMTA)',
    route: 'IV',
    modalityAdministration: 'J1 J22',
    timing: 'Dès que possible'
  },
  {
    organ: 'Poumon',
    condition: 'CBPC à petites cellules',
    molecule: 'Étoposide (VP16) - Cisplatine (CDDP)',
    route: 'IV',
    modalityAdministration: 'Cisplatine J1, Étoposide J1 à J3',
    timing: 'Toutes les 3 semaines, dès que possible'
  },
  {
    organ: 'Poumon',
    condition: 'CBPC à petites cellules',
    molecule: 'Étoposide (VP16) - Carboplatine',
    route: 'IV',
    modalityAdministration: 'Carboplatine J1, Étoposide J1 à J3',
    timing: 'Toutes les 3 semaines, dès que possible'
  },

  // Sein
  {
    organ: 'Sein',
    condition: 'Cancer du sein',
    molecule: 'Capécitabine (XELODA)',
    route: 'Per Os',
    modalityAdministration: 'Traitement continu J1/7 jours matin et soir',
    timing: 'Pendant RT'
  }
];

// Fonction utilitaire pour extraire les données uniques
export const extractUniqueData = (protocols) => {
  const organsList = [...new Set(protocols.map(p => p.organ))].sort();
  const moleculesList = [...new Set(protocols.map(p => p.molecule))].sort();
  
  return { organsList, moleculesList };
};

// Export séparé pour faciliter l'import
export const { organsList, moleculesList } = extractUniqueData(protocolsStaticData);