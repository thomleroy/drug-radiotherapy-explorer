import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle } from 'lucide-react';
import { allDrugs } from '../data/drugs';

const DrugExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [rtTypeFilter, setRtTypeFilter] = useState('all');

  // Fonction pour formater les données pour l'export CSV
  const formatForCSV = (data) => {
    const header = "Drug Name,Class,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
    const rows = data.map(drug => 
      `${drug.name},${drug.class},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
    ).join('\n');
    return header + rows;
  };

  // Fonction pour télécharger les données filtrées
  const downloadCSV = () => {
    const csv = formatForCSV(filterAndSortDrugs());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drug-radiotherapy-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Fonction pour trier les données
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour obtenir la couleur de la cellule basée sur la valeur
  const getCellColor = (value) => {
    if (value === '0') return 'bg-red-100';
    if (value.includes('48h')) return 'bg-yellow-100';
    if (value.includes('days')) return 'bg-green-100';
    return '';
  };

  // Fonction pour filtrer et trier les médicaments
  const filterAndSortDrugs = () => {
    let filteredDrugs = allDrugs.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      const matchesHalfLife = halfLifeFilter === 'all' || 
        (halfLifeFilter === 'short' && parseInt(drug.halfLife) <= 24) ||
        (halfLifeFilter === 'long' && parseInt(drug.halfLife) > 24);
      const matchesRTType = rtTypeFilter === 'all' || drug[rtTypeFilter] !== '0';
      
      return matchesSearch && matchesCategory && matchesHalfLife && matchesRTType;
    });

    if (sortConfig.key) {
      filteredDrugs.sort((a, b) => {
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
  };

  return (
    <Card className="w-full max-w-7xl mx-auto my-8 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-3xl font-bold">Drug-Radiotherapy Association Explorer</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Contrôles de recherche et filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a drug..."
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="h-12 border rounded-md px-3 bg-white shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="chemotherapy">Chemotherapy</option>
            <option value="endocrine">Endocrine Therapy</option>
            <option value="targeted">Targeted Therapy</option>
          </select>

          <select
            className="h-12 border rounded-md px-3 bg-white shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={halfLifeFilter}
            onChange={(e) => setHalfLifeFilter(e.target.value)}
          >
            <option value="all">All Half-lives</option>
            <option value="short">Short (≤24h)</option>
            <option value="long">Long (>24h)</option>
          </select>

          <select
            className="h-12 border rounded-md px-3 bg-white shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={rtTypeFilter}
            onChange={(e) => setRtTypeFilter(e.target.value)}
          >
            <option value="all">All RT Types</option>
            <option value="normofractionatedRT">Normofractionated RT</option>
            <option value="palliativeRT">Palliative RT</option>
            <option value="stereotacticRT">Stereotactic RT</option>
            <option value="intracranialRT">Intracranial RT</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="h-5 w-5" />
            Export Data
          </button>
        </div>

        {/* Tableau des résultats */}
        <div className="overflow-x-auto border rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold border-b cursor-pointer hover:bg-gray-100" onClick={() => requestSort('name')}>
                  Drug Name
                </th>
                <th className="p-4 text-left font-semibold border-b cursor-pointer hover:bg-gray-100" onClick={() => requestSort('class')}>
                  Class
                </th>
                <th className="p-4 text-left font-semibold border-b cursor-pointer hover:bg-gray-100" onClick={() => requestSort('halfLife')}>
                  Half-life
                </th>
                <th className="p-4 text-left font-semibold border-b">Normofractionated RT</th>
                <th className="p-4 text-left font-semibold border-b">Palliative RT</th>
                <th className="p-4 text-left font-semibold border-b">Stereotactic RT</th>
                <th className="p-4 text-left font-semibold border-b">Intracranial RT</th>
              </tr>
            </thead>
            <tbody>
              {filterAndSortDrugs().map((drug, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-b font-medium">{drug.name}</td>
                  <td className="p-4 border-b">{drug.class}</td>
                  <td className="p-4 border-b">{drug.halfLife}</td>
                  <td className={`p-4 border-b ${getCellColor(drug.normofractionatedRT)}`}>
                    {drug.normofractionatedRT}
                  </td>
                  <td className={`p-4 border-b ${getCellColor(drug.palliativeRT)}`}>
                    {drug.palliativeRT}
                  </td>
                  <td className={`p-4 border-b ${getCellColor(drug.stereotacticRT)}`}>
                    {drug.stereotacticRT}
                  </td>
                  <td className={`p-4 border-b ${getCellColor(drug.intracranialRT)}`}>
                    {drug.intracranialRT}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Légende des couleurs */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border rounded"></div>
            <span>No delay required (0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
            <span>48h delay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border rounded"></div>
            <span>Multiple days delay</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugExplorer;