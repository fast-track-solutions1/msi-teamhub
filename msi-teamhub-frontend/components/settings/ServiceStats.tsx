'use client';

import { useMemo } from 'react';
import { Briefcase, TrendingUp, UserCheck, Building2 } from 'lucide-react';
import { Service } from '@/lib/service-api';
import { Societe } from '@/lib/societe-api';

interface ServiceStatsProps {
  services: Service[];
  societes: Societe[];
}

export default function ServiceStats({ services, societes }: ServiceStatsProps) {
  // 📊 Calcul des statistiques
  const stats = useMemo(() => {
    const total = services.length;
    const actifs = services.filter((s) => s.actif).length;
    const inactifs = total - actifs;
    const avecResponsable = services.filter((s) => s.responsable).length;
    const sansResponsable = total - avecResponsable;

    // Distribution par société
    const bySociete = societes.map((societe) => {
      const count = services.filter((s) => s.societe === societe.id).length;
      return { nom: societe.nom, count };
    });

    return {
      total,
      actifs,
      inactifs,
      avecResponsable,
      sansResponsable,
      bySociete,
    };
  }, [services, societes]);

  // 🎨 Barre de progression
  const maxCount = Math.max(...stats.bySociete.map((s) => s.count), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 📊 Total */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <div className="flex items-center justify-between mb-4">
          <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
          <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {stats.total}
          </span>
        </div>
        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Services</p>
      </div>

      {/* ✅ Actifs */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="text-green-600 dark:text-green-400" size={32} />
          <span className="text-3xl font-bold text-green-900 dark:text-green-100">
            {stats.actifs}
          </span>
        </div>
        <p className="text-sm font-medium text-green-700 dark:text-green-300">Services Actifs</p>
      </div>

      {/* ❌ Inactifs */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <div className="flex items-center justify-between mb-4">
          <Briefcase className="text-red-600 dark:text-red-400" size={32} />
          <span className="text-3xl font-bold text-red-900 dark:text-red-100">
            {stats.inactifs}
          </span>
        </div>
        <p className="text-sm font-medium text-red-700 dark:text-red-300">Services Inactifs</p>
      </div>

      {/* 👤 Avec responsable */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <div className="flex items-center justify-between mb-4">
          <UserCheck className="text-purple-600 dark:text-purple-400" size={32} />
          <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {stats.avecResponsable}
          </span>
        </div>
        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
          Avec Responsable
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
                  {societe.count} service{societe.count > 1 ? 's' : ''}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
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
