'use client';

import React from 'react';

interface HierarchyControlsProps {
  onFilterChange: (filters: any) => void;
  grades: string[];
  statuts: string[];
  departements: string[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  totalEmployees: number;
  filteredCount: number;
}

export default function HierarchyControls({
  onFilterChange,
  grades,
  statuts,
  departements,
  isDarkMode,
  onDarkModeToggle,
  totalEmployees,
  filteredCount,
}: HierarchyControlsProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGrade, setSelectedGrade] = React.useState('');
  const [selectedStatut, setSelectedStatut] = React.useState('');
  const [selectedDepartement, setSelectedDepartement] = React.useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({
      searchQuery: value,
      selectedGrade,
      selectedStatut,
      selectedDepartement,
    });
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    onFilterChange({
      searchQuery,
      selectedGrade: value,
      selectedStatut,
      selectedDepartement,
    });
  };

  const handleStatutChange = (value: string) => {
    setSelectedStatut(value);
    onFilterChange({
      searchQuery,
      selectedGrade,
      selectedStatut: value,
      selectedDepartement,
    });
  };

  const handleDepartementChange = (value: string) => {
    setSelectedDepartement(value);
    onFilterChange({
      searchQuery,
      selectedGrade,
      selectedStatut,
      selectedDepartement: value,
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('');
    setSelectedStatut('');
    setSelectedDepartement('');
    onFilterChange({
      searchQuery: '',
      selectedGrade: '',
      selectedStatut: '',
      selectedDepartement: '',
    });
  };

  return (
    <div className={`p-6 rounded-lg mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      {/* Titre et stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            🔍 Filtres & Recherche
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {filteredCount} / {totalEmployees} employé{totalEmployees > 1 ? 's' : ''}
          </p>
        </div>

        {/* Bouton Dark Mode */}
        <button
          onClick={onDarkModeToggle}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isDarkMode
              ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
        >
          {isDarkMode ? '☀️ Clair' : '🌙 Sombre'}
        </button>
      </div>

      {/* Grille de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Recherche */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Nom, prénom..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Grade */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Grade
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Tous les grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Statut
          </label>
          <select
            value={selectedStatut}
            onChange={(e) => handleStatutChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Tous les statuts</option>
            {statuts.map((statut) => (
              <option key={statut} value={statut}>
                {statut}
              </option>
            ))}
          </select>
        </div>

        {/* Département */}
        <div>
          <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Département
          </label>
          <select
            value={selectedDepartement}
            onChange={(e) => handleDepartementChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Tous les départements</option>
            {departements.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton Réinitialiser */}
      <div className="flex justify-end">
        <button
          onClick={handleResetFilters}
          className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
        >
          🔄 Réinitialiser les filtres
        </button>
      </div>
    </div>
  );
}