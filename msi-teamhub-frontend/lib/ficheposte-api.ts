// lib/ficheposte-api.ts - API Client pour Fiches de Poste

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FichePoste {
  id: number;
  titre: string;
  service: number;
  servicenom?: string;
  grade: number;
  gradenom?: string;
  responsable_service: number | null;
  responsable_info?: string;
  description: string;
  taches: string;
  competencesrequises: string;
  moyenscorrection?: string;
  problemes?: string;
  propositions?: string;
  defauts?: string;
  statut: 'actif' | 'enrevision' | 'archiv';
  outils?: any[];
  ameliorations?: any[];
  datecreation: string;
  datemodification: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

class FichePosteApiClient {
  private baseUrl = `${API_BASE_URL}/api/fiches-poste/`;
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private handleError(response: Response, data: any) {
    const message = data?.detail || data?.error || `Erreur ${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  // === LECTURE ===

  async getFichesPostes(params?: {
    service?: number;
    grade?: number;
    statut?: string;
    search?: string;
    ordering?: string;
  }): Promise<FichePoste[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.service) queryParams.append('service', params.service.toString());
      if (params?.grade) queryParams.append('grade', params.grade.toString());
      if (params?.statut) queryParams.append('statut', params.statut);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      queryParams.append('limit', '100');

      const url = `${this.baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      const data = (await response.json()) as ApiResponse<FichePoste>;
      return data.results || [];
    } catch (error) {
      console.error('Erreur API getFichesPostes:', error);
      throw error;
    }
  }

  async getFichePosteById(id: number): Promise<FichePoste> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getFichePosteById:', error);
      throw error;
    }
  }

  // === CRÉATION ===

  async createFichePoste(ficheposte: Omit<FichePoste, 'id'>): Promise<FichePoste> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(ficheposte),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API createFichePoste:', error);
      throw error;
    }
  }

  // === MODIFICATION ===

  async updateFichePoste(id: number, ficheposte: Partial<FichePoste>): Promise<FichePoste> {
  try {
    console.log('📤 Envoi données:', JSON.stringify(ficheposte, null, 2));  // ← STRINGIFY
    
    const response = await fetch(`${this.baseUrl}${id}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(ficheposte),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log('❌ Erreur détails:', JSON.stringify(data, null, 2));  // ← STRINGIFY
      console.log('❌ Status:', response.status);
      this.handleError(response, data);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur API updateFichePoste:', error);
    throw error;
  }
}



  // === SUPPRESSION ===

  async deleteFichePoste(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }
    } catch (error) {
      console.error('Erreur API deleteFichePoste:', error);
      throw error;
    }
  }
}

// D'abord créer l'instance
export const fichePosteApi = new FichePosteApiClient();

// Ensuite les exports pour compatibilité
export const getFichesPostes = (params?: any) => fichePosteApi.getFichesPostes(params);
export const getFichePosteById = (id: number) => fichePosteApi.getFichePosteById(id);
export const createFichePoste = (ficheposte: Omit<FichePoste, 'id'>) => fichePosteApi.createFichePoste(ficheposte);
export const updateFichePoste = (id: number, ficheposte: Partial<FichePoste>) => fichePosteApi.updateFichePoste(id, ficheposte);
export const deleteFichePoste = (id: number) => fichePosteApi.deleteFichePoste(id);


