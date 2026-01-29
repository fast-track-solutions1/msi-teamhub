// lib/api/organigramme-api.ts
// ============================================================================
// ORGANIGRAMME API CLIENT - Gère tous les appels API organigramme
// ============================================================================

import { ApiClient, PaginatedResponse } from './base-client';
import { Service, Salarie, Grade, OrganigrammeStats } from '@/lib/types/organigramme-types';

/**
 * 📡 Client API pour l'organigramme
 * Hérite de ApiClient pour réutiliser getHeaders, handleError, etc.
 */
export class OrganigrammeApiClient extends ApiClient {
  private servicesUrl = '/api/services';
  private salariesUrl = '/api/salaries';
  private gradesUrl = '/api/grades';

  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL);
  }

  // ============================================================================
  // 🏢 SERVICES
  // ============================================================================

  /**
   * Récupère tous les services
   */
  async getAllServices(): Promise<Service[]> {
    try {
      console.log('📦 Récupération des services...');

      const response = await this.get<PaginatedResponse<Service>>(
        this.servicesUrl
      );

      const services = response.results || response.data || [];
      console.log(`✅ ${services.length} services récupérés`);

      return services;
    } catch (error) {
      console.error('❌ Erreur getAllServices:', error);
      throw error;
    }
  }

  /**
   * Récupère un service par son ID
   */
  async getService(serviceId: number): Promise<Service> {
    try {
      console.log(`📦 Récupération du service ${serviceId}...`);

      const response = await this.get<Service>(`${this.servicesUrl}/${serviceId}/`);

      console.log(`✅ Service ${serviceId} récupéré:`, response.nom);

      return response;
    } catch (error) {
      console.error(`❌ Erreur getService(${serviceId}):`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau service
   */
  async createService(data: Partial<Service>): Promise<Service> {
    try {
      console.log('📝 Création d\'un service:', data);

      const response = await this.post<Service>(this.servicesUrl, data);

      console.log('✅ Service créé:', response);

      return response;
    } catch (error) {
      console.error('❌ Erreur createService:', error);
      throw error;
    }
  }

  /**
   * Met à jour un service
   */
  async updateService(serviceId: number, data: Partial<Service>): Promise<Service> {
    try {
      console.log(`📝 Mise à jour du service ${serviceId}:`, data);

      const response = await this.patch<Service>(
        `${this.servicesUrl}/${serviceId}/`,
        data
      );

      console.log(`✅ Service ${serviceId} mis à jour:`, response);

      return response;
    } catch (error) {
      console.error(`❌ Erreur updateService(${serviceId}):`, error);
      throw error;
    }
  }

  /**
   * Supprime un service
   */
  async deleteService(serviceId: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression du service ${serviceId}...`);

      await this.delete(`${this.servicesUrl}/${serviceId}/`);

      console.log(`✅ Service ${serviceId} supprimé`);
    } catch (error) {
      console.error(`❌ Erreur deleteService(${serviceId}):`, error);
      throw error;
    }
  }

  // ============================================================================
  // 👤 SALARIÉS
  // ============================================================================

  /**
   * Récupère tous les salariés
   */
  async getAllSalaries(): Promise<Salarie[]> {
    try {
      console.log('📦 Récupération des salariés...');

      const response = await this.get<PaginatedResponse<Salarie>>(
        this.salariesUrl
      );

      const salaries = response.results || response.data || [];
      console.log(`✅ ${salaries.length} salariés récupérés`);

      return salaries;
    } catch (error) {
      console.error('❌ Erreur getAllSalaries:', error);
      throw error;
    }
  }

  /**
   * Récupère un salarié par son ID
   */
  async getSalarie(salarieId: number): Promise<Salarie> {
    try {
      console.log(`📦 Récupération du salarié ${salarieId}...`);

      const response = await this.get<Salarie>(`${this.salariesUrl}/${salarieId}/`);

      console.log(`✅ Salarié ${salarieId} récupéré:`, response.nom, response.prenom);

      return response;
    } catch (error) {
      console.error(`❌ Erreur getSalarie(${salarieId}):`, error);
      throw error;
    }
  }

  /**
   * Récupère tous les salariés d'un service
   */
  async getSalariesByService(serviceId: number): Promise<Salarie[]> {
    try {
      console.log(`📦 Récupération des salariés du service ${serviceId}...`);

      const response = await this.get<PaginatedResponse<Salarie>>(
        this.salariesUrl,
        { service: serviceId }
      );

      const salaries = response.results || response.data || [];
      console.log(`✅ ${salaries.length} salariés du service ${serviceId}`);

      return salaries;
    } catch (error) {
      console.error(`❌ Erreur getSalariesByService(${serviceId}):`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau salarié
   */
  async createSalarie(data: Partial<Salarie>): Promise<Salarie> {
    try {
      console.log('📝 Création d\'un salarié:', data);

      const response = await this.post<Salarie>(this.salariesUrl, data);

      console.log('✅ Salarié créé:', response);

      return response;
    } catch (error) {
      console.error('❌ Erreur createSalarie:', error);
      throw error;
    }
  }

  /**
   * Met à jour un salarié
   */
  async updateSalarie(salarieId: number, data: Partial<Salarie>): Promise<Salarie> {
    try {
      console.log(`📝 Mise à jour du salarié ${salarieId}:`, data);

      const response = await this.patch<Salarie>(
        `${this.salariesUrl}/${salarieId}/`,
        data
      );

      console.log(`✅ Salarié ${salarieId} mis à jour:`, response);

      return response;
    } catch (error) {
      console.error(`❌ Erreur updateSalarie(${salarieId}):`, error);
      throw error;
    }
  }

  /**
   * Supprime un salarié
   */
  async deleteSalarie(salarieId: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression du salarié ${salarieId}...`);

      await this.delete(`${this.salariesUrl}/${salarieId}/`);

      console.log(`✅ Salarié ${salarieId} supprimé`);
    } catch (error) {
      console.error(`❌ Erreur deleteSalarie(${salarieId}):`, error);
      throw error;
    }
  }

  // ============================================================================
  // 📊 GRADES
  // ============================================================================

  /**
   * Récupère tous les grades
   */
  async getAllGrades(): Promise<Grade[]> {
    try {
      console.log('📦 Récupération des grades...');

      const response = await this.get<PaginatedResponse<Grade>>(
        this.gradesUrl
      );

      const grades = response.results || response.data || [];
      console.log(`✅ ${grades.length} grades récupérés`);

      // Trier par ordre
      return grades.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    } catch (error) {
      console.error('❌ Erreur getAllGrades:', error);
      throw error;
    }
  }

  /**
   * Récupère un grade par son ID
   */
  async getGrade(gradeId: number): Promise<Grade> {
    try {
      console.log(`📦 Récupération du grade ${gradeId}...`);

      const response = await this.get<Grade>(`${this.gradesUrl}/${gradeId}/`);

      console.log(`✅ Grade ${gradeId} récupéré:`, response.nom);

      return response;
    } catch (error) {
      console.error(`❌ Erreur getGrade(${gradeId}):`, error);
      throw error;
    }
  }

  // ============================================================================
  // 📈 STATISTIQUES & UTILITAIRES
  // ============================================================================

  /**
   * Récupère les statistiques de l'organigramme
   */
  async getOrganigrammeStats(): Promise<OrganigrammeStats> {
    try {
      console.log('📊 Récupération des statistiques...');

      const [services, salaries, grades] = await Promise.all([
        this.getAllServices(),
        this.getAllSalaries(),
        this.getAllGrades(),
      ]);

      // Calculer les statistiques
      const stats: OrganigrammeStats = {
        totalServices: services.length,
        totalSalaries: salaries.length,
        salariesActifs: salaries.filter((s) => s.en_poste === true).length,
        salariesInactifs: salaries.filter((s) => s.en_poste !== true).length,
        niveauxHierarchie: this.calculateHierarchyDepth(services),
        salariesParService: {},
        salariesParGrade: {},
      };

      // Compter salariés par service
      salaries.forEach((s) => {
        if (s.service) {
          stats.salariesParService[s.service] =
            (stats.salariesParService[s.service] || 0) + 1;
        }
      });

      // Compter salariés par grade
      salaries.forEach((s) => {
        if (s.grade) {
          stats.salariesParGrade[s.grade] =
            (stats.salariesParGrade[s.grade] || 0) + 1;
        }
      });

      console.log('✅ Statistiques calculées:', stats);

      return stats;
    } catch (error) {
      console.error('❌ Erreur getOrganigrammeStats:', error);
      throw error;
    }
  }

  /**
   * Calcule la profondeur de la hiérarchie
   */
  private calculateHierarchyDepth(services: Service[]): number {
    let maxDepth = 0;

    const getDepth = (serviceId: number | null, depth: number = 0): number => {
      const children = services.filter((s) => s.parent_service === serviceId);
      if (children.length === 0) return depth;

      return Math.max(
        ...children.map((child) => getDepth(child.id, depth + 1))
      );
    };

    const rootServices = services.filter((s) => !s.parent_service);
    rootServices.forEach((root) => {
      maxDepth = Math.max(maxDepth, getDepth(root.id));
    });

    return maxDepth;
  }
}

/**
 * Instance singleton pour utilisation directe
 */
export const organigrammeApi = new OrganigrammeApiClient();