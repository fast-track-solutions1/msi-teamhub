// lib/departement-api.ts
// API Client pour gérer les Départements

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Circuit {
  id: number;
  nom: string;
  departement: number;
  departement_nom?: string;
  description?: string;
  actif: boolean;
  date_creation: string;
}

export interface Departement {
  id: number;
  numero: string;
  nom: string;
  region?: string;
  chef_lieu?: string;
  societe: number;
  nombre_circuits: number;
  actif: boolean;
  date_creation: string;
  circuits?: Circuit[];
  label_complet?: string;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

class DepartementApiClient {
  private baseUrl = `${API_BASE_URL}/api/departements`;
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

  // ✅ LECTURE - RÉCUPÈRE TOUS LES DÉPARTEMENTS
  async getDepartements(params?: { societe?: number; actif?: boolean; search?: string; ordering?: string }): Promise<Departement[]> {
    try {
      let allResults: Departement[] = [];
      let nextUrl: string | null = null;
      
      const queryParams = new URLSearchParams();
      if (params?.societe) queryParams.append('societe', params.societe.toString());
      if (params?.actif !== undefined) queryParams.append('actif', params.actif.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      queryParams.append('limit', '200'); // Limite élevée pour tout récupérer
      
      let url = `${this.baseUrl}/?${queryParams.toString()}`;
      
      // Boucle pour récupérer toutes les pages si nécessaire
      do {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          this.handleError(response, data);
        }

        const data: ApiResponse<Departement> = await response.json();
        allResults = [...allResults, ...(data.results || [])];
        nextUrl = data.next || null;
        url = nextUrl || '';
        
      } while (nextUrl);
      
      return allResults;
      
    } catch (error) {
      console.error('Erreur API (getDepartements):', error);
      throw error;
    }
  }

  async getDepartementById(id: number): Promise<Departement> {
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
      console.error('Erreur API (getDepartementById):', error);
      throw error;
    }
  }

  // ✅ CRÉATION
  async createDepartement(departement: Omit<Departement, 'id' | 'date_creation' | 'circuits' | 'label_complet'>): Promise<Departement> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(departement),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createDepartement):', error);
      throw error;
    }
  }

  // ✅ MODIFICATION
  async updateDepartement(id: number, departement: Partial<Departement>): Promise<Departement> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(departement),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateDepartement):', error);
      throw error;
    }
  }

  // ✅ SUPPRESSION
  async deleteDepartement(id: number): Promise<void> {
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
      console.error('Erreur API (deleteDepartement):', error);
      throw error;
    }
  }
}

export const departementApi = new DepartementApiClient();
// ✅ Exports pour compatibilité
export const getDepartements = (params?: any) => departementApi.getDepartements(params);
export const getDepartementById = (id: number) => departementApi.getDepartementById(id);
export const createDepartement = (departement: any) => departementApi.createDepartement(departement);
export const updateDepartement = (id: number, departement: any) => departementApi.updateDepartement(id, departement);
export const deleteDepartement = (id: number) => departementApi.deleteDepartement(id);
