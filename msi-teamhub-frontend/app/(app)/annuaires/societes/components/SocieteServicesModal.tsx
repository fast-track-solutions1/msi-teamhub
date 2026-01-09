'use client';

import { useState, useMemo } from 'react';
import { X, Briefcase, Search } from 'lucide-react';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';

interface SocieteServicesModalProps {
  societe: Societe | null;
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SocieteServicesModal({
  societe,
  services,
  isOpen,
  onClose,
}: SocieteServicesModalProps) {
  // 🎯 TOUS LES HOOKS EN HAUT!
  const [searchService, setSearchService] = useState('');

  const societeServices = useMemo(() => {
    if (!isOpen || !societe) return [];
    return services.filter((s) => s.societe === societe.id);
  }, [isOpen, societe, services]);

  const filteredServices = useMemo(() => {
    let result = [...societeServices];
    if (searchService) {
      const q = searchService.toLowerCase();
      result = result.filter(
        (s) =>
          s.nom?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.responsable_info?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [societeServices, searchService]);

  // ✅ RETURN APRÈS TOUS LES HOOKS
  if (!isOpen || !societe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full h-full max-w-7xl max-h-[95vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Services de {societe.nom}</h2>
              <p className="text-purple-100 text-sm">{societeServices.length} service(s)</p>
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
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
              {filteredServices.length} / {societeServices.length}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {filteredServices.length > 0 ? (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.nom}</h3>
                      {service.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{service.description}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Responsable</p>
                          <p className="text-slate-900 dark:text-white font-medium mt-1">
                            {service.responsable_info || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date création</p>
                          <p className="text-slate-900 dark:text-white font-medium mt-1">
                            {new Date(service.date_creation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`h-3 w-3 rounded-full ${service.actif ? 'bg-green-500' : 'bg-red-500'}`} />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
                        {service.actif ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Aucun service trouvé</p>
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