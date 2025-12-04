'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, Briefcase, User } from 'lucide-react';
import { Service } from '@/lib/service-api';
import { Societe } from '@/lib/societe-api';

interface ServiceTableProps {
  services: Service[];
  societes: Societe[];
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  sortField: 'nom' | 'societe' | 'date_creation';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'societe' | 'date_creation') => void;
}

export default function ServiceTable({
  services,
  societes,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: ServiceTableProps) {
  const getSocieteNom = (societeId: number) => {
    return societes.find((s) => s.id === societeId)?.nom || 'N/A';
  };

  const SortIcon = ({ field }: { field: 'nom' | 'societe' | 'date_creation' }) => {
    if (sortField !== field) return <ArrowUp size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* 🎯 En-tête avec tri */}
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                onClick={() => onSort('nom')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Nom
                  <SortIcon field="nom" />
                </div>
              </th>
              <th
                onClick={() => onSort('societe')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Société
                  <SortIcon field="societe" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Responsable
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
            {services.map((service) => (
              <tr
                key={service.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Nom avec icône */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">{service.nom}</div>
                  </div>
                </td>

                {/* Société */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {getSocieteNom(service.societe)}
                </td>

                {/* Description */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs">
                  <div className="truncate">
                    {service.description || (
                      <span className="text-slate-400 italic">Aucune description</span>
                    )}
                  </div>
                </td>

                {/* Responsable */}
                <td className="px-6 py-4">
                  {service.responsable_info ? (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-slate-900 dark:text-white">
                        {service.responsable_info}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Aucun</span>
                  )}
                </td>

                {/* Date création */}
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {new Date(service.date_creation).toLocaleDateString('fr-FR')}
                </td>

                {/* Statut */}
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {service.actif ? (
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
                      onClick={() => onEdit(service)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => onDelete(service.id)}
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
