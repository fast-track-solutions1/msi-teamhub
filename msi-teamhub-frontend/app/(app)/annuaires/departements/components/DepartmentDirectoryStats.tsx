'use client';

import { useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  MapPin,
  Navigation,
  Users,
} from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentDirectoryStatsProps {
  departements: Departement[];
  societes: Societe[];
}

export default function DepartmentDirectoryStats({
  departements,
  societes,
}: DepartmentDirectoryStatsProps) {
  const stats = useMemo(() => {
    const total = departements.length;
    const actifs = departements.filter((d) => d.actif).length;
    const inactifs = total - actifs;

    const activeDepartements = departements.filter((d) => d.actif);

    const totalCircuits = departements.reduce(
      (sum, d) => sum + (d.nombre_circuits ?? 0),
      0
    );

    const totalChauffeurs = departements.reduce(
      (sum, d) => sum + ((d as any).nombre_chauffeurs ?? 0),
      0
    );

    const totalCircuitsActifs = activeDepartements.reduce(
      (sum, d) => sum + (d.nombre_circuits ?? 0),
      0
    );

    const totalChauffeursActifs = activeDepartements.reduce(
      (sum, d) => sum + ((d as any).nombre_chauffeurs ?? 0),
      0
    );

    const avgCircuitsByActiveDept =
      actifs > 0 ? (totalCircuitsActifs / actifs).toFixed(1) : '0';

    const avgChauffeursByActiveDept =
      actifs > 0 ? (totalChauffeursActifs / actifs).toFixed(1) : '0';

    const byRegion = departements.reduce((acc, dept) => {
      const region = dept.region || 'Non spécifiée';

      if (!acc[region]) {
        acc[region] = { count: 0, circuits: 0, chauffeurs: 0 };
      }

      acc[region].count += 1;
      acc[region].circuits += dept.nombre_circuits ?? 0;
      acc[region].chauffeurs += (dept as any).nombre_chauffeurs ?? 0;

      return acc;
    }, {} as Record<string, { count: number; circuits: number; chauffeurs: number }>);

    const regionsData = Object.entries(byRegion)
      .map(([nom, data]) => ({
        nom,
        count: data.count,
        circuits: data.circuits,
        chauffeurs: data.chauffeurs,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const bySociete = societes
      .map((s) => {
        const activeDepts = departements.filter(
          (d) => d.societe === s.id && d.actif
        );

        const deptCount = activeDepts.length;

        const circuitsCount = activeDepts.reduce(
          (sum, d) => sum + (d.nombre_circuits ?? 0),
          0
        );

        const chauffeursCount = activeDepts.reduce(
          (sum, d) => sum + ((d as any).nombre_chauffeurs ?? 0),
          0
        );

        return {
          nom: s.nom.substring(0, 20),
          fullName: s.nom,
          deptCount,
          circuitsCount,
          chauffeursCount,
          avgCircuits:
            deptCount > 0 ? (circuitsCount / deptCount).toFixed(1) : '0',
        };
      })
      .filter((s) => s.deptCount > 0)
      .sort((a, b) => b.deptCount - a.deptCount);

    const top5Societes = bySociete.slice(0, 5);

    const topDept =
      departements.length > 0
        ? departements.reduce((prev, current) =>
            (current.nombre_circuits ?? 0) > (prev.nombre_circuits ?? 0)
              ? current
              : prev
          )
        : null;

    return {
      total,
      actifs,
      inactifs,
      totalCircuits,
      totalChauffeurs,
      totalCircuitsActifs,
      totalChauffeursActifs,
      avgCircuitsByActiveDept,
      avgChauffeursByActiveDept,
      regionsData,
      bySociete,
      top5Societes,
      topDept,
    };
  }, [departements, societes]);

  const maxCountRegions = Math.max(...stats.regionsData.map((r) => r.count), 1);
  const maxCountSocietes = Math.max(...stats.top5Societes.map((s) => s.deptCount), 1);

  return (
    <div className="space-y-8">
      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 border border-blue-200 dark:border-blue-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                Total Départements
              </p>
              <p className="mt-2 text-4xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total}
              </p>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                {stats.actifs} actifs • {stats.inactifs} inactifs
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-300 opacity-60" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 p-6 border border-emerald-200 dark:border-emerald-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300 uppercase tracking-wide">
                Départements Actifs
              </p>
              <p className="mt-2 text-4xl font-bold text-emerald-900 dark:text-emerald-100">
                {stats.actifs}
              </p>
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">
                Base des moyennes affichées
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-300 opacity-60" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 p-6 border border-indigo-200 dark:border-indigo-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
                Circuits Actifs
              </p>
              <p className="mt-2 text-4xl font-bold text-indigo-900 dark:text-indigo-100">
                {stats.totalCircuitsActifs}
              </p>
              <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-300">
                Moyenne: {stats.avgCircuitsByActiveDept} / dept actif
              </p>
            </div>
            <Navigation className="h-8 w-8 text-indigo-600 dark:text-indigo-300 opacity-60" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 border border-purple-200 dark:border-purple-700 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                Chauffeurs Actifs
              </p>
              <p className="mt-2 text-4xl font-bold text-purple-900 dark:text-purple-100">
                {stats.totalChauffeursActifs}
              </p>
              <p className="mt-2 text-xs text-purple-600 dark:text-purple-300">
                Moyenne: {stats.avgChauffeursByActiveDept} / dept actif
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-300 opacity-60" />
          </div>
        </div>
      </div>

      {/* Bloc principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Département Majeur
          </h3>

          {stats.topDept ? (
            <div className="space-y-4">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {stats.topDept.nom}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stats.topDept.numero}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  {stats.topDept.nombre_circuits ?? 0} circuits
                </span>

                <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1 text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {(stats.topDept as any).nombre_chauffeurs ?? 0} chauffeurs
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune donnée disponible
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Top 5 Sociétés Actives
          </h3>

          <div className="space-y-4">
            {stats.top5Societes.length > 0 ? (
              stats.top5Societes.map((societe, index) => (
                <div key={societe.fullName} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {index + 1}. {societe.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {societe.deptCount} départements actifs • {societe.circuitsCount} circuits • {societe.chauffeursCount} chauffeurs
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-300">
                      {societe.avgCircuits}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${(societe.deptCount / maxCountSocietes) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top régions */}
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Top 5 Régions
        </h3>

        <div className="space-y-4">
          {stats.regionsData.length > 0 ? (
            stats.regionsData.map((region, index) => (
              <div key={region.nom} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {index + 1}. {region.nom}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {region.count} départements • {region.circuits} circuits • {region.chauffeurs} chauffeurs
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                    {region.count}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{
                      width: `${(region.count / maxCountRegions) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </div>

      {/* Détail par société */}
      {stats.bySociete.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Détails par Société
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                    Société
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Départements actifs
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Circuits actifs
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Moyenne/Dept
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.bySociete.map((s) => (
                  <tr
                    key={s.fullName}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {s.fullName}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[40px] h-6 px-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                        {s.deptCount}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[56px] h-6 px-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                        {s.circuitsCount}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">
                      {s.avgCircuits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}