import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, Download, HelpCircle, Info } from 'lucide-react';
import { allDrugs } from '../data/drugs';

const DrugExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [halfLifeFilter, setHalfLifeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [rtTypeFilter, setRtTypeFilter] = useState('all');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showTooltip, setShowTooltip] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Tooltip = ({ children, content }) => (
    <div className="relative inline-block">
      <div className="group">
        {children}
        <div className="invisible group-hover:visible absolute z-50 w-64 p-2 mt-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {content}
        </div>
      </div>
    </div>
  );
  
  const getCategoryColor = (category) => {
    const colors = {
      chemotherapy: 'bg-blue-100 text-blue-800',
      endocrine: 'bg-purple-100 text-purple-800',
      targeted: 'bg-orange-100 text-orange-800',
      immunotherapy: 'bg-green-100 text-green-800'
    };
    return colors[category] || '';
  };

  const formatForCSV = (data) => {
    const header = "Drug Name,Class,Category,Half-life,Normofractionated RT,Palliative RT,Stereotactic RT,Intracranial RT,References\n";
    const rows = data.map(drug => 
      `${drug.name},${drug.class},${drug.category},${drug.halfLife},${drug.normofractionatedRT},${drug.palliativeRT},${drug.stereotacticRT},${drug.intracranialRT},${drug.references || ''}`
    ).join('\n');
    return header + rows;
  };

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

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getCellColor = (value) => {
    if (value === '0') return 'bg-green-100 text-green-800';
    if (value.includes('48h')) return 'bg-yellow-100 text-yellow-800';
    if (value.includes('days')) return 'bg-red-100 text-red-800';
    return '';
  };

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
  const DrugCard = ({ drug }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{drug.name}</h3>
        <Tooltip content={`Category: ${drug.category}`}>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(drug.category)}`}>
            {drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}
          </span>
        </Tooltip>
      </div>
      <div className="space-y-2">
        <p className="text-sm">
          <span className="text-gray-500">Class:</span> {drug.class}
          <Tooltip content="Classification of the drug based on its mechanism of action">
            <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
          </Tooltip>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Half-life:</span> {drug.halfLife}
          <Tooltip content="Time required for the concentration to be reduced by 50%">
            <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
          </Tooltip>
        </p>
        <div className="mt-4 space-y-2">
          <div className={`rounded-md p-2 ${getCellColor(drug.normofractionatedRT)}`}>
            <span className="font-medium">Normofractionated RT:</span> {drug.normofractionatedRT}
            <Tooltip content="Standard fractionation radiotherapy timing">
              <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
            </Tooltip>
          </div>
          <div className={`rounded-md p-2 ${getCellColor(drug.palliativeRT)}`}>
            <span className="font-medium">Palliative RT:</span> {drug.palliativeRT}
            <Tooltip content="Palliative radiotherapy timing">
              <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
            </Tooltip>
          </div>
          <div className={`rounded-md p-2 ${getCellColor(drug.stereotacticRT)}`}>
            <span className="font-medium">Stereotactic RT:</span> {drug.stereotacticRT}
            <Tooltip content="Stereotactic radiotherapy timing">
              <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
            </Tooltip>
          </div>
          <div className={`rounded-md p-2 ${getCellColor(drug.intracranialRT)}`}>
            <span className="font-medium">Intracranial RT:</span> {drug.intracranialRT}
            <Tooltip content="Intracranial radiotherapy timing">
              <Info className="inline-block w-4 h-4 ml-1 text-gray-400" />
            </Tooltip>
          </div>
        </div>
        {drug.references && (
          <p className="text-xs text-gray-500 mt-2">
            References: {drug.references}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-7xl mx-auto my-8 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600 text-white rounded-t-lg p-8">
        <CardTitle className="text-3xl font-bold tracking-tight">Drug-Radiotherapy Association Explorer</CardTitle>
        <p className="mt-2 text-blue-100">Explore drug interactions and timing with different radiotherapy types</p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Drugs', value: filterAndSortDrugs().length },
            { label: 'Chemotherapy', value: filterAndSortDrugs().filter(d => d.category === 'chemotherapy').length },
            { label: 'Endocrine', value: filterAndSortDrugs().filter(d => d.category === 'endocrine').length },
            { label: 'Targeted', value: filterAndSortDrugs().filter(d => d.category === 'targeted').length },
            { label: 'Immunotherapy', value: filterAndSortDrugs().filter(d => d.category === 'immunotherapy').length }
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for a drug..."
              className="pl-10 h-12 w-full border-2 border-gray-200 hover:border-blue-500 transition-colors rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-blue-500 transition-colors cursor-pointer bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="chemotherapy">Chemotherapy</option>
            <option value="endocrine">Endocrine Therapy</option>
            <option value="targeted">Targeted Therapy</option>
            <option value="immunotherapy">Immunotherapy</option>
          </select>

          <select
            className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-blue-500 transition-colors cursor-pointer bg-white"
            value={halfLifeFilter}
            onChange={(e) => setHalfLifeFilter(e.target.value)}
          >
            <option value="all">All Half-lives</option>
            <option value="short">Short (≤24h)</option>
            <option value="long">Long (>24h)</option>
          </select>

          <select
            className="h-12 w-full border-2 border-gray-200 rounded-lg px-4 hover:border-blue-500 transition-colors cursor-pointer bg-white"
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

        <div className="flex justify-end">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Download className="h-5 w-5" />
            Export to CSV
          </button>
        </div>

<div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg shadow-lg">
  <table className="w-full border-collapse bg-white table-fixed">
    <thead className="sticky top-0 bg-gray-50 z-10">
      <tr>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/6">Drug Name</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/6">Class</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Category</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Half-life</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Normo RT</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Pallia RT</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Stereo RT</th>
        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 w-1/12">Intra RT</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {filterAndSortDrugs().map((drug, index) => (
        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out text-xs">
          <td className="px-3 py-2 whitespace-normal">{drug.name}</td>
          <td className="px-3 py-2 whitespace-normal text-gray-500">
            <Tooltip content={drug.class}>
              {drug.class.length > 30 ? `${drug.class.substring(0, 30)}...` : drug.class}
            </Tooltip>
          </td>
          <td className="px-3 py-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(drug.category)}`}>
              {drug.category.substring(0, 3)}
            </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-gray-500">{drug.halfLife}</td>
          <td className={`px-3 py-2 whitespace-nowrap ${getCellColor(drug.normofractionatedRT)}`}>
            {drug.normofractionatedRT}
          </td>
          <td className={`px-3 py-2 whitespace-nowrap ${getCellColor(drug.palliativeRT)}`}>
            {drug.palliativeRT}
          </td>
          <td className={`px-3 py-2 whitespace-nowrap ${getCellColor(drug.stereotacticRT)}`}>
            {drug.stereotacticRT}
          </td>
          <td className={`px-3 py-2 whitespace-nowrap ${getCellColor(drug.intracranialRT)}`}>
            {drug.intracranialRT}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mt-4">
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
    </Card>
  );
};

export default DrugExplorer;