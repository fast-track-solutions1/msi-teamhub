'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, RefreshCw, Download, BarChart3, AlertCircle, Loader2, Grid3x3, Table2 } from 'lucide-react';
import { getSalaries, Salarie } from '@/lib/salarie-api';
import { getSocietes, Societe } from '@/lib/societe-api';
import { getServices, Service } from '@/lib/service-api';
import { getGrades, Grade } from '@/lib/grade-api';
import { getDepartements } from '@/lib/api-config';
import { Departement } from '@/lib/departement-api';
import AnnuaireCard from './components/AnnuaireCard';
import AnnuaireTable from './components/AnnuaireTable';

type ViewType = 'cards' | 'table';

export default function AnnuairePage() {
  const router = useRouter();

  // États principaux
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);

  // États UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('table');

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<string | number>('all');
  const [filterService, setFilterService] = useState<string | number>('all');
  const [filterGrade, setFilterGrade] = useState<string | number>('all');
  const [filterStatut, setFilterStatut] = useState('all');

  // Tri
  const [sortField, setSortField] = useState<'nom' | 'prenom' | 'matricule' | 'departement'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salariesData, societesData, servicesData, gradesData, departementsData] = await Promise.all([
        getSalaries(),
        getSocietes(),
        getServices(),
        getGrades(),
        getDepartements(),
      ]);

      setSalaries(Array.isArray(salariesData) ? salariesData : salariesData.results || []);
      setSocietes(societesData);
      setServices(servicesData);
      setGrades(gradesData);
      setDepartements(departementsData.results || departementsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) loadData();
  }, [mounted]);

  // Filtrage et tri
  const filteredAndSortedSalaries = useMemo(() => {
    let filtered = [...salaries];

    // Recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.nom.toLowerCase().includes(search) ||
          s.prenom.toLowerCase().includes(search) ||
          s.matricule.toLowerCase().includes(search) ||
          s.mail_professionnel?.toLowerCase().includes(search) ||
          s.poste?.toLowerCase().includes(search)
      );
    }

    // Filtres
    if (filterSociete !== 'all') {
      filtered = filtered.filter((s) => s.societe === Number(filterSociete));
    }

    if (filterService !== 'all') {
      filtered = filtered.filter((s) => s.service === Number(filterService));
    }

    if (filterGrade !== 'all') {
      filtered = filtered.filter((s) => s.grade === Number(filterGrade));
    }

    if (filterStatut !== 'all') {
      filtered = filtered.filter((s) => s.statut === filterStatut);
    }

    // Tri
    filtered.sort((a, b) => {
      let comp = 0;
      if (sortField === 'nom') comp = a.nom.localeCompare(b.nom);
      else if (sortField === 'prenom') comp = a.prenom.localeCompare(b.prenom);
      else if (sortField === 'matricule') comp = a.matricule.localeCompare(b.matricule);
      else if (sortField === 'departement') {
        const deptA = a.departements?.[0] || 0;
        const deptB = b.departements?.[0] || 0;
        comp = deptA - deptB;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return filtered;
  }, [salaries, searchTerm, filterSociete, filterService, filterGrade, filterStatut, sortField, sortOrder]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Poste', 'Département', 'Service', 'Grade', 'Responsable', 'Statut', 'Email', 'Téléphone'];
    const rows = filteredAndSortedSalaries.map((s) => [
      s.matricule,
      s.nom,
      s.prenom,
      s.poste || 'N/A',
      s.departements && s.departements.length > 0
        ? s.departements
            .map((deptId) => departements.find((d) => d.id === deptId)?.nom || 'N/A')
            .join('; ')
        : 'N/A',
      services.find((sv) => sv.id === s.service)?.nom || 'N/A',
      grades.find((g) => g.id === s.grade)?.nom || 'N/A',
      s.responsable_direct
        ? `${salaries.find((x) => x.id === s.responsable_direct)?.prenom} ${salaries.find((x) => x.id === s.responsable_direct)?.nom}`
        : 'N/A',
      s.statut,
      s.mail_professionnel || 'N/A',
      s.telephone || 'N/A',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `annuaire_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: 'nom' | 'prenom' | 'matricule' | 'departement') => {
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
      {/* === EN-TÊTE === */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Annuaire des Salariés</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredAndSortedSalaries.length} salarié{filteredAndSortedSalaries.length > 1 ? 's' : ''} trouvé{filteredAndSortedSalaries.length > 1 ? 's' : ''} sur {salaries.length} total
          </p>
        </div>

        <div className="flex gap-2">
          {/* Bouton Export */}
          <button
            onClick={handleExportCSV}
            disabled={filteredAndSortedSalaries.length === 0}
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
        </div>
      </div>

      {/* === MESSAGE D'ERREUR === */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* === BARRE DE RECHERCHE ET FILTRES === */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un salarié..."
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

        {/* Filtre Service */}
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Tous les services</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.nom}
            </option>
          ))}
        </select>

        {/* Filtre Grade */}
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Tous les grades</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.nom}
            </option>
          ))}
        </select>

        {/* Filtre Statut */}
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="absent">Absent</option>
          <option value="conge">Congé</option>
        </select>
      </div>

      {/* === VUE SWITCHER === */}
      <div className="flex gap-2 bg-slate-200 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setViewType('cards')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewType === 'cards'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Grid3x3 className="h-5 w-5" />
          Cartes
        </button>
        <button
          onClick={() => setViewType('table')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewType === 'table'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Table2 className="h-5 w-5" />
          Tableau
        </button>
      </div>

      {/* === AFFICHAGE === */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
        </div>
      ) : filteredAndSortedSalaries.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-slate-500 dark:text-slate-400">
            {searchTerm || filterSociete !== 'all' || filterService !== 'all' || filterGrade !== 'all' || filterStatut !== 'all'
              ? 'Aucun salarié ne correspond aux filtres'
              : 'Aucun salarié trouvé'}
          </p>
        </div>
      ) : viewType === 'cards' ? (
        // === VUE CARTES ===
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedSalaries.map((salarie) => (
            <div
              key={salarie.id}
              onClick={() => router.push(`/annuaires/salaries/${salarie.id}`)}
              className="cursor-pointer"
            >
              <AnnuaireCard salarie={salarie} societes={societes} services={services} grades={grades} />
            </div>
          ))}
        </div>
      ) : (
        // === VUE TABLEAU ===
        <AnnuaireTable
          salaries={filteredAndSortedSalaries}
          societes={societes}
          services={services}
          grades={grades}
          departements={departements}
          onRowClick={(id) => router.push(`/annuaires/salaries/${id}`)}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
}