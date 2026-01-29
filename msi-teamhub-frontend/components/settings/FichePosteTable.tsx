// components/settings/fiches/FichePosteTable.tsx

'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { FichePoste } from '@/lib/ficheposte-api';
import { Service } from '@/lib/api/service-api';
import { Grade } from '@/lib/grade-api';

interface FichePosteTableProps {
  fiches: FichePoste[];
  services: Service[];
  grades: Grade[];
  onEdit: (fiche: FichePoste) => void;
  onDelete: (id: number) => void;
  sortField?: 'titre' | 'service' | 'statut' | 'datecreation';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'titre' | 'service' | 'statut' | 'datecreation') => void;
}

export default function FichePosteTable({
  fiches,
  services,
  grades,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: FichePosteTableProps) {
  const getGradeNom = (gradeId: number) => {
    return grades.find((g) => g.id === gradeId)?.nom || 'N/A';
  };
  const getServiceNom = (serviceId: number) => {
    return services.find((s) => s.id === serviceId)?.nom || 'N/A';
  };

  const SortIcon = (field: 'titre' | 'service' | 'statut' | 'datecreation') => {
    if (sortField !== field) {
      return <ArrowUp size={14} className="text-slate-300" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, string> = {
      actif: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      enrevision: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
      archiv: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    };
    return styles[statut] || styles.actif;
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      actif: 'Actif',
      enrevision: 'En révision',
      archiv: 'Archivé',
    };
    return labels[statut] || statut;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* En-tête avec tri */}
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {/* Colonne Titre */}
              <th
                onClick={() => onSort?.('titre')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Titre
                  {SortIcon('titre')}
                </div>
              </th>

              {/* Colonne Service */}
              <th
                onClick={() => onSort?.('service')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Service
                  {SortIcon('service')}
                </div>
              </th>

              {/* Colonne Grade */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Grade
              </th>

              {/* Colonne Responsable */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Responsable
              </th>

              {/* Colonne Statut */}
              <th
                onClick={() => onSort?.('statut')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Statut
                  {SortIcon('statut')}
                </div>
              </th>

              {/* Colonne Date */}
              <th
                onClick={() => onSort?.('datecreation')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Date création
                  {SortIcon('datecreation')}
                </div>
              </th>

              {/* Colonne Actions */}
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {fiches.map((fiche) => (
              <tr
                key={fiche.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Titre */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {fiche.titre}
                  </div>
                </td>

                {/* Service */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {getServiceNom(fiche.service)}
                </td>

                {/* Grade */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {getGradeNom(fiche.grade)}
                </td>

                {/* Responsable */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {fiche.responsable_info || '-'}
                </td>

                {/* Statut */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatutBadge(
                      fiche.statut,
                    )}`}
                  >
                    {getStatutLabel(fiche.statut)}
                  </span>
                </td>

                {/* Date création */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {fiche.date_creation ? new Date(fiche.date_creation).toLocaleDateString('fr-FR') : 'N/A'}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Bouton Modifier */}
                    <button
                      onClick={() => onEdit(fiche)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => onDelete(fiche.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Message vide */}
        {fiches.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p>Aucune fiche de poste trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}














