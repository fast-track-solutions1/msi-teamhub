/**
 * lib/salarie-stats-api.ts
 * Client API pour récupérer les salariés avec statistiques
 */

import { getSalaries } from './salarie-api';
import {
  calculateAllStats,
  filterSalaries,
  sortSalaries,
  Salarie,
  SalarieStats,
} from './stats-utils';

/**
 * Récupère tous les salariés et calcule les statistiques
 */
export async function getSalariesWithStats(): Promise<{
  salaries: Salarie[];
  stats: SalarieStats;
}> {
  try {
    const salaries = await getSalaries();
    const stats = calculateAllStats(salaries);

    return {
      salaries,
      stats,
    };
  } catch (error) {
    console.error('❌ Erreur getSalariesWithStats:', error);
    throw error;
  }
}

/**
 * Récupère les salariés filtrés et triés avec stats
 */
export async function getSalariesFiltered(options: {
  serviceId?: number | null;
  gradeId?: number | null;
  statut?: string | null;
  searchQuery?: string | null;
  sortBy?: 'nom' | 'prenom' | 'dateembauche' | 'service';
  sortDirection?: 'asc' | 'desc';
}): Promise<{
  salaries: Salarie[];
  stats: SalarieStats;
  filteredCount: number;
}> {
  try {
    const { salaries: allSalaries, stats: allStats } = await getSalariesWithStats();

    // Applique les filtres
    let filtered = filterSalaries(allSalaries, {
      service: options.serviceId,
      grade: options.gradeId,
      statut: options.statut,
      searchQuery: options.searchQuery,
    });

    // Applique le tri
    if (options.sortBy) {
      filtered = sortSalaries(filtered, options.sortBy, options.sortDirection || 'asc');
    }

    return {
      salaries: filtered,
      stats: allStats,
      filteredCount: filtered.length,
    };
  } catch (error) {
    console.error('❌ Erreur getSalariesFiltered:', error);
    throw error;
  }
}

/**
 * Récupère uniquement les stats sans les données complètes
 */
export async function getSalariesStatsOnly(): Promise<SalarieStats> {
  try {
    const salaries = await getSalaries();
    return calculateAllStats(salaries);
  } catch (error) {
    console.error('❌ Erreur getSalariesStatsOnly:', error);
    throw error;
  }
}

/**
 * Récupère les salariés par service avec stats du service
 */
export async function getSalariesByService(
  serviceId: number
): Promise<{
  salaries: Salarie[];
  count: number;
  percentage: number;
}> {
  try {
    const allSalaries = await getSalaries();
    const salaries = allSalaries.filter((s) => s.service === serviceId);
    const stats = calculateAllStats(allSalaries);

    return {
      salaries,
      count: salaries.length,
      percentage: stats.percentageByService[serviceId] || 0,
    };
  } catch (error) {
    console.error('❌ Erreur getSalariesByService:', error);
    throw error;
  }
}
