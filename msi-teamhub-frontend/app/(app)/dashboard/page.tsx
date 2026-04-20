'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import {
  Loader2,
  Package2,
  Users,
  X as XIcon,
  MapPin,
  Building2,
  Hash,
  Briefcase,
  Navigation,
} from 'lucide-react';

import { salarieApi, Salarie } from '@/lib/salarie-api';
import { departementApi, Departement } from '@/lib/departement-api';
import { serviceApi, Service } from '@/lib/service-api';
import { gradeApi, Grade } from '@/lib/grade-api';
import { equipementApi, Equipment, EquipmentInstance } from '@/lib/equipement-api';
import { societeApi, Societe } from '@/lib/societe-api';
import { getDepartementCoords } from '@/lib/departements-coords';
import DepartmentDirectoryDetailModal from '@/app/(app)/annuaires/departements/components/DepartmentDirectoryDetailModal';
import AnnuaireCard from '@/app/(app)/annuaires/salaries/components/AnnuaireCard';

// ============================================================================
// CARTE INTERACTIVE (France + markers verts + hover popup + click -> modal)
// ============================================================================

interface InteractiveMapProps {
  isDark: boolean;
  departments: Departement[];
  salaries: Salarie[];
  onDepartmentClick: (dept: Departement) => void;
}

function InteractiveMap({
  isDark,
  departments,
  salaries,
  onDepartmentClick,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView([46.8, 2.6], 5.8);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 4,
    }).addTo(map.current);

    const depsWithCircuits = departments.filter(
      d => (d.nombre_circuits || 0) > 0,
    );

    const pistachioIcon = new L.Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      iconRetinaUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    depsWithCircuits.forEach((dept: Departement) => {
      const coords = getDepartementCoords(dept.numero);
      if (!coords) return;

      const deptSalaries = salaries.filter((s: Salarie) =>
        s.departements?.includes(dept.id),
      );
      const circuits = dept.nombre_circuits || 0;
      const chauffeurs = dept.nombre_chauffeurs || 0;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pistachioIcon,
      }).addTo(map.current!);

          marker.bindPopup(
            `
    <div style="
      min-width:360px;
      max-width:400px;
      border-radius:18px;
      padding:18px;
      background:${
        isDark
          ? 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,118,110,0.95))'
          : 'linear-gradient(135deg, rgba(219,234,254,0.96), rgba(167,243,208,0.96))'
      };
      color:${isDark ? '#e2e8f0' : '#0f172a'};
      border:1px solid ${isDark ? '#14b8a6' : '#bfdbfe'};
      box-shadow:0 16px 40px rgba(15,23,42,0.26);
      font-family:Inter,system-ui,sans-serif;
    ">
            <div style="text-align:center;margin-bottom:14px;">
              <div style="
                display:inline-flex;
                align-items:center;
                justify-content:center;
                min-width:36px;
                height:36px;
                padding:0 10px;
                border-radius:9999px;
                margin-bottom:8px;
                font-size:12px;
                font-weight:800;
                letter-spacing:.08em;
                background:${isDark ? 'rgba(16,185,129,.14)' : '#dcfce7'};
                color:${isDark ? '#6ee7b7' : '#047857'};
              ">
                ${dept.numero}
              </div>

              <div style="
                font-size:16px;
                font-weight:800;
                line-height:1.2;
                margin-bottom:4px;
              ">
                ${dept.nom}
              </div>

              <div style="
                font-size:12px;
                color:${isDark ? '#94a3b8' : '#64748b'};
              ">
                ${dept.region}
              </div>
            </div>

            <div style="
              display:grid;
              grid-template-columns:repeat(3, minmax(90px, 1fr));
              gap:12px;
            ">
              <div style="
                border-radius:14px;
                padding:12px 10px;
                text-align:center;
                background:${isDark ? 'rgba(15,23,42,.72)' : '#f8fafc'};
                border:1px solid ${isDark ? 'rgba(51,65,85,.85)' : '#e2e8f0'};
              ">
                <div style="
                  font-size:11px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:.08em;
                  color:${isDark ? '#86efac' : '#15803d'};
                  margin-bottom:6px;
                ">
                  Circuits
                </div>
                <div style="
                  font-size:18px;
                  font-weight:800;
                  line-height:1;
                ">
                  ${circuits}
                </div>
              </div>

              <div style="
                border-radius:14px;
                padding:12px 10px;
                text-align:center;
                background:${isDark ? 'rgba(15,23,42,.72)' : '#f8fafc'};
                border:1px solid ${isDark ? 'rgba(51,65,85,.85)' : '#e2e8f0'};
              ">
                <div style="
                  font-size:11px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:.08em;
                  color:${isDark ? '#93c5fd' : '#2563eb'};
                  margin-bottom:6px;
                ">
                  Salariés
                </div>
                <div style="
                  font-size:18px;
                  font-weight:800;
                  line-height:1;
                ">
                  ${deptSalaries.length}
                </div>
              </div>

              <div style="
                border-radius:14px;
                padding:12px 10px;
                text-align:center;
                background:${isDark ? 'rgba(15,23,42,.72)' : '#f8fafc'};
                border:1px solid ${isDark ? 'rgba(51,65,85,.85)' : '#e2e8f0'};
              ">
                <div style="
                  font-size:11px;
                  font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:.08em;
                  color:${isDark ? '#fca5a5' : '#b91c1c'};
                  margin-bottom:6px;
                ">
                  Chauffeurs
                </div>
                <div style="
                  font-size:18px;
                  font-weight:800;
                  line-height:1;
                ">
                  ${chauffeurs}
                </div>
              </div>
            </div>
          </div>
        `,
        {
          className: 'wow-dept-popup',
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
          offset: [0, -24],
        },
      );

      marker.on('mouseover', () => {
        marker.openPopup();
      });

      marker.on('mouseout', () => {
        marker.closePopup();
      });

      marker.on('click', () => {
        onDepartmentClick(dept);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [departments, salaries, onDepartmentClick, isDark]);

  return (
    <div className="relative w-full h-full">
      <style jsx global>{`
        .wow-dept-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
          border-radius: 18px;
        }

        .wow-dept-popup .leaflet-popup-content {
          margin: 0;
        }

        .wow-dept-popup .leaflet-popup-tip {
          background: ${isDark ? '#0f172a' : '#ffffff'};
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .wow-dept-popup .leaflet-popup-close-button {
          display: none;
        }
      `}</style>

      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg shadow-lg border border-slate-300 dark:border-slate-600"
      />
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
  const totalUtilise = equipment.reduce(
    (sum, e) => sum + ((e.stock_total || 0) - (e.stock_disponible || 0)),
    0,
  );

  const instancesAttribuees = instances.filter(i => i.salarie).length;
  const instancesNonAttribuees = instances.length - instancesAttribuees;

  const equipmentStats = equipment.map(eq => {
    const eqInstances = instances.filter(i => i.equipement === eq.id);
    const attribuees = eqInstances.filter(i => i.salarie).length;
    return {
      nom: eq.nom,
      stock_total: eq.stock_total,
      stock_disponible: eq.stock_disponible,
      attribuees,
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
        <h3 className={isDark ? 'font-bold text-lg flex items-center gap-2 text-white' : 'font-bold text-lg flex items-center gap-2 text-slate-900'}>
          <Package2 className="w-5 h-5" />
          Équipements & Stock
        </h3>
        <p className={isDark ? 'text-xs mt-1 text-slate-400' : 'text-xs mt-1 text-slate-600'}>
          Gestion complète du parc informatique
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className={
              isDark
                ? 'p-4 rounded-lg bg-slate-800/50 border border-blue-800'
                : 'p-4 rounded-lg bg-blue-50 border border-blue-200'
            }
          >
            <p className={isDark ? 'text-xs font-bold text-blue-400' : 'text-xs font-bold text-blue-600'}>
              STOCK TOTAL
            </p>
            <p className={isDark ? 'text-2xl font-bold mt-2 text-white' : 'text-2xl font-bold mt-2 text-slate-900'}>
              {totalStock}
            </p>
          </div>
          <div
            className={
              isDark
                ? 'p-4 rounded-lg bg-slate-800/50 border border-emerald-800'
                : 'p-4 rounded-lg bg-emerald-50 border border-emerald-200'
            }
          >
            <p
              className={
                isDark ? 'text-xs font-bold text-emerald-400' : 'text-xs font-bold text-emerald-600'
              }
            >
              DISPONIBLE
            </p>
            <p className={isDark ? 'text-2xl font-bold mt-2 text-white' : 'text-2xl font-bold mt-2 text-slate-900'}>
              {totalDisponible}
            </p>
          </div>
          <div
            className={
              isDark
                ? 'p-4 rounded-lg bg-slate-800/50 border border-orange-800'
                : 'p-4 rounded-lg bg-orange-50 border border-orange-200'
            }
          >
            <p
              className={
                isDark ? 'text-xs font-bold text-orange-400' : 'text-xs font-bold text-orange-600'
              }
            >
              UTILISÉ
            </p>
            <p className={isDark ? 'text-2xl font-bold mt-2 text-white' : 'text-2xl font-bold mt-2 text-slate-900'}>
              {totalUtilise}
            </p>
          </div>
          <div
            className={
              isDark
                ? 'p-4 rounded-lg bg-slate-800/50 border border-purple-800'
                : 'p-4 rounded-lg bg-purple-50 border border-purple-200'
            }
          >
            <p
              className={
                isDark ? 'text-xs font-bold text-purple-400' : 'text-xs font-bold text-purple-600'
              }
            >
              INSTANCES
            </p>
            <p className={isDark ? 'text-2xl font-bold mt-2 text-white' : 'text-2xl font-bold mt-2 text-slate-900'}>
              {instances.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div
            className={
              isDark
                ? 'p-4 rounded-lg border bg-slate-800/30 border-slate-700'
                : 'p-4 rounded-lg border bg-slate-50 border-slate-200'
            }
          >
            <h4 className={isDark ? 'font-bold mb-3 text-white' : 'font-bold mb-3 text-slate-900'}>
              Attribution
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-600'}>
                  ✅ Attribuées
                </span>
                <span className="font-bold text-green-600">{instancesAttribuees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-600'}>
                  ❌ Non attribuées
                </span>
                <span className="font-bold text-red-600">{instancesNonAttribuees}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className={isDark ? 'text-sm font-semibold text-slate-300' : 'text-sm font-semibold text-slate-700'}>
                  Total instances
                </span>
                <span className="font-bold">{instances.length}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={[
                  { name: 'Attribuées', value: instancesAttribuees },
                  { name: 'Non attribuées', value: instancesNonAttribuees },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className={isDark ? 'w-full text-sm text-slate-300' : 'w-full text-sm text-slate-700'}>
            <thead>
              <tr
                className={
                  isDark
                    ? 'border-b border-slate-700/50 bg-slate-800/30'
                    : 'border-b border-slate-200 bg-slate-100/50'
                }
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
                  className={
                    isDark
                      ? 'border-b border-slate-700/30 hover:bg-slate-800/20'
                      : 'border-b border-slate-200/50 hover:bg-slate-100/30'
                  }
                >
                  <td className="px-4 py-3 font-semibold">{eq.nom}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        isDark
                          ? 'px-2 py-1 rounded font-bold bg-blue-500/20 text-blue-300'
                          : 'px-2 py-1 rounded font-bold bg-blue-100 text-blue-700'
                      }
                    >
                      {eq.stock_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        isDark
                          ? 'px-2 py-1 rounded font-bold bg-emerald-500/20 text-emerald-300'
                          : 'px-2 py-1 rounded font-bold bg-emerald-100 text-emerald-700'
                      }
                    >
                      {eq.stock_disponible}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        isDark
                          ? 'px-2 py-1 rounded font-bold bg-green-500/20 text-green-300'
                          : 'px-2 py-1 rounded font-bold bg-green-100 text-green-700'
                      }
                    >
                      {eq.attribuees}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        isDark
                          ? 'px-2 py-1 rounded font-bold bg-red-500/20 text-red-300'
                          : 'px-2 py-1 rounded font-bold bg-red-100 text-red-700'
                      }
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

  const [deptSearch, setDeptSearch] = useState('');
  const [deptSortKey, setDeptSortKey] = useState<
    'numero' | 'nom' | 'region' | 'circuits' | 'chauffeurs' | 'salaries'
  >('nom');
  const [deptSortDir, setDeptSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      const [deptData, serviceData, gradeData, equipData, instanceData, salaryData, societeData] =
        await Promise.all([
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

  const totalHommes = salaries.filter(s => s.genre === 'm').length;
  const totalFemmes = salaries.filter(s => s.genre === 'f').length;

  const genderStackByDept = departments
    .map(dept => {
      const hommes = salaries.filter(s => s.genre === 'm' && s.departements?.includes(dept.id)).length;
      const femmes = salaries.filter(s => s.genre === 'f' && s.departements?.includes(dept.id)).length;
      const total = hommes + femmes;
      return { name: dept.nom, hommes, femmes, total };
    })
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const genderStackByService = services
    .map(svc => {
      const hommes = salaries.filter(s => s.genre === 'm' && s.service === svc.id).length;
      const femmes = salaries.filter(s => s.genre === 'f' && s.service === svc.id).length;
      const total = hommes + femmes;
      return { name: svc.nom, hommes, femmes, total };
    })
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const genderStackByGrade = grades
    .map(grd => {
      const hommes = salaries.filter(s => s.genre === 'm' && s.grade === grd.id).length;
      const femmes = salaries.filter(s => s.genre === 'f' && s.grade === grd.id).length;
      const total = hommes + femmes;
      return { name: grd.nom, hommes, femmes, total };
    })
    .filter(d => d.total > 0)
    .sort((a, b) => b.total - a.total);

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
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      } p-4 md:p-6`}
    >
      <div className="space-y-8 w-full mx-auto">
        <div className="animate-in fade-in slide-in-from-top-4">
          <h1 className={isDark ? 'text-5xl font-bold text-white' : 'text-5xl font-bold text-slate-900'}>
            📊 Tableau de Bord RH
          </h1>
          <p className={isDark ? 'mt-3 text-lg text-slate-400' : 'mt-3 text-lg text-slate-600'}>
            MSI TeamHub - Analytics RH & Gestion Départements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              title: 'Employés',
              value: totalEmployees,
              icon: '👥',
              color: 'from-blue-500 to-cyan-500',
              subtext: 'Total salariés',
            },
            {
              title: 'Circuits',
              value: totalCircuits,
              icon: '🔗',
              color: 'from-amber-500 to-orange-500',
              subtext: `${deptWithCircuits} depts`,
            },
            {
              title: 'Services',
              value: totalServices,
              icon: '📋',
              color: 'from-purple-500 to-pink-500',
              subtext: 'Unités',
            },
            {
              title: 'Grades',
              value: totalGrades,
              icon: '📊',
              color: 'from-rose-500 to-red-500',
              subtext: 'Niveaux',
            },
          ].map(kpi => (
            <div
              key={kpi.title}
              className={`relative rounded-xl border backdrop-blur-xl overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer group ${
                isDark
                  ? 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
                  : 'bg-white/40 border-white/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity`}
              />
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={
                        isDark
                          ? 'text-xs font-bold tracking-widest text-slate-400'
                          : 'text-xs font-bold tracking-widest text-slate-600'
                      }
                    >
                      {kpi.title}
                    </p>
                    <h3
                      className={
                        isDark ? 'text-4xl font-bold mt-3 text-white' : 'text-4xl font-bold mt-3 text-slate-900'
                      }
                    >
                      {kpi.value}
                    </h3>
                    <p className={isDark ? 'text-xs mt-2 text-slate-500' : 'text-xs mt-2 text-slate-500'}>
                      {kpi.subtext}
                    </p>
                  </div>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{kpi.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
                Carte Interactive des Départements
              </h3>
            </div>
            <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
              Cliquez sur un marqueur pour voir le détail du département.
            </p>
          </div>
          <div className="h-[70vh]">
            <InteractiveMap
              isDark={isDark}
              departments={departments}
              salaries={salaries}
              onDepartmentClick={setSelectedDept}
            />
          </div>
        </div>

        <div
          className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
                Départements actifs
              </h3>
              <p className={isDark ? 'text-xs mt-1 text-slate-400' : 'text-xs mt-1 text-slate-600'}>
                Numéro, nom, région, chef-lieu, circuits, effectifs, détail des salariés.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={deptSearch}
                onChange={e => setDeptSearch(e.target.value)}
                placeholder="Filtrer (numéro, nom, région, chef-lieu)..."
                className={
                  isDark
                    ? 'px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-sm text-slate-100 placeholder:text-slate-500'
                    : 'px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400'
                }
              />
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className={isDark ? 'w-full text-sm text-slate-300' : 'w-full text-sm text-slate-700'}>
                <thead>
                  <tr
                    className={
                      isDark
                        ? 'bg-slate-800/60 border-b border-slate-700'
                        : 'bg-slate-100/60 border-b border-slate-200'
                    }
                  >
                    {[
                      { key: 'numero', label: 'Code' },
                      { key: 'nom', label: 'Département' },
                      { key: 'region', label: 'Région' },
                      { key: 'chef_lieu', label: 'Chef-lieu' },
                      { key: 'circuits', label: 'Circuits' },
                      { key: 'chauffeurs', label: 'Chauffeurs' },
                      { key: 'salaries', label: 'Salariés' },
                    ].map(col => {
                      if (col.key === 'chef_lieu') {
                        return (
                          <th key={col.key} className="px-4 py-3 text-left">
                            {col.label}
                          </th>
                        );
                      }
                      const isActive = deptSortKey === col.key;
                      return (
                        <th
                          key={col.key}
                          className="px-4 py-3 text-left cursor-pointer select-none"
                          onClick={() => {
                            if (deptSortKey === col.key) {
                              setDeptSortDir(deptSortDir === 'asc' ? 'desc' : 'asc');
                            } else {
                              setDeptSortKey(col.key as any);
                              setDeptSortDir('asc');
                            }
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <span>{col.label}</span>
                            {isActive && (
                              <span className="text-[10px]">
                                {deptSortDir === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 text-center">Détail</th>
                  </tr>
                </thead>

                {departments
                  .filter(d => (d.nombre_circuits || 0) > 0)
                  .map(d => {
                    const deptSalaries = salaries.filter(s => s.departements?.includes(d.id));
                    const circuits = d.nombre_circuits || 0;
                    const chauffeurs = d.nombre_chauffeurs || 0;
                    return { dept: d, deptSalaries, circuits, chauffeurs };
                  })
                  .filter(({ dept }) => {
                    const q = deptSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      dept.numero.toLowerCase().includes(q) ||
                      dept.nom.toLowerCase().includes(q) ||
                      dept.region.toLowerCase().includes(q) ||
                      (dept.chef_lieu || '').toLowerCase().includes(q)
                    );
                  })
                  .sort((a, b) => {
                    const dir = deptSortDir === 'asc' ? 1 : -1;
                    if (deptSortKey === 'numero') {
                      return a.dept.numero.localeCompare(b.dept.numero) * dir;
                    }
                    if (deptSortKey === 'nom') {
                      return a.dept.nom.localeCompare(b.dept.nom) * dir;
                    }
                    if (deptSortKey === 'region') {
                      return a.dept.region.localeCompare(b.dept.region) * dir;
                    }
                    if (deptSortKey === 'circuits') {
                      return (a.circuits - b.circuits) * dir;
                    }
                      if (deptSortKey === 'chauffeurs') {
                      return (a.chauffeurs - b.chauffeurs) * dir;
                    }
                    if (deptSortKey === 'salaries') {
                      return (a.deptSalaries.length - b.deptSalaries.length) * dir;
                    }
                    return 0;
                  })
                  .map(({ dept, deptSalaries, circuits, chauffeurs }) => {
                    const expanded = expandedDeptId === dept.id;
                    return (
                      <tbody key={dept.id}>
                        <tr
                          className={
                            isDark
                              ? 'border-b border-slate-700/40 hover:bg-slate-800/40'
                              : 'border-b border-slate-200/60 hover:bg-slate-50'
                          }
                        >
<td className="px-4 py-3 font-mono text-xs">{dept.numero}</td>
<td className="px-4 py-3 font-semibold">{dept.nom}</td>
<td className="px-4 py-3">{dept.region}</td>
<td className="px-4 py-3">{dept.chef_lieu}</td>
<td className="px-4 py-3 text-center">{circuits}</td>

<td className="px-4 py-3 text-center">
  <span
    className={
      isDark
        ? 'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold'
        : 'inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold'
    }
  >
    <Users className="w-3.5 h-3.5" />
    {chauffeurs}
  </span>
</td>

<td className="px-4 py-3 text-center">{deptSalaries.length}</td>
<td className="px-4 py-3 text-center">
  <button
    onClick={() =>
      setExpandedDeptId(expanded ? null : dept.id)
    }
    className={
      isDark
        ? 'px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-100 border border-slate-600 hover:bg-slate-700'
        : 'px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200'
    }
  >
    {expanded ? 'Masquer' : 'Voir salariés'}
  </button>
</td>
                        </tr>
                        {expanded && (
                          <tr
                            className={
                              isDark
                                ? 'border-b border-slate-700/40 bg-slate-900/60'
                                : 'border-b border-slate-200/60 bg-slate-50'
                            }
                          >
                            <td colSpan={8} className="px-4 py-3">
                              <div className="text-xs mb-2 font-semibold">
                                Salariés du département ({deptSalaries.length})
                              </div>
                              <div className="overflow-x-auto">
                                <table
                                  className={
                                    isDark
                                      ? 'w-full text-xs text-slate-300'
                                      : 'w-full text-xs text-slate-700'
                                  }
                                >
                                  <thead>
                                    <tr
                                      className={
                                        isDark
                                          ? 'border-b border-slate-700/60 bg-slate-800/80'
                                          : 'border-b border-slate-200 bg-slate-100'
                                      }
                                    >
                                      <th className="px-2 py-2 text-left">Nom</th>
                                      <th className="px-2 py-2 text-left">Prénom</th>
                                      <th className="px-2 py-2 text-left">Service</th>
                                      <th className="px-2 py-2 text-left">Grade</th>
                                      <th className="px-2 py-2 text-left">Email</th>
                                      <th className="px-2 py-2 text-left">3CX</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {deptSalaries.map(emp => {
                                      const empService = services.find(s => s.id === emp.service);
                                      const empGrade = grades.find(g => g.id === emp.grade);
                                      return (
                                        <tr
                                          key={emp.id}
                                          className={
                                            isDark
                                              ? 'border-b border-slate-800/60'
                                              : 'border-b border-slate-200/60'
                                          }
                                        >
                                          <td className="px-2 py-1 font-semibold">{emp.nom}</td>
                                          <td className="px-2 py-1">{emp.prenom}</td>
                                          <td className="px-2 py-1">{empService?.nom || '—'}</td>
                                          <td className="px-2 py-1">{empGrade?.nom || '—'}</td>
                                          <td className="px-2 py-1">
                                            <a
                                              href={`mailto:${emp.mail_professionnel}`}
                                              className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                              {emp.mail_professionnel || 'N/A'}
                                            </a>
                                          </td>
                                          <td className="px-2 py-1">{emp.extension_3cx || 'N/A'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })}
              </table>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3
                className={
                  isDark
                    ? 'font-bold text-lg flex items-center gap-2 text-white'
                    : 'font-bold text-lg flex items-center gap-2 text-slate-900'
                }
              >
                <Users className="w-5 h-5" />
                Distribution par Genre
              </h3>
              <p className={isDark ? 'text-xs mt-1 text-slate-400' : 'text-xs mt-1 text-slate-600'}>
                Hommes / Femmes globalement et par entité.
              </p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div
              className={
                isDark
                  ? 'rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 flex flex-col gap-4'
                  : 'rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-4'
              }
            >
              <div>
                <p className={isDark ? 'text-xs font-semibold text-slate-400' : 'text-xs font-semibold text-slate-600'}>
                  TOTAL
                </p>
                <p className={isDark ? 'text-3xl font-bold mt-1 text-white' : 'text-3xl font-bold mt-1 text-slate-900'}>
                  {totalEmployees} salariés
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className={isDark ? 'text-sm text-slate-200' : 'text-sm text-slate-800'}>
                        Hommes
                      </span>
                    </span>
                    <span className="font-semibold text-blue-500">{totalHommes}</span>
                  </div>
                  <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
                    {totalEmployees ? Math.round((totalHommes / totalEmployees) * 100) : 0} %
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className={isDark ? 'text-sm text-slate-200' : 'text-sm text-slate-800'}>
                        Femmes
                      </span>
                    </span>
                    <span className="font-semibold text-rose-500">{totalFemmes}</span>
                  </div>
                  <p className={isDark ? 'text-xs text-slate-400' : 'text-xs text-slate-600'}>
                    {totalEmployees ? Math.round((totalFemmes / totalEmployees) * 100) : 0} %
                  </p>
                </div>
              </div>

              <div className={isDark ? 'text-xs text-slate-500 mt-2' : 'text-xs text-slate-500 mt-2'}>
                Ratio H/F : {totalFemmes ? (totalHommes / totalFemmes).toFixed(2) : '—'}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <div>
                <p
                  className={
                    isDark ? 'text-sm font-semibold mb-2 text-slate-200' : 'text-sm font-semibold mb-2 text-slate-800'
                  }
                >
                  Genres par Département (Top 10)
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderStackByDept}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" stroke={textColor} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke={textColor}
                        width={110}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip formatter={(value: any) => `${value} emp.`} />
                      <Bar dataKey="hommes" stackId="g1" fill="#3b82f6" />
                      <Bar dataKey="femmes" stackId="g1" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p
                  className={
                    isDark ? 'text-sm font-semibold mb-2 text-slate-200' : 'text-sm font-semibold mb-2 text-slate-800'
                  }
                >
                  Genres par Service (Top 10)
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderStackByService}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" stroke={textColor} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke={textColor}
                        width={110}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip formatter={(value: any) => `${value} emp.`} />
                      <Bar dataKey="hommes" stackId="g2" fill="#3b82f6" />
                      <Bar dataKey="femmes" stackId="g2" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p
                  className={
                    isDark ? 'text-sm font-semibold mb-2 text-slate-200' : 'text-sm font-semibold mb-2 text-slate-800'
                  }
                >
                  Genres par Grade
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genderStackByGrade}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" stroke={textColor} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke={textColor}
                        width={110}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip formatter={(value: any) => `${value} emp.`} />
                      <Bar dataKey="hommes" stackId="g3" fill="#3b82f6" />
                      <Bar dataKey="femmes" stackId="g3" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
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

          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
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

          <div
            className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
              isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
            }`}
          >
            <div className="p-6 border-b border-slate-700/30">
              <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
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

        <EquipmentStats equipment={equipment} instances={instances} salaries={salaries} isDark={isDark} />

        <div
          className={`rounded-xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white/40 border-white/60 shadow-sm'
          }`}
        >
          <div className="p-6 border-b border-slate-700/30">
            <h3 className={isDark ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>
              👥 Top 5 Derniers Salariés
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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

{selectedDept && (
  <DepartmentDirectoryDetailModal
    departement={selectedDept}
    societes={societes}
    salaries={salaries}
    isOpen={true}
    onClose={() => setSelectedDept(null)}
  />
)}
    </div>
  );
}


