export const INITIAL_VISIBLE_COLUMNS = {
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

export const CATEGORY_COLORS = {
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
