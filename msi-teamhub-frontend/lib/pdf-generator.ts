// lib/pdf-generator.ts - TEMPLATE CORPORATE A4 PROPRE

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FichePDFData {
  societeNom?: string;
  referenceFiche: string;
  titreComplet: string;
  createdInfo?: string;
  lastModInfo?: string;
  modifiePar?: string;

  // Références générales
  serviceNom?: string;
  gradeNom?: string;
  gradeActuel?: string;
  echelonGrade?: string;
  responsableService?: string;
  statut?: string;
  statutLabel?: string;

  // Contenu
  description?: string;
  descriptionPoste?: string;
  taches?: string;
  tachesResponsabilites?: string;
  competences?: string;
  competencesRequises?: string;
}

// Extension jsPDF pour récupérer lastAutoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: { finalY: number };
  }
}

function safe(v?: string | null) {
  return v && v.trim() !== '' ? v : '-';
}

// ==========================================================
// 🔵 HEADER REUTILISABLE SUR TOUTES LES PAGES
// ==========================================================

// ==========================================================
// 🔵 HEADER REUTILISABLE SUR TOUTES LES PAGES
// ==========================================================

function drawHeader(doc: jsPDF, colors: any, data: FichePDFData) {
  const pageWidth = 210;
  const margin = 16;
  const headerH = 52; // Hauteur augmentée

  // Bandeau top bleu
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // === Dégradé gris foncé dans le header ===
  const steps = 10;
  for (let i = 0; i < steps; i++) {
    const yStep = 3 + (headerH / steps) * i;
    const hStep = headerH / steps;
    const opacity = 0.35;
    doc.setGState(new doc.GState({ opacity }));
    doc.setFillColor(220, 220, 220);
    doc.rect(0, 3, pageWidth, headerH, 'F');
  }
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo box
  const logoBoxX = margin;
  const logoBoxY = 7;
  const logoBoxW = 35;
  const logoBoxH = 22;

  doc.setFillColor(...colors.surface);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH, 3, 3, 'FD');

  try {
    const margin_int = 2;
    const imgX = logoBoxX + margin_int;
    const imgY = logoBoxY + margin_int;
    const imgW = logoBoxW - margin_int * 2;
    const imgH = logoBoxH - margin_int * 2;
    doc.addImage('/logo.jpg', 'JPEG', imgX, imgY, imgW, imgH);
  } catch {}

  // Texte header (colonne gauche)
  const headerTextX = logoBoxX + logoBoxW + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textMain);
  doc.text('FICHE DE POSTE', headerTextX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textMuted);
  doc.text(data.societeNom || 'MSI TEAMHUB', headerTextX, 22);

  doc.setFontSize(8);
  doc.text(`Référence : ${safe(data.referenceFiche)}`, headerTextX, 27);

  // Titre poste (droite)
  const rightX = pageWidth - margin;
  const titleMaxW = 80;
  const titleText = data.titreComplet || 'Poste non défini';
  const lines = doc.splitTextToSize(titleText, titleMaxW);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textMain);

  if (lines.length === 1) {
    doc.text(lines[0], rightX, 16, { align: 'right' });
  } else {
    doc.text(lines[0], rightX, 14, { align: 'right' });
    doc.text(lines[1] || '', rightX, 18, { align: 'right' });
  }

  // Badge statut
  const badgeText = safe(data.statutLabel);
  const badgeW = 52;
  const badgeH = 7;
  const badgeX = rightX - badgeW;
  const badgeY = 20;

  doc.setFillColor(...colors.primarySoft);
  doc.setDrawColor(...colors.primary);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.primary);
  doc.text(`Statut : ${badgeText}`, badgeX + badgeW / 2, badgeY + 4.5, { align: 'center' });

  // ⚡ LIGNE CRÉÉ / MODIFIÉ (plus bas, sur une seule ligne)
  const infoLineY = 38; // Position Y plus basse
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textMuted);
  
  // Créé le - À GAUCHE
  if (data.createdInfo) {
    doc.text(`Créé le : ${data.createdInfo}`, margin, infoLineY);
  }
  
  // Modifié par - À DROITE
  if (data.lastModInfo) {
    const modifieText = data.modifiePar 
      ? `Modifié le : ${data.lastModInfo} par ${data.modifiePar}`
      : `Modifié le : ${data.lastModInfo}`;
    doc.text(modifieText, rightX, infoLineY, { align: 'right' });
  }

  return headerH + 10;

}

// ==========================================================
// 🔵 FOOTER SUR TOUTES LES PAGES
// ==========================================================

function drawFooterAllPages(doc: jsPDF, colors: any) {
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;

  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 10;

    // Ligne
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    // Texte footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.textMuted);
    doc.text('Document confidentiel - Usage interne MSI', margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textMain);
    doc.text('MSI TEAMHUB', pageWidth / 2, footerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textMuted);
    doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }
}

// ==========================================================
// 🔵 FONCTION PRINCIPALE
// ==========================================================

export function generateFichePDF(rawData: FichePDFData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;

  const colors = {
    primary: [37, 99, 235],
    primarySoft: [191, 219, 254],
    accent: [14, 116, 144],
    textMain: [15, 23, 42],
    textMuted: [71, 85, 105],
    border: [226, 232, 240],
    surface: [255, 255, 255],
    surfaceAlt: [248, 250, 252],
  };

  // Normalisation
  const data: FichePDFData = {
    ...rawData,
    societeNom: rawData.societeNom || 'MSI TEAMHUB',
    titreComplet: rawData.titreComplet || '',
    createdInfo: rawData.createdInfo || '',
    lastModInfo: rawData.lastModInfo || '',
    modifiePar: rawData.modifiePar || '',
    serviceNom: rawData.serviceNom || '',
    gradeNom: rawData.gradeNom || rawData.gradeActuel || '',
    echelonGrade: rawData.echelonGrade || '',
    responsableService: rawData.responsableService || '',
    statutLabel: rawData.statutLabel || rawData.statut || '',
    description: rawData.descriptionPoste || rawData.description || '',
    taches: rawData.tachesResponsabilites || rawData.taches || '',
    competences: rawData.competencesRequises || rawData.competences || '',
  };

  // === 1) HEADER DE LA PREMIÈRE PAGE ===
  let y = drawHeader(doc, colors, data);

  // Fonction ajout page avec header auto
  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = drawHeader(doc, colors, data);
    }
  };

  // ==========================================================
  // SECTION RÉFÉRENCES GÉNÉRALES
  // ==========================================================

  const boxW = pageWidth - 2 * margin;

  doc.setFillColor(...colors.surfaceAlt);
  doc.setDrawColor(...colors.border);
  doc.roundedRect(margin, y, boxW, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Références générales', margin + 4, y + 5.4);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: boxW,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      lineColor: colors.border,
      lineWidth: 0.2,
      cellPadding: 3.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: colors.textMain, fillColor: colors.surfaceAlt },
      1: { textColor: colors.textMuted },
      2: { fontStyle: 'bold', textColor: colors.textMain, fillColor: colors.surfaceAlt },
      3: { textColor: colors.textMuted },
    },
    body: [
      ['Service', safe(data.serviceNom), 'Grade', safe(data.gradeNom)],
      ['Échelon / niveau', safe(data.echelonGrade), 'Responsable du service', safe(data.responsableService)],
    ],
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ==========================================================
  // SECTIONS CONTENU (cartes)
  // ==========================================================

  const addSectionCard = (title: string, content: string) => {
    if (!content || !content.trim()) return;

    const textW = boxW - 10;
    const lines = doc.splitTextToSize(content, textW);
    const boxH = Math.max(lines.length * 4.5 + 10, 18);

    ensureSpace(boxH + 14);

    // Titre
    doc.setFillColor(...colors.surfaceAlt);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, boxW, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin + 4, y + 5.4);

    y += 10;

    // Carte
    doc.setFillColor(...colors.surface);
    doc.setDrawColor(...colors.border);
    doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);

    let ty = y + 7;
    lines.forEach((line) => {
      doc.text(line, margin + 5, ty);
      ty += 4.5;
    });

    y += boxH + 8;
  };

  addSectionCard('Description du poste', data.description);
  addSectionCard('Tâches et responsabilités', data.taches);
  addSectionCard('Compétences requises', data.competences);

  // ==========================================================
  // FOOTER SUR TOUTES PAGES
  // ==========================================================

  drawFooterAllPages(doc, colors);

  doc.save(`${rawData.referenceFiche || 'fiche-de-poste'}.pdf`);
}
