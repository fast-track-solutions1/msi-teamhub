'use client';

import { Users, Briefcase } from 'lucide-react';
import { Service } from '@/lib/service-api';
import { Societe } from '@/lib/societe-api';
import { Salarie } from '@/lib/salarie-api';

interface ServiceDirectoryTableProps {
  services: Service[];
  societes: Societe[];
  salaries: Salarie[];
  onServiceClick?: (service: Service) => void;
}

export default function ServiceDirectoryTable({
  services,
  societes,
  salaries,
  onServiceClick,
}: ServiceDirectoryTableProps) {
  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';
  
  const getSalarieCountForService = (serviceId: number) => {
    return salaries.filter((s) => s.service === serviceId).length;
  };

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Briefcase className="h-20 w-20 text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium">
          Aucun service à afficher
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full divide-y divide-slate-200 dark:divide-slate-700 text-base">
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
          <tr>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Nom
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Description
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Responsable
            </th>
            <th className="px-8 py-5 text-left text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Société
            </th>
            <th className="px-8 py-5 text-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Salariés
            </th>
            <th className="px-8 py-5 text-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Statut
            </th>
            <th className="px-8 py-5 text-center text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">
              Création
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {services.map((service) => (
            <tr
              key={service.id}
              className="hover:bg-purple-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
              onClick={() => onServiceClick?.(service)}
            >
              {/* Nom */}
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {service.nom}
                  </span>
                </div>
              </td>

              {/* Description */}
              <td className="px-8 py-6 text-slate-600 dark:text-slate-300 text-base">
                {service.description ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 max-w-xs truncate">
                    {service.description}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">—</span>
                )}
              </td>

              {/* Responsable */}
              <td className="px-8 py-6 text-slate-600 dark:text-slate-300 text-base font-medium">
                {service.responsable_info ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {service.responsable_info}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">—</span>
                )}
              </td>

              {/* Société */}
              <td className="px-8 py-6 text-slate-600 dark:text-slate-300 text-base font-medium">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {getSocieteName(service.societe)}
                </span>
              </td>

              {/* Nombre de salariés */}
              <td className="px-8 py-6 text-center">
                <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-600 dark:text-green-300 font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                  {getSalarieCountForService(service.id)}
                </span>
              </td>

              {/* Statut */}
              <td className="px-8 py-6 text-center">
                {service.actif ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-md animate-pulse" />
                    <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Actif
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                      Inactif
                    </span>
                  </div>
                )}
              </td>

              {/* Date création */}
              <td className="px-8 py-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                {new Date(service.date_creation).toLocaleDateString('fr-FR', {
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