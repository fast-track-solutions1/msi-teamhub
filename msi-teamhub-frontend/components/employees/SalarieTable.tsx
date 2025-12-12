'use client';

import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface SalarieTableProps {
  salaries: Salarie[];
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  onEdit: (salarie: Salarie) => void;
  onDelete: (id: number) => void;
  sortField: 'nom' | 'prenom' | 'matricule' | 'date_embauche';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'prenom' | 'matricule' | 'date_embauche') => void;
}

export default function SalarieTable({
  salaries,
  societes,
  services,
  grades,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: SalarieTableProps) {
  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';
  const getServiceName = (id: number | null) => services.find((s) => s.id === id)?.nom || 'N/A';
  const getGradeName = (id: number | null) => grades.find((g) => g.id === id)?.nom || 'N/A';

  // ✅ NOUVEAU - Générer initiales
  const getInitials = (nom: string, prenom: string) => {
    if (!nom && !prenom) return '?';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (statut: string) => {
    const colors: { [key: string]: string } = {
      actif: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      suspendu: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
      absent: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
      conge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700',
      demission: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700',
      licencie: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
      retraite: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    };
    return colors[statut] || colors['actif'];
  };

  const formatStatut = (statut: string) => {
    const labels: { [key: string]: string } = {
      actif: 'Actif',
      suspendu: 'Suspendu',
      absent: 'Absent',
      conge: 'Congé',
      demission: 'Démission',
      licencie: 'Licencié',
      retraite: 'Retraité',
    };
    return labels[statut] || statut;
  };

  const SortButton = ({ field, label }: { field: 'nom' | 'prenom' | 'matricule' | 'date_embauche'; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <span>{label}</span>
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full border-collapse bg-white dark:bg-slate-900">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Photo
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <SortButton field="nom" label="Nom" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <SortButton field="prenom" label="Prénom" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <SortButton field="matricule" label="Matricule" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Société
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Grade
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <SortButton field="date_embauche" label="Date embauche" />
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {salaries.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                Aucun salarié trouvé
              </td>
            </tr>
          ) : (
            salaries.map((salarie) => (
              <tr
                key={salarie.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* ✅ NOUVEAU - Colonne Photo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {salarie.photo ? (
                    <img
                      src={salarie.photo}
                      alt={`${salarie.prenom} ${salarie.nom}`}
                      className="h-10 w-10 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {getInitials(salarie.nom, salarie.prenom)}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {salarie.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {salarie.prenom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">
                  {salarie.matricule}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {getSocieteName(salarie.societe)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {getServiceName(salarie.service)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {getGradeName(salarie.grade)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(salarie.statut)}`}>
                    {formatStatut(salarie.statut)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {new Date(salarie.date_embauche).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(salarie)}
                      className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(salarie.id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
