// lib/service-api.ts
// API Client pour gérer les Services

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Service {
  id: number;
  nom: string;
  societe: number;
  description?: string;
  responsable?: number;
  responsable_info?: string;
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

class ServiceApiClient {
  private baseUrl = `${API_BASE_URL}/api/services`;
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

  // ✅ LECTURE
  async getServices(params?: { societe?: number; actif?: boolean; search?: string; ordering?: string }): Promise<Service[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.societe) queryParams.append('societe', params.societe.toString());
      if (params?.actif !== undefined) queryParams.append('actif', params.actif.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.ordering) queryParams.append('ordering', params.ordering);
      
      queryParams.append('limit', '100');

      const url = `${this.baseUrl}/?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      const data: ApiResponse<Service> = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erreur API (getServices):', error);
      throw error;
    }
  }

  async getServiceById(id: number): Promise<Service> {
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
      console.error('Erreur API (getServiceById):', error);
      throw error;
    }
  }

  // ✅ CRÉATION
  async createService(service: Omit<Service, 'id' | 'date_creation' | 'responsable_info'>): Promise<Service> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(service),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createService):', error);
      throw error;
    }
  }

  // ✅ MODIFICATION
  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(service),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateService):', error);
      throw error;
    }
  }

  // ✅ SUPPRESSION
  async deleteService(id: number): Promise<void> {
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
      console.error('Erreur API (deleteService):', error);
      throw error;
    }
  }
}

export const serviceApi = new ServiceApiClient();
