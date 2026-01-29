// app/(app)/settings/fiches-postes/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Loader } from 'lucide-react';
import FichePosteTable from '@/components/settings/FichePosteTable';
import FichePosteForm from '@/components/settings/FichePosteForm';
import FichePosteStats from '@/components/settings/FichePosteStats';
import { FichePoste, getFichesPostes, deleteFichePoste } from '@/lib/ficheposte-api';
import { getServices } from '@/lib/service-api';
import { getGrades } from '@/lib/grade-api';
import { getSalaries } from '@/lib/salarie-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';
import { Salarie } from '@/lib/salarie-api';

type SortField = 'titre' | 'service' | 'statut' | 'datecreation';
type SortOrder = 'asc' | 'desc';

export default function FichesPostesPage() {
  // État des données
  const [fiches, setFiches] = useState<FichePoste[]>([]);

  // Debug: Affiche les données
  useEffect(() => {
    if (fiches.length > 0) console.log('Statut de la fiche:', fiches[0]?.statut);
  }, [fiches]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);

  // État de l'UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState<number | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('titre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // État du formulaire
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<FichePoste | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Charger les données initiales
// Charger les données initiales
useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📡 Chargement des fiches...');
      const fichesData = await getFichesPostes();
      console.log('✅ Fiches chargées:', fichesData);

      console.log('📡 Chargement des services...');
      const servicesData = await getServices();
      console.log('✅ Services chargés:', servicesData);

      console.log('📡 Chargement des grades...');
      const gradesData = await getGrades();
      console.log('✅ Grades chargés:', gradesData);

      console.log('📡 Chargement des salariés...');
      const salariesData = await getSalaries();
      console.log('✅ Salariés chargés:', salariesData);

      setFiches(fichesData);
      setServices(servicesData);
      setGrades(gradesData);
      setSalaries(salariesData);

      console.log('✅ Tout chargé avec succès !');
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement:', err);
      console.error('Message:', err.message);
      console.error('Status:', err.status);
      console.error('Data:', err.data);
      setError('Impossible de charger les données: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, []);


  // Filtrer et trier les fiches
  const getFilteredFiches = (): FichePoste[] => {
    let result = [...fiches];

    // Filtrer par terme de recherche
    if (searchTerm) {
      result = result.filter(
        (f) =>
          f.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrer par service
    if (filterService) {
      result = result.filter((f) => f.service === filterService);
    }

    // Filtrer par grade
    if (filterGrade) {
      result = result.filter((f) => f.grade === filterGrade);
    }

    // Filtrer par statut
    if (filterStatut) {
      result = result.filter((f) => f.statut === filterStatut);
    }

    // Trier
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'service') {
        aValue = services.find((s) => s.id === a.service)?.nom || '';
        bValue = services.find((s) => s.id === b.service)?.nom || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (fiche: FichePoste) => {
    setSelectedFiche(fiche);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche de poste ?')) {
      return;
    }

    try {
      setIsDeleting(id);
      await deleteFichePoste(id);

      // Actualiser la liste
      const updatedFiches = await getFichesPostes();
      setFiches(updatedFiches);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer la fiche de poste');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormSuccess = async () => {
    try {
      // Actualiser la liste
      const updatedFiches = await getFichesPostes();
      setFiches(updatedFiches);
      setSelectedFiche(null);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
    }
  };

  const handleOpenForm = () => {
    setSelectedFiche(null);
    setIsFormOpen(true);
  };

  const filteredFiches = getFilteredFiches();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={40} className="mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Chargement des fiches de poste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fiches de Postes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les fiches de poste de vos collaborateurs
          </p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Nouvelle fiche
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <FichePosteStats fiches={fiches} isLoading={isLoading} />

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="space-y-4">
          {/* Recherche */}
          <div>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Rechercher par titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre Service */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filtrer par service
              </label>
              <select
                value={filterService || ''}
                onChange={(e) =>
                  setFilterService(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Tous les services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filtrer par grade
              </label>
              <select
                value={filterGrade || ''}
                onChange={(e) =>
                  setFilterGrade(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Tous les grades</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.nom}
                  </option>
                ))}
              </select>
              </div>

            {/* Filtre Statut */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filtrer par statut
              </label>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="en_revision">En révision</option>
                <option value="archivé">Archivé</option>
              </select>
            </div>
          </div>

          {/* Résultats */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredFiches.length} fiche{filteredFiches.length !== 1 ? 's' : ''} trouvée
            {filteredFiches.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <FichePosteTable
        fiches={filteredFiches}
        services={services}
        grades={grades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Formulaire */}
      <FichePosteForm
        fiche={selectedFiche}
        services={services}
        grades={grades}
        salaries={salaries}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedFiche(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Message vide */}
      {fiches.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Aucune fiche de poste créée pour le moment
          </p>
          <button
            onClick={handleOpenForm}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Créer la première fiche
          </button>
        </div>
      )}
    </div>
  );
}












