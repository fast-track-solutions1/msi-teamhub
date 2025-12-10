'use client';

import { Salarie } from '@/lib/salarie-api';
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface SalarieStatsProps {
  salaries: Salarie[];
}

export default function SalarieStats({ salaries }: SalarieStatsProps) {
  // Calculs des statistiques
  const totalSalaries = salaries.length;
  const activeSalaries = salaries.filter((s) => s.statut === 'actif').length;
  const inactiveSalaries = totalSalaries - activeSalaries;

  const averageAnciennete =
    salaries.length > 0
      ? (
          salaries.reduce((acc, s) => {
            const embauche = new Date(s.date_embauche);
            const today = new Date();
            return acc + (today.getFullYear() - embauche.getFullYear());
          }, 0) / salaries.length
        ).toFixed(1)
      : '0';

  const stats = [
    {
      label: 'Total salariés',
      value: totalSalaries,
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      label: 'Salariés actifs',
      value: activeSalaries,
      icon: CheckCircle,
      color: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      label: 'Inactifs',
      value: inactiveSalaries,
      icon: AlertCircle,
      color: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
    },
    {
      label: 'Ancienneté moyenne (ans)',
      value: averageAnciennete,
      icon: TrendingUp,
      color: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`p-6 rounded-lg border-2 ${stat.borderColor} ${stat.color} bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 shadow-sm hover:shadow-md transition`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-90 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}