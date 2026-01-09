'use client';

import { useState, useMemo } from 'react';
import { X, Briefcase, Building2, Users, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { Service } from '@/lib/service-api';
import { Societe } from '@/lib/societe-api';
import { Salarie } from '@/lib/salarie-api';

interface ServiceDirectoryDetailModalProps {
  service: Service | null;
  societes: Societe[];
  salaries: Salarie[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceDirectoryDetailModal({
  service,
  societes,
  salaries,
  isOpen,
  onClose,
}: ServiceDirectoryDetailModalProps) {
  // 👥 État pour salariés
  const [searchSalarie, setSearchSalarie] = useState('');
  const [sortField, setSortField] = useState<'nom' | 'poste' | 'extension' | 'anciennete'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 👥 Récupérer les salariés du service
  const salariesDuService = useMemo(() => {
    if (!service) return [];
    return salaries.filter((s) => s.service === service.id);
  }, [salaries, service]);

  // 🔍 Filtrage + tri salariés
  const filteredSalaries = useMemo(() => {
    let result = [...salariesDuService];

    // Recherche par nom, prénom, matricule
    if (searchSalarie) {
      const q = searchSalarie.toLowerCase();
      result = result.filter(
        (s) =>
          s.nom?.toLowerCase().includes(q) ||
          s.prenom?.toLowerCase().includes(q) ||
          s.matricule?.toLowerCase().includes(q)
      );
    }

    // Tri
    result.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'nom':
          comp = `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
          break;
        case 'poste':
          comp = (a.poste || '').localeCompare(b.poste || '');
          break;
        case 'extension':
          comp = (a.extension_3cx || '').localeCompare(b.extension_3cx || '');
          break;
        case 'anciennete':
          // Calcul simple: salarier plus anciens en premier
          const dateA = a.date_embauche ? new Date(a.date_embauche).getTime() : 0;
          const dateB = b.date_embauche ? new Date(b.date_embauche).getTime() : 0;
          comp = dateA - dateB;
          break;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [salariesDuService, searchSalarie, sortField, sortOrder]);

  // 🔄 Fonction tri avec toggle
  const handleSort = (field: 'nom' | 'poste' | 'extension' | 'anciennete') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 🎯 Icône tri
  const SortIcon = (field: 'nom' | 'poste' | 'extension' | 'anciennete') => {
    if (sortField !== field) {
      return <span className="text-xs text-slate-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Fonction pour calculer l'ancienneté
  const calculateAnciennete = (dateEmbauche: string | null): string => {
    if (!dateEmbauche) return 'N/A';
    const entree = new Date(dateEmbauche);
    const aujourd = new Date();
    let years = aujourd.getFullYear() - entree.getFullYear();
    let months = aujourd.getMonth() - entree.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0 && months === 0) return 'Aujourd\'hui';
    if (years === 0) return `${months}m`;
    return `${years}a${months > 0 ? ` ${months}m` : ''}`;
  };

  const getSocieteName = (id: number) =>
    societes.find((s) => s.id === id)?.nom || 'N/A';

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* 🎯 En-tête */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {service.nom}
              </h2>
              <p className="text-purple-100 text-sm">{service.description || 'Pas de description'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* 📋 Contenu avec scroll */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* 🏢 Informations générales */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Société
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {getSocieteName(service.societe)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Responsable
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {service.responsable_info || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Statut
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      service.actif ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p className="text-slate-900 dark:text-white font-medium">
                    {service.actif ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Date création
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {new Date(service.date_creation).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* 👥 Salariés du service */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              Salariés du service ({filteredSalaries.length} / {salariesDuService.length})
            </h3>

            {/* 🔍 Filtre recherche */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={searchSalarie}
                  onChange={(e) => setSearchSalarie(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* 📋 Tableau salariés */}
            {filteredSalaries.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('nom')}
                          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Nom et Prénom
                          <SortIcon field="nom" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('poste')}
                          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Poste
                          <SortIcon field="poste" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('extension')}
                          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Ext. 3CX
                          <SortIcon field="extension" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Entrée
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('anciennete')}
                          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Ancienneté
                          <SortIcon field="anciennete" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredSalaries.map((salarie) => (
                      <tr
                        key={salarie.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {salarie.nom} {salarie.prenom}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm font-mono">
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                            {salarie.matricule || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          {salarie.poste || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                            {salarie.mail_professionnel || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          <span className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                            {salarie.extension_3cx || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          {salarie.date_embauche
                            ? new Date(salarie.date_embauche).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold">
                            {calculateAnciennete(salarie.date_embauche)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-8">
                <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                  Aucun salarié trouvé
                </p>
              </div>
            )}
          </section>
        </div>

        {/* 🎯 Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {filteredSalaries.length} résultat{filteredSalaries.length !== 1 ? 's' : ''}
          </p>
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