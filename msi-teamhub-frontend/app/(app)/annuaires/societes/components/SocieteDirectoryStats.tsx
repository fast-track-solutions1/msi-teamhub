'use client';

import { useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users,
  Briefcase,
} from 'lucide-react';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Departement } from '@/lib/departement-api';
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

interface SocieteDirectoryStatsProps {
  societes: Societe[];
  services: Service[];
  departements: Departement[];
  salaries: Salarie[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function SocieteDirectoryStats({
  societes,
  services,
  departements,
  salaries,
}: SocieteDirectoryStatsProps) {
  const stats = useMemo(() => {
    const total = societes.length;
    const actives = societes.filter((s) => s.actif).length;
    const inactives = total - actives;

    const totalServices = services.length;
    const totalSalaries = salaries.length;
    const totalDepartements = departements.length;
    const totalCircuits = departements.reduce((sum, d) => sum + d.nombre_circuits, 0);

    // Données par société (pour graphiques)
    const bySociete = societes.map((s) => {
      const societeServices = services.filter((srv) => srv.societe === s.id);
      const societeDepts = departements.filter((d) => d.societe === s.id);
      const societeSalaries = salaries.filter((sal) =>
        societeServices.map((srv) => srv.id).includes(sal.service || -1)
      );
      const societyCircuits = societeDepts.reduce((sum, d) => sum + d.nombre_circuits, 0);

      return {
        nom: s.nom.substring(0, 15),
        fullName: s.nom,
        serviceCount: societeServices.length,
        salarieCount: societeSalaries.length,
        deptCount: societeDepts.length,
        circuitCount: societyCircuits,
      };
    }).sort((a, b) => b.salarieCount - a.salarieCount);

    const pieData = [
      { name: 'Actives', value: actives },
      { name: 'Inactives', value: inactives },
    ];

    return {
      total,
      actives,
      inactives,
      totalServices,
      totalSalaries,
      totalDepartements,
      totalCircuits,
      avgSalariesBySociete: total > 0 ? (totalSalaries / total).toFixed(1) : '0',
      avgDepartementsBySociete: total > 0 ? (totalDepartements / total).toFixed(1) : '0',
      avgCircuitsBySociete: total > 0 ? (totalCircuits / total).toFixed(1) : '0',
      bySociete,
      pieData,
    };
  }, [societes, services, departements, salaries]);

  return (
    <div className="space-y-8">
      {/* 🎯 Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Sociétés */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                Total Sociétés
              </p>
              <p className="mt-2 text-4xl font-bold text-blue-900 dark:text-blue-100">
                {stats.total}
              </p>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">
                {stats.actives} actives • {stats.inactives} inactives
              </p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-300 opacity-50" />
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
                Moy: {stats.avgSalariesBySociete}/société
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-300 opacity-50" />
          </div>
        </div>

        {/* Total Services */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                Total Services
              </p>
              <p className="mt-2 text-4xl font-bold text-purple-900 dark:text-purple-100">
                {stats.totalServices}
              </p>
              <p className="mt-2 text-xs text-purple-600 dark:text-purple-300">
                Services
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-300 opacity-50" />
          </div>
        </div>

        {/* Total Circuits */}
        <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 border border-orange-200 dark:border-orange-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-300 uppercase tracking-wide">
                Total Circuits
              </p>
              <p className="mt-2 text-4xl font-bold text-orange-900 dark:text-orange-100">
                {stats.totalCircuits}
              </p>
              <p className="mt-2 text-xs text-orange-600 dark:text-orange-300">
                Moy: {stats.avgCircuitsBySociete}/société
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
              <PieIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

        {/* Bar Chart - Salariés par société */}
        {stats.bySociete.length > 0 && (
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
              Salariés par Société
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
                <Bar dataKey="salarieCount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📋 Détail complet par société */}
      {stats.bySociete.length > 0 && (
        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                    Départements
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Circuits
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
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                        {s.serviceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-semibold">
                        {s.salarieCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-xs font-semibold">
                        {s.deptCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                        {s.circuitCount}
                      </span>
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