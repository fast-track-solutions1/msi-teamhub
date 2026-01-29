/**
 * 👤 Composant réutilisable pour afficher une carte employé
 * AVEC Départements intégrés dans la même carte
 */

'use client';

import { Mail, Phone, Users, Network, MapPin } from 'lucide-react';

export interface Department {
  id: number;
  numero: string;
  nom: string;
  region: string;
  circuits_count: number;
}

export interface EmployeeCardProps {
  id: number;
  nom: string;
  prenom: string;
  gradenom: string;
  poste: string;
  mail?: string;
  phone?: string;
  extension_3cx?: string;
  responsable_direct_nom?: string;
  totalcircuits: number;
  statut: string;
  matricule: string;
  departements?: Department[];
  depth: 'root' | 'child';
  hasChildren: boolean;
  onToggleChildren?: () => void;
  onSelect?: (id: number) => void;
}

const getAvatarColor = (id: number): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600',
    'from-green-500 to-green-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
  ];
  return colors[id % colors.length];
};

const getInitials = (nom: string, prenom: string): string => {
  const n = (prenom && prenom[0] ? prenom[0] : '') + (nom && nom[0] ? nom[0] : '');
  return n.toUpperCase().slice(0, 2);
};

/**
 * Composant principal EmployeeCard - AVEC DÉPARTEMENTS INTÉGRÉS
 */
export default function EmployeeCard({
  id,
  nom,
  prenom,
  gradenom,
  poste,
  mail,
  phone,
  extension_3cx,
  responsable_direct_nom,
  totalcircuits,
  statut,
  matricule,
  departements,
  depth,
  hasChildren,
  onToggleChildren,
  onSelect,
}: EmployeeCardProps) {
  const avatarColor = getAvatarColor(id);
  const initials = getInitials(nom, prenom);
  const isRoot = depth === 'root';
  const hasDepartments = departements && departements.length > 0;

  return (
    <div
      className={`
        bg-white dark:bg-slate-800 
        rounded-xl shadow-md hover:shadow-lg 
        transition-all duration-200
        border ${isRoot ? 'border-2 border-blue-300 dark:border-blue-700' : 'border border-slate-200 dark:border-slate-700'}
        overflow-hidden
        cursor-pointer hover:scale-105
      `}
      onClick={() => onSelect?.(id)}
    >
      {/* === FLEX CONTAINER PRINCIPAL === */}
      <div className={`flex ${isRoot ? 'flex-col lg:flex-row' : 'flex-row'}`}>
        {/* 🎨 Avatar */}
        <div
          className={`
            bg-gradient-to-br ${avatarColor} 
            text-white
            flex items-center justify-center flex-shrink-0
            ${isRoot ? 'w-full lg:w-28 h-28' : 'w-24 h-24'}
          `}
        >
          <span className={`font-bold ${isRoot ? 'text-3xl' : 'text-2xl'}`}>
            {initials}
          </span>
        </div>

        {/* 📝 Contenu Principal */}
        <div className={`flex-1 ${isRoot ? 'p-5' : 'p-4'}`}>
          {/* === EN-TÊTE === */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-bold text-slate-900 dark:text-white ${isRoot ? 'text-xl' : 'text-lg'}`}>
                {prenom} {nom}
              </h3>
              <p className={`font-semibold ${isRoot ? 'text-base text-blue-600 dark:text-blue-400' : 'text-sm text-slate-600 dark:text-slate-300'} mt-1`}>
                {gradenom}
              </p>
            </div>
          </div>

          {/* === DÉTAILS CONTACT === */}
          <div className={`mt-3 space-y-2 ${isRoot ? '' : ''}`}>
            {poste && poste !== 'N/A' && (
              <p className={`text-slate-600 dark:text-slate-400 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                📌 {poste}
              </p>
            )}

            {mail && (
              <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                <Mail size={isRoot ? 16 : 14} />
                <a href={`mailto:${mail}`} className="hover:underline break-all">
                  {mail}
                </a>
              </div>
            )}

            {phone && (
              <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                <Phone size={isRoot ? 16 : 14} />
                {phone}
              </div>
            )}

            {extension_3cx && (
              <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                <Phone size={isRoot ? 16 : 14} />
                🔊 Poste 3CX: {extension_3cx}
              </div>
            )}

            {responsable_direct_nom && (
              <div className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                <Users size={isRoot ? 16 : 14} />
                👤 Responsable: {responsable_direct_nom}
              </div>
            )}
          </div>

          {/* === CIRCUITS + STATUT === */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {totalcircuits > 0 && (
              <div className="flex items-center gap-2">
                <Network size={isRoot ? 20 : 16} className="text-orange-500" />
                <span className={`font-semibold text-orange-600 dark:text-orange-400 ${isRoot ? 'text-base' : 'text-sm'}`}>
                  {totalcircuits} circuit{totalcircuits !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <span className={`inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full font-semibold ${isRoot ? 'text-sm' : 'text-xs'}`}>
              {statut.toUpperCase()}
            </span>
          </div>

          {/* === DÉPARTEMENTS INTÉGRÉS === */}
          {hasDepartments && (
            <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700`}>
              <p className={`font-semibold text-slate-700 dark:text-slate-200 mb-2 ${isRoot ? 'text-sm' : 'text-xs'}`}>
                🏢 Départements ({departements.length})
              </p>
              <div className={isRoot ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : 'space-y-2'}>
                {departements.map((dept) => (
                  <div
                    key={dept.id}
                    className={`
                      rounded-lg p-2 border
                      ${isRoot 
                        ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-slate-200 dark:border-slate-600' 
                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                      }
                      hover:shadow-sm transition-all cursor-pointer
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-slate-900 dark:text-white ${isRoot ? 'text-sm' : 'text-xs'}`}>
                          {dept.nom}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={isRoot ? 14 : 12} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className={`text-slate-600 dark:text-slate-300 ${isRoot ? 'text-xs' : 'text-xs'}`}>
                            {dept.region || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Badge circuits */}
                      <div className={`
                        rounded-md px-2 py-1 flex-shrink-0
                        ${isRoot 
                          ? 'bg-orange-200 dark:bg-orange-900' 
                          : 'bg-orange-100 dark:bg-orange-900/30'
                        }
                      `}>
                        <span className={`font-semibold text-orange-700 dark:text-orange-300 ${isRoot ? 'text-xs' : 'text-xs'}`}>
                          {dept.circuits_count} ⚡
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🔽 Bouton toggle (si enfants) */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleChildren?.();
            }}
            className={`
              p-2 hover:bg-slate-100 dark:hover:bg-slate-700 
              rounded-lg transition flex-shrink-0 ${isRoot ? 'ml-4' : 'ml-2'}
            `}
          >
            <svg
              className="w-6 h-6 text-slate-600 dark:text-slate-400 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
