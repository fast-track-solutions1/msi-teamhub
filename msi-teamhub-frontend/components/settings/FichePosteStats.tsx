// components/settings/fiches/FichePosteStats.tsx

'use client';

import { FileText, AlertCircle, RefreshCw, Archive } from 'lucide-react';
import { FichePoste } from '@/lib/ficheposte-api';

interface FichePosteStatsProps {
  fiches: FichePoste[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function FichePosteStats({ fiches, isLoading, onRefresh }: FichePosteStatsProps) {
  // Calculer les statistiques
  const stats = {
    total: fiches.length,
    actives: fiches.filter((f) => f.statut === 'actif').length,
    enRevision: fiches.filter((f) => f.statut === 'enrevision').length,
    archivees: fiches.filter((f) => f.statut === 'archivé').length,
  };

  const getStatutDistribution = () => {
    if (stats.total === 0) return [];
    return [
      {
        label: 'Actives',
        count: stats.actives,
        percentage: ((stats.actives / stats.total) * 100).toFixed(1),
        color: 'bg-green-100 dark:bg-green-900',
        textColor: 'text-green-700 dark:text-green-300',
        barColor: 'bg-green-500',
      },
      {
        label: 'En révision',
        count: stats.enRevision,
        percentage: ((stats.enRevision / stats.total) * 100).toFixed(1),
        color: 'bg-amber-100 dark:bg-amber-900',
        textColor: 'text-amber-700 dark:text-amber-300',
        barColor: 'bg-amber-500',
      },
      {
        label: 'Archivées',
        count: stats.archivees,
        percentage: ((stats.archivees / stats.total) * 100).toFixed(1),
        color: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        barColor: 'bg-slate-500',
      },
    ];
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    bgColor,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    bgColor: string;
  }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-opacity-20`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
        {Icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <StatCard
          icon={
            <FileText
              size={24}
              className="text-blue-600 dark:text-blue-400"
            />
          }
          title="Total"
          value={stats.total}
          subtitle="fiches de poste"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />

        {/* Actives */}
        <StatCard
          icon={
            <AlertCircle
              size={24}
              className="text-green-600 dark:text-green-400"
            />
          }
          title="Actives"
          value={stats.actives}
          subtitle={`${((stats.actives / stats.total) * 100 || 0).toFixed(0)}% du total`}
          bgColor="bg-green-50 dark:bg-green-900/20"
        />

        {/* En révision */}
        <StatCard
          icon={
            <RefreshCw
              size={24}
              className="text-amber-600 dark:text-amber-400"
            />
          }
          title="En révision"
          value={stats.enRevision}
          subtitle={`${((stats.enRevision / stats.total) * 100 || 0).toFixed(0)}% du total`}
          bgColor="bg-amber-50 dark:bg-amber-900/20"
        />

        {/* Archivées */}
        <StatCard
          icon={
            <Archive
              size={24}
              className="text-slate-600 dark:text-slate-400"
            />
          }
          title="Archivées"
          value={stats.archivees}
          subtitle={`${((stats.archivees / stats.total) * 100 || 0).toFixed(0)}% du total`}
          bgColor="bg-slate-50 dark:bg-slate-800"
        />
      </div>

      {/* Distribution par statut */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">Distribution par statut</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw
                size={18}
                className={`text-slate-600 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {getStatutDistribution().map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <span className={`text-sm font-semibold ${item.textColor}`}>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${item.barColor} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau résumé */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Nombre
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Pourcentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {getStatutDistribution().map((item) => (
                <tr
                  key={item.label}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.barColor}`} />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                    {item.count}
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-medium ${item.textColor}`}>
                    {item.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

