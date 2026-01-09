'use client';

import { useState, useMemo } from 'react';
import { X, Users, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Salarie } from '@/lib/salarie-api';

interface SocieteSalariesModalProps {
  societe: Societe | null;
  services: Service[];
  salaries: Salarie[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SocieteSalariesModal({
  societe,
  services,
  salaries,
  isOpen,
  onClose,
}: SocieteSalariesModalProps) {
  // 👥 TOUS LES HOOKS EN HAUT!
  const [searchSalarie, setSearchSalarie] = useState('');
  const [sortField, setSortField] = useState<'nom' | 'email' | 'poste' | 'service' | 'grade' | 'date_entree'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 🔍 Récupérer les salariés
  const societeSalaries = useMemo(() => {
    if (!isOpen || !societe) return [];
    const societeServices = services.filter((s) => s.societe === societe.id);
    return salaries.filter((s) =>
      societeServices.map((srv) => srv.id).includes(s.service || -1)
    );
  }, [isOpen, societe, services, salaries]);

  // 🔍 Filtrage + tri salariés
  const filteredSalaries = useMemo(() => {
    let result = [...societeSalaries];

    if (searchSalarie) {
      const q = searchSalarie.toLowerCase();
      result = result.filter(
        (s) =>
          s.nom?.toLowerCase().includes(q) ||
          s.prenom?.toLowerCase().includes(q) ||
          s.mail_professionnel?.toLowerCase().includes(q) ||
          s.poste?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'nom':
          comp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
          break;
        case 'email':
          comp = (a.mail_professionnel || '').localeCompare(b.mail_professionnel || '');
          break;
        case 'poste':
          comp = (a.poste || '').localeCompare(b.poste || '');
          break;
        case 'service':
          const serviceA = services.find((s) => s.id === a.service)?.nom || '';
          const serviceB = services.find((s) => s.id === b.service)?.nom || '';
          comp = serviceA.localeCompare(serviceB);
          break;
        case 'grade':
          comp = (a.grade || '').localeCompare(b.grade || '');
          break;
        case 'date_entree':
          const dateA = a.date_embauche ? new Date(a.date_embauche).getTime() : 0;
          const dateB = b.date_embauche ? new Date(b.date_embauche).getTime() : 0;
          comp = dateA - dateB;
          break;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [societeSalaries, searchSalarie, sortField, sortOrder, services]);

  const handleSort = (field: 'nom' | 'email' | 'poste' | 'service' | 'grade' | 'date_entree') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = (field: 'nom' | 'email' | 'poste' | 'service' | 'grade' | 'date_entree') => {
    if (sortField !== field) return <span className="text-xs text-slate-400">⇅</span>;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const getServiceName = (serviceId: number | null) => {
    return services.find((s) => s.id === serviceId)?.nom || 'N/A';
  };

  // ✅ RETURN APRÈS TOUS LES HOOKS
  if (!isOpen || !societe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full h-full max-w-7xl max-h-[95vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 dark:from-green-900 dark:via-green-800 dark:to-green-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Salariés de {societe.nom}</h2>
              <p className="text-green-100 text-sm">{societeSalaries.length} salarié(s)</p>
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
                value={searchSalarie}
                onChange={(e) => setSearchSalarie(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
              {filteredSalaries.length} / {societeSalaries.length}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {filteredSalaries.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('nom')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Nom et Prénom
                        <SortIcon field="nom" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Email
                        <SortIcon field="email" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('poste')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Poste
                        <SortIcon field="poste" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('service')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Service
                        <SortIcon field="service" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('grade')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Grade
                        <SortIcon field="grade" />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => handleSort('date_entree')}
                        className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-600"
                      >
                        Date entrée
                        <SortIcon field="date_entree" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredSalaries.map((salarie) => (
                    <tr key={salarie.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {salarie.nom} {salarie.prenom}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                          {salarie.mail_professionnel || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{salarie.poste || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{getServiceName(salarie.service)}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                          {salarie.grade || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {salarie.date_embauche
                          ? new Date(salarie.date_embauche).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Aucun salarié trouvé</p>
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