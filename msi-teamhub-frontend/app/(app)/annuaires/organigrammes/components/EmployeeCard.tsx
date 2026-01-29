/**
 * 👤 Composant réutilisable pour afficher une carte employé
 * Utilisé pour : racine et enfants dans l'organigramme
 */

'use client';

import { Mail, Phone, Users, Network, MapPin } from 'lucide-react';

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
  depth: 'root' | 'child'; // root = card principale, child = carte dans l'arbre
  hasChildren: boolean;
  onToggleChildren?: () => void;
  onSelect?: (id: number) => void;
}

/**
 * Utilitaires de couleur pour les avatars
 */
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
 * Composant principal EmployeeCard
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
  depth,
  hasChildren,
  onToggleChildren,
  onSelect,
}: EmployeeCardProps) {
  const avatarColor = getAvatarColor(id);
  const initials = getInitials(nom, prenom);
  const isRoot = depth === 'root';

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

        {/* 📝 Contenu */}
        <div className={`flex-1 ${isRoot ? 'p-5' : 'p-4'}`}>
          {/* En-tête */}
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

          {/* 🏷️ Détails */}
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

          {/* 🌐 Circuits */}
          {totalcircuits > 0 && (
            <div className={`mt-3 pt-3 border-t border-slate-200 dark:border-slate-700`}>
              <div className="flex items-center gap-2">
                <Network size={isRoot ? 20 : 16} className="text-orange-500" />
                <span className={`font-semibold text-orange-600 dark:text-orange-400 ${isRoot ? 'text-base' : 'text-sm'}`}>
                  {totalcircuits} circuit{totalcircuits !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* ✅ Statut */}
          <div className={`mt-3 ${isRoot ? '' : ''}`}>
            <span className={`inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full font-semibold text-xs`}>
              {statut.toUpperCase()}
            </span>
          </div>
        </div>

        {/* 🔽 Bouton toggle (si enfants) */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleChildren?.();
            }}
            className={`
              ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 
              rounded-lg transition flex-shrink-0
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
