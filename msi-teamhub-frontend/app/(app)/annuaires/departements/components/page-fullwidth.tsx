'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { getDepartements } from '@/lib/departement-api';
import { getSocietes } from '@/lib/societe-api';
import { getSalaries } from '@/lib/salarie-api';
import DepartmentDirectoryTable from './components/DepartmentDirectoryTable';
import DepartmentDirectoryDetailModal from './components/DepartmentDirectoryDetailModal';
import DepartmentDirectoryStats from './components/DepartmentDirectoryStats';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';
import { Salarie } from '@/lib/salarie-api';

export default function AnnuaireDepartementsPage() {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSociete, setSelectedSociete] = useState<number | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<'all' | 'actif' | 'inactif'>('all');
  const [sortField, setSortField] = useState<'numero' | 'nom' | 'nombre_circuits' | 'date_creation'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 🎯 Modal
  const [selectedDept, setSelectedDept] = useState<Departement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 📡 Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [deptsData, societeData, salariesData] = await Promise.all([
          getDepartements(),
          getSocietes(),
          getSalaries(),
        ]);

        setDepartements(deptsData);
        setSocietes(societeData);
        setSalaries(salariesData);
      } catch (err: any) {
        console.error('Erreur chargement:', err);
        setError(
          err.message || 'Erreur lors du chargement des données'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔄 Filtrage et tri
  const filteredAndSortedDepartements = useMemo(() => {
    let result = [...departements];

    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(
        (d) =>
          d.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.chef_lieu?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par société
    if (selectedSociete) {
      result = result.filter((d) => d.societe === selectedSociete);
    }

    // Filtre par statut
    if (selectedStatut !== 'all') {
      result = result.filter((d) =>
        selectedStatut === 'actif' ? d.actif : !d.actif
      );
    }

    // Tri
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'numero':
          aVal = a.numero.localeCompare(b.numero);
          break;
        case 'nom':
          aVal = a.nom.localeCompare(b.nom);
          break;
        case 'nombre_circuits':
          aVal = a.nombre_circuits - b.nombre_circuits;
          break;
        case 'date_creation':
          aVal = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
          break;
        default:
          aVal = 0;
      }

      return sortOrder === 'asc' ? aVal : -aVal;
    });

    return result;
  }, [departements, searchQuery, selectedSociete, selectedStatut, sortField, sortOrder]);

  // 🎯 Gestion du clic sur un département
  const handleDeptClick = (dept: Departement) => {
    setSelectedDept(dept);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDept(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 🎯 En-tête de page */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Annuaire des Départements
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Consultez la liste complète des départements de l'entreprise
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Section Statistiques */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!loading && (
          <DepartmentDirectoryStats
            departements={departements}
            societes={societes}
          />
        )}
      </div>

      {/* 🎯 Section Listing avec filtres */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 🔍 Filtres */}
        <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filtres et Recherche
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 🔍 Recherche */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nom, numéro, région..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* 🏢 Société */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Société
              </label>
              <div className="relative">
                <select
                  value={selectedSociete || ''}
                  onChange={(e) =>
                    setSelectedSociete(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10"
                >
                  <option value="">Toutes les sociétés</option>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 📊 Statut */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Statut
              </label>
              <div className="relative">
                <select
                  value={selectedStatut}
                  onChange={(e) =>
                    setSelectedStatut(e.target.value as 'all' | 'actif' | 'inactif')
                  }
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actifs</option>
                  <option value="inactif">Inactifs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 📋 Tri */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Trier par
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortField}
                    onChange={(e) =>
                      setSortField(
                        e.target.value as 'numero' | 'nom' | 'nombre_circuits' | 'date_creation'
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none pr-10"
                  >
                    <option value="nom">Nom</option>
                    <option value="numero">Numéro</option>
                    <option value="nombre_circuits">Circuits</option>
                    <option value="date_creation">Date création</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={sortOrder === 'asc' ? 'Ascendant' : 'Descendant'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Résumé des filtres */}
          <div className="mt-4 flex flex-wrap gap-2 items-center text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              <strong>{filteredAndSortedDepartements.length}</strong> département
              {filteredAndSortedDepartements.length !== 1 ? 's' : ''} trouvé
              {filteredAndSortedDepartements.length !== 1 ? 's' : ''} sur{' '}
              <strong>{departements.length}</strong> total
            </span>
            {(searchQuery || selectedSociete || selectedStatut !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSociete(null);
                  setSelectedStatut('all');
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* ⚠️ États de chargement et erreur */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Chargement des données...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-300 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Erreur de chargement</h3>
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* 📋 Table des départements - FULL WIDTH */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <DepartmentDirectoryTable
              departements={filteredAndSortedDepartements}
              societes={societes}
              onDepartmentClick={handleDeptClick}
            />
          </div>
        )}

        {!loading && !error && filteredAndSortedDepartements.length === 0 && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Aucun département trouvé
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* 🎯 Modal détails */}
      <DepartmentDirectoryDetailModal
        departement={selectedDept}
        societes={societes}
        salaries={salaries}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}