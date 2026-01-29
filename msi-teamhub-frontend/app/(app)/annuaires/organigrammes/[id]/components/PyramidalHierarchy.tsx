'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HierarchyTree, HierarchyNode } from './components';
import { HierarchyControls, FilterState } from './components/HierarchyControls';

interface ApiResponse {
  service: { id: number; nom: string; description: string };
  hierarchy: HierarchyNode[];
  totalsalaries: number;
}

export default function OrganigrammeDetailPage() {
  const params = useParams();
  const serviceId = params?.id as string;

  // === ÉTAT API ===
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === FILTRES + CONTROLS ===
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedGrade: '',
    selectedStatut: '',
    selectedDepartement: '',
  });
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HierarchyNode | null>(null);

  // === FETCH DATA ===
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Token non trouvé. Veuillez vous connecter.');
        }

        const response = await fetch(
          `http://localhost:8000/api/services/${serviceId}/hierarchy`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const responseData: ApiResponse = await response.json();
        setData(responseData);
      } catch (err: any) {
        console.error('Erreur chargement:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchHierarchy();
    }
  }, [serviceId]);

  // === DARK MODE EFFECT ===
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // === EXTRACT FILTER OPTIONS ===
  const filterOptions = useMemo(() => {
    if (!data) return { grades: [], statuts: [], departements: [] };

    const grades = new Set<string>();
    const statuts = new Set<string>();
    const departements = new Set<string>();

    const collectOptions = (nodes: HierarchyNode[]) => {
      nodes.forEach((node) => {
        if (node.gradenom) grades.add(node.gradenom);
        if (node.statut) statuts.add(node.statut);
        if (node.departements) {
          node.departements.forEach((dept) => departements.add(dept.nom));
        }
        if (node.children && node.children.length > 0) {
          collectOptions(node.children);
        }
      });
    };

    collectOptions(data.hierarchy);

    return {
      grades: Array.from(grades).sort(),
      statuts: Array.from(statuts).sort(),
      departements: Array.from(departements).sort(),
    };
  }, [data]);

  // === FILTER LOGIC ===
  const filteredHierarchy = useMemo(() => {
    if (!data) return [];

    const filterNode = (node: HierarchyNode): HierarchyNode | null => {
      const matchesSearch =
        !filters.searchQuery ||
        node.nom.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        node.prenom.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        node.poste.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        node.gradenom.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesGrade = !filters.selectedGrade || node.gradenom === filters.selectedGrade;
      const matchesStatut = !filters.selectedStatut || node.statut === filters.selectedStatut;
      const matchesDept =
        !filters.selectedDepartement ||
        (node.departements?.some((dept) => dept.nom === filters.selectedDepartement) || false);

      // Filtrer les enfants récursivement
      const filteredChildren = node.children
        ? node.children
            .map((child) => filterNode(child))
            .filter((child): child is HierarchyNode => child !== null)
        : [];

      const nodeMatches = matchesSearch && matchesGrade && matchesStatut && matchesDept;

      // Retourner le node s'il match OU s'il a des enfants qui match
      if (nodeMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    return data.hierarchy
      .map((node) => filterNode(node))
      .filter((node): node is HierarchyNode => node !== null);
  }, [data, filters]);

  // === COUNT FILTERED EMPLOYEES ===
  const filteredCount = useMemo(() => {
    const count = (nodes: HierarchyNode[]): number => {
      return nodes.reduce((total, node) => {
        return total + 1 + (node.children ? count(node.children) : 0);
      }, 0);
    };
    return count(filteredHierarchy);
  }, [filteredHierarchy]);

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Chargement de l'organigramme...
          </p>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-6 text-lg">{error}</p>
          <Link
            href="/annuaires/organigrammes"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  // === NO DATA STATE ===
  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Aucune donnée</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      } ${isFullscreen ? 'p-0' : 'p-8'}`}
    >
      <div className={isFullscreen ? 'h-screen flex flex-col' : 'max-w-7xl mx-auto'}>
        {/* === HEADER (Hidden in fullscreen) === */}
        {!isFullscreen && (
          <div className="mb-12">
            <Link
              href="/annuaires/organigrammes"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 font-semibold"
            >
              ← Retour aux services
            </Link>

            <div className={`${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } rounded-xl p-8 shadow-lg border`}>
              <h1 className={`text-4xl font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              } mb-3`}>
                {data.service.nom}
              </h1>
              {data.service.description && (
                <p className={`text-lg ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {data.service.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className={`${
                  isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'
                } rounded-lg p-4 border`}>
                  <p className={`${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  } text-sm font-semibold`}>
                    Nombre de salariés
                  </p>
                  <p className={`text-4xl font-bold ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  } mt-2`}>
                    {data.totalsalaries}
                  </p>
                </div>

                <div className={`${
                  isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
                } rounded-lg p-4 border`}>
                  <p className={`${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  } text-sm font-semibold`}>
                    Managers
                  </p>
                  <p className={`text-4xl font-bold ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  } mt-2`}>
                    {data.hierarchy.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === CONTROLS BAR === */}
        <HierarchyControls
          onFilterChange={setFilters}
          grades={filterOptions.grades}
          statuts={filterOptions.statuts}
          departements={filterOptions.departements}
          zoom={zoom}
          onZoomChange={setZoom}
          isFullscreen={isFullscreen}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          isDarkMode={isDarkMode}
          onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
          totalEmployees={data.totalsalaries}
          filteredCount={filteredCount}
        />

        {/* === ORGANIGRAMME === */}
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className={`transition-transform ${isFullscreen ? 'flex-1 overflow-auto' : ''}`}
        >
          {filteredHierarchy.length > 0 ? (
            <div className="space-y-8">
              <HierarchyTree
                nodes={filteredHierarchy}
                onSelectEmployee={(employee) => {
                  setSelectedEmployee(employee);
                  console.log('Sélectionné:', employee);
                }}
                expandedByDefault={true}
              />
            </div>
          ) : (
            <div className={`${
              isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
            } border-2 rounded-xl p-8 text-center`}>
              <p className={`text-lg font-semibold ${
                isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                {filters.searchQuery || filters.selectedGrade || filters.selectedStatut || filters.selectedDepartement
                  ? '❌ Aucun résultat ne correspond à vos filtres'
                  : '❌ Aucune racine trouvée. Vérifiez les données du service.'}
              </p>
            </div>
          )}
        </div>

        {/* === FOOTER === */}
        {!isFullscreen && (
          <div className="mt-16 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">
              Cliquez sur les cartes pour sélectionner un employé ou sur les flèches pour afficher/masquer les collaborateurs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
