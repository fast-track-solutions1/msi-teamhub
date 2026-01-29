// lib/types/organigramme-types.ts
// ============================================================================
// TYPES POUR L'ORGANIGRAMME - Source de vérité centralisée
// ============================================================================

/**
 * 👤 Interface pour un salarié
 */
export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  mail_professionnel?: string;
  telephone_professionnel?: string;
  extension_3cx?: string;
  poste?: string;
  service: number;
  grade: number;
  grade_nom?: string;
  responsable_direct?: number | null;
  responsable_direct_nom?: string;
  photo?: string | null;
  date_embauche?: string;
  anciennete?: string;
  statut?: string;
  en_poste?: boolean;
  salaire?: number;
}

/**
 * 🏢 Interface pour un service
 */
export interface Service {
  id: number;
  nom: string;
  societe: number;
  societe_nom?: string;
  description?: string;
  responsable?: number;
  responsable_info?: string;
  parent_service: number | null;
  parentservice?: number | null; // Variante API
  actif: boolean;
  date_creation?: string;
}

/**
 * 📊 Interface pour un grade
 */
export interface Grade {
  id: number;
  nom: string;
  ordre: number;
  societe?: number;
  societe_nom?: string;
  actif?: boolean;
  date_creation?: string;
}

/**
 * 📋 Réponse paginée de l'API
 */
export interface PaginatedResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  data?: T[];
}

/**
 * 🌳 Nœud de la hiérarchie des services avec salariés
 */
export interface ServiceNode {
  id: number;
  nom: string;
  children: ServiceNode[];
  salaries: SalarieInService[];
}

/**
 * 👤 Salarié dans un service avec grade
 */
export interface SalarieInService {
  id: number;
  nom: string;
  prenom: string;
  grade?: string;
  grade_nom?: string;
  ordre?: number;
  salaire?: number;
  email?: string;
  mail_professionnel?: string;
  telephone_professionnel?: string;
  photo?: string | null;
  poste?: string;
  extension_3cx?: string;
}

/**
 * 📈 Statistiques de l'organigramme
 */
export interface OrganigrammeStats {
  totalServices: number;
  totalSalaries: number;
  salariesActifs: number;
  salariesInactifs: number;
  niveauxHierarchie: number;
  salariesParService: Record<number, number>;
  salariesParGrade: Record<number, number>;
}

/**
 * 🔍 Filtres pour l'organigramme
 */
export interface OrganigrammeFilters {
  services?: number[];
  grades?: number[];
  searchText?: string;
  responsableDirect?: number | null;
  statuts?: string[];
}