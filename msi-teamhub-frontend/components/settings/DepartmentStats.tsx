'use client';

import { useMemo } from 'react';
import { MapPin, TrendingUp, Navigation, Users } from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentStatsProps {
  departements: Departement[];
  societes: Societe[];
}

export default function DepartmentStats({ departements }: DepartmentStatsProps) {
  // 📊 Calcul des statistiques
  const stats = useMemo(() => {
    const total = departements.length;
    const actifs = departements.filter((d) => d.actif).length;
    const inactifs = total - actifs;

    const totalCircuits = departements.reduce(
      (sum, d) => sum + (d.nombre_circuits ?? 0),
      0
    );
    const totalChauffeurs = departements.reduce(
      (sum, d) => sum + (d.nombre_chauffeurs ?? 0),
      0
    );
    const moyenneChauffeursParDept = total > 0 ? totalChauffeurs / total : 0;

    // Distribution par région (uniquement départements actifs)
    const byRegion = departements
      .filter((d) => d.actif)
      .reduce((acc, dept) => {
        const region = dept.region || 'Non spécifiée';
        if (!acc[region]) {
          acc[region] = { count: 0, circuits: 0, chauffeurs: 0 };
        }
        acc[region].count += 1;
        acc[region].circuits += dept.nombre_circuits ?? 0;
        acc[region].chauffeurs += dept.nombre_chauffeurs ?? 0;
        return acc;
      }, {} as Record<string, { count: number; circuits: number; chauffeurs: number }>);

    const regionsData = Object.entries(byRegion)
      .map(([nom, data]) => ({
        nom,
        count: data.count,
        circuits: data.circuits,
        chauffeurs: data.chauffeurs,
      }))
      .sort((a, b) => b.count - a.count); // 👈 plus de slice

    // Départements actifs triés par nombre de chauffeurs (liste complète)
    const departementsChauffeurs = departements
      .filter((d) => d.actif)
      .sort(
        (a, b) => (b.nombre_chauffeurs ?? 0) - (a.nombre_chauffeurs ?? 0)
      ); // 👈 plus de slice

    return {
      total,
      actifs,
      inactifs,
      totalCircuits,
      totalChauffeurs,
      moyenneChauffeursParDept,
      regionsData,
      departementsChauffeurs,
    };
  }, [departements]);

  // 🎨 Barre de progression
  const maxCountRegions = Math.max(...stats.regionsData.map((r) => r.count), 1);
  const maxChauffeursDept = Math.max(
    ...stats.departementsChauffeurs.map((d) => d.nombre_chauffeurs ?? 0),
    1
  );

  return (
    <div className="space-y-6">
      {/* 📊 Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total départements */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="text-blue-600 dark:text-blue-400" size={32} />
            <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Total départements
          </p>
        </div>

        {/* Départements actifs */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
            <span className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.actifs}
            </span>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Départements actifs
          </p>
        </div>

        {/* Départements inactifs */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="text-red-600 dark:text-red-400" size={32} />
            <span className="text-3xl font-bold text-red-900 dark:text-red-100">
              {stats.inactifs}
            </span>
          </div>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Départements inactifs
          </p>
        </div>

        {/* Total circuits */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="flex items-center justify-between mb-4">
            <Navigation className="text-purple-600 dark:text-purple-400" size={32} />
            <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalCircuits}
            </span>
          </div>
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Total circuits
          </p>
        </div>

        {/* Total chauffeurs */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-amber-600 dark:text-amber-400" size={32} />
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {stats.totalChauffeurs}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Moyenne {stats.moyenneChauffeursParDept.toFixed(1)} / dép.
              </div>
            </div>
          </div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            Total chauffeurs
          </p>
        </div>
      </div>

      {/* 📊 Graphiques de distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Régions (scrollable) */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Régions (départements actifs)
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
                    <span className="text-amber-600 dark:text-amber-400">
                      {region.chauffeurs} chauffeurs
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

        {/* Départements par chauffeurs (scrollable) */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-slate-600 dark:text-slate-400" size={24} />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Départements actifs par nombre de chauffeurs
            </h3>
          </div>

          <div className="space-y-4">
            {stats.departementsChauffeurs.map((dept) => (
              <div key={dept.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {dept.numero} - {dept.nom}
                  </span>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {dept.nombre_chauffeurs ?? 0} chauffeurs
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        ((dept.nombre_chauffeurs ?? 0) / maxChauffeursDept) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {stats.departementsChauffeurs.length === 0 && (
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