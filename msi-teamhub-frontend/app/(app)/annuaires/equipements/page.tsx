'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Package, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { equipementApi, Equipment, EquipmentInstance } from '@/lib/equipement-api';
import { getSocietes } from '@/lib/societe-api';
import { getDepartements } from '@/lib/departement-api';
import EquipementDirectoryTable from './components/EquipementDirectoryTable';
import EquipementDirectoryStats from './components/EquipementDirectoryStats';
import EquipementInstancesModal from './components/EquipementInstancesModal';
import { Societe } from '@/lib/societe-api';
import { Departement } from '@/lib/departement-api';

const EQUIPEMENT_TYPES = [
  { value: 'informatique', label: 'Informatique' },
  { value: 'mobilier', label: 'Mobilier' },
  { value: 'reseau', label: 'Réseau' },
  { value: 'securite', label: 'Sécurité' },
  { value: 'autre', label: 'Autre' },
];

export default function AnnuaireEquipementPage() {
  const [equipements, setEquipements] = useState<Equipment[]>([]);
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedActif, setSelectedActif] = useState<'all' | 'actif' | 'inactif'>('all');
  const [sortField, setSortField] = useState<'nom' | 'stock_disponible' | 'date_creation'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // 🎯 Modal instances
  const [selectedEquipement, setSelectedEquipement] = useState<Equipment | null>(null);
  const [modalInstancesOpen, setModalInstancesOpen] = useState(false);

  // 📡 Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [equipData, instData, societeData, deptData] = await Promise.all([
          equipementApi.getEquipements(),
          equipementApi.getInstances(),
          getSocietes(),
          getDepartements(),
        ]);
        setEquipements(equipData);
        setInstances(instData);
        setSocietes(societeData);
        setDepartements(deptData);
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
  const filteredAndSortedEquipements = useMemo(() => {
    let result = [...equipements];

    // Filtre par recherche
    if (searchQuery) {
      result = result.filter(
        (e) =>
          e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.type_equipement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      result = result.filter((e) => e.type_equipement === selectedType);
    }

    // Filtre par actif
    if (selectedActif !== 'all') {
      result = result.filter((e) => (selectedActif === 'actif' ? e.actif : !e.actif));
    }

    // Tri
    result.sort((a, b) => {
      let comp: number;
      switch (sortField) {
        case 'nom':
          comp = a.nom.localeCompare(b.nom);
          break;
        case 'stock_disponible':
          comp = a.stock_disponible - b.stock_disponible;
          break;
        case 'date_creation':
          comp =
            new Date(a.date_creation).getTime() -
            new Date(b.date_creation).getTime();
          break;
        default:
          comp = 0;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [equipements, searchQuery, selectedType, selectedActif, sortField, sortOrder]);

  // 🎯 Gestion du modal
  const handleOpenInstances = (equipement: Equipment) => {
    setSelectedEquipement(equipement);
    setModalInstancesOpen(true);
  };

  const handleCloseModal = () => {
    setModalInstancesOpen(false);
    setSelectedEquipement(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 w-full">
      {/* 🎯 En-tête de page - FULL WIDTH */}
      <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900 w-full px-8 py-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
            <Package className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-bold text-white">Annuaire des Équipements</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Consulter l'inventaire complet des équipements
        </p>
      </div>

      <div className="w-full px-8 py-12 space-y-8">
        {/* 📊 Section Statistiques */}
        {!loading && (
          <EquipementDirectoryStats
            equipements={equipements}
            instances={instances}
          />
        )}

        {/* 🔍 Section Filtres */}
        <section className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Filtres et Recherche
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* 🔍 Recherche */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Nom, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all"
                />
              </div>
            </div>

            {/* 🔧 Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Type
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 appearance-none pr-10 transition-all"
                >
                  <option value="all">Tous les types</option>
                  {EQUIPEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* ✓ Statut */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                Statut
              </label>
              <div className="relative">
                <select
                  value={selectedActif}
                  onChange={(e) => setSelectedActif(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 appearance-none pr-10 transition-all"
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
                        e.target.value as 'nom' | 'stock_disponible' | 'date_creation'
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 appearance-none pr-10 transition-all"
                  >
                    <option value="nom">Nom</option>
                    <option value="stock_disponible">Stock disponible</option>
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
              <span className="font-semibold">{filteredAndSortedEquipements.length}</span> équipement
              {filteredAndSortedEquipements.length !== 1 ? 's' : ''} trouvé
              {filteredAndSortedEquipements.length !== 1 ? 's' : ''} sur{' '}
              <span className="font-semibold">{equipements.length}</span> total
            </p>
            {(searchQuery || selectedType !== 'all' || selectedActif !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedActif('all');
                }}
                className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium transition-colors"
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
              <Loader2 className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-4" />
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

        {/* 📋 TABLE DES ÉQUIPEMENTS - FULL WIDTH */}
        {!loading && !error && (
          <EquipementDirectoryTable
            equipements={filteredAndSortedEquipements}
            instances={instances}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={(field) => {
              if (sortField === field) {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField(field as any);
                setSortOrder('asc');
              }
            }}
            onViewInstances={handleOpenInstances}
          />
        )}

        {!loading && !error && filteredAndSortedEquipements.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
              Aucun équipement trouvé
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* 🎯 Modal instances */}
      <EquipementInstancesModal
        equipement={selectedEquipement}
        instances={instances.filter((i) => i.equipement === selectedEquipement?.id)}
        isOpen={modalInstancesOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}