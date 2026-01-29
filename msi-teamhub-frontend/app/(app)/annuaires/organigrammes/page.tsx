'use client';

import { useState, useEffect } from 'react';
import { Service, getServices } from '@/lib/service-api';
import Link from 'next/link';

export default function OrganigrammesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [salariesCount, setSalariesCount] = useState<Record<number, number>>({});

  // États des filtres
  const [searchName, setSearchName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [searchDescription, setSearchDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServices();
        setServices(data);
        setFilteredServices(data);

        // Charger le nombre de salariés par service
        try {
          const response = await fetch('http://localhost:8000/api/salaries/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.ok) {
            const salariesData = await response.json();
            const countByService: Record<number, number> = {};
            
            let salaries: any[] = [];
            if (Array.isArray(salariesData)) {
              salaries = salariesData;
            } else if (salariesData?.results && Array.isArray(salariesData.results)) {
              salaries = salariesData.results;
            } else if (salariesData?.data && Array.isArray(salariesData.data)) {
              salaries = salariesData.data;
            }
            
            salaries.forEach((s: any) => {
              if (s.service) {
                countByService[s.service] = (countByService[s.service] || 0) + 1;
              }
            });
            
            setSalariesCount(countByService);
          }
        } catch (error) {
          console.error('❌ Erreur chargement salariés:', error);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = services;

    // Filtre par nom du service
    if (searchName.trim()) {
      filtered = filtered.filter(s => 
        s.nom.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filtre par niveau hiérarchique
    if (selectedLevel !== null) {
      filtered = filtered.filter(s => getServiceLevel(s.id) === selectedLevel);
    }

    // Filtre par responsable
    if (selectedResponsable) {
      filtered = filtered.filter(s => 
        s.responsable_info?.toLowerCase().includes(selectedResponsable.toLowerCase())
      );
    }

    // Filtre par description
    if (searchDescription.trim()) {
      filtered = filtered.filter(s => 
        s.description?.toLowerCase().includes(searchDescription.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchName, selectedLevel, selectedResponsable, searchDescription, services]);

  const getServiceLevel = (serviceId: number, visited = new Set()): number => {
    if (visited.has(serviceId)) return 0;
    visited.add(serviceId);

    const service = services.find(s => s.id === serviceId);
    if (!service?.parentservice) return 0;

    return 1 + getServiceLevel(service.parentservice, visited);
  };

  const colorsByLevel: Record<number, string> = {
    0: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-800 shadow-indigo-500/50',
    1: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 shadow-emerald-500/50',
    2: 'bg-gradient-to-br from-violet-400 via-purple-500 to-purple-700 shadow-purple-500/50',
    3: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-700 shadow-orange-500/50',
    4: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-700 shadow-sky-500/50',
  };

  const defaultColor = 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 shadow-slate-500/50';

  const servicesByLevel = filteredServices.reduce((acc, service) => {
    const level = getServiceLevel(service.id);
    if (!acc[level]) acc[level] = [];
    acc[level].push(service);
    return acc;
  }, {} as Record<number, Service[]>);

  const maxLevel = Math.max(...Object.keys(servicesByLevel).map(Number), 0);

  // Get unique responsables pour le dropdown
  const uniqueResponsables = Array.from(
    new Set(services.map(s => s.responsable_info).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            Organigramme Services
          </h1>
          <p className="text-slate-300 text-lg">
            Organisé par niveau hiérarchique - Cliquez pour voir les employés
          </p>
        </div>

        {/* FILTRES AVANCÉS */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">🔎 Filtres Avancés</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recherche par nom */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔍 Nom du Service
              </label>
              <input
                type="text"
                placeholder="Chercher un service..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filtre par niveau */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📊 Niveau Hiérarchique
              </label>
              <select
                value={selectedLevel ?? ''}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Tous les niveaux</option>
                {Array.from({ length: maxLevel + 1 }).map((_, i) => (
                  <option key={i} value={i}>
                    Niveau {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par responsable */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👤 Responsable
              </label>
              <select
                value={selectedResponsable}
                onChange={(e) => setSelectedResponsable(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Tous les responsables</option>
                {uniqueResponsables.map((resp) => (
                  <option key={resp} value={resp}>
                    {resp}
                  </option>
                ))}
              </select>
            </div>

            {/* Recherche par description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📝 Description
              </label>
              <input
                type="text"
                placeholder="Chercher dans la description..."
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Résultats */}
          <div className="mt-4 text-sm text-slate-400">
            Affichage : <span className="text-indigo-400 font-semibold">{filteredServices.length}</span> / <span>{services.length}</span> services
          </div>
        </div>

        {/* Services par niveau */}
        <div className="space-y-16">
          {Array.from({ length: maxLevel + 1 })
            .map((_, level) => servicesByLevel[level])
            .map((levelServices, idx) => (
              levelServices && levelServices.length > 0 && (
                <div key={idx} className="group">
                  {/* Titre niveau */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`h-1 flex-grow rounded-full ${colorsByLevel[idx] || defaultColor}`} />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent whitespace-nowrap">
                      Niveau {idx + 1}
                    </h2>
                    <span className="text-sm font-normal text-slate-400 bg-slate-700/50 px-4 py-1 rounded-full">
                      {levelServices?.length || 0} service{levelServices?.length !== 1 ? 's' : ''}
                    </span>
                    <div className={`h-1 flex-grow rounded-full ${colorsByLevel[idx] || defaultColor}`} />
                  </div>

                  {/* Grille de cartes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {levelServices?.map(service => {
                      const color = colorsByLevel[idx] || defaultColor;
                      const childServices = services.filter(s => s.parentservice === service.id);
                      const employeeCount = salariesCount[service.id] || 0;

                      return (
                        <Link
                          key={service.id}
                          href={`/annuaires/organigrammes/${service.id}`}
                        >
                          <div className={`${color} text-white p-8 rounded-2xl shadow-2xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer min-h-[340px] flex flex-col justify-between transform hover:-translate-y-2 border border-white/10 backdrop-blur-sm hover:border-white/30 group/card`}>
                            {/* Contenu */}
                            <div className="space-y-4">
                              {/* Titre Service */}
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-white/20 group-hover/card:bg-white/30 transition-colors flex-shrink-0">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-lg leading-tight break-words group-hover/card:brightness-110 transition-all">
                                    {service.nom}
                                  </h3>
                                </div>
                              </div>

                              {/* Responsable */}
                              {service.responsable_info && (
                                <div className="p-3 rounded-lg bg-white/15 border border-white/25 hover:bg-white/20 transition-colors">
                                  <p className="text-xs opacity-75 uppercase tracking-widest font-semibold mb-1.5">👤 Responsable</p>
                                  <p className="text-sm font-bold text-white break-words leading-snug">
                                    {service.responsable_info}
                                  </p>
                                </div>
                              )}

                              {/* Nombre Salariés */}
                              <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                                <p className="text-xs opacity-70 uppercase tracking-widest font-semibold mb-1">👥 Salariés</p>
                                <p className="text-base font-bold text-white">
                                  {employeeCount} employé{employeeCount !== 1 ? 's' : ''}
                                </p>
                              </div>

                              {/* Service Parent */}
                              {service.parentservice && (
                                <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                                  <p className="text-xs opacity-70 uppercase tracking-widest font-semibold mb-1">📈 Parent Service</p>
                                  <p className="text-xs text-white/80 break-words">
                                    {services.find(s => s.id === service.parentservice)?.nom || 'N/A'}
                                  </p>
                                </div>
                              )}

                              {/* Services Enfants */}
                              {childServices.length > 0 && (
                                <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                                  <p className="text-xs opacity-70 uppercase tracking-widest font-semibold mb-1.5">📉 Sous-services</p>
                                  <div className="flex flex-wrap gap-1">
                                    {childServices.map(child => (
                                      <span key={child.id} className="text-xs bg-white/20 px-2 py-1 rounded text-white whitespace-nowrap">
                                        {child.nom}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Description */}
                              {service.description && (
                                <p className="text-sm opacity-85 line-clamp-2 text-white/90 leading-relaxed">
                                  {service.description}
                                </p>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/20">
                              <span className="text-xs opacity-75 font-medium tracking-wide">
                                Niveau {idx + 1}
                              </span>
                              <span className="text-xs opacity-50 group-hover/card:opacity-100 transition-opacity">
                                → Consulter
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">❌ Aucun service ne correspond aux filtres sélectionnés</p>
          </div>
        )}

        {/* Footer stats */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-slate-800/50 border border-slate-700 rounded-full px-6 py-3">
            <p className="text-slate-300 text-sm font-medium">
              <span className="text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text font-bold">
                {services.length}
              </span>
              {' '}services au total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
