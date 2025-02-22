import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle, Info, ExternalLink } from 'lucide-react';
import { allDrugs } from '../data/drugs';
import { motion, AnimatePresence } from 'framer-motion';

const DrugExplorer = () => {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [rtTypeFilter, setRtTypeFilter] = useState('all');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState(null);
  const [isTableScrolled, setIsTableScrolled] = useState(false);

  // Gestionnaire de redimensionnement responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Composant Tooltip amélioré avec animation
  const Tooltip = ({ children, content }) => (
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
  );

  // Fonction pour obtenir les couleurs selon la catégorie
  const getCategoryColor = (category) => {
    const colors = {
      chemotherapy: 'bg-sfro-light text-sfro-dark border-sfro-primary',
      endocrine: 'bg-purple-50 text-purple-800 border-purple-200',
      targeted: 'bg-orange-50 text-orange-800 border-orange-200',
      immunotherapy: 'bg-green-50 text-green-800 border-green-200'
    };
    return colors[category] || 'bg-gray-50 text-gray-800 border-gray-200';
  };
  // Fonction pour formater les données pour l'export CSV
  const formatForCSV = (data) => {
    const header = "Drug Name,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
    const rows = data.map(drug => 
      `${drug.name},${drug.class},${drug.category},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
    ).join('\n');
    return header + rows;
  };

  // Fonction de tri améliorée avec gestion des types de données
  const requestSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Fonction pour obtenir la couleur des cellules avec accessibilité améliorée
  const getCellColor = useCallback((value) => {
    if (value === '0' || value.includes('0 (except')) return 'bg-green-100 text-green-800';
  if (value.includes('48h')) return 'bg-yellow-100 text-yellow-800';
  if (value.includes('days')) return 'bg-red-100 text-red-800';
    return '';
  }, []);

  // Fonction de filtrage améliorée avec performances optimisées
  const filterAndSortDrugs = useCallback(() => {
    let filteredDrugs = allDrugs.filter(drug => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = drug.name.toLowerCase().includes(searchLower) || 
                          drug.class.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      const matchesHalfLife = halfLifeFilter === 'all' || 
        (halfLifeFilter === 'short' && parseFloat(drug.halfLife) <= 24) ||
        (halfLifeFilter === 'long' && parseFloat(drug.halfLife) > 24);
      const matchesRTType = rtTypeFilter === 'all' || drug[rtTypeFilter] !== '0';
      
      return matchesSearch && matchesCategory && matchesHalfLife && matchesRTType;
    });

    if (sortConfig.key) {
      filteredDrugs.sort((a, b) => {
        // Gestion spéciale pour les valeurs numériques
        if (sortConfig.key === 'halfLife') {
          const aValue = parseFloat(a[sortConfig.key]) || 0;
          const bValue = parseFloat(b[sortConfig.key]) || 0;
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Tri standard pour les chaînes
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
  }, [searchTerm, selectedCategory, halfLifeFilter, rtTypeFilter, sortConfig]);

  
  // Fonction de téléchargement améliorée avec gestion des erreurs
  const downloadCSV = useCallback(() => {
    try {
      const csv = formatForCSV(filterAndSortDrugs());
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `drug-radiotherapy-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Ici vous pourriez ajouter une notification d'erreur UI
    }
  }, [filterAndSortDrugs]);

  // Stats calculées pour le dashboard
  const stats = [
    { 
      label: 'Total Drugs',
      value: filterAndSortDrugs().length,
      color: 'bg-sfro-light text-sfro-dark'
    },
    { 
      label: 'Chemotherapy',
      value: filterAndSortDrugs().filter(d => d.category === 'chemotherapy').length,
      color: 'bg-blue-50 text-blue-800'
    },
    { 
      label: 'Endocrine',
      value: filterAndSortDrugs().filter(d => d.category === 'endocrine').length,
      color: 'bg-purple-50 text-purple-800'
    },
    { 
      label: 'Targeted',
      value: filterAndSortDrugs().filter(d => d.category === 'targeted').length,
      color: 'bg-orange-50 text-orange-800'
    },
    { 
      label: 'Immunotherapy',
      value: filterAndSortDrugs().filter(d => d.category === 'immunotherapy').length,
      color: 'bg-green-50 text-green-800'
    }
  ];
  // Composant pour les badges avec animation
  const Badge = ({ children, color }) => (
    <motion.span
      initial={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {children}
    </motion.span>
  );

  const DrugCard = ({ drug }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-sfro-dark">
            {drug.name}
          </h3>
          <Badge color={getCategoryColor(drug.category)}>
            {drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Class:</span>
            <Tooltip content={drug.class}>
              <span className="text-gray-900">
                {drug.class.length > 30 ? `${drug.class.substring(0, 30)}...` : drug.class}
              </span>
            </Tooltip>
          </div>

          <div className="flex items-center text-sm">
            <span className="text-gray-500 w-24">Half-life:</span>
            <span className="text-gray-900">{drug.halfLife}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3">
            <h4 className="text-sm font-medium text-sfro-dark mb-2">Radiotherapy Timing</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className={`rounded-md p-2 ${getCellColor(drug.normofractionatedRT)} text-sm`}>
                <span className="font-medium">Normofractionated:</span> {drug.normofractionatedRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.palliativeRT)} text-sm`}>
                <span className="font-medium">Palliative:</span> {drug.palliativeRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.stereotacticRT)} text-sm`}>
                <span className="font-medium">Stereotactic:</span> {drug.stereotacticRT}
              </div>
              <div className={`rounded-md p-2 ${getCellColor(drug.intracranialRT)} text-sm`}>
                <span className="font-medium">Intracranial:</span> {drug.intracranialRT}
              </div>
            </div>
          </div>

          {drug.references && (
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <Tooltip content="Click to copy reference">
                <button 
                  onClick={() => navigator.clipboard.writeText(drug.references)}
                  className="hover:text-sfro-primary focus:outline-none focus:text-sfro-primary transition-colors"
                >
                  References: {drug.references}
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Composant pour le menu de filtres sur mobile
  const MobileFilters = ({ show, onClose }) => (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: show ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-sfro-dark">Filters</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <span className="sr-only">Close filters</span>
          ×
        </button>
      </div>
      {/* Filtres mobiles ici */}
    </motion.div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="w-full max-w-7xl mx-auto my-8 shadow-xl">
        {/* Header avec logo SFRO */}
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-[#00BFF3] to-[#0080A5] text-white rounded-t-lg">
  {/* Background pattern subtil */}
  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
  
  <div className="relative flex items-center justify-between p-8">
    {/* Contenu gauche */}
    <div className="flex-grow">
      <CardTitle className="text-4xl font-bold tracking-tight mb-2">
        Drug-Radiotherapy Association Explorer
      </CardTitle>
      <p className="text-lg text-white/90 max-w-2xl">
        Explore drug interactions and timing with different radiotherapy types
      </p>
    </div>
    
    {/* Logo avec fond blanc pour meilleur contraste */}
    <div className="flex-shrink-0 ml-8">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <img 
          src="/sfro-logo.png" 
          alt="SFRO Logo" 
          className="h-20 w-auto"
        />
      </div>
    </div>
  </div>
</CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Dashboard statistiques */}
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

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search drugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 w-full border-2 border-gray-200 hover:border-sfro-primary focus:border-sfro-primary focus:ring-2 focus:ring-sfro-light transition-colors rounded-lg"
                />
              </div>

              {/* Filtres */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
              >
                <option value="all">All Categories</option>
                <option value="chemotherapy">Chemotherapy</option>
                <option value="endocrine">Endocrine Therapy</option>
                <option value="targeted">Targeted Therapy</option>
                <option value="immunotherapy">Immunotherapy</option>
              </select>

              <select
                value={halfLifeFilter}
                onChange={(e) => setHalfLifeFilter(e.target.value)}
                className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
              >
                <option value="all">All Half-lives</option>
                <option value="short">Short (≤24h)</option>
                <option value="long">Long (>24h)</option>
              </select>

              <select
                value={rtTypeFilter}
                onChange={(e) => setRtTypeFilter(e.target.value)}
                className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-sfro-primary focus:border-sfro-primary transition-colors cursor-pointer bg-white"
              >
                <option value="all">All RT Types</option>
                <option value="normofractionatedRT">Normofractionated RT</option>
                <option value="palliativeRT">Palliative RT</option>
                <option value="stereotacticRT">Stereotactic RT</option>
                <option value="intracranialRT">Intracranial RT</option>
              </select>
            </div>
          </div>

          {/* Bouton Export */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCSV}
              className="flex items-center gap-2 bg-sfro-primary hover:bg-sfro-secondary transition-colors px-6 py-3 rounded-lg text-white shadow-sm font-medium"
            >
              <Download className="h-5 w-5" />
              Export to CSV
            </motion.button>
          </div>

          {/* Vue conditionnelle Mobile/Desktop */}
          <AnimatePresence>
            {isMobileView ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filterAndSortDrugs().map((drug, index) => (
                  <DrugCard key={`${drug.name}-${index}`} drug={drug} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg shadow-lg"
              >
                <table className="w-full border-collapse bg-white table-fixed">
                  <thead className="sticky top-0 bg-sfro-light z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">
                        <button 
                          className="flex items-center hover:text-sfro-primary"
                          onClick={() => requestSort('name')}
                        >
                          Drug Name <HelpCircle className="ml-1 h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/6">Class</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Half-life</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Normo RT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Pallia RT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Stereo RT</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-sfro-dark w-1/12">Intra RT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filterAndSortDrugs().map((drug, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-gray-50 transition-colors duration-150 ease-in-out text-xs"
                      >
                        <td className="px-3 py-2 whitespace-normal font-medium text-sfro-dark">{drug.name}</td>
                        <td className="px-3 py-2 whitespace-normal text-gray-500">
                          <Tooltip content={drug.class}>
                            {drug.class.length > 30 ? `${drug.class.substring(0, 30)}...` : drug.class}
                          </Tooltip>
                        </td>
                        <td className="px-3 py-2">
                          <Badge color={getCategoryColor(drug.category)}>
                            {drug.category.substring(0, 3)}
                          </Badge>
                        </td>
                       <td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.normofractionatedRT)}`}>
  {drug.normofractionatedRT}
</td>
<td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.palliativeRT)}`}>
  {drug.palliativeRT}
</td>
<td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.stereotacticRT)}`}>
  {drug.stereotacticRT}
</td>
<td className={`px-3 py-2 whitespace-normal break-words ${getCellColor(drug.intracranialRT)}`}>
  {drug.intracranialRT}
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Légende */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border rounded"></div>
              <span>No delay required (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
              <span>48h delay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border rounded"></div>
              <span>Multiple days delay</span>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-8 p-6 bg-sfro-light">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-sfro-dark">
            <div className="mb-4 md:mb-0">
              © 2024 SFRO - Société Française de Radiothérapie Oncologique
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-sfro-primary transition-colors">À propos</a>
              <a href="#" className="hover:text-sfro-primary transition-colors">Contact</a>
              <a href="#" className="hover:text-sfro-primary transition-colors">Mentions légales</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DrugExplorer;
