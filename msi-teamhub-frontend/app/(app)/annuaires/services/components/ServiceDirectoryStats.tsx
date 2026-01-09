'use client';

import { useMemo } from 'react';
import {
  Briefcase,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users,
} from 'lucide-react';
import { Service } from '@/lib/service-api';
import { Societe } from '@/lib/societe-api';
import { Salarie } from '@/lib/salarie-api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ServiceDirectoryStatsProps {
  services: Service[];
  societes: Societe[];
  salaries: Salarie[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ServiceDirectoryStats({
  services,
  societes,
  salaries,
}: ServiceDirectoryStatsProps) {
  const stats = useMemo(() => {
    const total = services.length;
    const actifs = services.filter((s) => s.actif).length;
    const inactifs = total - actifs;

    const totalSalaries = salaries.length;
    const avgSalariesByService = total > 0 ? (totalSalaries / total).toFixed(1) : '0';

    // Services par société
    const bySociete = societes
      .map((s) => ({
        nom: s.nom.substring(0, 20),
        fullName: s.nom,
        serviceCount: services.filter((srv) => srv.societe === s.id).length,
        salariesCount: salaries.filter((sal) =>
          services.filter((srv) => srv.societe === s.id).map((srv) => srv.id).includes(sal.service || -1)
        ).length,
      }))
      .filter((s) => s.serviceCount > 0 || s.salariesCount > 0)
      .sort((a, b) => b.serviceCount - a.serviceCount);

    // Service le plus fourni en salariés
    const topService = services.reduce((prev, current) => {
      const prevCount = salaries.filter((s) => s.service === prev.id).length;
      const currentCount = salaries.filter((s) => s.service === current.id).length;
      return currentCount > prevCount ? current : prev;
    }, services[0]);

    const topServiceCount = salaries.filter((s) => s.service === topService?.id).length;

    const pieData = [
      { name: 'Actifs', value: actifs },
      { name: 'Inactifs', value: inactifs },
    ];

    return {
      total,
      actifs,
      inactifs,
      totalSalaries,
      avgSalariesByService,
      bySociete,
      topService,
      topServiceCount,
      pieData,
    };
  }, [services, societes, salaries]);

  return (
    <div className="space-y-8">
      {/* 🎯 Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Services */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                Total Services
              </p>
              <p className="mt-2 text-4xl font-bold text-purple-900 dark:text-purple-100">
                {stats.total}
              </p>
              <p className="mt-2 text-xs text-purple-600 dark:text-purple-300">
                {stats.actifs} actifs • {stats.inactifs} inactifs
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-300 opacity-50" />
          </div>
        </div>

        {/* Total Salariés */}
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">
                Total Salariés
              </p>
              <p className="mt-2 text-4xl font-bold text-green-900 dark:text-green-100">
                {stats.totalSalaries}
              </p>
              <p className="mt-2 text-xs text-green-600 dark:text-green-300">
                Moyenne: {stats.avgSalariesByService} par service
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-300 opacity-50" />
          </div>
        </div>

        {/* Service le plus fourni */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                Service Top
              </p>
              {stats.topService && (
                <>
                  <p className="mt-2 text-lg font-bold text-blue-900 dark:text-blue-100">
                    {stats.topService.nom}
                  </p>
                  <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                    {stats.topServiceCount} salariés
                  </p>
                </>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-300 opacity-50" />
          </div>
        </div>

        {/* Sociétés impliquées */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-300 uppercase tracking-wide">
                Sociétés Impliquées
              </p>
              <p className="mt-2 text-4xl font-bold text-orange-900 dark:text-orange-100">
                {stats.bySociete.length}
              </p>
              <p className="mt-2 text-xs text-orange-600 dark:text-orange-300">
                Avec services actifs
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* 📊 Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Actif/Inactif */}
        {stats.total > 0 && (
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <PieIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Répartition Statut
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Services par société */}
        {stats.bySociete.length > 0 && (
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Services par Société
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={stats.bySociete}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="nom"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="serviceCount" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📋 Détail par société */}
      {stats.bySociete.length > 0 && (
        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                    Services
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Salariés
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Moyenne/Service
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {stats.bySociete.map((s, index) => (
                  <tr
                    key={s.fullName}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {s.fullName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                        {s.serviceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-semibold">
                        {s.salariesCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                      {s.serviceCount > 0
                        ? (s.salariesCount / s.serviceCount).toFixed(1)
                        : '0'}
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