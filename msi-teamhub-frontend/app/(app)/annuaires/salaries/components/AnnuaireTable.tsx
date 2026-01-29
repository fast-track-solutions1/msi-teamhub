'use client';

import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';
import { Departement } from '@/lib/departement-api';
import { Eye, ArrowUp, ArrowDown } from 'lucide-react';

interface AnnuaireTableProps {
  salaries: Salarie[];
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  departements: Departement[];
  allSalaries?: Salarie[];
  onRowClick: (id: number) => void;
  sortField?: 'nom' | 'prenom' | 'matricule' | 'departement';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'nom' | 'prenom' | 'matricule' | 'departement') => void;
}

export default function AnnuaireTable({
  salaries,
  societes,
  services,
  grades,
  departements,
  allSalaries = [],
  onRowClick,
  sortField = 'nom',
  sortOrder = 'asc',
  onSort,
}: AnnuaireTableProps) {
  if (!departements || !Array.isArray(departements)) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">⚠️ Données incomplètes: departements est undefined</p>
      </div>
    );
  }

  const getResponsableName = (responsableId: number | null): string => {
    if (!responsableId) return 'N/A';
    const searchArray = allSalaries && allSalaries.length > 0 ? allSalaries : salaries;
    const responsable = searchArray.find(s => s.id === responsableId);
    return responsable ? `${responsable.prenom} ${responsable.nom}` : 'Inconnu';
  };

  const getServiceName = (serviceId: number | null): string => {
    if (!serviceId) return 'N/A';
    const service = services.find(s => s.id === serviceId);
    return service ? service.nom : 'Inconnu';
  };

  const getGradeName = (gradeId: number | null): string => {
    if (!gradeId) return 'N/A';
    const grade = grades.find(g => g.id === gradeId);
    return grade ? grade.nom : 'Inconnu';
  };

  const getDepartementNames = (depts: number[]): string => {
    if (!depts || depts.length === 0) return 'N/A';
    return depts
      .map(id => departements.find(d => d.id === id)?.numero || 'N/A')
      .join(', ');
  };

  const getRegions = (depts: number[]): string => {
    if (!depts || depts.length === 0) return 'N/A';
    const regions = new Set(
      depts
        .map(id => departements.find(d => d.id === id)?.region)
        .filter(Boolean)
    );
    return regions.size > 0 ? Array.from(regions).join(', ') : 'N/A';
  };

  const formatStatut = (statut: string): string => {
    const statutMap: Record<string, string> = {
      actif: '✅ Actif',
      suspendu: '⏸️ Suspendu',
      absent: '❌ Absent',
      conge: '🏖️ Congé',
    };
    return statutMap[statut?.toLowerCase()] || statut || 'N/A';
  };

  if (salaries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Aucun salarié à afficher</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <th
              onClick={() => onSort?.('prenom')}
              className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Prénom
                {sortField === 'prenom' && (
                  sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                )}
              </div>
            </th>
            <th
              onClick={() => onSort?.('nom')}
              className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Nom
                {sortField === 'nom' && (
                  sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                )}
              </div>
            </th>
            <th
              onClick={() => onSort?.('matricule')}
              className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Matricule
                {sortField === 'matricule' && (
                  sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                )}
              </div>
            </th>
            <th
              onClick={() => onSort?.('departement')}
              className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                Département(s)
                {sortField === 'departement' && (
                  sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Région
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Grade
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Poste
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Responsable Direct
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Statut
            </th>
            <th className="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((salarie, idx) => (
            <tr
              key={salarie.id}
              className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <td className="px-6 py-4 text-slate-900 dark:text-white">{salarie.prenom}</td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">{salarie.nom}</td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">{salarie.matricule}</td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">
                {getDepartementNames(salarie.departements || [])}
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">
                {getRegions(salarie.departements || [])}
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">
                {getGradeName(salarie.grade)}
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">
                {salarie.poste || 'N/A'}
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white font-medium text-indigo-600 dark:text-indigo-400">
                {getResponsableName(salarie.responsable_direct)}
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">
                {formatStatut(salarie.statut)}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onRowClick(salarie.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  title="Voir la fiche"
                >
                  <Eye size={16} />
                  Voir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
