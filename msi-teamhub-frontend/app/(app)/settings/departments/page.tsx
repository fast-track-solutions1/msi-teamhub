'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, RefreshCw, Download, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Departement, departementApi } from '@/lib/departement-api';
import { Societe, societeApi } from '@/lib/societe-api';
import DepartmentForm from '@/components/settings/DepartmentForm';
import DepartmentTable from '@/components/settings/DepartmentTable';
import DepartmentStats from '@/components/settings/DepartmentStats';

export default function DepartmentsSettingsPage() {
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingDepartement, setEditingDepartement] = useState<Departement | null>(null);
  const [mounted, setMounted] = useState(false);

  // 🔍 Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<number | 'all'>('all');
  const [filterRegion, setFilterRegion] = useState<string | 'all'>('all');
  const [filterActif, setFilterActif] = useState<boolean | 'all'>('all');
  const [sortField, setSortField] = useState<'numero' | 'nom' | 'nombre_circuits' | 'date_creation'>('numero');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [departementsData, societesData] = await Promise.all([
        departementApi.getDepartements(),
        societeApi.getSocietes(),
      ]);
      
      console.log(`✅ ${departementsData.length} départements chargés`);
      setDepartements(departementsData);
      setSocietes(societesData);
    } catch (err: any) {
      console.error('❌ Erreur chargement:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted]);

  // 🔍 Liste des régions uniques pour le filtre
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(departements.map((d) => d.region).filter(Boolean))];
    return uniqueRegions.sort();
  }, [departements]);

  // 🔍 Filtrage et tri
  const filteredAndSortedDepartements = useMemo(() => {
    let filtered = [...departements];

    // Recherche par numéro, nom, région
    if (searchTerm) {
      filtered = filtered.filter((dept) =>
        dept.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par société
    if (filterSociete !== 'all') {
      filtered = filtered.filter((dept) => dept.societe === filterSociete);
    }

    // Filtre par région
    if (filterRegion !== 'all') {
      filtered = filtered.filter((dept) => dept.region === filterRegion);
    }

    // Filtre actif/inactif
    if (filterActif !== 'all') {
      filtered = filtered.filter((dept) => dept.actif === filterActif);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'numero') {
        comparison = a.numero.localeCompare(b.numero);
      } else if (sortField === 'nom') {
        comparison = a.nom.localeCompare(b.nom);
      } else if (sortField === 'nombre_circuits') {
        comparison = (a.nombre_circuits || 0) - (b.nombre_circuits || 0);
      } else if (sortField === 'date_creation') {
        comparison = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [departements, searchTerm, filterSociete, filterRegion, filterActif, sortField, sortOrder]);

  // ✅ CRUD Operations
  const handleCreate = async (data: Omit<Departement, 'id' | 'date_creation' | 'circuits' | 'label_complet'>) => {
    try {
      console.log('📤 Création département:', data);
      const newDept = await departementApi.createDepartement(data);
      console.log('📥 Département créé:', newDept);
      setDepartements([...departements, newDept]);
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      console.error('❌ Erreur création:', err);
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: Partial<Departement>) => {
    try {
      console.log('📤 Mise à jour département ID', id, ':', data);
      const updated = await departementApi.updateDepartement(id, data);
      console.log('📥 Département mis à jour:', updated);
      
      // ✅ Mettre à jour le state avec les données retournées par le backend
      setDepartements((prevDepartements) =>
        prevDepartements.map((d) => {
          if (d.id === id) {
            console.log('🔄 Remplacement département:', d.numero, 'circuits:', d.nombre_circuits, '→', updated.nombre_circuits);
            return updated;
          }
          return d;
        })
      );
      
      setEditingDepartement(null);
      setShowForm(false);
      setError(null);
      
      console.log('✅ State mis à jour');
    } catch (err: any) {
      console.error('❌ Erreur mise à jour:', err);
      setError(err.message || 'Erreur lors de la modification');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      return;
    }

    try {
      console.log('🗑️ Suppression département ID:', id);
      await departementApi.deleteDepartement(id);
      setDepartements(departements.filter((d) => d.id !== id));
      setError(null);
      console.log('✅ Département supprimé');
    } catch (err: any) {
      console.error('❌ Erreur suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // 📊 Export CSV
  const handleExportCSV = () => {
    const headers = ['Numéro', 'Nom', 'Région', 'Chef-lieu', 'Société', 'Circuits', 'Actif', 'Date création'];
    const rows = filteredAndSortedDepartements.map((dept) => {
      const societe = societes.find((s) => s.id === dept.societe);
      return [
        dept.numero,
        dept.nom,
        dept.region || '',
        dept.chef_lieu || '',
        societe?.nom || 'N/A',
        dept.nombre_circuits || 1,
        dept.actif ? 'Oui' : 'Non',
        new Date(dept.date_creation).toLocaleDateString('fr-FR'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `departements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: 'numero' | 'nom' | 'nombre_circuits' | 'date_creation') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 🎯 En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Paramètres Départements
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredAndSortedDepartements.length} département{filteredAndSortedDepartements.length > 1 ? 's' : ''} trouvé{filteredAndSortedDepartements.length > 1 ? 's' : ''} sur {departements.length} total
          </p>
        </div>

        <div className="flex gap-2">
          {/* Bouton Statistiques */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showStats
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 size={18} />
            Stats
          </button>

          {/* Bouton Export */}
          <button
            onClick={handleExportCSV}
            disabled={filteredAndSortedDepartements.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </button>

          {/* Bouton Rafraîchir */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>

          {/* Bouton Ajouter */}
          <button
            onClick={() => {
              setEditingDepartement(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <Plus size={18} />
            Ajouter
          </button>
        </div>
      </div>

      {/* 📊 Statistiques */}
      {showStats && (
        <DepartmentStats departements={filteredAndSortedDepartements} societes={societes} />
      )}

      {/* 🔍 Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un département..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        {/* Filtre Société */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={filterSociete}
            onChange={(e) => setFilterSociete(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
          >
            <option value="all">Toutes les sociétés</option>
            {societes.map((societe) => (
              <option key={societe.id} value={societe.id}>
                {societe.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Région */}
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Toutes les régions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {/* Filtre Actif */}
        <select
          value={filterActif === 'all' ? 'all' : filterActif.toString()}
          onChange={(e) =>
            setFilterActif(e.target.value === 'all' ? 'all' : e.target.value === 'true')
          }
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      {/* ❌ Message d'erreur */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* 📊 Tableau ou formulaire */}
      {!showForm ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
            </div>
          ) : filteredAndSortedDepartements.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || filterSociete !== 'all' || filterRegion !== 'all' || filterActif !== 'all'
                  ? 'Aucun département ne correspond aux filtres'
                  : 'Aucun département trouvé'}
              </p>
            </div>
          ) : (
            <DepartmentTable
              departements={filteredAndSortedDepartements}
              societes={societes}
              onEdit={(dept) => {
                console.log('✏️ Édition département:', dept);
                setEditingDepartement(dept);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
        </>
      ) : (
        <DepartmentForm
          departement={editingDepartement}
          societes={societes}
          onSave={editingDepartement ? (data) => handleUpdate(editingDepartement.id, data) : handleCreate}
          onCancel={() => {
            console.log('❌ Annulation formulaire');
            setShowForm(false);
            setEditingDepartement(null);
          }}
        />
      )}
    </div>
  );
}
