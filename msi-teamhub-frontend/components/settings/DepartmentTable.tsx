'use client';

import { Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentTableProps {
  departements: Departement[];
  societes: Societe[];
  onEdit: (departement: Departement) => void;
  onDelete: (id: number) => void;
  sortField: 'numero' | 'nom' | 'nombre_circuits' | 'date_creation';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'numero' | 'nom' | 'nombre_circuits' | 'date_creation') => void;
}

export default function DepartmentTable({
  departements,
  societes,
  onEdit,
  onDelete,
  sortField,
  sortOrder,
  onSort,
}: DepartmentTableProps) {
  const getSocieteNom = (societeId: number) => {
    return societes.find((s) => s.id === societeId)?.nom || 'N/A';
  };

  const SortIcon = ({ field }: { field: 'numero' | 'nom' | 'nombre_circuits' | 'date_creation' }) => {
    if (sortField !== field) return <ArrowUp size={14} className="text-slate-300" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="text-blue-600" />
    ) : (
      <ArrowDown size={14} className="text-blue-600" />
    );
  };

  // ✅ Fonction pour obtenir le nombre de circuits de manière sécurisée
  const getNombreCircuits = (dept: Departement): number => {
    const value = dept.nombre_circuits;
    if (value == null || isNaN(value)) {
      console.warn(`⚠️ Nombre circuits invalide pour ${dept.numero}:`, value);
      return 1; // Valeur par défaut
    }
    return value;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* 🎯 En-tête avec tri */}
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th
                onClick={() => onSort('numero')}
                className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Numéro
                  <SortIcon field="numero" />
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
                Région
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Chef-lieu
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                Société
              </th>
              <th
                onClick={() => onSort('nombre_circuits')}
                className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  Circuits
                  <SortIcon field="nombre_circuits" />
                </div>
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
            {departements.map((dept) => {
              const nombreCircuits = getNombreCircuits(dept);
              
              return (
                <tr
                  key={dept.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {/* Numéro avec badge */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <MapPin size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="font-bold text-lg text-slate-900 dark:text-white">
                        {dept.numero}
                      </div>
                    </div>
                  </td>

                  {/* Nom */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{dept.nom}</div>
                  </td>

                  {/* Région */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {dept.region || <span className="text-slate-400 italic">-</span>}
                  </td>

                  {/* Chef-lieu */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {dept.chef_lieu || <span className="text-slate-400 italic">-</span>}
                  </td>

                  {/* Société */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {getSocieteNom(dept.societe)}
                  </td>

                  {/* Nombre de circuits - SÉCURISÉ */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {nombreCircuits}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date création */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {new Date(dept.date_creation).toLocaleDateString('fr-FR')}
                  </td>

                  {/* Statut */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {dept.actif ? (
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
                        onClick={() => onEdit(dept)}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => onDelete(dept.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
