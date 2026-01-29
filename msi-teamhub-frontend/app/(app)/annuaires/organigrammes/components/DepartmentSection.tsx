/**
 * 🏢 Section Départements - Affiche la liste des depts d'un employé
 */

'use client';

import { MapPin } from 'lucide-react';

export interface Department {
  id: number;
  numero: string;
  nom: string;
  region: string;
  circuits_count: number;
}

export interface DepartmentSectionProps {
  departments: Department[];
  isRoot?: boolean;
  onSelectDepartment?: (deptId: number) => void;
}

export default function DepartmentSection({
  departments,
  isRoot = false,
  onSelectDepartment,
}: DepartmentSectionProps) {
  if (!departments || departments.length === 0) {
    return null;
  }

  const containerClass = isRoot
    ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
    : 'space-y-2';

  const cardClass = isRoot
    ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-600'
    : 'bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-600';

  const titleClass = isRoot ? 'text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3' : 'text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2';

  const deptNameClass = isRoot ? 'font-semibold text-slate-900 dark:text-white' : 'text-xs font-semibold text-slate-900 dark:text-white';

  const regionClass = isRoot ? 'text-sm text-slate-600 dark:text-slate-300' : 'text-xs text-slate-600 dark:text-slate-400';

  const badgeClass = isRoot
    ? 'bg-orange-200 dark:bg-orange-900 px-3 py-1.5 rounded-md flex-shrink-0'
    : 'bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md';

  const badgeTextClass = isRoot
    ? 'text-sm font-bold text-orange-700 dark:text-orange-300'
    : 'text-xs font-semibold text-orange-700 dark:text-orange-400';

  return (
    <div className={`mt-${isRoot ? '6 pt-6' : '4 pt-4'} border-t border-slate-200 dark:border-slate-700`}>
      <p className={titleClass}>
        🏢 Départements ({departments.length})
      </p>

      <div className={containerClass}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            className={`
              ${cardClass}
              hover:shadow-md transition-all cursor-pointer
              hover:scale-105
            `}
            onClick={() => onSelectDepartment?.(dept.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={deptNameClass}>{dept.nom}</p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin size={isRoot ? 14 : 12} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className={regionClass}>{dept.region || 'N/A'}</span>
                </div>
              </div>

              {/* Badge circuits */}
              <div className={badgeClass}>
                <span className={badgeTextClass}>
                  {dept.circuits_count} circuit{dept.circuits_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
