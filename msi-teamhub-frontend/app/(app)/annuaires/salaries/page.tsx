'use client';


import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  Grid3x3,
  Table2,
  BarChart3,
} from 'lucide-react';


// ✅ Imports corrigés - Utilisation des classes API
import { salarieApi, Salarie } from '@/lib/salarie-api';
import { societeApi, Societe } from '@/lib/societe-api';
import { serviceApi, Service } from '@/lib/service-api';
import { gradeApi, Grade } from '@/lib/grade-api';
import { getDepartements } from '@/lib/api-config';
import { Departement } from '@/lib/departement-api';


// Components
import AnnuaireCard from './components/AnnuaireCard';
import AnnuaireTable from './components/AnnuaireTable';
import AnnuaireStats from './components/AnnuaireStats';


type ViewType = 'cards' | 'table';
type FilterValue = 'all' | number;


export default function AnnuairePage() {
  const router = useRouter();


  // ==================== ÉTATS ====================
  // Données
  const [allSalaries, setAllSalaries] = useState<Salarie[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);


  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('table');
  const [showStats, setShowStats] = useState(false);


  // Filtres / recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<FilterValue>('all');
  const [filterService, setFilterService] = useState<FilterValue>('all');
  const [filterGrade, setFilterGrade] = useState<FilterValue>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');


  // Tri
  const [sortField, setSortField] = useState<'nom' | 'prenom' | 'matricule' | 'departement'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');


  // ==================== CHARGEMENT DONNÉES ====================
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);


      // ✅ NOUVEAU: Charger TOUS les salariés (SANS filtre)
      const allSalariesData = await salarieApi.getSalaries();
      const allSalariesList = Array.isArray(allSalariesData) 
        ? allSalariesData 
        : allSalariesData.results || [];
      
      setAllSalaries(allSalariesList);
      setSalaries(allSalariesList);
      console.log('✅ Chargé', allSalariesList.length, 'salariés au total');

      // ✅ Appels API corrigés avec les méthodes des classes
      const [societesData, servicesData, gradesData, departementsData] =
        await Promise.all([
          societeApi.getSocietes(),
          serviceApi.getServices(),
          gradeApi.getGrades(),
          getDepartements(),
        ]);


      // Normalisation des données
      setSocietes(Array.isArray(societesData) ? societesData : societesData.results || []);
      setServices(Array.isArray(servicesData) ? servicesData : servicesData.results || []);
      setGrades(Array.isArray(gradesData) ? gradesData : gradesData.results || []);
      setDepartements(Array.isArray(departementsData) ? departementsData : departementsData.results || []);


      console.log('✅ Données chargées avec succès');
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du chargement des données';
      setError(errorMessage);
      console.error('❌ Erreur loadData:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  // ==================== EFFETS ====================
  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (mounted) {
      loadData();
    }
  }, [mounted, loadData]);


  // ==================== FILTRAGE ET TRI ====================
  const filteredAndSortedSalaries = useMemo(() => {
    let filtered = [...salaries];


    // Recherche
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
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
      filtered = filtered.filter((s) => s.societe === filterSociete);
    }


    if (filterService !== 'all') {
      filtered = filtered.filter((s) => s.service === filterService);
    }


    if (filterGrade !== 'all') {
      filtered = filtered.filter((s) => s.grade === filterGrade);
    }


    if (filterStatut !== 'all') {
      filtered = filtered.filter((s) => s.statut === filterStatut);
    }


    // Tri
    filtered.sort((a, b) => {
      let comp = 0;


      switch (sortField) {
        case 'nom':
          comp = a.nom.localeCompare(b.nom);
          break;
        case 'prenom':
          comp = a.prenom.localeCompare(b.prenom);
          break;
        case 'matricule':
          comp = a.matricule.localeCompare(b.matricule);
          break;
        case 'departement':
          const deptA = a.departements?.[0] || 0;
          const deptB = b.departements?.[0] || 0;
          comp = deptA - deptB;
          break;
      }


      return sortOrder === 'asc' ? comp : -comp;
    });


    return filtered;
  }, [salaries, searchTerm, filterSociete, filterService, filterGrade, filterStatut, sortField, sortOrder]);


  // ==================== HANDLERS ====================
  const handleExportCSV = useCallback(() => {
    const headers = [
      'Matricule',
      'Nom',
      'Prénom',
      'Poste',
      'Département',
      'Service',
      'Grade',
      'Responsable',
      'Statut',
      'Email',
      'Téléphone',
    ];


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
        ? `${allSalaries.find((x) => x.id === s.responsable_direct)?.prenom || ''} ${
            allSalaries.find((x) => x.id === s.responsable_direct)?.nom || ''
          }`.trim() || 'N/A'
        : 'N/A',
      s.statut,
      s.mail_professionnel || 'N/A',
      s.telephone || 'N/A',
    ]);


    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
    ].join('\n');


    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `annuaire_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredAndSortedSalaries, departements, services, grades, allSalaries]);


  const handleSort = useCallback((field: 'nom' | 'prenom' | 'matricule' | 'departement') => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return field;
      } else {
        setSortOrder('asc');
        return field;
      }
    });
  }, []);


  const handleSalarieClick = useCallback(
    (id: number) => {
      router.push(`/annuaires/salaries/${id}`);
    },
    [router]
  );


  // ==================== RENDER CONDITIONS ====================
  if (!mounted) return null;


  const hasActiveFilters =
    searchTerm.trim() ||
    filterSociete !== 'all' ||
    filterService !== 'all' ||
    filterGrade !== 'all' ||
    filterStatut !== 'all';


  // ==================== RENDER ====================
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ==================== EN-TÊTE ==================== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Annuaire des Salariés
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filteredAndSortedSalaries.length} salarié
            {filteredAndSortedSalaries.length > 1 ? 's' : ''} trouvé
            {filteredAndSortedSalaries.length > 1 ? 's' : ''} sur {salaries.length} total
          </p>
        </div>


        <div className="flex gap-2">
          {/* Stats */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showStats
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-label="Afficher les statistiques"
          >
            <BarChart3 size={18} />
            Stats
          </button>


          {/* Export */}
          <button
            onClick={handleExportCSV}
            disabled={filteredAndSortedSalaries.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Exporter en CSV"
          >
            <Download size={18} />
            Export
          </button>


          {/* Rafraîchir */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Rafraîchir les données"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>
        </div>
      </div>


      {/* ==================== ERREUR ==================== */}
      {error && (
        <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}


      {/* ==================== RECHERCHE + FILTRES ==================== */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Recherche */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un salarié..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            aria-label="Rechercher un salarié"
          />
        </div>


        {/* Filtre Société */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <select
            value={filterSociete}
            onChange={(e) => setFilterSociete(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="pl-10 pr-8 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none cursor-pointer"
            aria-label="Filtrer par société"
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
          aria-label="Filtrer par service"
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
          aria-label="Filtrer par grade"
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
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="absent">Absent</option>
          <option value="conge">Congé</option>
        </select>
      </div>


      {/* ==================== STATISTIQUES ==================== */}
      {showStats && <AnnuaireStats salaries={filteredAndSortedSalaries} departements={departements} />}


      {/* ==================== SWITCH CARTES / TABLEAU ==================== */}
      <div className="flex gap-2 bg-slate-200 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setViewType('cards')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            viewType === 'cards'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Vue en cartes"
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
          aria-label="Vue en tableau"
        >
          <Table2 className="h-5 w-5" />
          Tableau
        </button>
      </div>


      {/* ==================== AFFICHAGE DONNÉES ==================== */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={32} />
        </div>
      ) : filteredAndSortedSalaries.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-slate-500 dark:text-slate-400">
            {hasActiveFilters ? 'Aucun salarié ne correspond aux filtres' : 'Aucun salarié trouvé'}
          </p>
        </div>
      ) : viewType === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedSalaries.map((salarie) => (
            <div key={salarie.id} onClick={() => handleSalarieClick(salarie.id)} className="cursor-pointer">
              <AnnuaireCard salarie={salarie} societes={societes} services={services} grades={grades} />
            </div>
          ))}
        </div>
      ) : (
        <AnnuaireTable
          salaries={filteredAndSortedSalaries}
          allSalaries={allSalaries}
          societes={societes}
          services={services}
          grades={grades}
          departements={departements}
          onRowClick={handleSalarieClick}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
