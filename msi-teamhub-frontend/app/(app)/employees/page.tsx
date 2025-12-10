'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, RefreshCw, Download, BarChart3, AlertCircle } from 'lucide-react';
import { Salarie, salarieApi } from '@/lib/salarie-api';
import { Societe, societeApi } from '@/lib/societe-api';
import { Service, serviceApi } from '@/lib/service-api';
import { Grade, gradeApi } from '@/lib/grade-api';
import { getDepartements, getCreneauxTravail, getSalariesForResponsable } from '@/lib/api-config';
import SalarieForm from '@/components/employees/SalarieForm';
import SalarieTable from '@/components/employees/SalarieTable';
import SalarieStats from '@/components/employees/SalarieStats';

// Interfaces pour les données supplémentaires
interface Departement {
  id: number;
  numero: string;
  nom: string;
  nombre_circuits: number;
}

interface CreneauTravail {
  id: number;
  nom: string;
}

interface SalarieForResponsable {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  service_nom?: string;
  grade_nom?: string;
}

export default function EmployeesPage() {
  // États principaux
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  // États pour les données supplémentaires
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [creneauxTravail, setCreneauxTravail] = useState<CreneauTravail[]>([]);
  const [salariesForResponsable, setSalariesForResponsable] = useState<SalarieForResponsable[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingSalarie, setEditingSalarie] = useState<Salarie | null>(null);
  const [mounted, setMounted] = useState(false);

  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSociete, setFilterSociete] = useState<string | number>('all');
  const [filterService, setFilterService] = useState<string | number>('all');
  const [filterGrade, setFilterGrade] = useState<string | number>('all');
  const [filterStatut, setFilterStatut] = useState('all');

  // Tri
  const [sortField, setSortField] = useState<'nom' | 'prenom' | 'matricule' | 'date_embauche'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ FONCTION PRINCIPALE DE CHARGEMENT
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ 1️⃣ CHARGER LES DONNÉES PRINCIPALES
      const [salariesData, societesData, servicesData, gradesData] = await Promise.all([
        salarieApi.getSalaries(),
        societeApi.getSocietes(),
        serviceApi.getServices(),
        gradeApi.getGrades(),
      ]);

      setSalaries(Array.isArray(salariesData) ? salariesData : salariesData.results || []);
      setSocietes(societesData);
      setServices(servicesData);
      setGrades(gradesData);

      // ✅ 2️⃣ CHARGER LES DONNÉES SUPPLÉMENTAIRES (optionnel - ne bloque pas si erreur)
      try {
        const [departementsData, creneauxData] = await Promise.all([
          getDepartements(),
          getCreneauxTravail(),
        ]);
        
        setDepartements(departementsData.results || departementsData);
        setCreneauxTravail(creneauxData.results || creneauxData);
      } catch (err: any) {
        console.warn('⚠️ Données supplémentaires (depts/creneaux) non disponibles:', err.message);
        setDepartements([]);
        setCreneauxTravail([]);
      }

      // ✅ 3️⃣ CHARGER LES SALARIÉS POUR LA SÉLECTION DU RESPONSABLE DIRECT
      try {
        const responsablesData = await getSalariesForResponsable();
        
        // Formater les données pour le dropdown
        const formatted = responsablesData.map((s: any) => ({
          id: s.id,
          nom: s.nom,
          prenom: s.prenom,
          matricule: s.matricule,
          service_nom: s.service_nom || undefined,
          grade_nom: s.grade_nom || undefined,
        }));
        
        setSalariesForResponsable(formatted);
        console.log('✅ Salariés pour Responsable Direct chargés:', formatted.length);
      } catch (err: any) {
        console.warn('⚠️ Salariés pour Responsable Direct non disponibles:', err.message);
        setSalariesForResponsable([]);
      }

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
      filtered = filtered.filter(
        (s) =>
          s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.matricule.toLowerCase().includes(searchTerm.toLowerCase())
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
      else if (sortField === 'date_embauche')
        comp = new Date(a.date_embauche).getTime() - new Date(b.date_embauche).getTime();

      return sortOrder === 'asc' ? comp : -comp;
    });

    return filtered;
  }, [salaries, searchTerm, filterSociete, filterService, filterGrade, filterStatut, sortField, sortOrder]);

  // Handlers CRUD
  const handleCreate = async (data: Omit<Salarie, 'id'>) => {
    try {
      const newSalarie = await salarieApi.createSalarie(data);
      setSalaries([...salaries, newSalarie]);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
      throw err;
    }
  };

  const handleUpdate = async (id: number, data: Partial<Salarie>) => {
    try {
      const updated = await salarieApi.updateSalarie(id, data);
      setSalaries(salaries.map((s) => (s.id === id ? { ...s, ...updated } : s)));
      setEditingSalarie(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce salarié ?')) return;
    try {
      await salarieApi.deleteSalarie(id);
      setSalaries(salaries.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nom', 'Prénom', 'Matricule', 'Société', 'Service', 'Grade', 'Statut', 'Date d\'embauche'];
    const rows = filteredAndSortedSalaries.map((s) => [
      s.id,
      s.nom,
      s.prenom,
      s.matricule,
      societes.find((x) => x.id === s.societe)?.nom || 'N/A',
      services.find((x) => x.id === s.service)?.nom || 'N/A',
      grades.find((x) => x.id === s.grade)?.nom || 'N/A',
      s.statut,
      new Date(s.date_embauche).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `salaries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSort = (field: 'nom' | 'prenom' | 'matricule' | 'date_embauche') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Salariés</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {filteredAndSortedSalaries.length} / {salaries.length} salarié(s)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              >
                <BarChart3 size={18} />
                Statistiques
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              >
                <Download size={18} />
                Exporter
              </button>
              <button
                onClick={() => loadData()}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-300"
              >
                <RefreshCw size={18} />
                Rafraîchir
              </button>
              <button
                onClick={() => {
                  setEditingSalarie(null);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {showStats && <SalarieStats salaries={filteredAndSortedSalaries} />}

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <span className="text-red-800 dark:text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Formulaire ou Liste */}
        {!showForm ? (
          <>
            {/* Filtres et Recherche */}
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-48">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom, matricule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterSociete}
                  onChange={(e) => setFilterSociete(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes les sociétés</option>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>

                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>

                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les grades</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="suspendu">Suspendu</option>
                  <option value="absent">Absent</option>
                  <option value="conge">Congé</option>
                  <option value="demission">Démission</option>
                  <option value="licencie">Licencié</option>
                  <option value="retraite">Retraité</option>
                </select>
              </div>
            </div>

            {/* Tableau ou État */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-slate-500 dark:text-slate-400">Chargement...</p>
              </div>
            ) : filteredAndSortedSalaries.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">Aucun salarié trouvé</p>
              </div>
            ) : (
              <SalarieTable
                salaries={filteredAndSortedSalaries}
                societes={societes}
                services={services}
                grades={grades}
                onEdit={(s) => {
                  setEditingSalarie(s);
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
          // ✅ PASSER LES 3 PROPS AU FORMULAIRE
          <SalarieForm
            salarie={editingSalarie}
            societes={societes}
            services={services}
            grades={grades}
            departements={departements}
            creneauxTravail={creneauxTravail}
            salariesForResponsable={salariesForResponsable}
            onSave={(data) =>
              editingSalarie ? handleUpdate(editingSalarie.id, data) : handleCreate(data as Omit<Salarie, 'id'>)
            }
            onCancel={() => {
              setShowForm(false);
              setEditingSalarie(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
