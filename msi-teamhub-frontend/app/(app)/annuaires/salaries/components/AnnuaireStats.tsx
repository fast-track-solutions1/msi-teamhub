'use client';

import { Salarie } from '@/lib/salarie-api';
import { Departement } from '@/lib/departement-api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnnuaireStatsProps {
  salaries: Salarie[];
  departements: Departement[];
}

export default function AnnuaireStats({
  salaries,
  departements,
}: AnnuaireStatsProps) {
  // Vérifier que departements existe ET est un array
  if (!departements || !Array.isArray(departements) || departements.length === 0) {
    return <div className="p-6 text-center text-gray-500">Chargement des données...</div>;
  }

  // === STATS PAR STATUT ===
  const statsByStatut = {
    actif: salaries.filter(s => s.statut === 'actif').length,
    inactif: salaries.filter(s => s.statut === 'inactif').length,
    conge: salaries.filter(s => s.statut === 'conge').length,
    arret_maladie: salaries.filter(s => s.statut === 'arret_maladie').length,
  };

  const statutData = [
    { name: 'Actifs', value: statsByStatut.actif, fill: '#10b981' },
    { name: 'Inactifs', value: statsByStatut.inactif, fill: '#6b7280' },
    { name: 'Congés', value: statsByStatut.conge, fill: '#3b82f6' },
    { name: 'Arrêt maladie', value: statsByStatut.arret_maladie, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  // === STATS PAR DÉPARTEMENT ===
  const statsByDept: { [key: number]: number } = {};
  salaries.forEach(salarie => {
    if (salarie.departements && Array.isArray(salarie.departements) && salarie.departements.length > 0) {
      salarie.departements.forEach(deptId => {
        statsByDept[deptId] = (statsByDept[deptId] || 0) + 1;
      });
    }
  });

  // Créer deptData avec vérifications strictes
  const deptData = Object.entries(statsByDept)
    .map(([deptId, count]) => {
      // Vérifier que departements existe et trouver le département
      const dept = departements?.find(d => d?.id === parseInt(deptId, 10));
      return {
        name: dept?.nom || `Dept ${deptId}`,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .filter(item => item.name && item.count > 0);

  // === STATS PAR RÉGION ===
  const statsByRegion: { [key: string]: number } = {};
  
  if (departements && Array.isArray(departements) && departements.length > 0) {
    departements.forEach(dept => {
      if (dept && typeof dept.id === 'number' && dept.region) {
        const count = salaries.filter(s => s.departements?.includes(dept.id)).length;
        if (count > 0) {
          statsByRegion[dept.region] = (statsByRegion[dept.region] || 0) + count;
        }
      }
    });
  }

  const regionData = Object.entries(statsByRegion)
    .map(([region, count]) => ({
      name: region,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  // === STATS PAR RESPONSABLE DIRECT ===
  const statsByResponsable: { [key: number]: number } = {};
  salaries.forEach(salarie => {
    if (salarie.responsable_direct && typeof salarie.responsable_direct === 'number') {
      statsByResponsable[salarie.responsable_direct] = (statsByResponsable[salarie.responsable_direct] || 0) + 1;
    }
  });

  const responsableData = Object.entries(statsByResponsable)
    .map(([respId, count]) => {
      const resp = salaries.find(s => s.id === parseInt(respId, 10));
      return {
        name: resp ? `${resp.prenom} ${resp.nom}` : 'Unknown',
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .filter(item => item.count > 0);

  // === STATS GLOBALES ===
  const totalSalaries = salaries.length;
  const tauxActivite = totalSalaries > 0 
    ? ((statsByStatut.actif / totalSalaries) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg">
      {/* === STATS RÉSUMÉ === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Actifs</div>
          <div className="text-3xl font-bold text-green-800 dark:text-green-200 mt-1">
            {statsByStatut.actif}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {tauxActivite}% du total
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">En Congés</div>
          <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mt-1">
            {statsByStatut.conge}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {totalSalaries > 0 ? ((statsByStatut.conge / totalSalaries) * 100).toFixed(1) : '0'}% du total
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-sm text-red-600 dark:text-red-400 font-medium">Arrêt Maladie</div>
          <div className="text-3xl font-bold text-red-800 dark:text-red-200 mt-1">
            {statsByStatut.arret_maladie}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
            {totalSalaries > 0 ? ((statsByStatut.arret_maladie / totalSalaries) * 100).toFixed(1) : '0'}% du total
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total</div>
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-1">
            {totalSalaries}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Tous statuts
          </div>
        </div>
      </div>

      {/* === GRAPHIQUE STATUT === */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Distribution par Statut
        </h3>
        {statutData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Aucune donnée</p>
        )}
      </div>

      {/* === GRAPHIQUE DÉPARTEMENT === */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Top Départements
        </h3>
        {deptData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Aucune donnée de département</p>
        )}
      </div>

      {/* === GRAPHIQUE RÉGION === */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Distribution par Région
        </h3>
        {regionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Aucune donnée de région</p>
        )}
      </div>

      {/* === GRAPHIQUE RESPONSABLES === */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Top 10 Responsables Directs
        </h3>
        {responsableData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsableData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Aucune donnée de responsable</p>
        )}
      </div>
    </div>
  );
}