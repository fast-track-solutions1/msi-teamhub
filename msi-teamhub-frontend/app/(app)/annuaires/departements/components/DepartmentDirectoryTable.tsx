'use client';

import { CheckCircle, XCircle, MapPin } from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentDirectoryTableProps {
  departements: Departement[];
  societes: Societe[];
  onDepartmentClick?: (departement: Departement) => void;
}

export default function DepartmentDirectoryTable({
  departements,
  societes,
  onDepartmentClick,
}: DepartmentDirectoryTableProps) {
  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';

  if (departements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <MapPin className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Aucun département à afficher
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Numéro
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Région
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Chef-lieu
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Société
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Circuits
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Création
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {departements.map((dept) => (
            <tr
              key={dept.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => onDepartmentClick?.(dept)}
            >
              {/* Numéro avec icône */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {dept.numero}
                  </span>
                </div>
              </td>

              {/* Nom */}
              <td className="px-6 py-4 text-slate-900 dark:text-slate-100 font-medium">
                {dept.nom}
              </td>

              {/* Région */}
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {dept.region || '—'}
              </td>

              {/* Chef-lieu */}
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {dept.chef_lieu || '—'}
              </td>

              {/* Société */}
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                {getSocieteName(dept.societe)}
              </td>

              {/* Nombre de circuits */}
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                  {dept.nombre_circuits}
                </span>
              </td>

              {/* Statut */}
              <td className="px-6 py-4 text-center">
                {dept.actif ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      Actif
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      Inactif
                    </span>
                  </div>
                )}
              </td>

              {/* Date création */}
              <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                {new Date(dept.date_creation).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
