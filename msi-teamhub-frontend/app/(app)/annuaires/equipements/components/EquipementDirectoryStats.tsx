'use client';

import { useMemo } from 'react';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Equipment, EquipmentInstance } from '@/lib/equipement-api';

interface EquipementDirectoryStatsProps {
  equipements: Equipment[];
  instances: EquipmentInstance[];
}

export default function EquipementDirectoryStats({
  equipements,
  instances,
}: EquipementDirectoryStatsProps) {
  const stats = useMemo(() => {
    const total = equipements.length;
    const actifs = equipements.filter((e) => e.actif).length;
    const totalStock = equipements.reduce((sum, e) => sum + e.stock_total, 0);
    const disponible = equipements.reduce((sum, e) => sum + e.stock_disponible, 0);
    const utilise = totalStock - disponible;
    const tauxUtilisation = totalStock > 0 ? Math.round((utilise / totalStock) * 100) : 0;

    return {
      total,
      actifs,
      inactifs: total - actifs,
      totalStock,
      disponible,
      utilise,
      tauxUtilisation,
      instances: instances.length,
    };
  }, [equipements, instances]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total équipements */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Équipements
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {stats.total}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.actifs} actifs
            </p>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Package className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Stock total */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Stock Total
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {stats.totalStock}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              unités
            </p>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            📦
          </div>
        </div>
      </div>

      {/* Stock disponible */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Disponible
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {stats.disponible}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.totalStock > 0 ? Math.round((stats.disponible / stats.totalStock) * 100) : 0}% du total
            </p>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            ✓
          </div>
        </div>
      </div>

      {/* Taux utilisation */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              Utilisation
            </p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
              {stats.tauxUtilisation}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.utilise} utilisés
            </p>
          </div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}