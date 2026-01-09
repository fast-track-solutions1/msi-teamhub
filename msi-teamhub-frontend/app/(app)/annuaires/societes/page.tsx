'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Building2, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { getSocietes } from '@/lib/societe-api';
import { getServices } from '@/lib/service-api';
import { getDepartements } from '@/lib/departement-api';
import { getSalaries } from '@/lib/salarie-api';
import SocieteDirectoryTable from './components/SocieteDirectoryTable';
import SocieteDirectoryStats from './components/SocieteDirectoryStats';
import SocieteServicesModal from './components/SocieteServicesModal';
import SocieteSalariesModal from './components/SocieteSalariesModal';
import SocieteDepartementsModal from './components/SocieteDepartementsModal';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Departement } from '@/lib/departement-api';
import { Salarie } from '@/lib/salarie-api';

export default function AnnuaireSocietesPage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<'all' | 'actif' | 'inactif'>('all');
  const [sortField, setSortField] = useState<'nom' | 'email' | 'date_creation'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 🎯 Modals
  const [selectedSociete, setSelectedSociete] = useState<Societe | null>(null);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [salariesModalOpen, setSalariesModalOpen] = useState(false);
  const [departementsModalOpen, setDepartementsModalOpen] = useState(false);

  // 📡 Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [societeData, serviceData, deptData, salariesData] = await Promise.all([
          getSocietes(),
          getServices(),
          getDepartements(),
          getSalaries(),
        ]);
        setSocietes(societeData);
        setServices(serviceData);
        setDepartements(deptData);
        setSalaries(salariesData);
      } catch (err: any) {
        console.error('Erreur chargement:', err);
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔄 Filtrage et tri
  const filteredAndSortedSocietes = useMemo(() => {
    let result = [...societes];

    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(
        (s) =>
          s.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.adresse?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.ville?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut
    if (selectedStatut !== 'all') {
      result = result.filter((s) => (selectedStatut === 'actif' ? s.actif : !s.actif));
    }

    // Tri
    result.sort((a, b) => {
      let comp: number;
      switch (sortField) {
        case 'nom':
          comp = a.nom.localeCompare(b.nom);
          break;
        case 'email':
          comp = (a.email || '').localeCompare(b.email || '');
          break;
        case 'date_creation':
          comp =
            new Date(a.date_creation || 0).getTime() -
            new Date(b.date_creation || 0).getTime();
          break;
        default:
          comp = 0;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [societes, searchQuery, selectedStatut, sortField, sortOrder]);

  // 🎯 Gestion des clics sur les nombres
  const handleOpenServicesModal = (societe: Societe) => {
    setSelectedSociete(societe);
    setServicesModalOpen(true);
  };

  const handleOpenSalariesModal = (societe: Societe) => {
    setSelectedSociete(societe);
    setSalariesModalOpen(true);
  };

  const handleOpenDepartementsModal = (societe: Societe) => {
    setSelectedSociete(societe);
    setDepartementsModalOpen(true);
  };

  const closeAllModals = () => {
    setServicesModalOpen(false);
    setSalariesModalOpen(false);
    setDepartementsModalOpen(false);
    setSelectedSociete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 w-full">
      {/* 🎯 En-tête de page - FULL WIDTH */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 w-full px-8 py-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-white">Annuaire des Sociétés</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Consultez la liste complète des sociétés de l'entreprise
        </p>
      </div>

      <div className="w-full px-8 py-12 space-y-8">
        {/* 📊 Section Statistiques */}
        {!loading && (
          <SocieteDirectoryStats
            societes={societes}
            services={services}
            departements={departements}
            salaries={salaries}
          />
        )}

        {/* 🔍 Section Filtres */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Filtres et Recherche
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 🔍 Recherche */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Nom, email, ville..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>
            </div>

            {/* 📊 Statut */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Statut
              </label>
              <div className="relative">
                <select
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value as 'all' | 'actif' | 'inactif')}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10 transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 📋 Tri */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                  Trier par
                </label>
                <div className="relative">
                  <select
                    value={sortField}
                    onChange={(e) =>
                      setSortField(
                        e.target.value as 'nom' | 'email' | 'date_creation'
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10 transition-all"
                  >
                    <option value="nom">Nom</option>
                    <option value="email">Email</option>
                    <option value="date_creation">Date création</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-7">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                  title={sortOrder === 'asc' ? 'Ascendant' : 'Descendant'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Résumé des filtres */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{filteredAndSortedSocietes.length}</span> société
              {filteredAndSortedSocietes.length !== 1 ? 's' : ''} trouvée
              {filteredAndSortedSocietes.length !== 1 ? 's' : ''} sur{' '}
              <span className="font-semibold">{societes.length}</span> total
            </p>
            {(searchQuery || selectedStatut !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatut('all');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </section>

        {/* ⚠️ États de chargement et erreur */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Chargement des données...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">Erreur de chargement</h3>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* 📋 TABLE DES SOCIÉTÉS - FULL WIDTH */}
        {!loading && !error && (
          <SocieteDirectoryTable
            societes={filteredAndSortedSocietes}
            services={services}
            departements={departements}
            salaries={salaries}
            onOpenServices={handleOpenServicesModal}
            onOpenSalaries={handleOpenSalariesModal}
            onOpenDepartements={handleOpenDepartementsModal}
            onOpenCircuits={handleOpenDepartementsModal}
          />
        )}

        {!loading && !error && filteredAndSortedSocietes.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
              Aucune société trouvée
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* 🎯 Modals */}
      <SocieteServicesModal
        societe={selectedSociete}
        services={services}
        isOpen={servicesModalOpen}
        onClose={closeAllModals}
      />
      <SocieteSalariesModal
        societe={selectedSociete}
        services={services}
        salaries={salaries}
        isOpen={salariesModalOpen}
        onClose={closeAllModals}
      />
      <SocieteDepartementsModal
        societe={selectedSociete}
        departements={departements}
        isOpen={departementsModalOpen}
        onClose={closeAllModals}
      />
    </div>
  );
}