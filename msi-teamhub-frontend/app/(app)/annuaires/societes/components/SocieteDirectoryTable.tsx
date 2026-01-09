'use client';

import { useMemo } from 'react';
import { Briefcase, Users, MapPin, Activity } from 'lucide-react';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Departement } from '@/lib/departement-api';
import { Salarie } from '@/lib/salarie-api';

interface SocieteDirectoryTableProps {
  societes: Societe[];
  services: Service[];
  departements: Departement[];
  salaries: Salarie[];
  onOpenServices: (societe: Societe) => void;
  onOpenSalaries: (societe: Societe) => void;
  onOpenDepartements: (societe: Societe) => void;
  onOpenCircuits: (societe: Societe) => void;
}

export default function SocieteDirectoryTable({
  societes,
  services,
  departements,
  salaries,
  onOpenServices,
  onOpenSalaries,
  onOpenDepartements,
  onOpenCircuits,
}: SocieteDirectoryTableProps) {
  const computedData = useMemo(() => {
    return societes.map((societe) => {
      const societeServices = services.filter((s) => s.societe === societe.id);
      const societeDepartements = departements.filter((d) => d.societe === societe.id);
      const societeSalaries = salaries.filter((s) =>
        societeServices.map((srv) => srv.id).includes(s.service || -1)
      );
      const totalCircuits = societeDepartements.reduce((sum, d) => sum + d.nombre_circuits, 0);

      return {
        ...societe,
        servicesCount: societeServices.length,
        salariesCount: societeSalaries.length,
        departementsCount: societeDepartements.length,
        circuitsCount: totalCircuits,
      };
    });
  }, [societes, services, departements, salaries]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Services
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Salariés
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Depts
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Circuits
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {computedData.map((societe) => (
              <tr
                key={societe.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Nom */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {societe.nom}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {societe.adresse || '—'}
                    </p>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                    {societe.email || '—'}
                  </span>
                </td>

                {/* Téléphone */}
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {societe.telephone || '—'}
                </td>

                {/* Services - CLIQUABLE */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenServices(societe)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-sm font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                    title={`${societe.servicesCount} service(s)`}
                  >
                    {societe.servicesCount}
                  </button>
                </td>

                {/* Salariés - CLIQUABLE */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenSalaries(societe)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors cursor-pointer"
                    title={`${societe.salariesCount} salarié(s)`}
                  >
                    {societe.salariesCount}
                  </button>
                </td>

                {/* Départements - CLIQUABLE */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenDepartements(societe)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-sm font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors cursor-pointer"
                    title={`${societe.departementsCount} département(s)`}
                  >
                    {societe.departementsCount}
                  </button>
                </td>

                {/* Circuits - CLIQUABLE (utilise le même modal que Depts) */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onOpenDepartements(societe)}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                    title={`${societe.circuitsCount} circuit(s)`}
                  >
                    {societe.circuitsCount}
                  </button>
                </td>

                {/* Statut */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {societe.actif ? (
                      <>
                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Actif
                        </span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          Inactif
                        </span>
                      </>
                    )}
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