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

function clampText(doc: jsPDF, text: string, maxWidth: number) {
  if (!text) return '';
  const w = doc.getTextWidth(text);
  if (w <= maxWidth) return text;
  let out = text;
  while (out.length > 3 && doc.getTextWidth(out + '...') > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + '...';
}

export function generateFichePDF(rawData: FichePDFData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;

  // Palette très uniforme : bleu + slate
  const colors = {
    primary: [37, 99, 235] as [number, number, number], // blue-600
    primarySoft: [191, 219, 254] as [number, number, number], // blue-200
    accent: [14, 116, 144] as [number, number, number], // cyan-700
    textMain: [15, 23, 42] as [number, number, number], // slate-900
    textMuted: [71, 85, 105] as [number, number, number], // slate-600
    border: [226, 232, 240] as [number, number, number], // slate-200
    surface: [255, 255, 255] as [number, number, number], // white
    surfaceAlt: [248, 250, 252] as [number, number, number], // slate-50
  };

  // Normalisation des données
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

  let y = margin;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawFooterAllPages();
    }
  };

  // ========= HEADER SOBRE CORPORATE =========
  const headerH = 42;

  // Bandeau top fin
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Bandeau clair sous le bandeau principal
  doc.setFillColor(...colors.surfaceAlt);
  doc.rect(0, 3, pageWidth, headerH, 'F');

  // Logo - CADRE RECTANGULAIRE
  const logoBoxX = margin;
  const logoBoxY = 7;
  const logoBoxW = 35;
  const logoBoxH = 22;

  doc.setFillColor(...colors.surface);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(logoBoxX, logoBoxY, logoBoxW, logoBoxH, 3, 3, 'FD');

  try {
    const logoPath = '/logo.jpg';
    const margin_int = 2;
    const imgW = logoBoxW - (margin_int * 2);
    const imgH = logoBoxH - (margin_int * 2);
    const imgX = logoBoxX + margin_int;
    const imgY = logoBoxY + margin_int;
    doc.addImage(logoPath, 'JPEG', imgX, imgY, imgW, imgH);
  } catch {
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('MSI', logoBoxX + logoBoxW / 2, logoBoxY + logoBoxH / 2 + 2, { align: 'center' });
  }

  // Bloc titre à droite du logo
  const headerTextX = logoBoxX + logoBoxW + 8;
  doc.setTextColor(...colors.textMain);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FICHE DE POSTE', headerTextX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textMuted);
  doc.text(data.societeNom || 'MSI TEAMHUB', headerTextX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Référence : ${safe(data.referenceFiche)}`, headerTextX, 27);

  // Bloc titre complet + statut à droite
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textMain);
  const titleMaxW = 80;
  doc.text(
    clampText(doc, data.titreComplet || 'Poste non défini', titleMaxW),
    rightX,
    16,
    { align: 'right' },
  );

  // Badge statut
  const badgeText = safe(data.statutLabel);
  const badgeW = 52;
  const badgeH = 7;
  const badgeX = rightX - badgeW;
  const badgeY = 20;

  doc.setFillColor(...colors.primarySoft);
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...colors.primary);
  doc.text(`Statut : ${badgeText}`, badgeX + badgeW / 2, badgeY + 4.5, {
    align: 'center',
  });

  // DATES DANS LE HEADER
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.textMuted);
  
  if (data.createdInfo) {
    doc.setFont('helvetica', 'bold');
    doc.text('Créé le : ', margin, headerH - 4);
    doc.setFont('helvetica', 'normal');
    const createdTextX = margin + doc.getTextWidth('Créé le : ');
    doc.text(data.createdInfo, createdTextX, headerH - 4);
  }

  if (data.lastModInfo) {
    const labelModif = 'Modifié le : ';
    const fullTextModif = labelModif + data.lastModInfo;
    const fullWidthModif = doc.getTextWidth(fullTextModif);
    
    doc.setFont('helvetica', 'bold');
    doc.text(labelModif, rightX - fullWidthModif, headerH - 4);
    doc.setFont('helvetica', 'normal');
    doc.text(data.lastModInfo, rightX - fullWidthModif + doc.getTextWidth(labelModif), headerH - 4);
  }

  y = headerH + 6;

  // ========= TITRE "RÉFÉRENCES GÉNÉRALES" AVEC FOND (comme les autres sections) =========
  const boxW = pageWidth - 2 * margin;
  
  doc.setFillColor(...colors.surfaceAlt);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, boxW, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textMain);
  doc.text('Références générales', margin + 4, y + 5.4);

  y += 10;

  // ========= TABLEAU 4 COLONNES =========
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - 2 * margin,
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
      1: { textColor: colors.textMuted, fillColor: colors.surface },
      2: { fontStyle: 'bold', textColor: colors.textMain, fillColor: colors.surfaceAlt },
      3: { textColor: colors.textMuted, fillColor: colors.surface },
    },
    body: [
      ['Service', safe(data.serviceNom), 'Grade', safe(data.gradeNom)],
      ['Échelon / niveau', safe(data.echelonGrade), 'Responsable du service', safe(data.responsableService)],
    ],
  });
  y = (doc as any).lastAutoTable?.finalY || y;
  y += 8;

  // ========= CARTES DE CONTENU (SANS ICÔNES, SANS COULEURS) =========
  const addSectionCard = (title: string, content: string) => {
    if (!content || content.trim() === '') return;

    const textMaxWidth = boxW - 10;
    const lines = doc.splitTextToSize(content, textMaxWidth);
    const boxH = Math.max(lines.length * 4.5 + 10, 18);

    ensureSpace(boxH + 14);

    // Titre section
    doc.setFillColor(...colors.surfaceAlt);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, boxW, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.textMain);
    doc.text(title, margin + 4, y + 5.4);

    y += 10;

    // Carte contenu
    doc.setFillColor(...colors.surface);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);

    let ty = y + 7;
    lines.forEach((line: string) => {
      doc.text(line, margin + 5, ty);
      ty += 4.5;
    });

    y += boxH + 8;
  };

  addSectionCard('Description du poste', data.description || '');
  addSectionCard('Tâches et responsabilités', data.taches || '');
  addSectionCard('Compétences requises', data.competences || '');

  // ========= FOOTER =========
  drawFooterAllPages();

  const fileName = `${rawData.referenceFiche || 'fiche-de-poste'}.pdf`;
  doc.save(fileName);

  // Footer avec numéro de page
  function drawFooterAllPages() {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      const footerY = pageHeight - 10;

      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...colors.textMuted);
      doc.text('Document confidentiel - Usage interne MSI', margin, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.textMain);
      doc.text('MSI TEAMHUB', pageWidth / 2, footerY, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.textMuted);
      doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, footerY, {
        align: 'right',
      });
    }
  }
}
