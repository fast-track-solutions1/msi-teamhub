'use client';

import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';
import { Mail, Phone, Building2, Briefcase, Award } from 'lucide-react';

interface AnnuaireCardProps {
  salarie: Salarie;
  societes: Societe[];
  services: Service[];
  grades: Grade[];
}

export default function AnnuaireCard({ salarie, societes, services, grades }: AnnuaireCardProps) {
  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';
  const getServiceName = (id: number | null) => services.find((s) => s.id === id)?.nom || 'N/A';
  const getGradeName = (id: number | null) => grades.find((g) => g.id === id)?.nom || 'N/A';

  const getInitials = (nom: string, prenom: string) => {
    if (!nom && !prenom) return '?';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (statut: string) => {
    const colors: { [key: string]: string } = {
      actif: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200',
      suspendu: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200',
      absent: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200',
      conge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200',
    };
    return colors[statut] || colors['actif'];
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header avec photo */}
      <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 h-24">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          {salarie.photo ? (
            <img
              src={salarie.photo}
              alt={`${salarie.prenom} ${salarie.nom}`}
              className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-lg"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-slate-900 shadow-lg">
              {getInitials(salarie.nom, salarie.prenom)}
            </div>
          )}
        </div>

        {/* Badge statut */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(salarie.statut)}`}>
            {salarie.statut}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="pt-14 px-6 pb-6">
        {/* Nom et matricule */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {salarie.prenom} {salarie.nom}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
            {salarie.matricule}
          </p>
        </div>

        {/* Infos organisation */}
        <div className="space-y-3 mb-4">
          {salarie.poste && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate">{salarie.poste}</span>
            </div>
          )}

          {salarie.service && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate">{getServiceName(salarie.service)}</span>
            </div>
          )}

          {salarie.grade && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate">{getGradeName(salarie.grade)}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>

        {/* Contact */}
        <div className="space-y-2">
          {salarie.mail_professionnel && (
            <a
              href={`mailto:${salarie.mail_professionnel}`}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
            >
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate group-hover:underline">{salarie.mail_professionnel}</span>
            </a>
          )}

          {salarie.telephone_professionnel && (
            <a
              href={`tel:${salarie.telephone_professionnel}`}
              className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{salarie.telephone_professionnel}</span>
              {salarie.extension_3cx && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (ext. {salarie.extension_3cx})
                </span>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
