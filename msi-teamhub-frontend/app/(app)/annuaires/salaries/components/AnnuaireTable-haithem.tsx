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
  onRowClick,
  sortField = 'nom',
  sortOrder = 'asc',
  onSort,
}: AnnuaireTableProps) {
  // Vérifier que departements existe
  if (!departements || !Array.isArray(departements)) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">⚠️ Données incomplètes: departements est undefined</p>
      </div>
    );
  }

  // Helpers
  const getServiceName = (id: number | null) => services.find((s) => s.id === id)?.nom || 'N/A';

  const getGradeName = (id: number | null) => grades.find((g) => g.id === id)?.nom || 'N/A';

  const getDepartementNames = (deptIds: number[]) => {
    if (!deptIds || deptIds.length === 0 || !departements) return 'N/A';
    return (
      departements
        .filter((d) => d && deptIds.includes(d.id))
        .map((d) => d.nom)
        .join(', ') || 'N/A'
    );
  };

  const getRegions = (deptIds: number[]) => {
    if (!deptIds || deptIds.length === 0 || !departements) return 'N/A';
    const regions = new Set(
      departements
        .filter((d) => d && deptIds.includes(d.id))
        .map((d) => d.region)
        .filter(Boolean)
    );
    return Array.from(regions).join(', ') || 'N/A';
  };

  const getResponsableName = (responsableId: number | null) => {
    if (!responsableId) return 'N/A';
    const responsable = salaries.find((s) => s.id === responsableId);
    return responsable ? `${responsable.prenom} ${responsable.nom}` : 'N/A';
  };

  const getStatusColor = (statut: string) => {
    const colors: { [key: string]: string } = {
      actif: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      suspendu: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      absent: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
      conge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    };
    return colors[statut] || colors['actif'];
  };

  const formatStatut = (statut: string) => {
    const labels: { [key: string]: string } = {
      actif: '✅ Actif',
      suspendu: '⚠️ Suspendu',
      absent: '❌ Absent',
      conge: '🏖️ Congé',
    };
    return labels[statut] || statut;
  };

  const SortIcon = ({ field }: { field: 'nom' | 'prenom' | 'matricule' | 'departement' }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-slate-900">
        <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
          <tr>
            <th
              onClick={() => onSort?.('prenom')}
              className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Prénom <SortIcon field="prenom" />
            </th>
            <th
              onClick={() => onSort?.('nom')}
              className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Nom <SortIcon field="nom" />
            </th>
            <th
              onClick={() => onSort?.('matricule')}
              className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Matricule <SortIcon field="matricule" />
            </th>
            <th
              onClick={() => onSort?.('departement')}
              className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Département(s) <SortIcon field="departement" />
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Région
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Grade
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Poste
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Responsable Direct
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
              Statut
            </th>
            <th className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {salaries.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="border border-slate-300 dark:border-slate-700 px-4 py-4 text-center text-slate-600 dark:text-slate-400"
              >
                Aucun salarié à afficher
              </td>
            </tr>
          ) : (
            salaries.map((salarie) => (
              <tr
                key={salarie.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-300 dark:border-slate-700 transition"
              >
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {salarie.prenom}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {salarie.nom}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {salarie.matricule}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {getDepartementNames(salarie.departements || [])}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {getRegions(salarie.departements || [])}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {getGradeName(salarie.grade)}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {salarie.poste || 'N/A'}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                  {getResponsableName(salarie.responsable_direct)}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(salarie.statut)}`}>
                    {formatStatut(salarie.statut)}
                  </span>
                </td>
                <td className="border border-slate-300 dark:border-slate-700 px-4 py-3 text-center">
                  <button
                    onClick={() => onRowClick(salarie.id)}
                    className="inline-flex items-center justify-center p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                    title="Voir détails"
                  >
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}