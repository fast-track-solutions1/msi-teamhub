'use client';

import { useEffect, useState } from 'react';
import { Plus, AlertCircle, Loader } from 'lucide-react';
import ServiceStats from '@/components/settings/ServiceStats';
import ServiceTable from '@/components/settings/ServiceTable';
import ServiceForm from '@/components/settings/ServiceForm';

interface Service {
  id: number;
  nom: string;
  description: string | null;
  societe: number;
  responsable: number | null;
  responsable_info?: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
  } | null;
  actif: boolean;
  date_creation: string;
}

interface Societe {
  id: number;
  nom: string;
}

interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState('all');
  const [filterActif, setFilterActif] = useState('all');
  const [sortField, setSortField] = useState<'nom' | 'societe' | 'date_creation'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = getAuthHeaders();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [servicesRes, societesRes, salariesRes] = await Promise.all([
          fetch('http://localhost:8000/api/services/', { headers, signal: controller.signal }),
          fetch('http://localhost:8000/api/societes/', { headers, signal: controller.signal }),
          fetch('http://localhost:8000/api/salaries/', { headers, signal: controller.signal }),
        ]);

        clearTimeout(timeoutId);

        if (!servicesRes.ok || !societesRes.ok || !salariesRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const servicesData = await servicesRes.json();
        const societesData = await societesRes.json();
        const salariesData = await salariesRes.json();

        setServices(Array.isArray(servicesData) ? servicesData : servicesData.results || []);
        setSocietes(Array.isArray(societesData) ? societesData : societesData.results || []);
        setSalaries(Array.isArray(salariesData) ? salariesData : salariesData.results || []);
      } catch (err: any) {
        console.error('❌ Erreur chargement:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer et trier
  const filteredAndSortedServices = services
    .filter((service) => {
      const matchSearch =
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchSociete = filterSociete === 'all' || service.societe === Number(filterSociete);
      const matchActif =
        filterActif === 'all' || (filterActif === 'actif' ? service.actif : !service.actif);

      return matchSearch && matchSociete && matchActif;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'societe') {
        aVal = societes.find((s) => s.id === a.societe)?.nom || '';
        bVal = societes.find((s) => s.id === b.societe)?.nom || '';
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal < bVal ? -1 : 1) : aVal > bVal ? -1 : 1;
    });

  // Handlers
  const handleAddService = () => {
    setEditingService(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormError(null);
    setShowForm(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`http://localhost:8000/api/services/${id}/`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      setServices(services.filter((s) => s.id !== id));
    } catch (err: any) {
      alert('❌ ' + (err.message || 'Erreur lors de la suppression'));
    }
  };

  const handleSaveService = async (data: any) => {
    try {
      setFormLoading(true);
      setFormError(null);

      const headers = getAuthHeaders();
      const method = editingService ? 'PATCH' : 'POST';
      const url = editingService
        ? `http://localhost:8000/api/services/${editingService.id}/`
        : 'http://localhost:8000/api/services/';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Erreur lors de la sauvegarde');
      }

      const savedService = await res.json();

      if (editingService) {
        setServices(services.map((s) => (s.id === savedService.id ? savedService : s)));
      } else {
        setServices([...services, savedService]);
      }

      setShowForm(false);
      setEditingService(null);
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSort = (field: 'nom' | 'societe' | 'date_creation') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Services</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gestion des services et départements
            </p>
          </div>
          <button
            onClick={handleAddService}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Ajouter un service
          </button>
        </div>

        {/* Erreur générale */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">Erreur</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <ServiceStats services={services} societes={societes} />

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            {/* Filtre Société */}
            <select
              value={filterSociete}
              onChange={(e) => setFilterSociete(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Toutes les sociétés</option>
              {societes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>

            {/* Filtre Statut */}
            <select
              value={filterActif}
              onChange={(e) => setFilterActif(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="inactif">Inactifs</option>
            </select>

            {/* Compteur */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {filteredAndSortedServices.length} service
                {filteredAndSortedServices.length > 1 ? 's' : ''} trouvé
                {filteredAndSortedServices.length > 1 ? 's' : ''} sur {services.length} total
              </span>
            </div>
          </div>
        </div>

        {/* Tableau */}
        {filteredAndSortedServices.length > 0 ? (
          <ServiceTable
            services={filteredAndSortedServices}
            societes={societes}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {searchTerm || filterSociete !== 'all' || filterActif !== 'all'
                ? 'Aucun service ne correspond aux filtres'
                : 'Aucun service trouvé'}
            </p>
          </div>
        )}

        {/* Modal Formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ServiceForm
                service={editingService}
                societes={societes}
                salaries={salaries}
                services={services}
                onSave={handleSaveService}
                onCancel={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
