// lib/pdf-generator.ts - TEMPLATE PREMIUM STYLE CANVA/UX
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FichePDFData {
  societeNom?: string;
  referenceFiche: string;
  titreComplet: string;
  createdInfo?: string;
  lastModInfo?: string;

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

// IMPORTANT : on garde la déclaration autoTable existante via 'jspdf-autotable'
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

export function generateFichePDF(rawData: FichePDFData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  let y = 20;

  // ============================
  // PALETTE STYLE CANVA PRO
  // ============================
  const colors = {
    bgHeader: [15, 23, 42] as [number, number, number],    // bleu très foncé
    accent: [56, 189, 248] as [number, number, number],    // bleu cyan
    accentSoft: [191, 219, 254] as [number, number, number], // bleu clair
    textMain: [15, 23, 42] as [number, number, number],
    textMuted: [100, 116, 139] as [number, number, number],
    cardBg: [248, 250, 252] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  // Normalisation
  const data: FichePDFData = {
    ...rawData,
    societeNom: rawData.societeNom || 'MSI TEAMHUB',
    titreComplet: rawData.titreComplet || '',
    createdInfo: rawData.createdInfo || '',
    lastModInfo: rawData.lastModInfo || '',
    serviceNom: rawData.serviceNom || '',
    gradeNom: rawData.gradeNom || rawData.gradeActuel || '',
    echelonGrade: rawData.echelonGrade || '',
    responsableService: rawData.responsableService || '',
    statutLabel: rawData.statutLabel || rawData.statut || '',
    description: rawData.descriptionPoste || rawData.description || '',
    taches: rawData.tachesResponsabilites || rawData.taches || '',
    competences: rawData.competencesRequises || rawData.competences || '',
  };

  // ============================
  // HEADER UX (2 colonnes)
  // ============================
  // Bande top
  doc.setFillColor(...colors.bgHeader);
  doc.rect(0, 0, pageWidth, 52, 'F');

  // Accent fin
  doc.setFillColor(...colors.accent);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Bloc gauche: logo + MSI
  const logoX = margin;
  const logoY = 13;
  const logoSize = 26;

  // "logo" placeholder (carré blanc + texte MSI)
  doc.setFillColor(...colors.white);
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, 'F');

  doc.setTextColor(...colors.bgHeader);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MSI', logoX + logoSize / 2, logoY + logoSize / 2 - 1, { align: 'center' });
  doc.setFontSize(7);
  doc.text('TEAMHUB', logoX + logoSize / 2, logoY + logoSize / 2 + 5, { align: 'center' });

  // Texte MSI TEAMHUB
  doc.setTextColor(...colors.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MSI TEAMHUB', logoX + logoSize + 8, logoY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Plateforme de gestion RH & fiches de poste', logoX + logoSize + 8, logoY + 15);

  // Référence sous le nom
  doc.setFontSize(8);
  doc.text(`Référence : ${data.referenceFiche}`, logoX + logoSize + 8, logoY + 22);

  // Bloc droite: FICHE DE POSTE + titre + dates sur 2 lignes
  const rightX = pageWidth - margin;

  // Titre FICHE DE POSTE aligné à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FICHE DE POSTE', rightX, logoY + 5, { align: 'right' });

  // Titre du poste (une seule ligne tronquée si nécessaire)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const titreShort = data.titreComplet.length > 45
    ? data.titreComplet.substring(0, 42) + '...'
    : data.titreComplet;
  doc.text(titreShort || 'Poste non défini', rightX, logoY + 11, { align: 'right' });

  // Ligne 1: "Créé le ..."
  doc.setFontSize(7);
  doc.setTextColor(...colors.white);
  doc.text(data.createdInfo || 'Créé le : N/A', rightX, logoY + 18, { align: 'right' });

  // Ligne 2: "Dernière modification ..."
  doc.text(data.lastModInfo || 'Dernière modification : N/A', rightX, logoY + 23, { align: 'right' });

  y = 60;

  // ============================
  // BLOC "RÉFÉRENCES GÉNÉRALES" EN CARTE UX
  // ============================
  // Titre avec barre
  doc.setFillColor(...colors.accent);
  doc.rect(margin, y - 3, 3, 10, 'F');

  doc.setTextColor(...colors.textMain);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Références générales', margin + 7, y + 3);

  y += 10;

  // Carte avec fond clair et bordure fine
  const cardX = margin;
  const cardWidth = pageWidth - margin * 2;
  const cardPaddingY = 6;

  doc.setFillColor(...colors.cardBg);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, y, cardWidth, 40, 3, 3, 'FD');

  // Contenu de la carte : grille 2 colonnes × 3 lignes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textMuted);

  const col1X = cardX + 6;
  const col2X = cardX + cardWidth / 2 + 2;
  let rowY = y + cardPaddingY + 2;
  const rowGap = 11;

  const labelStyle = () => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textMain);
  };
  const valueStyle = () => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textMuted);
  };

  // Ligne 1
  labelStyle();
  doc.text('Service', col1X, rowY);
  valueStyle();
  doc.text(data.serviceNom || '-', col1X, rowY + 4);

  labelStyle();
  doc.text('Grade', col2X, rowY);
  valueStyle();
  doc.text(data.gradeNom || '-', col2X, rowY + 4);

  rowY += rowGap;

  // Ligne 2
  labelStyle();
  doc.text('Échelon / niveau', col1X, rowY);
  valueStyle();
  doc.text(data.echelonGrade || '-', col1X, rowY + 4);

  labelStyle();
  doc.text('Statut de la fiche', col2X, rowY);
  valueStyle();
  doc.text(data.statutLabel || '-', col2X, rowY + 4);

  rowY += rowGap;

  // Ligne 3
  labelStyle();
  doc.text('Responsable du service', col1X, rowY);
  valueStyle();
  doc.text(data.responsableService || '-', col1X, rowY + 4);

  // pas de 6ème champ pour l’instant → tu pourras en rajouter si tu veux

  y += 40 + 10;

  // ============================
  // SECTIONS CONTENU EN CARTES UX
  // ============================
  const addSectionCard = (title: string, content: string) => {
    if (!content || content.trim() === '') return;

    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    // Titre avec barre colorée
    doc.setFillColor(...colors.accentSoft);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 8, 2, 2, 'F');

    doc.setTextColor(...colors.textMain);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin + 4, y + 5.5);

    y += 10;

    // Carte de texte
    const boxX = margin;
    const boxW = pageWidth - 2 * margin;
    const textMaxWidth = boxW - 8;

    doc.setFillColor(...colors.cardBg);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    const lines = doc.splitTextToSize(content, textMaxWidth);
    const boxH = Math.max(lines.length * 5 + 8, 16);

    doc.roundedRect(boxX, y, boxW, boxH, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);
    let textY = y + 6;
    lines.forEach((line: string) => {
      doc.text(line, boxX + 4, textY);
      textY += 5;
    });

    y += boxH + 8;
  };

  addSectionCard('Description du poste', data.description || '');
  addSectionCard('Tâches et responsabilités', data.taches || '');
  addSectionCard('Compétences requises', data.competences || '');

  // ============================
  // FOOTER
  // ============================
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - 12;

    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.textMuted);
    doc.text('Document confidentiel - Usage interne uniquement', margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textMain);
    doc.text('MSI TEAMHUB', pageWidth / 2, footerY, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textMuted);
    doc.text(`Page ${p} / ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  const fileName = `${rawData.referenceFiche || 'fiche-de-poste'}.pdf`;
  doc.save(fileName);
}
