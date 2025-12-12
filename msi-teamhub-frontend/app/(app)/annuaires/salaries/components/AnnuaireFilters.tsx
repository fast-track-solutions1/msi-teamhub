'use client';

import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';
import { Departement } from '@/lib/departement-api';
import { X, Filter } from 'lucide-react';
import { useState } from 'react';

interface AnnuaireFiltersProps {
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  departements: Departement[];
  salaries: Salarie[];
  selectedSociete: number | null;
  selectedService: number | null;
  selectedGrade: number | null;
  selectedDepartement: number | null;
  selectedRegion: string | null;
  selectedStatut: string | null;
  selectedResponsable: number | null;
  onSocieteChange: (id: number | null) => void;
  onServiceChange: (id: number | null) => void;
  onGradeChange: (id: number | null) => void;
  onDepartementChange: (id: number | null) => void;
  onRegionChange: (region: string | null) => void;
  onStatutChange: (statut: string | null) => void;
  onResponsableChange: (id: number | null) => void;
  onReset: () => void;
}

export default function AnnuaireFilters({
  societes,
  services,
  grades,
  departements,
  salaries,
  selectedSociete,
  selectedService,
  selectedGrade,
  selectedDepartement,
  selectedRegion,
  selectedStatut,
  selectedResponsable,
  onSocieteChange,
  onServiceChange,
  onGradeChange,
  onDepartementChange,
  onRegionChange,
  onStatutChange,
  onResponsableChange,
  onReset,
}: AnnuaireFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Récupérer les régions uniques
  const regions = Array.from(
    new Set(departements.map(d => d.region).filter(Boolean))
  );

  // Filtrer les services selon la société sélectionnée
  const filteredServices = selectedSociete
    ? services.filter(s => s.societe === selectedSociete)
    : services;

  // Filtrer les grades selon la société sélectionnée
  const filteredGrades = selectedSociete
    ? grades.filter(g => g.societe === selectedSociete)
    : grades;

  // Récupérer les responsables directs (salariés avec des subordonnés)
  const responsables = salaries
    .filter(s => salaries.some(other => other.responsable_direct === s.id))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const hasActiveFilters =
    selectedSociete ||
    selectedService ||
    selectedGrade ||
    selectedDepartement ||
    selectedRegion ||
    selectedStatut ||
    selectedResponsable;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      {/* === HEADER FILTRES === */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Filtres Avancés
          </span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
              {[selectedSociete, selectedService, selectedGrade, selectedDepartement, selectedRegion, selectedStatut, selectedResponsable].filter(Boolean).length}
            </span>
          )}
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* === CONTENU FILTRES === */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* === SOCIÉTÉ === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Société
              </label>
              <select
                value={selectedSociete || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : null;
                  onSocieteChange(val);
                  // Reset services et grades si changement de société
                  onServiceChange(null);
                  onGradeChange(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {societes.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {/* === SERVICE === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service
              </label>
              <select
                value={selectedService || ''}
                onChange={(e) => onServiceChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!selectedSociete && services.length > 10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Tous</option>
                {filteredServices.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {/* === GRADE === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade
              </label>
              <select
                value={selectedGrade || ''}
                onChange={(e) => onGradeChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!selectedSociete && grades.length > 10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Tous</option>
                {filteredGrades.map(g => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </select>
            </div>

            {/* === DÉPARTEMENT === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Département
              </label>
              <select
                value={selectedDepartement || ''}
                onChange={(e) => onDepartementChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {departements.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.numero} - {d.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* === RÉGION === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Région
              </label>
              <select
                value={selectedRegion || ''}
                onChange={(e) => onRegionChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* === STATUT === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={selectedStatut || ''}
                onChange={(e) => onStatutChange(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="actif">✅ Actif</option>
                <option value="inactif">❌ Inactif</option>
                <option value="conge">🏖️ Congé</option>
                <option value="arret_maladie">🏥 Arrêt maladie</option>
              </select>
            </div>

            {/* === RESPONSABLE DIRECT === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsable Direct
              </label>
              <select
                value={selectedResponsable || ''}
                onChange={(e) => onResponsableChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                {responsables.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.prenom} {r.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* === BOUTON RÉINITIALISER === */}
            <div className="flex items-end">
              <button
                onClick={onReset}
                disabled={!hasActiveFilters}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  hasActiveFilters
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}