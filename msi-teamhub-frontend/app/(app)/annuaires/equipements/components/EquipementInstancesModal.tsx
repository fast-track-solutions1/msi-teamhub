'use client';

import { X, Package, Users } from 'lucide-react';
import { Equipment, EquipmentInstance } from '@/lib/equipement-api';

interface EquipementInstancesModalProps {
  equipement: Equipment | null;
  instances: EquipmentInstance[];
  isOpen: boolean;
  onClose: () => void;
}

const INSTANCE_STATES: Record<string, { label: string; color: string }> = {
  neuf: { label: 'Neuf', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  bon: { label: 'Bon état', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  leger: { label: 'Usure légère', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  defaut: { label: 'Défaut', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  horsservice: { label: 'Hors service', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
};

export default function EquipementInstancesModal({
  equipement,
  instances,
  isOpen,
  onClose,
}: EquipementInstancesModalProps) {
  if (!isOpen || !equipement) return null;

  const assignedCount = instances.filter((i) => i.salarie_nom && i.salarie_nom !== '-' && !i.date_retrait).length;
  const unassignedCount = instances.length - assignedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{equipement.nom}</h2>
              <p className="text-purple-100 text-sm mt-1">
                Détails et instances d'équipement
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          {/* Section Infos Équipement */}
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Description
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {equipement.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Stock Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Stock Total
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {equipement.stock_total}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm mb-1">unités</span>
                  </div>
                </div>
              </div>

              {/* Disponible */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Disponible
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {equipement.stock_disponible}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm mb-1">
                      ({equipement.stock_total > 0 ? Math.round((equipement.stock_disponible / equipement.stock_total) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé Instances */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Total instances
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {instances.length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-1">
                  <Users className="h-4 w-4" /> Assignées
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {assignedCount}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Non assignées
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {unassignedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Table Instances */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Instances ({instances.length})
            </h3>
            
            {instances.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                        Numéro de série
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                        Assigné à
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                        Date affectation
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                        Date retrait
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                        État
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {instances.map((instance) => {
                      const stateInfo = INSTANCE_STATES[instance.etat] || {
                        label: instance.etat,
                        color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
                      };

                      const isAssigned = instance.salarie_nom && instance.salarie_nom !== '-' && !instance.date_retrait;

                      return (
                        <tr key={instance.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium font-mono">
                              {instance.numero_serie}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isAssigned && (
                                <div className="h-2 w-2 rounded-full bg-purple-500" />
                              )}
                              <span className={`text-sm font-medium ${
                                isAssigned 
                                  ? 'text-slate-900 dark:text-white' 
                                  : 'text-slate-500 dark:text-slate-400 italic'
                              }`}>
                                {instance.salarie_nom || '— Non assignée'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm">
                            {new Date(instance.date_affectation).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm">
                            {instance.date_retrait ? (
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                {new Date(instance.date_retrait).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            ) : (
                              <span className="text-green-600 dark:text-green-400">Actif</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium inline-block ${stateInfo.color}`}
                            >
                              {stateInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Aucune instance trouvée</p>
              </div>
            )}
          </div>
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