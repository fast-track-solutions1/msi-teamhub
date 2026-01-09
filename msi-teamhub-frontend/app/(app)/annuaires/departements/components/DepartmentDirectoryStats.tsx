'use client';

import { useMemo } from 'react';
import {
  Building2,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  MapPin,
} from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';
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

interface DepartmentDirectoryStatsProps {
  departements: Departement[];
  societes: Societe[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DepartmentDirectoryStats({
  departements,
  societes,
}: DepartmentDirectoryStatsProps) {
  const stats = useMemo(() => {
    const total = departements.length;
    const actifs = departements.filter((d) => d.actif).length;
    const inactifs = total - actifs;

    const totalCircuits = departements.reduce((sum, d) => sum + d.nombre_circuits, 0);
    const avgCircuitsByDept = total > 0 ? (totalCircuits / total).toFixed(1) : '0';

    // Départements par société
    const bySociete = societes
      .map((s) => ({
        nom: s.nom.substring(0, 20),
        fullName: s.nom,
        deptCount: departements.filter((d) => d.societe === s.id).length,
        circuitsCount: departements
          .filter((d) => d.societe === s.id)
          .reduce((sum, d) => sum + d.nombre_circuits, 0),
      }))
      .filter((s) => s.deptCount > 0 || s.circuitsCount > 0)
      .sort((a, b) => b.deptCount - a.deptCount);

    // Département le plus fourni en circuits
    const topDept = departements.reduce(
      (prev, current) =>
        current.nombre_circuits > prev.nombre_circuits ? current : prev,
      departements
    );

    const pieData = [
      { name: 'Actifs', value: actifs },
      { name: 'Inactifs', value: inactifs },
    ];

    // Distribution des circuits par société
    const circuitsDistribution = bySociete.map((s) => ({
      name: s.nom,
      circuits: s.circuitsCount,
    }));

    return {
      total,
      actifs,
      inactifs,
      totalCircuits,
      avgCircuitsByDept,
      bySociete,
      topDept,
      pieData,
      circuitsDistribution,
    };
  }, [departements, societes]);

  return (
    <div className="space-y-8">
      {/* 🎯 Cartes statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Départements */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 border border-blue-200 dark:border-blue-700">
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
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-300 opacity-50" />
          </div>
        </div>

        {/* Total Circuits */}
        <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 p-6 border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
                Total Circuits
              </p>
              <p className="mt-2 text-4xl font-bold text-indigo-900 dark:text-indigo-100">
                {stats.totalCircuits}
              </p>
              <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-300">
                Moyenne: {stats.avgCircuitsByDept} par département
              </p>
            </div>
            <MapPin className="h-8 w-8 text-indigo-600 dark:text-indigo-300 opacity-50" />
          </div>
        </div>

        {/* Département le plus fourni */}
        <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                Département Majeur
              </p>
              {stats.topDept && (
                <>
                  <p className="mt-2 text-lg font-bold text-purple-900 dark:text-purple-100">
                    {stats.topDept.nom}
                  </p>
                  <p className="mt-2 text-xs text-purple-600 dark:text-purple-300">
                    {stats.topDept.nombre_circuits} circuits
                  </p>
                </>
              )}
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-300 opacity-50" />
          </div>
        </div>

        {/* Sociétés impliquées */}
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 border border-green-200 dark:border-green-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-300 uppercase tracking-wide">
                Sociétés Impliquées
              </p>
              <p className="mt-2 text-4xl font-bold text-green-900 dark:text-green-100">
                {stats.bySociete.length}
              </p>
              <p className="mt-2 text-xs text-green-600 dark:text-green-300">
                Avec départements actifs
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-300 opacity-50" />
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

        {/* Bar Chart - Circuits par société */}
        {stats.circuitsDistribution.length > 0 && (
          <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Circuits par Société
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={stats.circuitsDistribution}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="circuits" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📋 Détail par société */}
      {stats.bySociete.length > 0 && (
        <div className="rounded-lg bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
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
                    Départements
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Circuits
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                    Moyenne/Dept
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
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold">
                        {s.deptCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                        {s.circuitsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                      {s.deptCount > 0
                        ? (s.circuitsCount / s.deptCount).toFixed(1)
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
