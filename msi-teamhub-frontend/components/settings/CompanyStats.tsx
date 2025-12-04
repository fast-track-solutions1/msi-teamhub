'use client';

import { useMemo } from 'react';
import { Building2, TrendingUp, MapPin, Calendar } from 'lucide-react';
import { Societe } from '@/lib/societe-api';

interface CompanyStatsProps {
  societes: Societe[];
}

export default function CompanyStats({ societes }: CompanyStatsProps) {
  // 📊 Calcul des statistiques
  const stats = useMemo(() => {
    const total = societes.length;
    const actives = societes.filter((s) => s.actif).length;
    const inactives = total - actives;

    // Distribution par ville
    const byVille = societes.reduce((acc, societe) => {
      const ville = societe.ville || 'Non spécifié';
      acc[ville] = (acc[ville] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const villesData = Object.entries(byVille)
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 villes

    // Distribution par activité
    const byActivite = societes.reduce((acc, societe) => {
      const activite = societe.activite || 'Non spécifié';
      acc[activite] = (acc[activite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activitesData = Object.entries(byActivite)
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 activités

    // Société la plus récente
    const mostRecent = societes.reduce((prev, current) => {
      return new Date(prev.date_creation) > new Date(current.date_creation) ? prev : current;
    }, societes[0]);

    return {
      total,
      actives,
      inactives,
      villesData,
      activitesData,
      mostRecent,
    };
  }, [societes]);

  // 🎨 Barre de progression
  const maxCountVilles = Math.max(...stats.villesData.map((v) => v.count), 1);
  const maxCountActivites = Math.max(...stats.activitesData.map((a) => a.count), 1);

  return (
    <div className="space-y-6">
      {/* 📊 Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="text-blue-600 dark:text-blue-400" size={32} />
            <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Sociétés</p>
        </div>

        {/* Actives */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            <span className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.actives}
            </span>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Sociétés Actives</p>
        </div>

        {/* Inactives */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <div className="flex items-center justify-between mb-4">
            <Building2 className="text-red-600 dark:text-red-400" size={32} />
            <span className="text-3xl font-bold text-red-900 dark:text-red-100">
              {stats.inactives}
            </span>
          </div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Sociétés Inactives</p>
        </div>

        {/* Plus récente */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-purple-600 dark:text-purple-400" size={32} />
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
            Plus récente
          </p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100 truncate">
            {stats.mostRecent?.nom || 'N/A'}
          </p>
        </div>
      </div>

      {/* 📊 Graphiques de distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par ville */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top 5 Villes
            </h3>
          </div>

          <div className="space-y-4">
            {stats.villesData.map((ville, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {ville.nom}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {ville.count} société{ville.count > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(ville.count / maxCountVilles) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {stats.villesData.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>

        {/* Distribution par activité */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top 5 Activités
            </h3>
          </div>

          <div className="space-y-4">
            {stats.activitesData.map((activite, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {activite.nom}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {activite.count}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(activite.count / maxCountActivites) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {stats.activitesData.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
