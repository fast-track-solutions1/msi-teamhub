'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, ChevronUp } from 'lucide-react';
import { Grade } from '@/lib/grade-api';
import { Societe } from '@/lib/societe-api';

interface GradeTableProps {
  grades: Grade[];
  societes: Societe[];
  onEdit: (grade: Grade) => void;
  onDelete: (id: number) => void;
  sortField: 'nom' | 'ordre' | 'date_creation';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'ordre' | 'date_creation') => void;
}

export default function GradeTable({
  grades,
  societes,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: GradeTableProps) {
  const getSocieteNom = (societeId: number) => {
    return societes.find((s) => s.id === societeId)?.nom || 'N/A';
  };

  const SortIcon = ({ field }: { field: 'nom' | 'ordre' | 'date_creation' }) => {
    if (sortField !== field) return <ArrowUp size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  // 🎨 Badge hiérarchie avec couleur selon niveau
  const getHierarchyBadgeColor = (ordre: number) => {
    if (ordre === 0) return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    if (ordre <= 2) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (ordre <= 5) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* 🎯 En-tête avec tri */}
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                onClick={() => onSort('ordre')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Ordre
                  <SortIcon field="ordre" />
                </div>
              </th>
              <th
                onClick={() => onSort('nom')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Nom
                  <SortIcon field="nom" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Société
              </th>
              <th
                onClick={() => onSort('date_creation')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Date création
                  <SortIcon field="date_creation" />
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                Statut
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          {/* 📊 Données */}
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {grades.map((grade) => (
              <tr
                key={grade.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Ordre hiérarchique */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getHierarchyBadgeColor(
                        grade.ordre
                      )}`}
                    >
                      #{grade.ordre}
                    </span>
                    {grade.ordre === 0 && (
                      <ChevronUp className="text-purple-600 dark:text-purple-400" size={16} />
                    )}
                  </div>
                </td>

                {/* Nom */}
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-white">{grade.nom}</div>
                </td>

                {/* Société */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {getSocieteNom(grade.societe)}
                </td>

                {/* Date création */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(grade.date_creation).toLocaleDateString('fr-FR')}
                </td>

                {/* Statut */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {grade.actif ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Actif
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900">
                        <XCircle size={16} className="text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          Inactif
                        </span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Bouton Modifier */}
                    <button
                      onClick={() => onEdit(grade)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => onDelete(grade.id)}
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
      </div>
    </div>
  );
}
