'use client';

import React from 'react';

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

interface Grade {
  id: number;
  nom: string;
  ordre: number;
}

interface Props {
  employees: Employee[];
  grades: Grade[];
  isDarkMode: boolean;
}

export default function PyramidalHierarchy({ employees, grades, isDarkMode }: Props) {
  // Grouper les employés par grade
  const employeesByGrade = grades
    .sort((a, b) => a.ordre - b.ordre)
    .map((grade) => ({
      ...grade,
      employees: employees.filter((emp) => emp.gradeId === grade.id),
    }))
    .filter((group) => group.employees.length > 0);

  if (employeesByGrade.length === 0) {
    return (
      <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          ❌ Aucune donnée à afficher
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-12">
      {employeesByGrade.map((group) => (
        <div key={group.id} className="space-y-6">
          {/* Titre du grade */}
          <div className={`p-6 rounded-lg border-l-4 border-blue-500 ${isDarkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              {group.nom}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {group.employees.length} employé{group.employees.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Grille d'employés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 hover:border-blue-400'
                    : 'bg-white border-slate-200 hover:border-blue-400'
                }`}
              >
                {/* Nom et prénom */}
                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {employee.prenom} {employee.nom}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {employee.grade}
                  </p>
                </div>

                {/* Infos supplémentaires */}
                <div className="space-y-3 text-sm">
                  {/* Département */}
                  {employee.departement && (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500">📦</span>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Département
                        </p>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          {employee.departement}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Statut */}
                  {employee.statut && (
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Statut
                        </p>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          {employee.statut}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {employee.email && (
                    <div className="flex items-start gap-2">
                      <span className="text-purple-500">✉️</span>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Email
                        </p>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} break-all`}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Téléphone */}
                  {employee.telephone && (
                    <div className="flex items-start gap-2">
                      <span className="text-orange-500">📱</span>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Téléphone
                        </p>
                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                          {employee.telephone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}