export const allDrugs = [
{
    name: "Irinotecan",
    class: "Topoisomerases 1 inhibitors",
    category: "chemotherapy",
    halfLife: "14h",
    normofractionatedRT: "48h",
    palliativeRT: "48h",
    stereotacticRT: "48h",
    intracranialRT: "48h",
    references: "[185]"
  },
  {
    name: "Topotecan",
    class: "Topoisomerases 1 inhibitors",
    category: "chemotherapy",
    halfLife: "5h",
    normofractionatedRT: "48h",
    palliativeRT: "48h",
    stereotacticRT: "48h",
    intracranialRT: "48h",
    references: "[185]"
  },
  {
    name: "Daunorubicine",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "24h",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[162]"
  },
  {
    name: "Doxorubicine",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "3 days",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[162]"
  },
  {
    name: "Epirubicine",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "20 to 40h",
    normofractionatedRT: "7 days",
    palliativeRT: "7 days",
    stereotacticRT: "7 days",
    intracranialRT: "7 days",
    references: "[162]"
  },
  {
    name: "Idarubicine",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "11 to 25h",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[162]"
  },
  {
    name: "Etoposide",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "4 to 11h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[125]"
  },
  {
    name: "Bleomycine",
    class: "Topoisomerases 2 inhibitors",
    category: "chemotherapy",
    halfLife: "4h",
    normofractionatedRT: "0 (except thoracic irradiation : 48h)",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[186,187]"
  },

  // Purine analogues
{
  name: "Mercaptopurine",
  class: "Purine analogues",
  category: "chemotherapy",
  halfLife: "2h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[194]"
},
{
  name: "Fludarabine",
  class: "Purine analogues",
  category: "chemotherapy",
  halfLife: "15 to 23h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[195,196]"
},
{
  name: "Clofarabine",
  class: "Purine analogues",
  category: "chemotherapy",
  halfLife: "5.2h",
  normofractionatedRT: "3 days",
  palliativeRT: "3 days",
  stereotacticRT: "3 days",
  intracranialRT: "3 days",
  references: "[197,198]"
},
// Alkylating agents - Platinum based drugs
{
  name: "Cisplatin",
  class: "Platinum based drugs",
  category: "chemotherapy",
  halfLife: "30 min",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Carboplatin",
  class: "Platinum based drugs",
  category: "chemotherapy",
  halfLife: "6h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Oxaliplatine",
  class: "Platinum based drugs",
  category: "chemotherapy",
  halfLife: "25min",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},

// Alkylating agents - Nitrogen mustards
{
  name: "Chlorambucil",
  class: "Nitrogen mustards",
  category: "chemotherapy",
  halfLife: "1.5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[199]"
},
{
  name: "Melphalan",
  class: "Nitrogen mustards",
  category: "chemotherapy",
  halfLife: "1.5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[200]"
},
{
  name: "Cyclophosphamide",
  class: "Nitrogen mustards",
  category: "chemotherapy",
  halfLife: "4 to 8h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[201,202]"
},
{
  name: "Ifosfamide",
  class: "Nitrogen mustards",
  category: "chemotherapy",
  halfLife: "4 to 8h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[203,204]"
},
  // Anti metabolites agents
  {
    name: "5-Fluorouracil",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "6min",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0"
  },
  {
    name: "Capecitabine",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "3h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0"
  },
  {
    name: "Triflurifine",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "1.4h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[188,189]"
  },
  {
    name: "Tipiracil",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "1.4h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[188,189]"
  },
{
    name: "Gemcitabine",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "5 to 11h",
    normofractionatedRT: "7 days (except concurrent chemoradiation 100mg/m2)",
    palliativeRT: "7 days",
    stereotacticRT: "7 days",
    intracranialRT: "0",
    references: "[190]"
  },
  {
    name: "Cytarabine",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "2h",
    normofractionatedRT: "2 days",
    palliativeRT: "2 days",
    stereotacticRT: "2 days",
    intracranialRT: "2 days",
    references: "[191]"
  },
  {
    name: "Azacitidine",
    class: "Pyrimidine analogues",
    category: "chemotherapy",
    halfLife: "45min",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0"
  },
  {
    name: "Methotrexate",
    class: "Antifolates",
    category: "chemotherapy",
    halfLife: "8 to 15h",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[164]"
  },
  {
    name: "Pemetrexed",
    class: "Antifolates",
    category: "chemotherapy",
    halfLife: "3.5h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[192]"
  },
  {
    name: "Ralitrexed",
    class: "Antifolates",
    category: "chemotherapy",
    halfLife: "8 days",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[193]"
  },
  // Alkylating agents - Nitrosea urea
{
  name: "Bendamustine",
  class: "Nitrosea urea",
  category: "chemotherapy",
  halfLife: "30min",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[205,206]"
},
{
  name: "Fotemustine",
  class: "Nitrosea urea",
  category: "chemotherapy",
  halfLife: "30min to 2h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Lomustine",
  class: "Nitrosea urea",
  category: "chemotherapy",
  halfLife: "3 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[207,208]"
},

// Alcaloid
{
  name: "Trabectidine",
  class: "Alcaloid",
  category: "chemotherapy",
  halfLife: "7.5 days",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[209,210]"
},

// Various
{
  name: "Dacarbazine",
  class: "Various",
  category: "chemotherapy",
  halfLife: "1.5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Procarbazine",
  class: "Various",
  category: "chemotherapy",
  halfLife: "7 min",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Mitomycin C",
  class: "Various",
  category: "chemotherapy",
  halfLife: "1h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Temozolomide",
  class: "Various",
  category: "chemotherapy",
  halfLife: "1.8h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},

// Antimitutic agents - Taxanes
{
  name: "Paclitaxel",
  class: "Taxanes",
  category: "chemotherapy",
  halfLife: "24h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Nab-Paclitaxel",
  class: "Taxanes",
  category: "chemotherapy",
  halfLife: "24h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Docetaxel",
  class: "Taxanes",
  category: "chemotherapy",
  halfLife: "11h",
  normofractionatedRT: "2 days",
  palliativeRT: "2 days",
  stereotacticRT: "2 days",
  intracranialRT: "2 days"
},
{
  name: "Cabazitaxel",
  class: "Taxanes",
  category: "chemotherapy",
  halfLife: "96h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
// Antimitutic agents - Halichondrins
{
  name: "Eribuline",
  class: "Halichondrins",
  category: "chemotherapy",
  halfLife: "40h",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "0",
  references: "[211]"
},
// Antimitutic agents - Vinca alkaloids
{
  name: "Vinblastine",
  class: "Vinca alkaloids",
  category: "chemotherapy",
  halfLife: "24h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Vincristine",
  class: "Vinca alkaloids",
  category: "chemotherapy",
  halfLife: "3.5 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[212]"
},
{
  name: "Vinorelbine",
  class: "Vinca alkaloids",
  category: "chemotherapy",
  halfLife: "40h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[213,214]"
},
  // Endocrine Therapy - LH-RH agonists & antagonists
{
  name: "Goserelin",
  class: "LH-RH agonists",
  category: "endocrine",
  halfLife: "7h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Leuproprelin",
  class: "LH-RH agonists",
  category: "endocrine",
  halfLife: "3h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Triptoreline",
  class: "LH-RH agonists",
  category: "endocrine",
  halfLife: "5h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Degarelix",
  class: "LH-RH antagonists",
  category: "endocrine",
  halfLife: "28 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Relugolix",
  class: "LH-RH antagonists",
  category: "endocrine",
  halfLife: "61.5h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},

// Anti-androgens receptor
{
  name: "Bicalutamide",
  class: "Anti-androgens receptor",
  category: "endocrine",
  halfLife: "7 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Apalutamide",
  class: "Anti-androgens receptor",
  category: "endocrine",
  halfLife: "72h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[215,216]"
},
{
  name: "Enzalutamide",
  class: "Anti-androgens receptor",
  category: "endocrine",
  halfLife: "6 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[217]"
},
{
  name: "Darolutamide",
  class: "Anti-androgens receptor",
  category: "endocrine",
  halfLife: "20h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[218]"
},

// Other endocrine therapies
{
  name: "Abiraterone acetate",
  class: "Cytochrome P450 C17 inhibitor",
  category: "endocrine",
  halfLife: "15h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[219,220]"
},
{
  name: "Tamoxifene",
  class: "Anti estrogens receptor",
  category: "endocrine",
  halfLife: "7 days",
  normofractionatedRT: "0 (except radiosensibility)",
  palliativeRT: "0 (except radiosensibility)",
  stereotacticRT: "0 (except radiosensibility)",
  intracranialRT: "0 (except radiosensibility)",
  references: "[58]"
},
{
  name: "Fulvestrant",
  class: "Anti estrogens receptor",
  category: "endocrine",
  halfLife: "50 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[221,222]"
},

// Anti-aromatases
{
  name: "Letrozole",
  class: "Anti-aromatases",
  category: "endocrine",
  halfLife: "2 to 4 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[223]"
},
{
  name: "Anastrozole",
  class: "Anti-aromatases",
  category: "endocrine",
  halfLife: "48h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Exemestane",
  class: "Anti-aromatases",
  category: "endocrine",
  halfLife: "24h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
  // Targeted therapy drugs
  {
    name: "Alectinib",
    class: "Tyrosine kinase inhibitors",
    category: "targeted",
    halfLife: "32h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "0",
    references: "[286]"
  },
  {
    name: "Brigatinib",
    class: "Tyrosine kinase inhibitors",
    category: "targeted",
    halfLife: "24h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "0"
  },
  {
    name: "Ceritinib",
    class: "Tyrosine kinase inhibitors",
    category: "targeted",
    halfLife: "40h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "0"
  },
  {
    name: "Crizotinib",
    class: "Tyrosine kinase inhibitors",
    category: "targeted",
    halfLife: "42h",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
    references: "[225,226,227]"
  },
  {
  name: "Lorlatinib",
  class: "Tyrosine kinase inhibitors (ALK)",
  category: "targeted",
  halfLife: "24h",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "0"
},

// BCR-ABL inhibitors
{
  name: "Bosutinib",
  class: "Tyrosine kinase inhibitors (BCR-ABL)",
  category: "targeted",
  halfLife: "35h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Dasatinib",
  class: "Tyrosine kinase inhibitors (BCR-ABL)",
  category: "targeted",
  halfLife: "5h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[228,229]"
},
{
  name: "Imatinib",
  class: "Tyrosine kinase inhibitors (BCR-ABL)",
  category: "targeted",
  halfLife: "18h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[230]"
},
{
  name: "Nilotinib",
  class: "Tyrosine kinase inhibitors (BCR-ABL)",
  category: "targeted",
  halfLife: "17h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[231]"
},
{
  name: "Ponatinib",
  class: "Tyrosine kinase inhibitors (BCR-ABL)",
  category: "targeted",
  halfLife: "22h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},

// BTK inhibitors
{
  name: "Acalabrutinib",
  class: "Tyrosine kinase inhibitors (BTK)",
  category: "targeted",
  halfLife: "7h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Ibrutinib",
  class: "Tyrosine kinase inhibitors (BTK)",
  category: "targeted",
  halfLife: "4h to 13h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[232]"
},
{
  name: "Pirtobrutinib",
  class: "Tyrosine kinase inhibitors (BTK)",
  category: "targeted",
  halfLife: "19h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
// EGFR inhibitors
{
  name: "Afatinib",
  class: "Tyrosine kinase inhibitors (EGFR)",
  category: "targeted",
  halfLife: "37h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "0",
  references: "[235]"
},
{
  name: "Gefitinib",
  class: "Tyrosine kinase inhibitors (EGFR)",
  category: "targeted",
  halfLife: "41h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[236]"
},
{
  name: "Erlotinib",
  class: "Tyrosine kinase inhibitors (EGFR)",
  category: "targeted",
  halfLife: "36h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Osimertinib",
  class: "Tyrosine kinase inhibitors (EGFR)",
  category: "targeted",
  halfLife: "48h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[237,238]"
},

// Other specific inhibitors
{
  name: "Futibatinib",
  class: "Tyrosine kinase inhibitors (FGFR)",
  category: "targeted",
  halfLife: "3h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Pemigatinib",
  class: "Tyrosine kinase inhibitors (FGFR2)",
  category: "targeted",
  halfLife: "15h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Gilteritinib",
  class: "Tyrosine kinase inhibitors (FLT3)",
  category: "targeted",
  halfLife: "4.7 days",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Lapatinib",
  class: "Tyrosine kinase inhibitors (HER2)",
  category: "targeted",
  halfLife: "24h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[239,81]"
},
{
  name: "Tucatinib",
  class: "Tyrosine kinase inhibitors (HER2)",
  category: "targeted",
  halfLife: "8.5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[81]"
},

// JAK & MEK inhibitors
{
  name: "Fedratinib",
  class: "Tyrosine kinase inhibitors (JAK)",
  category: "targeted",
  halfLife: "4.75 days",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Ruxolitinib",
  class: "Tyrosine kinase inhibitors (JAK)",
  category: "targeted",
  halfLife: "3h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Binimetinib",
  class: "Tyrosine kinase inhibitors (MEK)",
  category: "targeted",
  halfLife: "8.66h",
  normofractionatedRT: "3 days",
  palliativeRT: "3 days",
  stereotacticRT: "3 days",
  intracranialRT: "3 days",
  references: "[178]"
},
// MET, RET and other inhibitors
{
  name: "Capmatinib",
  class: "Tyrosine kinase inhibitors (MET)",
  category: "targeted",
  halfLife: "6.5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[240]"
},
{
  name: "Cabozantinib",
  class: "Tyrosine kinase inhibitors (MET, RET, ROS1, VEGFR)",
  category: "targeted",
  halfLife: "4.5 days",
  normofractionatedRT: "21 days",
  palliativeRT: "0 (except abdominopelvic)",
  stereotacticRT: "21 days",
  intracranialRT: "0",
  references: "[241,242]"
},
{
  name: "Tepotinib",
  class: "Tyrosine kinase inhibitors (MET)",
  category: "targeted",
  halfLife: "32h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Selpercatinib",
  class: "Tyrosine kinase inhibitors (RET fusion)",
  category: "targeted",
  halfLife: "24h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days"
},
{
  name: "Larotrectinib",
  class: "Tyrosine kinase inhibitors (TRK)",
  category: "targeted",
  halfLife: "3h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[243]"
},

// VEGFR inhibitors
{
  name: "Axitinib",
  class: "Tyrosine kinase inhibitors (VEGFR)",
  category: "targeted",
  halfLife: "2.5h to 6h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[244,245]"
},
{
  name: "Lenvatinib",
  class: "Tyrosine kinase inhibitors (c-Kit, FGFR, PDGFR, VEGFR)",
  category: "targeted",
  halfLife: "28h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[246,247]"
},
{
  name: "Sorafenib",
  class: "Tyrosine kinase inhibitors (c-Kit, FLT3, PDGFR, VEGFR)",
  category: "targeted",
  halfLife: "24h to 48h",
  normofractionatedRT: "7 days",
  palliativeRT: "0 (except abdomino pelvic)",
  stereotacticRT: "7 days",
  intracranialRT: "0",
  references: "[170,248,249]"
},

// Monoclonal antibodies
{
  name: "Obinutuzumab",
  class: "Monoclonal antibodies (CD20)",
  category: "targeted",
  halfLife: "23.9 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[262]"
},
{
  name: "Rituximab",
  class: "Monoclonal antibodies (CD20)",
  category: "targeted",
  halfLife: "22 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[263]"
},
{
  name: "Cetuximab",
  class: "Monoclonal antibodies (EGFR)",
  category: "targeted",
  halfLife: "4 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Bevacizumab",
  class: "Monoclonal antibodies (VEGFR)",
  category: "targeted",
  halfLife: "18 to 20 days",
  normofractionatedRT: "21 days",
  palliativeRT: "0 (except abdomino pelvic)",
  stereotacticRT: "21 days",
  intracranialRT: "0"
  },
// Autres thérapies ciblées
{
  name: "Venetoclax",
  class: "Bcl-2 inhibitors",
  category: "targeted",
  halfLife: "26h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[249]"
},
{
  name: "Dabrafenib",
  class: "BRAF inhibitors",
  category: "targeted",
  halfLife: "2.6h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[178]"
},
{
  name: "Encorafenib",
  class: "BRAF inhibitors",
  category: "targeted",
  halfLife: "6.3h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Vemurafenib",
  class: "BRAF inhibitors",
  category: "targeted",
  halfLife: "51h",
  normofractionatedRT: "7 days",
  palliativeRT: "7 days",
  stereotacticRT: "7 days",
  intracranialRT: "7 days"
},

// PARP inhibitors
{
  name: "Niraparib",
  class: "PARP inhibitors",
  category: "targeted",
  halfLife: "48h",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "0"
},
{
  name: "Olaparib",
  class: "PARP inhibitors",
  category: "targeted",
  halfLife: "15h",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "0",
  references: "[184]"
},
{
  name: "Rucaparib",
  class: "PARP inhibitors",
  category: "targeted",
  halfLife: "26h",
  normofractionatedRT: "5 days",
  palliativeRT: "0",
  stereotacticRT: "5 days",
  intracranialRT: "0"
},

// Proteasome inhibitors et autres
{
  name: "Bortezomib",
  class: "Proteasome inhibitors",
  category: "targeted",
  halfLife: "40 to 193h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[254,255,256]"
},
{
  name: "Carfilzomib",
  class: "Proteasome inhibitors",
  category: "targeted",
  halfLife: "1h",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},

// Immunomodulators
{
  name: "Lenalidomide",
  class: "Immunomodulators",
  category: "immunotherapy",
  halfLife: "3h to 5h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[267,268]"
},
{
  name: "Pomalidomide",
  class: "Immunomodulators",
  category: "immunotherapy",
  halfLife: "9h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[264]"
},
{
  name: "Thalidomide",
  class: "Immunomodulators",
  category: "immunotherapy",
  halfLife: "7h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[269,270,271]"
},

// Antibody-drug conjugates
{
  name: "Brentuximab vedotin",
  class: "Antibody-drug conjugates (CD30)",
  category: "targeted",
  halfLife: "4 to 6 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[275,276]"
},
{
  name: "Trastuzumab Emtansine",
  class: "Antibody-drug conjugates (HER2)",
  category: "targeted",
  halfLife: "4 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[81]"
},
// Derniers anticorps monoclonaux et protéines de fusion
{
  name: "Ramucirumab",
  class: "Monoclonal antibodies (VEGFR)",
  category: "targeted",
  halfLife: "14 days",
  normofractionatedRT: "21days",
  palliativeRT: "0 (except abdomino pelvic)",
  stereotacticRT: "21days",
  intracranialRT: "0",
  references: "[265,266]"
},
{
  name: "Aflibercept",
  class: "Recombinant fusion protein (VEGF)",
  category: "targeted",
  halfLife: "6 days",
  normofractionatedRT: "21days",
  palliativeRT: "0 (except abdomino pelvic)",
  stereotacticRT: "21days",
  intracranialRT: "0"
},
// Antibody-drug conjugates
{
  name: "Trastuzumab Deruxtecan",
  class: "Antibody-drug conjugates",
  category: "targeted",
  halfLife: "7 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[277]"
},
{
  name: "Enfortumab Vedotin",
  class: "Antibody-drug conjugates (Nectin 4)",
  category: "targeted",
  halfLife: "3.6 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0",
  references: "[278,279]"
},
{
  name: "Sacituzumab govitecan",
  class: "Antibody-drug conjugates (TROP2)",
  category: "targeted",
  halfLife: "15h to 19h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[280]"
},

// Immunotherapy drugs
{
  name: "Nivolumab",
  class: "PD1 inhibitors",
  category: "immunotherapy",
  halfLife: "25 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Pembrolizumab",
  class: "PD1 inhibitors",
  category: "immunotherapy",
  halfLife: "22 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Atezolizumab",
  class: "PDL1 inhibitors",
  category: "immunotherapy",
  halfLife: "27 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Avelumab",
  class: "PDL1 inhibitors",
  category: "immunotherapy",
  halfLife: "6 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Durvalumab",
  class: "PDL1 inhibitors",
  category: "immunotherapy",
  halfLife: "18 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Ipilimumab",
  class: "CTLA4 inhibitors",
  category: "immunotherapy",
  halfLife: "15 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Tremelimumab",
  class: "CTLA4 inhibitors",
  category: "immunotherapy",
  halfLife: "14.2 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
    name: "Abemaciclib",
    class: "CDK4/6 inhibitors",
    category: "targeted",
    halfLife: "25h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[81]"
  },
  {
    name: "Palbociclib",
    class: "CDK4/6 inhibitors",
    category: "targeted",
    halfLife: "29h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[81]"
  },
  {
    name: "Ribociclib",
    class: "CDK4/6 inhibitors",
    category: "targeted",
    halfLife: "30 to 55h",
    normofractionatedRT: "5 days",
    palliativeRT: "0",
    stereotacticRT: "5 days",
    intracranialRT: "5 days"
  },
  {
    name: "Vorinostat",
    class: "Histones deacetylases HDAC inhibitors",
    category: "targeted",
    halfLife: "2h",
    normofractionatedRT: "48h",
    palliativeRT: "48h",
    stereotacticRT: "48h",
    intracranialRT: "48h",
    references: "[250,251]"
  },
  {
    name: "Panobinostat",
    class: "CDK4/6 inhibitors, IDH-1 inhibitors, IDH-2 inhibitors",
    category: "targeted",
    halfLife: "37h",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[252]"
  },
  {
    name: "Ivosidenib",
    class: "Isocitrate dehydrogenase inhibitors (IDH-1)",
    category: "targeted",
    halfLife: "58h to 129h",
    normofractionatedRT: "0 days",
    palliativeRT: "0 days",
    stereotacticRT: "0 days",
    intracranialRT: "0 days",
    references: "[253]"
  },
  {
    name: "Enasidenib",
    class: "Unspecified",
    category: "targeted",
    halfLife: "8 days",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days"
  },
  {
    name: "Adagrasib",
    class: "KRAS G12C inhibitors",
    category: "targeted",
    halfLife: "24h",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days"
  },
  {
    name: "Sotorasib",
    class: "KRAS G12C inhibitors",
    category: "targeted",
    halfLife: "5h",
    normofractionatedRT: "2 days",
    palliativeRT: "2 days",
    stereotacticRT: "2 days",
    intracranialRT: "2 days"
  },
  {
    name: "Niraparib",
    class: "PARP inhibitors",
    category: "targeted",
    halfLife: "48h",
    normofractionatedRT: "5 days",
    palliativeRT: "0 days",
    stereotacticRT: "5 days",
    intracranialRT: "0 days"
  },
  {
    name: "Talazoparib",
    class: "PARP inhibitors",
    category: "targeted",
    halfLife: "3.75 days",
    normofractionatedRT: "5 days",
    palliativeRT: "0 days",
    stereotacticRT: "5 days",
    intracranialRT: "0 days"
  },
  {
    name: "Ixazomib",
    class: "Proteasome inhibitors",
    category: "targeted",
    halfLife: "9.5 days",
    normofractionatedRT: "0 days",
    palliativeRT: "0 days",
    stereotacticRT: "0 days",
    intracranialRT: "0 days"
  },
  {
    name: "Vismodegib",
    class: "SMO protein inhibitors",
    category: "targeted",
    halfLife: "4 days",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[257, 258]"
  },
  {
    name: "Sonidegib",
    class: "Proteasome inhibitors, PI3K inhibitors",
    category: "targeted",
    halfLife: "28 days",
    normofractionatedRT: "5 days",
    palliativeRT: "5 days",
    stereotacticRT: "5 days",
    intracranialRT: "5 days",
    references: "[259]"
  },
  {
    name: "Daratumumab",
    class: "PI3K inhibitors (CD38)",
    category: "targeted",
    halfLife: "9 days",
    normofractionatedRT: "0 days",
    palliativeRT: "0 days",
    stereotacticRT: "0 days",
    intracranialRT: "0 days",
    references: "[264]"
  },
    {
    name: "Pertuzumab",
    class: "Monoclonal antibodies (HER2)",
    category: "targeted",
    halfLife: "18 days",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
  },
     {
    name: "Trastuzumab",
    class: "Monoclonal antibodies (HER2)",
    category: "targeted",
    halfLife: "28.5 days",
    normofractionatedRT: "0",
    palliativeRT: "0",
    stereotacticRT: "0",
    intracranialRT: "0",
          },
    {
  name: "Zanubrutinib",
  class: "Tyrosine kinase inhibitors (BTK)",
  category: "targeted",
  halfLife: "4h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Pazopanib",
  class: "Tyrosine kinase inhibitors (c-Kit)",
  category: "targeted",
  halfLife: "31h",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[233, 234]"
},
{
  name: "Ripretinib",
  class: "Tyrosine kinase inhibitors (c-Kit)",
  category: "targeted",
  halfLife: "15h",
  normofractionatedRT: "3 days",
  palliativeRT: "3 days",
  stereotacticRT: "3 days",
  intracranialRT: "3 days"
},
{
  name: "Cobimetinib",
  class: "Tyrosine kinase inhibitors (MEK)",
  category: "targeted",
  halfLife: "43h",
  normofractionatedRT: "10 days",
  palliativeRT: "10 days",
  stereotacticRT: "10 days",
  intracranialRT: "10 days"
},
{
  name: "Trametinib",
  class: "Tyrosine kinase inhibitors (MEK)",
  category: "targeted",
  halfLife: "127h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h"
},
{
  name: "Alpelisib",
  class: "PI3K inhibitors",
  category: "targeted",
  halfLife: "9h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[260]"
},
{
  name: "Idelalisib",
  class: "PI3K inhibitors",
  category: "targeted",
  halfLife: "8h",
  normofractionatedRT: "48h",
  palliativeRT: "48h",
  stereotacticRT: "48h",
  intracranialRT: "48h",
  references: "[261]"
},
{
  name: "Everolimus",
  class: "Immunosuppressors",
  category: "targeted",
  halfLife: "30h",
  normofractionatedRT: "7 days",
  palliativeRT: "7 days",
  stereotacticRT: "7 days",
  intracranialRT: "7 days",
  references: "[273, 274, 272]"
},
{
  name: "Panitumumab",
  class: "Monoclonal antibodies (EGFR)",
  category: "targeted",
  halfLife: "7 days",
  normofractionatedRT: "0",
  palliativeRT: "0",
  stereotacticRT: "0",
  intracranialRT: "0"
},
{
  name: "Vandetanib",
  class: "Tyrosine kinase inhibitors (EGFR, VEGFR)",
  category: "targeted",
  halfLife: "19 days",
  normofractionatedRT: "5 days",
  palliativeRT: "5 days",
  stereotacticRT: "5 days",
  intracranialRT: "5 days",
  references: "[228]"
    }

];
