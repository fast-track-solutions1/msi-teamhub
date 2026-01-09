'use client';

import { useState, useMemo } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { Societe } from '@/lib/societe-api';
import { Departement } from '@/lib/departement-api';

interface SocieteDepartementsModalProps {
  societe: Societe | null;
  departements: Departement[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SocieteDepartementsModal({
  societe,
  departements,
  isOpen,
  onClose,
}: SocieteDepartementsModalProps) {
  // 🎯 TOUS LES HOOKS EN HAUT!
  const [searchDept, setSearchDept] = useState('');

  const societeDepartements = useMemo(() => {
    if (!isOpen || !societe) return [];
    return departements.filter((d) => d.societe === societe.id);
  }, [isOpen, societe, departements]);

  const filteredDepartements = useMemo(() => {
    let result = [...societeDepartements];
    if (searchDept) {
      const q = searchDept.toLowerCase();
      result = result.filter(
        (d) =>
          d.nom?.toLowerCase().includes(q) ||
          d.numero?.toString().includes(q) ||
          d.region?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [societeDepartements, searchDept]);

  const totalCircuits = useMemo(() => {
    return societeDepartements.reduce((sum, d) => sum + d.nombre_circuits, 0);
  }, [societeDepartements]);

  // ✅ RETURN APRÈS TOUS LES HOOKS
  if (!isOpen || !societe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full h-full max-w-7xl max-h-[95vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 dark:from-orange-900 dark:via-orange-800 dark:to-orange-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Départements de {societe.nom}</h2>
              <p className="text-orange-100 text-sm">{societeDepartements.length} département(s) • {totalCircuits} circuit(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
              {filteredDepartements.length} / {societeDepartements.length}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {filteredDepartements.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Numéro</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Nom</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Région</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Chef-lieu</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Circuits</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Statut</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Création</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredDepartements.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{dept.numero}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{dept.nom}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{dept.region || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{dept.chef_lieu || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-bold cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors" title={`${dept.nombre_circuits} circuit(s)`}>
                          {dept.nombre_circuits}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dept.actif ? (
                          <span className="inline-flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Actif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">Inactif</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">
                        {new Date(dept.date_creation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Aucun département trouvé</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}