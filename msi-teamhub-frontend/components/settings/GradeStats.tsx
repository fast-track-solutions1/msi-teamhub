'use client';

import { useMemo } from 'react';
import { BarChart2, TrendingUp, Award, Building2 } from 'lucide-react';
import { Grade } from '@/lib/grade-api';
import { Societe } from '@/lib/societe-api';

interface GradeStatsProps {
  grades: Grade[];
  societes: Societe[];
}

export default function GradeStats({ grades, societes }: GradeStatsProps) {
  // 📊 Calcul des statistiques
  const stats = useMemo(() => {
    const total = grades.length;
    const actifs = grades.filter((g) => g.actif).length;
    const inactifs = total - actifs;

    // Distribution par société
    const bySociete = societes.map((societe) => {
      const count = grades.filter((g) => g.societe === societe.id).length;
      return { nom: societe.nom, count };
    });

    // Grade le plus haut (ordre le plus bas)
    const topGrade = grades.reduce((prev, current) => {
      return prev.ordre < current.ordre ? prev : current;
    }, grades[0]);

    return {
      total,
      actifs,
      inactifs,
      bySociete,
      topGrade,
    };
  }, [grades, societes]);

  // 🎨 Barre de progression pour distribution
  const maxCount = Math.max(...stats.bySociete.map((s) => s.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 📊 Total */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <div className="flex items-center justify-between mb-4">
          <BarChart2 className="text-blue-600 dark:text-blue-400" size={32} />
          <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {stats.total}
          </span>
        </div>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Grades</p>
      </div>

      {/* ✅ Actifs */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
          <span className="text-3xl font-bold text-green-900 dark:text-green-100">
            {stats.actifs}
          </span>
        </div>
        <p className="text-sm font-medium text-green-700 dark:text-green-300">Grades Actifs</p>
      </div>

      {/* ❌ Inactifs */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <div className="flex items-center justify-between mb-4">
          <Award className="text-red-600 dark:text-red-400" size={32} />
          <span className="text-3xl font-bold text-red-900 dark:text-red-100">
            {stats.inactifs}
          </span>
        </div>
        <p className="text-sm font-medium text-red-700 dark:text-red-300">Grades Inactifs</p>
      </div>

      {/* 🏆 Grade le plus élevé */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-purple-600 dark:text-purple-400" size={32} />
        </div>
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
          Grade le plus élevé
        </p>
        <p className="text-lg font-bold text-purple-900 dark:text-purple-100 truncate">
          {stats.topGrade?.nom || 'N/A'}
        </p>
      </div>

      {/* 📊 Distribution par société */}
      <div className="md:col-span-2 lg:col-span-4 p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
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
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {societe.count} grade{societe.count > 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(societe.count / maxCount) * 100}%` }}
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
  );
}
