'use client';

import { useMemo } from 'react';
import { MapPin, TrendingUp, Navigation, Building2 } from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentStatsProps {
  departements: Departement[];
  societes: Societe[];
}

export default function DepartmentStats({ departements, societes }: DepartmentStatsProps) {
  // 📊 Calcul des statistiques
  const stats = useMemo(() => {
    const total = departements.length;
    const actifs = departements.filter((d) => d.actif).length;
    const inactifs = total - actifs;
    const totalCircuits = departements.reduce((sum, d) => sum + d.nombre_circuits, 0);

    // Distribution par région
    const byRegion = departements.reduce((acc, dept) => {
      const region = dept.region || 'Non spécifiée';
      if (!acc[region]) {
        acc[region] = { count: 0, circuits: 0 };
      }
      acc[region].count++;
      acc[region].circuits += dept.nombre_circuits;
      return acc;
    }, {} as Record<string, { count: number; circuits: number }>);

    const regionsData = Object.entries(byRegion)
      .map(([nom, data]) => ({ nom, count: data.count, circuits: data.circuits }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 régions

    // Distribution par société
    const bySociete = societes.map((societe) => {
      const depts = departements.filter((d) => d.societe === societe.id);
      const count = depts.length;
      const circuits = depts.reduce((sum, d) => sum + d.nombre_circuits, 0);
      return { nom: societe.nom, count, circuits };
    });

    return {
      total,
      actifs,
      inactifs,
      totalCircuits,
      regionsData,
      bySociete,
    };
  }, [departements, societes]);

  // 🎨 Barre de progression
  const maxCountRegions = Math.max(...stats.regionsData.map((r) => r.count), 1);
  const maxCountSocietes = Math.max(...stats.bySociete.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* 📊 Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="text-blue-600 dark:text-blue-400" size={32} />
            <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Départements</p>
        </div>

        {/* Actifs */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            <span className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.actifs}
            </span>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">Départements Actifs</p>
        </div>

        {/* Inactifs */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="text-red-600 dark:text-red-400" size={32} />
            <span className="text-3xl font-bold text-red-900 dark:text-red-100">
              {stats.inactifs}
            </span>
          </div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Départements Inactifs</p>
        </div>

        {/* Total circuits */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="flex items-center justify-between mb-4">
            <Navigation className="text-purple-600 dark:text-purple-400" size={32} />
            <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalCircuits}
            </span>
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Circuits</p>
        </div>
      </div>

      {/* 📊 Graphiques de distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par région */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top 5 Régions
            </h3>
          </div>

          <div className="space-y-4">
            {stats.regionsData.map((region, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {region.nom}
                  </span>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {region.count} dép.
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {region.circuits} circuits
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(region.count / maxCountRegions) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {stats.regionsData.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </div>

        {/* Distribution par société */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Distribution par société
            </h3>
          </div>

          <div className="space-y-4">
            {stats.bySociete.map((societe, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {societe.nom}
                  </span>
                  <div className="flex gap-3 text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {societe.count} dép.
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      {societe.circuits} circuits
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(societe.count / maxCountSocietes) * 100}%` }}
                  />
                </div>
              </div>
            ))}

            {stats.bySociete.length === 0 && (
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
