'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Building2, MapIcon, Search, Filter, Users, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Departement, Circuit } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';
import { Salarie } from '@/lib/salarie-api';

interface DepartmentDirectoryDetailModalProps {
  departement: Departement | null;
  societes: Societe[];
  salaries: Salarie[];
  isOpen: boolean;
  onClose: () => void;
}

export default function DepartmentDirectoryDetailModal({
  departement,
  societes,
  salaries,
  isOpen,
  onClose,
}: DepartmentDirectoryDetailModalProps) {
  // 🔗 État pour circuits
  const [filteredCircuits, setFilteredCircuits] = useState<Circuit[]>([]);
  const [circuitSearch, setCircuitSearch] = useState('');

  // 👥 État pour salariés
  const [searchSalarie, setSearchSalarie] = useState('');
  const [filterService, setFilterService] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'nom' | 'poste' | 'service' | 'extension'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoadingSalaries, setIsLoadingSalaries] = useState(false);

  // 🔄 Filtre circuits
  useEffect(() => {
    if (departement?.circuits) {
      const filtered = departement.circuits.filter(
        (circuit) =>
          circuit.nom.toLowerCase().includes(circuitSearch.toLowerCase()) ||
          circuit.description?.toLowerCase().includes(circuitSearch.toLowerCase())
      );
      setFilteredCircuits(filtered);
    }
  }, [departement?.circuits, circuitSearch]);

  // 👥 Récupérer les salariés du département
  const salariesDuDepartement = useMemo(() => {
    if (!departement || salaries.length === 0) return [];
    
    return salaries.filter((s) =>
      s.departements && s.departements.includes(departement.id)
    );
  }, [salaries, departement]);

  // 📋 Services disponibles pour ce département
  const services = useMemo(() => {
    const unique = new Map<number, string>();
    salariesDuDepartement.forEach((s) => {
      if (s.service && s.service_nom) {
        unique.set(s.service, s.service_nom);
      }
    });
    return Array.from(unique.entries())
      .map(([id, nom]) => ({ id, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [salariesDuDepartement]);

  // 🔍 Filtrage + tri salariés
  const filteredSalaries = useMemo(() => {
    let result = [...salariesDuDepartement];

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

    // Filtre par service
    if (filterService) {
      result = result.filter((s) => s.service === filterService);
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
        case 'service':
          comp = (a.service_nom || '').localeCompare(b.service_nom || '');
          break;
        case 'extension':
          comp = (a.extension_3cx || '').localeCompare(b.extension_3cx || '');
          break;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [salariesDuDepartement, searchSalarie, filterService, sortField, sortOrder]);

  // 🔄 Fonction tri avec toggle
  const handleSort = (field: 'nom' | 'poste' | 'service' | 'extension') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 🎯 Icône tri
  const SortIcon = (field: 'nom' | 'poste' | 'service' | 'extension') => {
    if (sortField !== field) {
      return <span className="text-xs text-slate-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const getSocieteName = (id: number) =>
    societes.find((s) => s.id === id)?.nom || 'N/A';

  if (!isOpen || !departement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-6xl max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* 🎯 En-tête */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                {departement.nom}
              </h2>
              <p className="text-blue-100 text-sm">Numéro : {departement.numero}</p>
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
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Société
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {getSocieteName(departement.societe)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Statut
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      departement.actif ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <p className="text-slate-900 dark:text-white font-medium">
                    {departement.actif ? 'Actif' : 'Inactif'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Région
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {departement.region || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Chef-lieu
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {departement.chef_lieu || '—'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Date création
                </label>
                <p className="text-slate-900 dark:text-white font-medium">
                  {new Date(departement.date_creation).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Circuits associés
                </label>
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-semibold">
                  {departement.nombre_circuits}
                </div>
              </div>
            </div>
          </section>

          {/* 🔗 Circuits associés */}
          {departement.circuits && departement.circuits.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Circuits associés ({departement.circuits.length})
              </h3>

              {/* 🔍 Barre de recherche circuits */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Rechercher un circuit..."
                  value={circuitSearch}
                  onChange={(e) => setCircuitSearch(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 📋 Tableau des circuits */}
              {filteredCircuits.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                          Nom
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">
                          Description
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCircuits.map((circuit) => (
                        <tr
                          key={circuit.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {circuit.nom}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {circuit.description || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                circuit.actif
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                              }`}
                            >
                              {circuit.actif ? 'Actif' : 'Inactif'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Aucun circuit trouvé pour cette recherche
                </div>
              )}

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {filteredCircuits.length} circuit{filteredCircuits.length !== 1 ? 's' : ''} trouvé
                {filteredCircuits.length !== 1 ? 's' : ''} sur {departement.circuits.length} total
              </p>
            </section>
          )}

          {/* 👥 Salariés du département */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Salariés du département ({filteredSalaries.length} / {salariesDuDepartement.length})
            </h3>

            {/* 🔍 Filtres salariés */}
            <div className="mb-4 space-y-3">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={searchSalarie}
                  onChange={(e) => setSearchSalarie(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Filtre par service */}
              {services.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <button
                    onClick={() => setFilterService(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filterService === null
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    Tous les services
                  </button>
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setFilterService(service.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filterService === service.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {service.nom}
                    </button>
                  ))}
                </div>
              )}
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
                        <button
                          onClick={() => handleSort('service')}
                          className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                          Service
                          <SortIcon field="service" />
                        </button>
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
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {salarie.mail_professionnel}
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
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                            {salarie.service_nom || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-sm">
                          <span className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                            {salarie.extension_3cx || 'N/A'}
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