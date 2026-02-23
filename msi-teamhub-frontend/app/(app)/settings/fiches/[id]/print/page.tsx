// app/(app)/settings/fiches/[id]/print/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, Clock } from 'lucide-react';

import { FichePoste, getFichePosteById } from '@/lib/ficheposte-api';
import { getCurrentUser, User } from '@/lib/user-api';
import { Service, getServiceById } from '@/lib/service-api';
import { Grade, getGradeById } from '@/lib/grade-api';
import FichePosteDocument from '@/components/settings/FichePosteDocument';
import FichePosteHistory from '@/components/settings/FichePosteHistory';
import { getFichePosteHistory, HistoryEntry } from '@/lib/ficheposte-history-api';
import { generateFichePDF, FichePDFData } from '@/lib/pdf-generator';

interface HistorySummary {
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export default function FichePostePrintPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [fiche, setFiche] = useState<FichePoste | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historySummary, setHistorySummary] = useState<HistorySummary>({});
  const [serviceDetails, setServiceDetails] = useState<Service | null>(null);
  const [gradeDetails, setGradeDetails] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [ficheData, userData, historyData] = await Promise.all([
          getFichePosteById(id),
          getCurrentUser(),
          getFichePosteHistory(id),
        ]);

        setFiche(ficheData);
        setCurrentUser(userData);
        setHistory(historyData);

        if (ficheData.service) {
          const service = await getServiceById(ficheData.service);
          setServiceDetails(service);
        }

        if (ficheData.grade) {
          const grade = await getGradeById(ficheData.grade);
          setGradeDetails(grade);
        }

        computeHistorySummary(historyData);
      } catch (error) {
        console.error('Erreur chargement fiche de poste pour impression', error);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(id)) {
      load();
    }
  }, [id]);

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

  const handlePrint = () => {
    window.print();
  };

  const buildPdfData = (): FichePDFData | null => {
    if (!fiche) return null;

    const getInitiales = (nom: string) =>
      nom
        .split(' ')
        .map((mot) => mot.charAt(0).toUpperCase())
        .join('');

    const initialesGrade = fiche.grade_nom
      ? getInitiales(fiche.grade_nom)
      : 'XX';
    const initialesService = fiche.service_nom
      ? getInitiales(fiche.service_nom)
      : 'XX';
    const referenceFiche = `FICHE-${fiche.id}-${initialesGrade}-${initialesService}`;

    const titreComplet =
      (fiche.grade_nom ?? '') +
      (fiche.service_nom ? ` - ${fiche.service_nom}` : '');

    const statutLabel =
      fiche.statut === 'actif'
        ? 'Actif'
        : fiche.statut === 'en_revision'
        ? 'En révision'
        : fiche.statut === 'archive'
        ? 'Archivé'
        : fiche.statut || '';

    const echelonGrade = gradeDetails?.echelon
      ? `Niveau ${gradeDetails.echelon}`
      : 'Non défini';

    const createdInfo =
      historySummary.createdAt && historySummary.createdBy
        ? `${historySummary.createdAt} par ${historySummary.createdBy}`
        : undefined;

    const lastModInfo =
      historySummary.lastModifiedAt && historySummary.lastModifiedBy
        ? `${historySummary.lastModifiedAt} par ${historySummary.lastModifiedBy}`
        : undefined;

    return {
      societeNom: 'MSI TeamHub',
      referenceFiche,
      titreComplet,
      createdInfo,
      lastModInfo,
      responsableService: fiche.responsable_info || 'Non défini',
      gradeActuel: fiche.grade_nom || 'Non défini',
      echelonGrade,
      serviceNom: fiche.service_nom || serviceDetails?.nom || 'Non défini',
      statutLabel,
      description: fiche.description,
      taches: fiche.taches,
      competences:
        fiche.competences_requises || fiche.competencesrequises || '',
    };
  };

  const handlePrintPDF = () => {
    const pdfData = buildPdfData();
    if (!pdfData) return;
    generateFichePDF(pdfData);
  };

  if (loading) {
    return <div>Chargement de la fiche de poste...</div>;
  }

  if (!fiche) {
    return <div>Fiche de poste introuvable.</div>;
  }

  const auteurModification = currentUser
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : 'Utilisateur inconnu';

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white">
      {/* Barre d'actions - masquée à l'impression */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-xl font-semibold text-slate-900">
          Prévisualisation de la fiche de poste
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Printer size={18} />
            Imprimer
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer size={18} />
            Exporter en PDF
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-lg"
          >
            <Clock size={18} />
            {showHistory ? "Masquer l'historique" : "Voir l'historique détaillé"}
          </button>
        </div>
      </div>

      {/* Document de la fiche de poste */}
      <div className="bg-white rounded-xl shadow-md p-8 max-w-5xl mx-auto">
        <FichePosteDocument
          fiche={fiche}
          gradeDetails={gradeDetails || undefined}
          societeNom="MSI TeamHub"
          createdAt={historySummary.createdAt}
          createdBy={historySummary.createdBy}
          lastModifiedAt={historySummary.lastModifiedAt}
          lastModifiedBy={historySummary.lastModifiedBy}
        />
      </div>

      {/* Historique détaillé - masqué à l'impression */}
      {showHistory && (
        <div className="max-w-5xl mx-auto mt-6 print:hidden">
          <FichePosteHistory history={history} auteurModification={auteurModification} />
        </div>
      )}
    </div>
  );
}
