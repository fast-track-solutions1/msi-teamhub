'use client';

import React from 'react';
import { FichePoste } from '@/lib/ficheposte-api';

interface FichePosteDocumentProps {
  fiche: FichePoste;
  societeNom?: string;
  auteurModification?: string;
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

function splitLines(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export default function FichePosteDocument({
  fiche,
  societeNom = 'MSI TeamHub',
  auteurModification,
  createdAt,
  createdBy,
  lastModifiedAt,
  lastModifiedBy,
}: FichePosteDocumentProps) {
  const taches = splitLines(fiche.taches);
  const competences = splitLines(fiche.competences_requises);

  const dateCreation = fiche.datecreation
    ? new Date(fiche.datecreation).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const dateModif = fiche.datemodification
    ? new Date(fiche.datemodification).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const statutLabel =
    fiche.statut === 'actif'
      ? 'Actif'
      : fiche.statut === 'en_revision'
      ? 'En révision'
      : fiche.statut === 'archive'
      ? 'Archivé'
      : fiche.statut || '';

  const titreComplet =
    (fiche.grade_nom ?? '') + (fiche.service_nom ? ` - ${fiche.service_nom}` : '');

  // ✅ NOUVEAU FORMAT DE RÉFÉRENCE : FICHE-{numero}-{InitialesGrade}-{InitialesService}
  const getInitiales = (nom: string) => {
    return nom
      .split(' ')
      .map((mot) => mot.charAt(0).toUpperCase())
      .join('');
  };

  const initialesGrade = fiche.grade_nom ? getInitiales(fiche.grade_nom) : 'XX';
  const initialesService = fiche.service_nom ? getInitiales(fiche.service_nom) : 'XX';
  const referenceFiche = `FICHE-${fiche.id}-${initialesGrade}-${initialesService}`;

  const responsableService = fiche.responsable_info || '';
  const gradeActuel = fiche.grade_nom || '';
  const echelonGrade =
    fiche.grade !== undefined && fiche.grade !== null ? `Niveau ${fiche.grade}` : '';

  // ✅ NOUVELLE TERMINOLOGIE
  const gradeRattachement = fiche.grade_superieur || 'Aucun (poste de direction)';
  const posteManage = fiche.grade_inferieur || 'Aucun';
  const serviceNom = fiche.service_nom || '';

  // Résumé historique à afficher dans la ligne de synthèse
  const createdInfo = createdAt && createdBy ? `${createdAt} par ${createdBy}` : dateCreation || '';
  const lastModInfo =
    lastModifiedAt && lastModifiedBy
      ? `${lastModifiedAt} par ${lastModifiedBy}`
      : dateModif || '';

  return (
    <div
      id="fiche-poste-printable"
      className="w-[210mm] mx-auto bg-white text-black p-8"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* ========== STYLES POUR IMPRESSION PDF ========== */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          #fiche-poste-printable {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 20mm;
            box-shadow: none;
            border: none;
          }

          /* Masque tout sauf la fiche */
          body > *:not(#__next) {
            display: none !important;
          }

          #__next > *:not(main) {
            display: none !important;
          }

          main > *:not(#fiche-poste-printable) {
            display: none !important;
          }

          /* Masque les boutons et éléments de navigation */
          button,
          nav,
          .print\\:hidden {
            display: none !important;
          }

          /* Force l'impression en A4 portrait */
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }

        /* Couleurs corporatives */
        .bg-corporate {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        }
        
        .border-corporate {
          border-color: #3b82f6;
        }

        .text-corporate {
          color: #1e40af;
        }
      `}</style>

      {/* EN-TÊTE SOCIÉTÉ + TITRE */}
      <header className="flex items-center justify-between border-b-2 border-corporate pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo entreprise" className="h-16 w-auto" />
          <div>
            <div className="font-bold text-xl uppercase tracking-wide text-corporate">
              {societeNom}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Référence : <span className="font-semibold text-corporate">{referenceFiche}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg uppercase tracking-wide text-corporate">
            FICHE DE POSTE
          </div>
          <div className="mt-1 text-xs text-slate-700">
            Dernière modification :
            <br />
            <span className="font-semibold">{lastModInfo || dateModif}</span>
          </div>
        </div>
      </header>

      {/* BLOC RÉFÉRENCES GÉNÉRALES */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase mb-3 pb-1 text-corporate border-b-2 border-corporate">
          Références Générales
        </h2>
        <table className="w-full border-2 border-slate-400 text-xs border-collapse rounded-lg overflow-hidden">
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold w-1/4 bg-slate-50">
                Référence de la fiche de poste
              </td>
              <td className="border border-slate-300 px-3 py-2">{referenceFiche}</td>
              <td className="border border-slate-300 px-3 py-2 font-semibold w-1/4 bg-slate-50">
                Responsable du Service
              </td>
              <td className="border border-slate-300 px-3 py-2">{responsableService}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Grade actuel
              </td>
              <td className="border border-slate-300 px-3 py-2">{gradeActuel}</td>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Échelon/niveau de grade
              </td>
              <td className="border border-slate-300 px-3 py-2">{echelonGrade}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Poste de rattachement hiérarchique
              </td>
              <td className="border border-slate-300 px-3 py-2">{gradeRattachement}</td>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Service
              </td>
              <td className="border border-slate-300 px-3 py-2">{serviceNom}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Poste(s) managé(s)
              </td>
              <td className="border border-slate-300 px-3 py-2">{posteManage}</td>
              <td className="border border-slate-300 px-3 py-2 font-semibold bg-slate-50">
                Statut
              </td>
              <td className="border border-slate-300 px-3 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    fiche.statut === 'actif'
                      ? 'bg-green-100 text-green-800'
                      : fiche.statut === 'en_revision'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {statutLabel}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* LIGNE SYNTHÈSE DATES / AUTEUR */}
      <section className="mb-6">
        <table className="w-full border-2 border-slate-400 text-xs border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-corporate text-white">
              <th className="border border-slate-300 px-3 py-2 text-left w-1/4 font-semibold">
                Créé le
              </th>
              <th className="border border-slate-300 px-3 py-2 text-left w-1/4 font-semibold">
                Dernière modification
              </th>
              <th className="border border-slate-300 px-3 py-2 text-left w-1/4 font-semibold">
                Modifié par
              </th>
              <th className="border border-slate-300 px-3 py-2 text-left w-1/4 font-semibold">
                Fiche de poste
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2 align-top">
                {createdInfo || dateCreation}
              </td>
              <td className="border border-slate-300 px-3 py-2 align-top">
                {lastModInfo || dateModif}
              </td>
              <td className="border border-slate-300 px-3 py-2 align-top">
                {lastModifiedBy || auteurModification}
              </td>
              <td className="border border-slate-300 px-3 py-2 align-top">
                {titreComplet || fiche.titre}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* DESCRIPTION DU POSTE */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase mb-3 pb-1 text-corporate border-b-2 border-corporate">
          Description du poste
        </h2>
        <div className="border-2 border-slate-300 rounded-lg px-4 py-3 text-xs leading-relaxed min-h-[4rem] bg-slate-50">
          {fiche.description}
        </div>
      </section>

      {/* TÂCHES ET RESPONSABILITÉS */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase mb-3 pb-1 text-corporate border-b-2 border-corporate">
          Tâches et Responsabilités
        </h2>
        <div className="border-2 border-slate-300 rounded-lg px-4 py-3 text-xs leading-relaxed min-h-[4rem] bg-slate-50">
          {taches.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {taches.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400">Non renseigné</span>
          )}
        </div>
      </section>

      {/* COMPÉTENCES REQUISES */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase mb-3 pb-1 text-corporate border-b-2 border-corporate">
          Compétences Requises
        </h2>
        <div className="border-2 border-slate-300 rounded-lg px-4 py-3 text-xs leading-relaxed min-h-[4rem] bg-slate-50">
          {competences.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {competences.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400">Non renseigné</span>
          )}
        </div>
      </section>

      {/* PIED DE PAGE */}
      <footer className="mt-8 pt-4 border-t-2 border-corporate text-xs text-center text-slate-600">
        <p className="font-semibold text-corporate">Document confidentiel - Usage interne uniquement</p>
        <p className="mt-1">Document généré automatiquement par MSI TeamHub</p>
      </footer>
    </div>
  );
}
