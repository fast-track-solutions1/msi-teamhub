/**
 * 🎯 Utilitaires pour les organigrammes
 */

import { Salarie } from './organigramme-types';

/**
 * 📊 Calcule le rang basé sur le grade/poste
 */
export const getRankByGrade = (salarie: Salarie): number => {
  if (!salarie) return 999;

  const grade = salarie.grade?.toLowerCase() || '';
  const poste = salarie.poste?.toLowerCase() || '';

  // Niveaux hiérarchiques
  const rankMap: Record<string, number> = {
    // Directeurs
    'directeur': 1,
    'director': 1,
    'dg': 1,
    'pdg': 1,
    'directeur général': 1,

    // Responsables/Managers
    'responsable': 2,
    'manager': 2,
    'chef': 2,
    'chef de service': 2,
    'head of': 2,

    // Superviseurs/Coordonnateurs
    'superviseur': 3,
    'coordinateur': 3,
    'coordinator': 3,
    'assistant manager': 3,

    // Employés standards
    'employe': 4,
    'employee': 4,
    'agent': 4,
    'staff': 4,
    'technicien': 4,
    'technician': 4,

    // Stagiaires/Apprentis
    'stagiaire': 5,
    'intern': 5,
    'apprenti': 5,
  };

  // Cherche dans le grade en priorité
  for (const [key, rank] of Object.entries(rankMap)) {
    if (grade.includes(key)) return rank;
  }

  // Puis dans le poste
  for (const [key, rank] of Object.entries(rankMap)) {
    if (poste.includes(key)) return rank;
  }

  // Default
  return 4;
};

/**
 * 🎨 Obtient une couleur basée sur le grade
 */
export const getColorByGrade = (salarie: Salarie): string => {
  const rank = getRankByGrade(salarie);

  const colors = {
    1: 'bg-red-100 border-red-300 text-red-900', // Directeurs - Rouge
    2: 'bg-orange-100 border-orange-300 text-orange-900', // Managers - Orange
    3: 'bg-yellow-100 border-yellow-300 text-yellow-900', // Superviseurs - Jaune
    4: 'bg-blue-100 border-blue-300 text-blue-900', // Employés - Bleu
    5: 'bg-gray-100 border-gray-300 text-gray-900', // Stagiaires - Gris
  };

  return colors[rank as keyof typeof colors] || colors[4];
};

/**
 * 🏢 Groupe les salariés par service
 */
export const groupByService = (salaries: Salarie[]): Record<number, Salarie[]> => {
  return salaries.reduce(
    (acc, salarie) => {
      const serviceId = salarie.service || 0;
      if (!acc[serviceId]) {
        acc[serviceId] = [];
      }
      acc[serviceId].push(salarie);
      return acc;
    },
    {} as Record<number, Salarie[]>
  );
};

/**
 * 👥 Filtre les salariés par critères
 */
export const filterSalaries = (
  salaries: Salarie[],
  filters: {
    search?: string;
    grade?: string;
    serviceId?: number;
  }
): Salarie[] => {
  return salaries.filter((salarie) => {
    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches =
        salarie.nom?.toLowerCase().includes(searchLower) ||
        salarie.prenom?.toLowerCase().includes(searchLower) ||
        salarie.poste?.toLowerCase().includes(searchLower) ||
        salarie.email?.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }

    // Filtre par grade
    if (filters.grade) {
      if (!salarie.grade?.toLowerCase().includes(filters.grade.toLowerCase())) {
        return false;
      }
    }

    // Filtre par service
    if (filters.serviceId && salarie.service !== filters.serviceId) {
      return false;
    }

    return true;
  });
};

/**
 * 📈 Calcule les statistiques
 */
export const calculateStats = (salaries: Salarie[]) => {
  if (salaries.length === 0) {
    return {
      total: 0,
      byGrade: {},
      byService: {},
    };
  }

  const byGrade: Record<string, number> = {};
  const byService: Record<number, number> = {};

  salaries.forEach((salarie) => {
    // Count par grade
    const grade = salarie.grade || 'Non spécifié';
    byGrade[grade] = (byGrade[grade] || 0) + 1;

    // Count par service
    const service = salarie.service || 0;
    byService[service] = (byService[service] || 0) + 1;
  });

  return {
    total: salaries.length,
    byGrade,
    byService,
  };
};

/**
 * 🔤 Trie les salariés
 */
export const sortSalaries = (
  salaries: Salarie[],
  sortBy: 'nom' | 'prenom' | 'grade' | 'date' = 'nom'
): Salarie[] => {
  const sorted = [...salaries];

  switch (sortBy) {
    case 'nom':
      return sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    case 'prenom':
      return sorted.sort((a, b) => (a.prenom || '').localeCompare(b.prenom || ''));
    case 'grade':
      return sorted.sort((a, b) => getRankByGrade(a) - getRankByGrade(b));
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.date_embauche || 0).getTime();
        const dateB = new Date(b.date_embauche || 0).getTime();
        return dateB - dateA;
      });
    default:
      return sorted;
  }
};

/**
 * 🏆 Obtient le titre/poste formaté
 */
export const getFormattedTitle = (salarie: Salarie): string => {
  if (salarie.poste) return salarie.poste;
  if (salarie.grade) return salarie.grade;
  return 'Employé';
};

/**
 * 📱 Formate le téléphone
 */
export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return 'N/A';
  return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
};

/**
 * ✉️ Crée un mailto link
 */
export const getEmailLink = (email: string | null | undefined): string => {
  return email ? `mailto:${email}` : '#';
};