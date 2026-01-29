// lib/organigramme-types.ts

// ============================================
// TYPES EXISTANTS (À CONSERVER)
// ============================================

export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  grade: number;
  grade_nom: string;
  responsable_direct: number | null;
  service: number;
  service_nom: string;
  poste: string;
  mail_professionnel: string;
  telephone_professionnel: string;
  extension_3cx: string;
  photo: string | null;
  date_embauche: string;
  anciennete: string;
  statut: string;
}

export interface Service {
  id: number;
  nom: string;
  societe: number;
  description: string;
  responsable: number;
  responsable_info: string;
  parentservice: number | null;
  actif: boolean;
  date_creation: string;
}


export interface OrganigrammeNode {
  salarie: Salarie;
  children: OrganigrammeNode[];
}

export interface PaginatedResponse<T> {
  results?: T[];
  data?: T[];
  count?: number;
  next?: string;
  previous?: string;
}

// ============================================
// NOUVEAUX TYPES POUR PYRAMIDE
// ============================================

export interface OrganigrammeFilters {
  services: number[];
  departments: string[];
  regions: string[];
  grades: string[];
  responsableDirect: number | null;
  responsableService: number | null;
  statuts: string[];
  searchText: string;
  level?: number;
}

export interface HierarchyLevel {
  level: number;
  employees: Salarie[];
  count: number;
}

export interface PyramidalStructure {
  root: Salarie;
  levels: HierarchyLevel[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
}

export interface OrganigrammeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  employeesByGrade: Record<string, number>;
  employeesByDepartment: Record<string, number>;
  employeesByRegion: Record<string, number>;
  averageTeamSize: number;
  hierarchyLevels: number;
}

export interface FilterOptions {
  services: { id: number; nom: string }[];
  departments: string[];
  regions: string[];
  grades: string[];
  responsables: { id: number; nom: string; prenom: string }[];
  statuts: string[];
}

export interface EmployeeCardData {
  employee: Salarie;
  isRoot: boolean;
  teamSize: number;
  directReports: number;
}
