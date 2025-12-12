// lib/societe-api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Societe {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  activite?: string;
  clients?: string;
  actif: boolean;
  date_creation: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

class SocieteApiClient {
  private baseUrl = `${API_BASE_URL}/api/societes`;
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

  async getSocietes(limit = 100): Promise<Societe[]> {
    try {
      const response = await fetch(`${this.baseUrl}/?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      const data: ApiResponse<Societe> = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erreur API (getSocietes):', error);
      throw error;
    }
  }

  async getSocieteById(id: number): Promise<Societe> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (getSocieteById):', error);
      throw error;
    }
  }

  async createSociete(societe: Omit<Societe, 'id'>): Promise<Societe> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(societe),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createSociete):', error);
      throw error;
    }
  }

  async updateSociete(id: number, societe: Partial<Societe>): Promise<Societe> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(societe),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateSociete):', error);
      throw error;
    }
  }

  async deleteSociete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }
    } catch (error) {
      console.error('Erreur API (deleteSociete):', error);
      throw error;
    }
  }
}

export const societeApi = new SocieteApiClient();

// ✅ Exports pour compatibilité
export const getSocietes = (limit?: number) => societeApi.getSocietes(limit);
export const getSocieteById = (id: number) => societeApi.getSocieteById(id);
export const createSociete = (societe: Omit<Societe, 'id'>) => societeApi.createSociete(societe);
export const updateSociete = (id: number, societe: Partial<Societe>) => societeApi.updateSociete(id, societe);
export const deleteSociete = (id: number) => societeApi.deleteSociete(id);
