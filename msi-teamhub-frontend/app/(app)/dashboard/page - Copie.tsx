'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Loader2, Package2, Users } from 'lucide-react';

// ✅ IMPORTS DES CLASSES API
import { salarieApi, Salarie } from '@/lib/salarie-api';
import { departementApi, Departement } from '@/lib/departement-api';
import { serviceApi, Service } from '@/lib/service-api';
import { gradeApi, Grade } from '@/lib/grade-api';
import { equipementApi, Equipment, EquipmentInstance } from '@/lib/equipement-api';
import { societeApi, Societe } from '@/lib/societe-api';
import { getDepartementCoords } from '@/lib/departements-coords';

// Components réutilisés
import AnnuaireCard from '@/app/(app)/annuaires/salaries/components/AnnuaireCard';

// ============================================================================
// CARTE INTERACTIVE - VERSION AMÉLIORÉE AVEC VRAIES COORDONNÉES
// ============================================================================

interface InteractiveMapProps {
  isDark: boolean;
  departments: Departement[];
  salaries: Salarie[];
  services: Service[];
  grades: Grade[];
  onDepartmentClick: (dept: Departement) => void;
}

function InteractiveMap({ isDark, departments, salaries, services, grades, onDepartmentClick }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([46.2276, 2.3522], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 4,
    }).addTo(map.current);

    const depsWithCircuits = departments.filter(d => (d.nombre_circuits || 0) > 0);

    depsWithCircuits.forEach((dept: Departement) => {
      const coords = getDepartementCoords(dept.numero);
      if (!coords) return;

      const deptSalaries = salaries.filter((s: Salarie) => s.departements?.includes(dept.id));
      const circuits = dept.nombre_circuits || 0;

      let fillColor = '#3b82f6';
      let intensity = 0.6;
      let radius = 18;
      
      if (circuits <= 20) {
        fillColor = '#f59e0b';
        intensity = 0.4;
        radius = 12;
      } else if (circuits <= 50) {
        fillColor = '#3b82f6';
        intensity = 0.6;
        radius = 18;
      } else if (circuits <= 100) {
        fillColor = '#10b981';
        intensity = 0.7;
        radius = 22;
      } else {
        fillColor = '#8b5cf6';
        intensity = 0.85;
        radius = 28;
      }

      const circle = L.circleMarker([coords.lat, coords.lng], {
        radius: radius,
        fillColor: fillColor,
        color: '#1e293b',
        weight: 2.5,
        opacity: 1,
        fillOpacity: intensity,
      }).addTo(map.current!);

      circle.on('click', () => onDepartmentClick(dept));
      circle.on('mouseover', function () {
        this.setStyle({ weight: 3.5, fillOpacity: Math.min(intensity + 0.15, 1) });
      });
      circle.on('mouseout', function () {
        this.setStyle({ weight: 2.5, fillOpacity: intensity });
      });

      circle.bindPopup(`<strong>${dept.nom}</strong><br/>Circuits: ${circuits}<br/>Salariés: ${deptSalaries.length}`);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [departments, salaries, onDepartmentClick]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg border border-slate-300 dark:border-slate-600" />;
}

// ============================================================================
// TABLEAU DÉTAIL DÉPARTEMENT
// ============================================================================

interface DepartmentDetailTableProps {
  department: Departement;
  salaries: Salarie[];
  services: Service[];
  grades: Grade[];
  isDark: boolean;
}

function DepartmentDetailTable({ department, salaries, services, grades, isDark }: DepartmentDetailTableProps) {
  const deptSalaries = salaries.filter(s => s.departements?.includes(department.id));
  const coords = getDepartementCoords(department.numero);

  const salariesByService = services
    .map(svc => {
      const employees = deptSalaries.filter(s => s.service === svc.id);
      return {
        service: svc.nom,
        employees: employees,
      };
    })
    .filter(s => s.employees.length > 0);

  return (
    <div
      className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
        isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
      }`}
    >
      <div className="p-6 border-b border-slate-700/30">
        <h3 className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📍 {department.numero} - {department.nom}
        </h3>
      </div>

      {/* Info générale */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>RÉGION</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.region}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>CHEF-LIEU</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.chef_lieu}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-purple-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>CODE</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.numero}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-orange-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>CIRCUITS</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{department.nombre_circuits}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-pink-50'}`}>
            <p className={`text-xs font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>SALARIÉS</p>
            <p className={`font-bold text-lg mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{deptSalaries.length}</p>
          </div>
        </div>

        {/* Coordonnées GPS */}
        {coords && (
          <div
            className={`p-4 rounded-lg mb-6 border ${
              isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📍 Coordonnées GPS: {coords.lat}, {coords.lng}
            </p>
          </div>
        )}

        {/* Tableau des salariés par service et grade */}
        <div className="space-y-6">
          {salariesByService.map(serviceGroup => (
            <div key={serviceGroup.service}>
              <h4 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💼 {serviceGroup.service} ({serviceGroup.employees.length} emp.)
              </h4>

              {grades.map(grade => {
                const gradeEmployees = serviceGroup.employees.filter(s => s.grade === grade.id);
                if (gradeEmployees.length === 0) return null;

                return (
                  <div key={`${serviceGroup.service}-${grade.id}`} className="mb-4">
                    <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      📊 {grade.nom} ({gradeEmployees.length})
                    </p>
                    <div className="overflow-x-auto">
                      <table className={`w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead>
                          <tr
                            className={`border-b ${
                              isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-100/50'
                            }`}
                          >
                            <th className="px-3 py-2 text-left">Nom</th>
                            <th className="px-3 py-2 text-left">Prénom</th>
                            <th className="px-3 py-2 text-left">Matricule</th>
                            <th className="px-3 py-2 text-left">Email</th>
                            <th className="px-3 py-2 text-left">3CX</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeEmployees.map(emp => (
                            <tr
                              key={emp.id}
                              className={`border-b ${isDark ? 'border-slate-700/30' : 'border-slate-200/50'}`}
                            >
                              <td className="px-3 py-2 font-semibold">{emp.nom}</td>
                              <td className="px-3 py-2">{emp.prenom}</td>
                              <td className="px-3 py-2 font-mono text-xs">{emp.matricule}</td>
                              <td className="px-3 py-2">
                                <a
                                  href={`mailto:${emp.mail_professionnel}`}
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {emp.mail_professionnel || 'N/A'}
                                </a>
                              </td>
                              <td className="px-3 py-2">{emp.extension_3cx || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATS ÉQUIPEMENTS
// ============================================================================

interface EquipmentStatsProps {
  equipment: Equipment[];
  instances: EquipmentInstance[];
  salaries: Salarie[];
  isDark: boolean;
}

function EquipmentStats({ equipment, instances, salaries, isDark }: EquipmentStatsProps) {
  const totalStock = equipment.reduce((sum, e) => sum + (e.stock_total || 0), 0);
  const totalDisponible = equipment.reduce((sum, e) => sum + (e.stock_disponible || 0), 0);
  const totalUtilise = equipment.reduce((sum, e) => sum + ((e.stock_total || 0) - (e.stock_disponible || 0)), 0);

  const instancesAttribuees = instances.filter(i => i.salarie).length;
  const instancesNonAttribuees = instances.length - instancesAttribuees;

  const equipmentStats = equipment.map(eq => {
    const eqInstances = instances.filter(i => i.equipement === eq.id);
    const attribuees = eqInstances.filter(i => i.salarie).length;
    return {
      nom: eq.nom,
      stock_total: eq.stock_total,
      stock_disponible: eq.stock_disponible,
      attribuees: attribuees,
      non_attribuees: eqInstances.length - attribuees,
    };
  });

  return (
    <div
      className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
        isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
      }`}
    >
      <div className="p-6 border-b border-slate-700/30">
        <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Package2 className="w-5 h-5" />
          Équipements & Stock
        </h3>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Gestion complète du parc informatique
        </p>
      </div>
      <div className="p-6">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'} border border-blue-200 dark:border-blue-800`}
          >
            <p className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>STOCK TOTAL</p>
            <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalStock}</p>
          </div>
          <div
            className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-emerald-50'} border border-emerald-200 dark:border-emerald-800`}
          >
            <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>DISPONIBLE</p>
            <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalDisponible}</p>
          </div>
          <div
            className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-orange-50'} border border-orange-200 dark:border-orange-800`}
          >
            <p className={`text-xs font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>UTILISÉ</p>
            <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalUtilise}</p>
          </div>
          <div
            className={`p-4 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-purple-50'} border border-purple-200 dark:border-purple-800`}
          >
            <p className={`text-xs font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>INSTANCES</p>
            <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{instances.length}</p>
          </div>
        </div>

        {/* Breakdown Attribué/Non Attribué */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={`p-4 rounded-lg border ${
              isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Attribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>✅ Attribuées</span>
                <span className="font-bold text-green-600">{instancesAttribuees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>❌ Non attribuées</span>
                <span className="font-bold text-red-600">{instancesNonAttribuees}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Total instances
                </span>
                <span className="font-bold">{instances.length}</span>
              </div>
            </div>
          </div>

          {/* Pie chart Attribué/Non */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Attribuées', value: instancesAttribuees },
                    { name: 'Non attribuées', value: instancesNonAttribuees },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau détaillé */}
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <thead>
              <tr
                className={`border-b ${
                  isDark ? 'border-slate-700/50 bg-slate-800/30' : 'border-slate-200 bg-slate-100/50'
                }`}
              >
                <th className="px-4 py-3 text-left font-bold">Équipement</th>
                <th className="px-4 py-3 text-center font-bold">Stock Total</th>
                <th className="px-4 py-3 text-center font-bold">Disponible</th>
                <th className="px-4 py-3 text-center font-bold">Attribuées</th>
                <th className="px-4 py-3 text-center font-bold">Non Attribuées</th>
              </tr>
            </thead>
            <tbody>
              {equipmentStats.map(eq => (
                <tr
                  key={eq.nom}
                  className={`border-b ${
                    isDark ? 'border-slate-700/30 hover:bg-slate-800/20' : 'border-slate-200/50 hover:bg-slate-100/30'
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{eq.nom}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {eq.stock_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {eq.stock_disponible}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {eq.attribuees}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded font-bold ${
                        isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {eq.non_attribuees}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [departments, setDepartments] = useState<Departement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);

  const [selectedDept, setSelectedDept] = useState<Departement | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [deptData, serviceData, gradeData, equipData, instanceData, salaryData, societeData] = await Promise.all([
        departementApi.getDepartements(),
        serviceApi.getServices(),
        gradeApi.getGrades(),
        equipementApi.getEquipements(),
        equipementApi.getInstances(),
        salarieApi.getSalaries(),
        societeApi.getSocietes(),
      ]);

      setDepartments(Array.isArray(deptData) ? deptData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
      setGrades(Array.isArray(gradeData) ? gradeData : []);
      setEquipment(Array.isArray(equipData) ? equipData : []);
      setInstances(Array.isArray(instanceData) ? instanceData : []);
      setSalaries(Array.isArray(salaryData) ? salaryData : []);
      setSocietes(Array.isArray(societeData) ? societeData : []);
    } catch (err) {
      console.error('❌ Erreur loadAllData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadAllData();
    }
  }, [mounted, loadAllData]);

  const totalEmployees = salaries.length;
  const deptWithCircuits = departments.filter(d => (d.nombre_circuits || 0) > 0).length;
  const totalServices = services.length;
  const totalGrades = grades.length;
  const totalCircuits = departments.reduce((sum, d) => sum + (d.nombre_circuits || 0), 0);

  const employeesByDept = departments
    .map(dept => {
      const count = salaries.filter(s => s.departements?.includes(dept.id)).length;
      return { name: dept.nom, employees: count };
    })
    .filter(d => d.employees > 0)
    .sort((a, b) => b.employees - a.employees);

  const employeesByService = services
    .map(svc => {
      const count = salaries.filter(s => s.service === svc.id).length;
      return { name: svc.nom, employees: count };
    })
    .filter(s => s.employees > 0)
    .sort((a, b) => b.employees - a.employees);

  const employeesByGrade = grades
    .map(grd => {
      const count = salaries.filter(s => s.grade === grd.id).length;
      return { name: grd.nom, employees: count };
    })
    .filter(g => g.employees > 0)
    .sort((a, b) => b.employees - a.employees);

  const employeesByGender = [
    { name: 'Hommes', employees: salaries.filter(s => s.genre === 'm').length },
    { name: 'Femmes', employees: salaries.filter(s => s.genre === 'f').length },
    { name: 'Autre', employees: salaries.filter(s => s.genre === 'autre').length },
  ].filter(g => g.employees > 0);

  const genders = ['m', 'f', 'autre'] as const;
  const genderLabels: Record<(typeof genders)[number], string> = {
    m: 'Hommes',
    f: 'Femmes',
    autre: 'Autre',
  };

  // Genre par département
  const genderByDept = departments
    .map(dept => {
      const data = genders
        .map(g => ({
          name: genderLabels[g],
          employees: salaries.filter(s => s.genre === g && s.departements?.includes(dept.id)).length,
        }))
        .filter(d => d.employees > 0);
      return { dept: dept.nom, data };
    })
    .filter(d => d.data.length > 0);

  // Genre par service
  const genderByService = services
    .map(svc => {
      const data = genders
        .map(g => ({
          name: genderLabels[g],
          employees: salaries.filter(s => s.genre === g && s.service === svc.id).length,
        }))
        .filter(d => d.employees > 0);
      return { service: svc.nom, data };
    })
    .filter(d => d.data.length > 0);

  // Genre par grade
  const genderByGrade = grades
    .map(grd => {
      const data = genders
        .map(g => ({
          name: genderLabels[g],
          employees: salaries.filter(s => s.genre === g && s.grade === grd.id).length,
        }))
        .filter(d => d.employees > 0);
      return { grade: grd.nom, data };
    })
    .filter(d => d.data.length > 0);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981'];

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={40} />
      </div>
    );
  }

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      } p-6 md:p-8`}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-top-4">
          <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>📊 Tableau de Bord RH</h1>
          <p className={`mt-3 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            MSI TeamHub - Analytics RH & Gestion Départements
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Employés', value: totalEmployees, icon: '👥', color: 'from-blue-500 to-cyan-500', subtext: 'Total salariés' },
            { title: 'Circuits', value: totalCircuits, icon: '🔗', color: 'from-amber-500 to-orange-500', subtext: `${deptWithCircuits} depts` },
            { title: 'Services', value: totalServices, icon: '📋', color: 'from-purple-500 to-pink-500', subtext: 'Unités' },
            { title: 'Grades', value: totalGrades, icon: '📊', color: 'from-rose-500 to-red-500', subtext: 'Niveaux' },
          ].map(kpi => (
            <div
              key={kpi.title}
              className={`rounded-xl border backdrop-blur-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-105 cursor-pointer group ${
                isDark ? 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600' : 'bg-white/40 border-white/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-xs font-bold tracking-widest ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {kpi.title}
                    </p>
                    <h3 className={`text-4xl font-bold mt-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</h3>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{kpi.subtext}</p>
                  </div>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{kpi.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Distribution par Genre + par entités */}
        <div
          className={`mt-4 rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-5 h-5" />
              Distribution par Genre
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Vue globale + par département, service et grade
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Global */}
            <div className="flex flex-col items-center">
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Global</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={employeesByGender}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="employees"
                    label={({ name, employees }) => `${name}: ${employees}`}
                    labelLine={false}
                  >
                    {employeesByGender.map((entry, index) => (
                      <Cell key={`global-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value} emp.`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Par Département */}
            <div className="flex flex-col">
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Par Département
              </p>
              <div className="space-y-4 overflow-y-auto max-h-72 pr-2">
                {genderByDept.map(item => (
                  <div
                    key={item.dept}
                    className="border-b border-slate-200/40 dark:border-slate-700/40 pb-2"
                  >
                    <p
                      className={`text-xs font-semibold mb-1 truncate ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {item.dept}
                    </p>
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart data={item.data} layout="vertical" barCategoryGap={10}>
                        <CartesianGrid strokeDasharray="2 2" stroke={gridColor} />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={70}
                          stroke={textColor}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip formatter={(value: any) => `${value} emp.`} />
                        <Bar dataKey="employees" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>

            {/* Par Service */}
            <div className="flex flex-col">
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Par Service
              </p>
              <div className="space-y-4 overflow-y-auto max-h-72 pr-2">
                {genderByService.map(item => (
                  <div
                    key={item.service}
                    className="border-b border-slate-200/40 dark:border-slate-700/40 pb-2"
                  >
                    <p
                      className={`text-xs font-semibold mb-1 truncate ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {item.service}
                    </p>
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart data={item.data} layout="vertical" barCategoryGap={10}>
                        <CartesianGrid strokeDasharray="2 2" stroke={gridColor} />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={70}
                          stroke={textColor}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip formatter={(value: any) => `${value} emp.`} />
                        <Bar dataKey="employees" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>

            {/* Par Grade */}
            <div className="flex flex-col">
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Par Grade
              </p>
              <div className="space-y-4 overflow-y-auto max-h-72 pr-2">
                {genderByGrade.map(item => (
                  <div
                    key={item.grade}
                    className="border-b border-slate-200/40 dark:border-slate-700/40 pb-2"
                  >
                    <p
                      className={`text-xs font-semibold mb-1 truncate ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {item.grade}
                    </p>
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart data={item.data} layout="vertical" barCategoryGap={10}>
                        <CartesianGrid strokeDasharray="2 2" stroke={gridColor} />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={70}
                          stroke={textColor}
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip formatter={(value: any) => `${value} emp.`} />
                        <Bar dataKey="employees" fill="#10b981" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARTE PLEINE LARGEUR */}
        <div
          className={`mt-6 rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>🗺️ Carte Interactive</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Cliquez sur un point pour voir les détails
            </p>
          </div>
          <div className="h-[70vh]">
            <InteractiveMap
              isDark={isDark}
              departments={departments}
              salaries={salaries}
              services={services}
              grades={grades}
              onDepartmentClick={setSelectedDept}
            />
          </div>
        </div>

        {/* TABLEAU DÉTAIL DÉPARTEMENT - PLEINE LARGEUR */}
        {selectedDept && (
          <DepartmentDetailTable
            department={selectedDept}
            salaries={salaries}
            services={services}
            grades={grades}
            isDark={isDark}
          />
        )}

        {/* Effectifs par Département / Service / Grade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Départements */}
          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                🗺️ Employés par Département
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={employeesByDept}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={textColor}
                    width={95}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="employees" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Services */}
          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                💼 Employés par Service
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={employeesByService}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={textColor}
                    width={95}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="employees" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grades */}
          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                📊 Employés par Grade
              </h3>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={employeesByGrade}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis type="number" stroke={textColor} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={textColor}
                    width={95}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="employees" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* STATS ÉQUIPEMENTS - PLEINE LARGEUR */}
        <EquipmentStats equipment={equipment} instances={instances} salaries={salaries} isDark={isDark} />

        {/* Top Salariés */}
        <div
          className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              👥 Top 5 Derniers Salariés
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {salaries.slice(0, 5).map(salarie => (
                <AnnuaireCard
                  key={salarie.id}
                  salarie={salarie}
                  societes={societes}
                  services={services}
                  grades={grades}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
