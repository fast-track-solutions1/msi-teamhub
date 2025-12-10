'use client';
import { Salarie } from '@/lib/salarie-api';
import { useState, useEffect, useMemo } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Plus, Search, Filter, RefreshCw, Download, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { Service, serviceApi } from '@/lib/service-api';
import { Societe, societeApi } from '@/lib/societe-api';
import ServiceForm from '@/components/settings/ServiceForm';
import ServiceTable from '@/components/settings/ServiceTable';
import ServiceStats from '@/components/settings/ServiceStats';

export default function ServicesSettingsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [mounted, setMounted] = useState(false);
  const { data: salariesData, loading: salariesLoading } = useFetch('/api/salaries/');
  const salaries = Array.isArray(salariesData) ? salariesData : salariesData?.results || [];

  // 🔍 Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<number | 'all'>('all');
  const [filterActif, setFilterActif] = useState<boolean | 'all'>('all');
  const [filterResponsable, setFilterResponsable] = useState<'with' | 'without' | 'all'>('all');
  const [sortField, setSortField] = useState<'nom' | 'societe' | 'date_creation'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [servicesData, societesData] = await Promise.all([
        serviceApi.getServices(),
        societeApi.getSocietes(),
      ]);
      
      setServices(servicesData);
      setSocietes(societesData);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
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

  // 🔍 Filtrage et tri
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];

    // Recherche par nom ou description
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par société
    if (filterSociete !== 'all') {
      filtered = filtered.filter((service) => service.societe === filterSociete);
    }

    // Filtre actif/inactif
    if (filterActif !== 'all') {
      filtered = filtered.filter((service) => service.actif === filterActif);
    }

    // Filtre responsable
    if (filterResponsable === 'with') {
      filtered = filtered.filter((service) => service.responsable);
    } else if (filterResponsable === 'without') {
      filtered = filtered.filter((service) => !service.responsable);
    }

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'nom') {
        comparison = a.nom.localeCompare(b.nom);
      } else if (sortField === 'societe') {
        const societeA = societes.find((s) => s.id === a.societe)?.nom || '';
        const societeB = societes.find((s) => s.id === b.societe)?.nom || '';
        comparison = societeA.localeCompare(societeB);
      } else if (sortField === 'date_creation') {
        comparison = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [services, searchTerm, filterSociete, filterActif, filterResponsable, sortField, sortOrder, societes]);

  // ✅ CRUD Operations
  const handleCreate = async (data: Omit<Service, 'id' | 'date_creation' | 'responsable_info'>) => {
    try {
      const newService = await serviceApi.createService(data);
      setServices([...services, newService]);
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    }
  };

  const handleUpdate = async (id: number, data: Partial<Service>) => {
    try {
      const updated = await serviceApi.updateService(id, data);
      setServices(services.map((s) => (s.id === id ? updated : s)));
      setEditingService(null);
      setShowForm(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }

    try {
      await serviceApi.deleteService(id);
      setServices(services.filter((s) => s.id !== id));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // 📊 Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nom', 'Société', 'Description', 'Responsable', 'Actif', 'Date création'];
    const rows = filteredAndSortedServices.map((service) => {
      const societe = societes.find((s) => s.id === service.societe);
      return [
        service.id,
        service.nom,
        societe?.nom || 'N/A',
        service.description || '',
        service.responsable_info || 'Aucun',
        service.actif ? 'Oui' : 'Non',
        new Date(service.date_creation).toLocaleDateString('fr-FR'),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `services_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: 'nom' | 'societe' | 'date_creation') => {
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
            Paramètres Services
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredAndSortedServices.length} service{filteredAndSortedServices.length > 1 ? 's' : ''} trouvé{filteredAndSortedServices.length > 1 ? 's' : ''}
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
            disabled={filteredAndSortedServices.length === 0}
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
              setEditingService(null);
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
        <ServiceStats services={filteredAndSortedServices} societes={societes} />
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
            placeholder="Rechercher un service..."
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

        {/* Filtre Responsable */}
        <select
          value={filterResponsable}
          onChange={(e) => setFilterResponsable(e.target.value as 'with' | 'without' | 'all')}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Tous les responsables</option>
          <option value="with">Avec responsable</option>
          <option value="without">Sans responsable</option>
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
          ) : filteredAndSortedServices.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm || filterSociete !== 'all' || filterActif !== 'all' || filterResponsable !== 'all'
                  ? 'Aucun service ne correspond aux filtres'
                  : 'Aucun service trouvé'}
              </p>
            </div>
          ) : (
            <ServiceTable
              services={filteredAndSortedServices}
              societes={societes}
              onEdit={(service) => {
                setEditingService(service);
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
        <ServiceForm
          service={editingService}
          societes={societes}
          salaries={salaries}
          onSave={editingService ? (data) => handleUpdate(editingService.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}
