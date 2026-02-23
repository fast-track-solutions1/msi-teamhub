'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Briefcase,
  Award,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  LightbulbIcon,
  Wrench,
  Printer,
  FileDown,
  TrendingUp,
} from 'lucide-react';
import { FichePoste } from '@/lib/ficheposte-api';
import { generateFichePDF } from '@/lib/pdf-generator';
import { Grade, getGradeById } from '@/lib/grade-api';
import { Service, getServiceById } from '@/lib/service-api';
import { getFichePosteHistory, HistoryEntry } from '@/lib/ficheposte-history-api';

interface FichePosteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fiche: FichePoste | null;
}

interface HistorySummary {
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

const InfoSection: React.FC<{
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value?: string | null;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
      <Icon size={16} />
    </div>
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || 'Non renseigné'}
      </div>
    </div>
  </div>
);

const ContentSection: React.FC<{
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  content?: string | null;
}> = ({ icon: Icon, title, content }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-3 flex items-center gap-2">
      <div className="rounded-full bg-slate-100 p-1.5 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
        <Icon size={14} />
      </div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {title}
      </h3>
    </div>
    <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap dark:text-slate-200">
      {content && content.trim() !== '' ? content : 'Non renseigné'}
    </div>
  </div>
);

export default function FichePosteDetailModal({
  isOpen,
  onClose,
  fiche,
}: FichePosteDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'historique'>('details');
  const [historique, setHistorique] = useState<HistoryEntry[]>([]);
  const [loadingHistorique, setLoadingHistorique] = useState(false);
  const [gradeDetails, setGradeDetails] = useState<Grade | null>(null);
  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [historySummary, setHistorySummary] = useState<HistorySummary>({});

  useEffect(() => {
    if (isOpen && fiche?.id) {
      fetchHistorique(fiche.id);
      if (fiche.grade) {
        loadGradeDetails(fiche.grade);
      }
      if (fiche.service) {
        loadServiceDetails(fiche.service);
      }
    }
  }, [isOpen, fiche?.id, fiche?.grade, fiche?.service]);

  const loadGradeDetails = async (gradeId: number) => {
    try {
      const grade = await getGradeById(gradeId);
      setGradeDetails(grade);
    } catch (error) {
      console.error('Erreur chargement grade:', error);
    }
  };

  const loadServiceDetails = async (serviceId: number) => {
    try {
      const service = await getServiceById(serviceId);
      setServiceDetails(service);
    } catch (error) {
      console.error('Erreur chargement service:', error);
    }
  };

  const fetchHistorique = async (ficheId: number) => {
    setLoadingHistorique(true);
    try {
      const data = await getFichePosteHistory(ficheId);
      setHistorique(data);
      computeHistorySummary(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistorique(false);
    }
  };

  // ✅ COPIÉ DEPUIS page.tsx - Logique identique
  const computeHistorySummary = (entries: HistoryEntry[]) => {
    if (!entries || entries.length === 0) {
      setHistorySummary({});
      return;
    }

    const sorted = [...entries].sort(
      (a, b) =>
        new Date(a.action_time).getTime() - new Date(b.action_time).getTime(),
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const format = (d: string) =>
      new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(d));

    setHistorySummary({
      createdAt: first ? format(first.action_time) : undefined,
      createdBy: first ? first.user.full_name || first.user.username : undefined,
      lastModifiedAt: last ? format(last.action_time) : undefined,
      lastModifiedBy: last ? last.user.full_name || last.user.username : undefined,
    });
  };

  if (!isOpen || !fiche) return null;

  const gradeNom = fiche.grade_nom || gradeDetails?.nom || 'Non renseigné';
  const serviceNom = fiche.service_nom || serviceDetails?.nom || 'Non renseigné';

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR');
  };

  const getStatutLabel = (statut?: string | null) => {
    if (!statut) return 'Non défini';
    switch (statut) {
      case 'ACTIF':
      case 'actif':
        return 'Actif';
      case 'INACTIF':
      case 'inactif':
        return 'Inactif';
      case 'Brouillon':
      case 'BROUILLON':
      case 'en_revision':
        return 'En révision';
      case 'archive':
        return 'Archivé';
      default:
        return statut;
    }
  };

  const getStatutBadgeClass = (statut?: string | null) => {
    if (!statut) return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100';
    switch (statut) {
      case 'ACTIF':
      case 'actif':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200';
      case 'INACTIF':
      case 'inactif':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200';
      case 'Brouillon':
      case 'BROUILLON':
      case 'en_revision':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200';
      case 'archive':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100';
    }
  };

  const getInitiales = (nom: string) => {
    if (!nom) return 'XX';
    return nom
      .split(' ')
      .map((mot) => mot.charAt(0).toUpperCase())
      .join('');
  };

  const referenceFiche = (() => {
    const id = fiche.id;
    const gradeInitiales = getInitiales(gradeNom);
    const serviceInitiales = getInitiales(serviceNom);
    return `FICHE-${id}-${gradeInitiales}-${serviceInitiales}`;
  })();

// ✅ Format identique à page.tsx : "04 février 2026 à 16:42 par Admin"
// ✅ Fallback : Si historique vide, utiliser les dates de la fiche
const createdInfo = historySummary.createdAt && historySummary.createdBy
  ? `${historySummary.createdAt} par ${historySummary.createdBy}`
  : fiche.date_creation || fiche.datecreation
    ? formatDateTime(fiche.date_creation || fiche.datecreation)
    : 'N/A';

const lastModInfo = historySummary.lastModifiedAt && historySummary.lastModifiedBy
  ? `${historySummary.lastModifiedAt} par ${historySummary.lastModifiedBy}`
  : fiche.date_modification || fiche.datemodification
    ? formatDateTime(fiche.date_modification || fiche.datemodification)
    : 'N/A';

const echelonGrade = gradeDetails?.echelon
  ? `Niveau ${gradeDetails.echelon}`
  : 'Non défini';

const handleGeneratePDF = () => {
  const titreComplet = `${gradeNom}${serviceNom !== 'Non renseigné' ? ` - ${serviceNom}` : ''}`;

  // ✅ Calcul de l'échelon comme dans FichePosteDocument
  const echelonGradeValue = fiche.grade !== undefined && fiche.grade !== null 
    ? `Niveau ${fiche.grade}` 
    : '';

  generateFichePDF({
    societeNom: 'MSI TeamHub',
    referenceFiche,
    titreComplet,
    createdInfo,
    lastModInfo,
    modifiePar: historySummary.lastModifiedBy || '',
    
    // ✅ CORRECTION : Utiliser les vraies valeurs de la fiche (comme FichePosteDocument)
    responsableService: fiche.responsable_info || '',  // Vide si pas de valeur
    gradeActuel: fiche.grade_nom || '',                // Vide si pas de valeur
    echelonGrade: echelonGradeValue,                   // Utilise fiche.grade
    serviceNom: fiche.service_nom || '',
    statutLabel: getStatutLabel(fiche.statut),
    
    // Contenus
    description: fiche.description || '',
    taches: fiche.taches || '',
    competences: fiche.competences_requises || fiche.competencesrequises || '',
  });
};



  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-6 sm:items-center sm:px-6">
      <div className="relative w-full max-w-5xl rounded-2xl bg-slate-50/90 shadow-2xl ring-1 ring-slate-200/80 backdrop-blur-xl dark:bg-slate-900/90 dark:ring-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-lg font-bold text-white shadow-lg">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  MSI TeamHub
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Fiche de Poste
                </span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-300/20">
                  {referenceFiche}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGeneratePDF}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <FileDown className="h-3.5 w-3.5" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => {
                window.open(
                  `/settings/fiches/${fiche.id}/print`,
                  '_blank',
                  'noopener,noreferrer',
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-100/60 px-6 py-2 text-xs font-medium text-slate-600 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
              activeTab === 'details'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Détails
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
              activeTab === 'historique'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Historique
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Poste
                        </div>
                        <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {gradeNom} {serviceNom !== 'Non renseigné' && '·'} {serviceNom !== 'Non renseigné' ? serviceNom : ''}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatutBadgeClass(
                          fiche.statut,
                        )}`}
                      >
                        {(fiche.statut === 'ACTIF' || fiche.statut === 'actif') && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {(fiche.statut === 'INACTIF' || fiche.statut === 'inactif') && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {getStatutLabel(fiche.statut)}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <InfoSection
                        icon={Briefcase}
                        label="Service"
                        value={serviceNom}
                      />
                      <InfoSection
                        icon={Award}
                        label="Grade"
                        value={gradeNom}
                      />
                      <InfoSection
                        icon={TrendingUp}
                        label="Échelon/niveau de grade"
                        value={echelonGrade}
                      />
                      <InfoSection
                        icon={User}
                        label="Responsable de service"
                        value={fiche.responsable_info || 'Non assigné'}
                      />
                      <InfoSection
                        icon={Calendar}
                        label="Date de création"
                        value={
                          fiche.date_creation || fiche.datecreation
                            ? formatDate(fiche.date_creation || fiche.datecreation)
                            : 'N/A'
                        }
                      />
                    </div>
                  </div>

                  <ContentSection
                    icon={FileText}
                    title="DESCRIPTION DU POSTE"
                    content={fiche.description_poste || fiche.description}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <ContentSection
                      icon={LightbulbIcon}
                      title="TÂCHES ET RESPONSABILITÉS"
                      content={fiche.taches_responsabilites || fiche.taches}
                    />
                    <ContentSection
                      icon={Wrench}
                      title="COMPÉTENCES REQUISES"
                      content={fiche.competences_requises || fiche.competencesrequises}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Métadonnées
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Créée le
                        </span>
                        <span className="block text-xs font-medium text-slate-900 dark:text-slate-100">
                          {createdInfo || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                          Dernière modification
                        </span>
                        <span className="block text-xs font-medium text-slate-900 dark:text-slate-100">
                          {lastModInfo || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                    <p className="mb-1 font-medium text-slate-600 dark:text-slate-200">
                      Note
                    </p>
                    <p>
                      Cette fiche de poste est un document de référence pour le
                      titulaire du poste, le manager et les ressources humaines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingHistorique ? (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Chargement de l&apos;historique...
                </div>
              ) : historique.length > 0 ? (
                historique.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <div className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      <Clock className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {entry.user?.full_name || entry.user?.username}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(entry.action_time)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300">
                        {entry.action_label}
                        {entry.change_message && ` - ${entry.change_message}`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                  Aucun historique disponible
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-6 py-3 text-[11px] text-slate-500 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-400">
          <div>Document confidentiel - Usage interne uniquement</div>
          <div>Document généré automatiquement par MSI TeamHub</div>
        </div>
      </div>
    </div>
  );
}
