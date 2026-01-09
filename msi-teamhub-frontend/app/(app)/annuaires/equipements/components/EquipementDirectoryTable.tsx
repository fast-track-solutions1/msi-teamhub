'use client';

import { ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Equipment, EquipmentInstance } from '@/lib/equipement-api';

interface EquipementDirectoryTableProps {
  equipements: Equipment[];
  instances: EquipmentInstance[];
  sortField: 'nom' | 'stock_disponible' | 'date_creation';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'nom' | 'stock_disponible' | 'date_creation') => void;
  onViewInstances: (equipement: Equipment) => void;
}

const EQUIPEMENT_TYPES: Record<string, string> = {
  informatique: 'Informatique',
  mobilier: 'Mobilier',
  reseau: 'Réseau',
  securite: 'Sécurité',
  autre: 'Autre',
};

export default function EquipementDirectoryTable({
  equipements,
  instances,
  sortField,
  sortOrder,
  onSort,
  onViewInstances,
}: EquipementDirectoryTableProps) {
  const getInstanceCount = (equipmentId: number) => {
    return instances.filter((i) => i.equipement === equipmentId).length;
  };

  const SortIcon = (field: 'nom' | 'stock_disponible' | 'date_creation') => {
    if (sortField !== field) return <span className="text-xs text-slate-400">⇅</span>;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => onSort('nom')}
                  className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white"
                >
                  Nom
                  <SortIcon field="nom" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Stock Total
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => onSort('stock_disponible')}
                  className="flex items-center gap-2 justify-center hover:text-slate-900 dark:hover:text-white w-full"
                >
                  Disponible
                  <SortIcon field="stock_disponible" />
                </button>
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Instances
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {equipements.map((equipement) => {
              const instanceCount = getInstanceCount(equipement.id);
              const tauxUtilisation = equipement.stock_total > 0 
                ? Math.round(((equipement.stock_total - equipement.stock_disponible) / equipement.stock_total) * 100)
                : 0;

              return (
                <tr
                  key={equipement.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {equipement.nom}
                      </p>
                      {equipement.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {equipement.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                      {EQUIPEMENT_TYPES[equipement.type_equipement] || equipement.type_equipement}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm font-bold">
                      {equipement.stock_total}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm font-bold">
                        {equipement.stock_disponible}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        ({tauxUtilisation}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewInstances(equipement)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                      title={`${instanceCount} instance(s)`}
                    >
                      {instanceCount}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {equipement.actif ? (
                      <span className="inline-flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Actif
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Inactif
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onViewInstances(equipement)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Voir
                    </button>
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