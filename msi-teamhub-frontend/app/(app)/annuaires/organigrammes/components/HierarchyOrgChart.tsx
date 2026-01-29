'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';

interface Employee {
  id: number;
  nom: string;
  prenom: string;
  grade: string;
  gradeId: number;
  departement: string;
  statut: string;
  email?: string;
  telephone?: string;
  responsable?: number;
}

interface Props {
  employees: Employee[];
  isDarkMode: boolean;
}

// Composant pour afficher un employé avec ses enfants
const EmployeeNode: React.FC<{
  employee: Employee;
  allEmployees: Employee[];
  level: number;
  isDarkMode: boolean;
}> = ({ employee, allEmployees, level, isDarkMode }) => {
  // Trouver les employés qui rapportent à cet employé
  const subordinates = useMemo(
    () => allEmployees.filter((emp) => emp.responsable === employee.id),
    [employee.id, allEmployees]
  );

  const bgColor = isDarkMode ? 'bg-slate-700' : 'bg-white';
  const borderColor = isDarkMode ? 'border-slate-600' : 'border-slate-200';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const secondaryText = isDarkMode ? 'text-slate-300' : 'text-slate-600';

  const levelPadding = level * 40;

  return (
    <div style={{ paddingLeft: `${levelPadding}px` }} className="mb-4">
      {/* === EMPLOYEE CARD === */}
      <div
        className={`${bgColor} ${borderColor} border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow`}
      >
        {/* Header avec ligne gauche */}
        <div className="flex items-start gap-3">
          {/* Connecteur visuel */}
          {level > 0 && (
            <div className="flex flex-col items-center mt-1">
              <div className={`w-0.5 h-6 ${isDarkMode ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-bold ${textColor}`}>
                  {employee.prenom} {employee.nom}
                </h3>
                <p className={`text-sm font-semibold ${secondaryText}`}>
                  {employee.grade}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                employee.statut === 'Actif'
                  ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                  : isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
              }`}>
                {employee.statut}
              </span>
            </div>

            {/* Infos supplémentaires */}
            <div className={`mt-2 text-sm ${secondaryText} space-y-1`}>
              <p>📍 <strong>Département:</strong> {employee.departement}</p>
              {employee.email && <p>📧 <strong>Email:</strong> {employee.email}</p>}
              {employee.telephone && <p>📱 <strong>Tél:</strong> {employee.telephone}</p>}
            </div>

            {/* Compteur subordonnés */}
            {subordinates.length > 0 && (
              <div className={`mt-3 px-2 py-1 rounded text-xs font-semibold ${
                isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                👥 {subordinates.length} subordonné{subordinates.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === SUBORDINATES (RÉCURSIF) === */}
      {subordinates.length > 0 && (
        <div className={`mt-2 ${level > 0 ? `ml-4 pl-4 ${isDarkMode ? 'border-l-2 border-slate-600' : 'border-l-2 border-slate-300'}` : ''}`}>
          {subordinates.map((sub) => (
            <EmployeeNode
              key={sub.id}
              employee={sub}
              allEmployees={allEmployees}
              level={level + 1}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function HierarchyOrgChart({ employees, isDarkMode }: Props) {
  // Trouver les employés sans responsable (racines de l'organigramme)
  const rootEmployees = useMemo(
    () => employees.filter((emp) => !emp.responsable || emp.responsable === 0),
    [employees]
  );

  const bgColor = isDarkMode ? 'bg-slate-800' : 'bg-slate-50';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';

  if (employees.length === 0) {
    return (
      <div className={`${bgColor} rounded-lg p-12 text-center`}>
        <p className={`text-lg ${textColor}`}>
          ❌ Aucun employé à afficher
        </p>
      </div>
    );
  }

  return (
    <div className={`${bgColor} rounded-lg p-8 mt-8`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textColor} mb-2`}>
          📊 Organigramme Hiérarchique
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {employees.length} employé{employees.length > 1 ? 's' : ''} - {rootEmployees.length} responsable{rootEmployees.length > 1 ? 's' : ''} principal{rootEmployees.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* === ROOT EMPLOYEES === */}
      <div className="space-y-2">
        {rootEmployees.length > 0 ? (
          rootEmployees.map((emp) => (
            <EmployeeNode
              key={emp.id}
              employee={emp}
              allEmployees={employees}
              level={0}
              isDarkMode={isDarkMode}
            />
          ))
        ) : (
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Aucun responsable trouvé
          </p>
        )}
      </div>
    </div>
  );
}