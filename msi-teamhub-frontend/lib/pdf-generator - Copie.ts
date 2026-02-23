// lib/pdf-generator.ts – Version alignée sur FichePosteDocument (mise en page fiche A4)

import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export interface FichePDFData {
  societeNom?: string;
  referenceFiche: string;
  titreComplet: string;
  createdInfo?: string;
  lastModInfo?: string;

  // Références générales
  serviceNom?: string;
  gradeActuel?: string;
  echelonGrade?: string;
  responsableService?: string;
  statutLabel?: string;

  // Contenu principal
  description?: string;
  descriptionPoste?: string;
  taches?: string;
  tachesResponsabilites?: string;
  competences?: string;
  competencesRequises?: string;
}

export function generateFichePDF(rawData: FichePDFData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  let y = margin;

  // palette (proche de ta page print)
  const colors = {
    corporateBlue: [30, 64, 175] as [number, number, number],
    border: [148, 163, 184] as [number, number, number],
    text: [15, 23, 42] as [number, number, number],
    textMuted: [100, 116, 139] as [number, number, number],
    bgSoft: [248, 250, 252] as [number, number, number],
    bgTableHeader: [241, 245, 249] as [number, number, number],
    badgeActiveBg: [220, 252, 231] as [number, number, number],
    badgeActiveText: [22, 101, 52] as [number, number, number],
  };

  // normalisation
  const data: FichePDFData = {
    ...rawData,
    societeNom: rawData.societeNom || 'MSI TeamHub',
    titreComplet: rawData.titreComplet || '',
    createdInfo: rawData.createdInfo || '',
    lastModInfo: rawData.lastModInfo || '',
    serviceNom: rawData.serviceNom || '',
    gradeActuel: rawData.gradeActuel || '',
    echelonGrade: rawData.echelonGrade || '',
    responsableService: rawData.responsableService || '',
    statutLabel: rawData.statutLabel || '',
    description: rawData.descriptionPoste || rawData.description || '',
    taches: rawData.tachesResponsabilites || rawData.taches || '',
    competences: rawData.competencesRequises || rawData.competences || '',
  };

  // ====== En-tête comme la page HTML (logo gauche, titre droite) ======
  // “Logo” bloc (placeholder – tu pourras remplacer par addImage ensuite)
  const logoX = margin;
  const logoY = y;
  const logoSize = 18;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...colors.corporateBlue);
  doc.setLineWidth(0.4);
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, 'S');

  doc.setTextColor(...colors.corporateBlue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('MSI', logoX + logoSize / 2, logoY + 7, { align: 'center' });
  doc.setFontSize(7);
  doc.text('TEAMHUB', logoX + logoSize / 2, logoY + 13, { align: 'center' });

  // nom société + référence
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(data.societeNom!, logoX + logoSize + 4, logoY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textMuted);
  doc.text(`Référence : ${rawData.referenceFiche}`, logoX + logoSize + 4, logoY + 11);

  // bloc droite : FICHE DE POSTE + dates
  const rightX = pageWidth - margin;
  doc.setTextColor(...colors.corporateBlue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FICHE DE POSTE', rightX, logoY + 5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.text);
  const titreShort =
    data.titreComplet.length > 50
      ? data.titreComplet.substring(0, 47) + '...'
      : data.titreComplet || 'Poste non défini';
  doc.text(titreShort, rightX, logoY + 10, { align: 'right' });

  doc.setFontSize(7);
  doc.setTextColor(...colors.textMuted);
  const createdTxt = data.createdInfo || 'Créé le : N/A';
  const modifTxt = data.lastModInfo || 'Dernière modification : N/A';
  doc.text(createdTxt, rightX, logoY + 15, { align: 'right' });
  doc.text(modifTxt, rightX, logoY + 19, { align: 'right' });

  y = logoY + logoSize + 10;

  // séparation
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ====== Bloc RÉFÉRENCES GÉNÉRALES (reprend le tableau de la page) ======
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('RÉFÉRENCES GÉNÉRALES', margin, y);

  y += 4;

  const refTable = [
    ['Référence de la fiche de poste', rawData.referenceFiche, 'Responsable du Service', data.responsableService || ''],
    ['Grade', data.gradeActuel || '', 'Échelon / niveau de grade', data.echelonGrade || ''],
    ['Service', data.serviceNom || '', 'Statut', data.statutLabel || ''],
  ];

  (doc as any).autoTable({
    startY: y,
    head: [],
    body: refTable,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: colors.text,
      lineColor: colors.border,
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 50, fillColor: colors.bgTableHeader, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 50, fillColor: colors.bgTableHeader, fontStyle: 'bold' },
      3: { cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ====== Ligne synthèse dates/auteur (version simplifiée) ======
  // Si tu veux reprendre la ligne 4 colonnes de FichePosteDocument, tu peux l’ajouter ici.

  // ====== Section : DESCRIPTION DU POSTE ======
  const addSection = (title: string, content: string) => {
    if (!content || content.trim() === '') return;

    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.corporateBlue);
    doc.text(title, margin, y);

    y += 3;
    doc.setDrawColor(...colors.corporateBlue);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 35, y);

    y += 5;

    const boxX = margin;
    const boxW = pageWidth - 2 * margin;
    const textMaxWidth = boxW - 6;
    const lines = doc.splitTextToSize(content, textMaxWidth);
    const boxH = Math.max(lines.length * 5 + 6, 16);

    doc.setFillColor(...colors.bgSoft);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.text);
    let textY = y + 6;
    lines.forEach((line: string) => {
      doc.text(line, boxX + 3, textY);
      textY += 5;
    });

    y += boxH + 8;
  };

  addSection('DESCRIPTION DU POSTE', data.description || '');
  addSection('TÂCHES ET RESPONSABILITÉS', data.taches || '');
  addSection('COMPÉTENCES REQUISES', data.competences || '');

  // ====== Footer ======
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - 12;
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.textMuted);
    doc.text('Document confidentiel - Usage interne uniquement', margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);
    doc.text('MSI TeamHub', pageWidth / 2, footerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textMuted);
    doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  const filename = `${rawData.referenceFiche || 'fiche-de-poste'}.pdf`;
  doc.save(filename);
}
