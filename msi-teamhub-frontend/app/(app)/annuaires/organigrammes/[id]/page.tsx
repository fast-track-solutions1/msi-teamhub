'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Mail, Phone, MapPin, Network, Users } from 'lucide-react';


interface Department {
  id: number;
  numero: string;
  nom: string;
  region: string;
  cheflieu: string;
  circuits_count: number;
}

interface HierarchyNode {
  id: number;
  nom: string;
  prenom: string;
  gradenom: string;
  poste: string;
  responsable_direct_nom: string
  mail: string;
  phone: string;
  photo: string | null;
  extension_3cx: string;
  matricule: string;
  statut: string;
  departements: Department[];
  totalcircuits: number;
  children: HierarchyNode[];
}

interface ApiResponse {
  service: { id: number; nom: string; description: string };
  hierarchy: HierarchyNode[];
  totalsalaries: number;
}

const getInitials = (nom: string, prenom: string): string => {
  const n = (prenom && prenom[0] ? prenom[0] : '') + (nom && nom[0] ? nom[0] : '');
  return n.toUpperCase().slice(0, 2);
};

const getAvatarColor = (id: number): string => {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-red-500 to-red-600',
    'from-orange-500 to-orange-600',
    'from-green-500 to-green-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
  ];
  return colors[id % colors.length];
};

export default function OrganigrammeDetailPage() {
  const params = useParams();
  const serviceId = params?.id as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Token non trouvÃ©. Veuillez vous connecter.');
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

        // Expand all nodes by default
        const allNodeIds = new Set<number>();
        const collectIds = (nodes: HierarchyNode[]) => {
          nodes.forEach((node) => {
            allNodeIds.add(node.id);
            if (node.children.length > 0) {
              collectIds(node.children);
            }
          });
        };
        collectIds(responseData.hierarchy);
        setExpandedNodes(allNodeIds);
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

  const toggleNode = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: HierarchyNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const hasDepartments = node.departements && node.departements.length > 0;
    const avatarColor = getAvatarColor(node.id);
    const initials = getInitials(node.nom, node.prenom);
    console.log('Department data:', node.departements);

    return (
      <div key={node.id} className="mb-6">
        {/* Connecteur vertical depuis le parent */}
        {depth > 0 && (
          <div className="flex items-start">
            <div className="w-8 flex justify-center relative">
              <div className="absolute top-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
              <div className="absolute top-4 w-4 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
            </div>

            {/* Carte du salariÃ© */}
            <div className="flex-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="flex">
                  {/* Avatar */}
                  <div
                    className={`bg-gradient-to-br ${avatarColor} w-24 h-24 flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-2xl font-bold text-white">{initials}</span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-4">
                    {/* En-tÃªte */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {node.prenom} {node.nom}
                        </h3>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
                          {node.gradenom}
                        </p>
                      </div>
                    </div>

                    {/* DÃ©tails */}
                    <div className="mt-3 space-y-2">
                      {node.poste && node.poste !== 'N/A' && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {node.poste}
                        </p>
                      )}
                      {node.mail && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Mail size={14} />
                          <a href={`mailto:${node.mail}`} className="hover:underline">
                            {node.mail}
                          </a>
                        </div>
                      )}
                      {node.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Phone size={14} />
                          {node.phone}
                        </div>
                      )}
                    </div>
                    {node.extension_3cx && (
  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
    <Phone size={14} />
    Poste 3CX: {node.extension_3cx}
  </div>
)}

{node.responsable_direct_nom && (
  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
    <Users size={14} />
    Responsable: {node.responsable_direct_nom}
  </div>
)}

                    {/* Circuits count */}
                    {node.totalcircuits > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <Network size={16} className="text-orange-500" />
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {node.totalcircuits} circuit{node.totalcircuits !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Statut */}
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-xs font-semibold">
                        {node.statut.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Bouton toggle */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleNode(node.id)}
                      className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-slate-600 dark:text-slate-400" />
                      ) : (
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Nombre d'enfants */}
                {hasChildren && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {node.children.length} collaborateur{node.children.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* DÃ©partements */}
                {hasDepartments && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      DÃ©partements ({node.departements.length})
                    </p>
                    <div className="space-y-2">
                      {node.departements.map((dept) => (
                        <div
                          key={dept.id}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-600"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {dept.nom}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin size={12} className="text-blue-600 dark:text-blue-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {dept.region || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Badge circuits (version enfant) */}
                            <div className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md">
  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
    {dept.circuits_count} circuit{dept.circuits_count !== 1 ? 's' : ''}
  </span>
</div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Racine sans connecteur parent */}
        {depth === 0 && (
          <>
            {/* Carte du salariÃ© */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-blue-300 dark:border-blue-700 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* Avatar */}
                <div
                  className={`bg-gradient-to-br ${avatarColor} w-full lg:w-28 h-28 flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-3xl font-bold text-white">{initials}</span>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-5">
                  {/* En-tÃªte */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {node.prenom} {node.nom}
                      </h3>
                      <p className="text-base font-semibold text-blue-600 dark:text-blue-400 mt-1">
                        {node.gradenom}
                      </p>
                    </div>
                  </div>

                  {/* DÃ©tails */}
                  <div className="mt-3 space-y-2">
                    {node.poste && node.poste !== 'N/A' && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {node.poste}
                      </p>
                    )}
                    {node.mail && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Mail size={16} />
                        <a href={`mailto:${node.mail}`} className="hover:underline">
                          {node.mail}
                        </a>
                      </div>
                    )}
                    {node.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone size={16} />
                        {node.phone}
                      </div>
                    )}
                  </div>
                    {node.extension_3cx && (
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
    <Phone size={16} />
    Poste 3CX: {node.extension_3cx}
  </div>
)}

{node.responsable_direct_nom && (
  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
    <Users size={16} />
    Responsable: {node.responsable_direct_nom}
  </div>
)}

                  {/* Circuits count */}
                  {node.totalcircuits > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-700">
                        <Network size={20} className="text-orange-600 dark:text-orange-400" />
                        <span className="font-bold text-orange-700 dark:text-orange-300">
                          {node.totalcircuits} circuit{node.totalcircuits !== 1 ? 's' : ''} au total
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Statut */}
                  <div className="mt-4">
                    <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full text-sm font-semibold">
                      {node.statut.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Bouton toggle */}
                {hasChildren && (
                  <button
                    onClick={() => toggleNode(node.id)}
                    className="ml-4 p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown size={24} className="text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronRight size={24} className="text-slate-600 dark:text-slate-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Nombre d'enfants */}
              {hasChildren && (
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  {node.children.length} collaborateur{node.children.length !== 1 ? 's' : ''} directs
                </div>
              )}

              {/* DÃ©partements */}
              {hasDepartments && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    DÃ©partements ({node.departements.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {node.departements.map((dept) => (
                      <div
                        key={dept.id}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {dept.nom}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {dept.region || 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Badge circuits (version racine) */}
                          <div className="bg-orange-200 dark:bg-orange-900 px-3 py-1.5 rounded-md flex-shrink-0">
  <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
    {dept.circuits_count} circuit{dept.circuits_count !== 1 ? 's' : ''}
  </span>
</div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Enfants */}
        {hasChildren && isExpanded && (
          <div className="mt-4 ml-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600"></div>
            <div className="space-y-0">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Aucune donnÃ©e</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tÃªte */}
        <div className="mb-12">
          <Link
            href="/annuaires/organigrammes"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-6 font-semibold"
          >
            â† Retour aux services
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
              {data.service.nom}
            </h1>
            {data.service.description && (
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {data.service.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  Nombre de salariÃ©s
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {data.totalsalaries}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  Managers
                </p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {data.hierarchy.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Organigramme */}
        {data.hierarchy.length > 0 ? (
          <div className="space-y-8">
            {data.hierarchy.map((node) => renderNode(node))}
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-8 text-center">
            <p className="text-yellow-800 dark:text-yellow-200 text-lg font-semibold">
              Aucune racine trouvÃ©e. VÃ©rifiez les donnÃ©es du service.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm">
            Cliquez sur les flÃ¨ches pour afficher/masquer les collaborateurs
          </p>
        </div>
      </div>
    </div>
  );
}