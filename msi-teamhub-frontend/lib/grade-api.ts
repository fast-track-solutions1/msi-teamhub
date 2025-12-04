// lib/grade-api.ts
// API Client pour gérer les Grades

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Grade {
  id: number;
  nom: string;
  societe: number;
  societe_nom?: string;
  ordre: number;
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

class GradeApiClient {
  private baseUrl = `${API_BASE_URL}/api/grades`;
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
  async getGrades(params?: { societe?: number; actif?: boolean; search?: string; ordering?: string }): Promise<Grade[]> {
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

      const data: ApiResponse<Grade> = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Erreur API (getGrades):', error);
      throw error;
    }
  }

  async getGradeById(id: number): Promise<Grade> {
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
      console.error('Erreur API (getGradeById):', error);
      throw error;
    }
  }

  // ✅ CRÉATION
  async createGrade(grade: Omit<Grade, 'id' | 'date_creation' | 'societe_nom'>): Promise<Grade> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(grade),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (createGrade):', error);
      throw error;
    }
  }

  // ✅ MODIFICATION
  async updateGrade(id: number, grade: Partial<Grade>): Promise<Grade> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(grade),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        this.handleError(response, data);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API (updateGrade):', error);
      throw error;
    }
  }

  // ✅ SUPPRESSION
  async deleteGrade(id: number): Promise<void> {
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
      console.error('Erreur API (deleteGrade):', error);
      throw error;
    }
  }
}

export const gradeApi = new GradeApiClient();
