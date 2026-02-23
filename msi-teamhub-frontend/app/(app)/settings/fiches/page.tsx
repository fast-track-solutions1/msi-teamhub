// app/settings/fiches/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
  Download,
  BarChart3,
} from 'lucide-react';
import FichePosteForm from '@/components/settings/FichePosteForm';
import FichePosteTable from '@/components/settings/FichePosteTable';
import FichePosteDetailModal from '@/components/settings/FichePosteDetailModal';
import {
  getFichesPostes,
  FichePoste,
  deleteFichePoste,
} from '@/lib/ficheposte-api';
import { getServices, Service } from '@/lib/service-api';
import { getGrades, Grade } from '@/lib/grade-api';
import { getSalaries, Salarie } from '@/lib/salarie-api';

export default function FichesPostesPage() {
  const [fiches, setFiches] = useState<FichePoste[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('tous');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState<FichePoste | null>(null);
  const [viewFiche, setViewFiche] = useState<FichePoste | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fichesData, servicesData, gradesData, salariesData] = await Promise.all([
        getFichesPostes(),
        getServices(),
        getGrades(),
        getSalaries(),
      ]);
      setFiches(fichesData);
      setServices(servicesData);
      setGrades(gradesData);
      setSalaries(salariesData);
    } catch (error: any) {
      console.error('Erreur chargement données:', error);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NORMALISER LE STATUT (Correction principale)
  const normalizeStatut = (statut: string): string => {
    const normalized = statut.toLowerCase().replace(/[éè]/g, 'e').replace(/[_\s-]/g, '');
    
    if (normalized === 'enrevision' || normalized === 'revision') return 'en_revision';
    if (normalized === 'archive' || normalized === 'archiv') return 'archive';
    return 'actif';
  };

  // ✅ STATISTIQUES CORRIGÉES
  const stats = {
    total: fiches.length,
    actives: fiches.filter((f) => normalizeStatut(f.statut) === 'actif').length,
    enRevision: fiches.filter((f) => normalizeStatut(f.statut) === 'en_revision').length,
    archivees: fiches.filter((f) => normalizeStatut(f.statut) === 'archive').length,
  };

  // ✅ FILTRAGE CORRIGÉ
  const filteredFiches = fiches.filter((fiche) => {
    const matchSearch =
      fiche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fiche.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      services.find((s) => s.id === fiche.service)?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grades.find((g) => g.id === fiche.grade)?.nom.toLowerCase().includes(searchTerm.toLowerCase());

    const normalizedStatut = normalizeStatut(fiche.statut);
    const matchStatut =
      selectedStatut === 'tous' ||
      (selectedStatut === 'actif' && normalizedStatut === 'actif') ||
      (selectedStatut === 'en_revision' && normalizedStatut === 'en_revision') ||
      (selectedStatut === 'archive' && normalizedStatut === 'archive');

    const matchService = !selectedService || fiche.service === selectedService;
    const matchGrade = !selectedGrade || fiche.grade === selectedGrade;

    return matchSearch && matchStatut && matchService && matchGrade;
  });

  const handleEdit = (fiche: FichePoste) => {
    setSelectedFiche(fiche);
    setIsFormOpen(true);
  };

  const handleView = (fiche: FichePoste) => {
    setViewFiche(fiche);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche ?')) return;

    try {
      setIsDeleting(id);
      await deleteFichePoste(id);
      await loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      setError('Impossible de supprimer la fiche');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormSuccess = async () => {
    await loadData();
    setSelectedFiche(null);
  };

  const exportToCSV = () => {
    const headers = ['Titre', 'Service', 'Grade', 'Responsable', 'Statut', 'Date création'];
    const rows = filteredFiches.map((f) => [
      f.titre,
      services.find((s) => s.id === f.service)?.nom || '',
      grades.find((g) => g.id === f.grade)?.nom || '',
      f.responsable_info || '',
      f.statut,
      f.date_creation || f.datecreation || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fiches_poste_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Fiches de Poste
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérez les descriptions de postes de vos collaborateurs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Exporter CSV
          </button>
          <button
            onClick={() => {
              setSelectedFiche(null);
              setIsFormOpen(true);
            }}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            Nouvelle Fiche
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ✅ STATISTIQUES CARDS - Design moderne avec données correctes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <FileText size={24} />
            </div>
            <TrendingUp size={20} className="text-white/70" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-blue-100 font-medium">Total</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedStatut('actif')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle size={24} />
            </div>
            <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              {stats.total > 0 ? ((stats.actives / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-green-100 font-medium">Actives</p>
            <p className="text-4xl font-bold">{stats.actives}</p>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedStatut('en_revision')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Clock size={24} />
            </div>
            <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              {stats.total > 0 ? ((stats.enRevision / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-amber-100 font-medium">En révision</p>
            <p className="text-4xl font-bold">{stats.enRevision}</p>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setSelectedStatut('archive')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Archive size={24} />
            </div>
            <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              {stats.total > 0 ? ((stats.archivees / stats.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate-100 font-medium">Archivées</p>
            <p className="text-4xl font-bold">{stats.archivees}</p>
          </div>
        </div>
      </div>

      {/* ✅ GRAPHIQUE DE DISTRIBUTION - Style moderne */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" />
            Distribution par statut
          </h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Actives</span>
              <span className="text-slate-600 dark:text-slate-400">
                {stats.actives} ({stats.total > 0 ? ((stats.actives / stats.total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.actives / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium">En révision</span>
              <span className="text-slate-600 dark:text-slate-400">
                {stats.enRevision} ({stats.total > 0 ? ((stats.enRevision / stats.total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.enRevision / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Archivées</span>
              <span className="text-slate-600 dark:text-slate-400">
                {stats.archivees} ({stats.total > 0 ? ((stats.archivees / stats.total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.archivees / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actives</option>
            <option value="en_revision">En révision</option>
            <option value="archive">Archivées</option>
          </select>

          <select
            value={selectedService || ''}
            onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nom}
              </option>
            ))}
          </select>

          <select
            value={selectedGrade || ''}
            onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les grades</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          {filteredFiches.length} fiche{filteredFiches.length !== 1 ? 's' : ''} trouvée
          {filteredFiches.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <FichePosteTable
        fiches={filteredFiches}
        services={services}
        grades={grades}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
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

      {/* Modal de vue détaillée */}
      <FichePosteDetailModal
        fiche={viewFiche}
        services={services}
        grades={grades}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewFiche(null);
        }}
        onEdit={handleEdit}
      />

      {/* Message vide */}
      {fiches.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Aucune fiche de poste créée pour le moment
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Créer la première fiche
          </button>
        </div>
      )}
    </div>
  );
}
