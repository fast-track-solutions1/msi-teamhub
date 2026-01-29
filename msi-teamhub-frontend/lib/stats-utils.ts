/**
 * lib/stats-utils.ts
 * Utilitaires pour calculer les statistiques des salariés
 * Nombre, pourcentage, top 5, etc.
 */

export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  service?: number;
  grade?: number;
  grade_nom?: string;
  dateembauche: string;
  statut: string;
  poste?: string;
  mailprofessionnel?: string;
  [key: string]: any;
}

export interface SalarieStats {
  totalCount: number;
  countByService: Record<number, number>;
  percentageByService: Record<number, number>;
  topNewEmployees: Salarie[];
  topOldestEmployees: Salarie[];
  topHighestGrades: Salarie[];
  mostRecentHire?: Salarie;
  mostOldestHire?: Salarie;
}

export interface ServiceInfo {
  id: number;
  nom: string;
}

/**
 * Calcule le nombre de salariés par service
 */
export function calculateCountByService(salaries: Salarie[]): Record<number, number> {
  const counts: Record<number, number> = {};
  
  salaries.forEach((salarie) => {
    if (salarie.service) {
      counts[salarie.service] = (counts[salarie.service] || 0) + 1;
    }
  });
  
  return counts;
}

/**
 * Calcule le pourcentage de salariés par service
 */
export function calculatePercentageByService(
  salaries: Salarie[]
): Record<number, number> {
  const total = salaries.length;
  if (total === 0) return {};

  const counts = calculateCountByService(salaries);
  const percentages: Record<number, number> = {};

  Object.entries(counts).forEach(([serviceId, count]) => {
    percentages[parseInt(serviceId)] = parseFloat(((count / total) * 100).toFixed(2));
  });

  return percentages;
}

/**
 * Convertit une date string en objet Date
 */
function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Compare deux dates et retourne 1 si a > b, -1 si a < b
 */
function compareDates(dateA: string, dateB: string): number {
  const a = parseDate(dateA);
  const b = parseDate(dateB);
  return a.getTime() - b.getTime();
}

/**
 * Récupère les 5 salariés les plus récemment embauchés
 */
export function getTopNewEmployees(salaries: Salarie[], limit: number = 5): Salarie[] {
  return salaries
    .filter((s) => s.dateembauche)
    .sort((a, b) => compareDates(b.dateembauche, a.dateembauche))
    .slice(0, limit);
}

/**
 * Récupère les 5 salariés les plus anciens (date d'embauche)
 */
export function getTopOldestEmployees(salaries: Salarie[], limit: number = 5): Salarie[] {
  return salaries
    .filter((s) => s.dateembauche)
    .sort((a, b) => compareDates(a.dateembauche, b.dateembauche))
    .slice(0, limit);
}

/**
 * Récupère les 5 salariés avec les plus hauts grades
 */
export function getTopHighestGrades(salaries: Salarie[], limit: number = 5): Salarie[] {
  return salaries
    .filter((s) => s.grade !== null && s.grade !== undefined)
    .sort((a, b) => (b.grade || 0) - (a.grade || 0))
    .slice(0, limit);
}

/**
 * Récupère le salariés le plus récemment embauché
 */
export function getMostRecentHire(salaries: Salarie[]): Salarie | undefined {
  return salaries
    .filter((s) => s.dateembauche)
    .sort((a, b) => compareDates(b.dateembauche, a.dateembauche))[0];
}

/**
 * Récupère le salariés le plus ancien (première embauche)
 */
export function getMostOldestHire(salaries: Salarie[]): Salarie | undefined {
  return salaries
    .filter((s) => s.dateembauche)
    .sort((a, b) => compareDates(a.dateembauche, b.dateembauche))[0];
}

/**
 * Calcule toutes les statistiques en une seule fonction
 */
export function calculateAllStats(salaries: Salarie[]): SalarieStats {
  return {
    totalCount: salaries.length,
    countByService: calculateCountByService(salaries),
    percentageByService: calculatePercentageByService(salaries),
    topNewEmployees: getTopNewEmployees(salaries),
    topOldestEmployees: getTopOldestEmployees(salaries),
    topHighestGrades: getTopHighestGrades(salaries),
    mostRecentHire: getMostRecentHire(salaries),
    mostOldestHire: getMostOldestHire(salaries),
  };
}

/**
 * Formate une date pour l'affichage (JJ/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseDate(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Formate une date relative (ex: "Il y a 2 ans")
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseDate(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Aujourd'hui";
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;

    const years = Math.floor(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  } catch {
    return dateString;
  }
}

/**
 * Filtre les salariés selon plusieurs critères
 */
export function filterSalaries(
  salaries: Salarie[],
  filters: {
    service?: number | null;
    grade?: number | null;
    statut?: string | null;
    searchQuery?: string | null;
  }
): Salarie[] {
  let filtered = [...salaries];

  // Filtre par service
  if (filters.service) {
    filtered = filtered.filter((s) => s.service === filters.service);
  }

  // Filtre par grade
  if (filters.grade) {
    filtered = filtered.filter((s) => s.grade === filters.grade);
  }

  // Filtre par statut
  if (filters.statut) {
    filtered = filtered.filter((s) => s.statut === filters.statut);
  }

  // Recherche textuelle (nom, prénom, matricule, email)
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.nom.toLowerCase().includes(query) ||
        s.prenom.toLowerCase().includes(query) ||
        s.matricule.toLowerCase().includes(query) ||
        (s.mailprofessionnel && s.mailprofessionnel.toLowerCase().includes(query))
    );
  }

  return filtered;
}

/**
 * Trie les salariés selon un champ
 */
export function sortSalaries(
  salaries: Salarie[],
  sortBy: 'nom' | 'prenom' | 'dateembauche' | 'service',
  direction: 'asc' | 'desc' = 'asc'
): Salarie[] {
  const sorted = [...salaries];

  sorted.sort((a, b) => {
    let valueA: any = a[sortBy];
    let valueB: any = b[sortBy];

    if (sortBy === 'dateembauche') {
      valueA = parseDate(valueA).getTime();
      valueB = parseDate(valueB).getTime();
    } else if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = (valueB as string).toLowerCase();
    }

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}
