// lib/api.ts - API Client pour MSI TeamHub
// Configuration centralisée + Services réutilisables

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Department {
  id: number;
  numero: string;
  nom: string;
  region: string;
  societe: number;
  actif: boolean;
}

export interface Service {
  id: number;
  nom: string;
  description?: string;
  societe: number;
  actif: boolean;
}

export interface Grade {
  id: number;
  nom: string;
  ordre: number;
  societe: number;
  actif: boolean;
}

export interface Employee {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  date_embauche: string;
  service: number;
  grade: number;
  departement: number;
  actif: boolean;
}

export interface Circuit {
  id: number;
  nom: string;
  departement: number;
  actif: boolean;
}

export interface Equipment {
  id: number;
  nom: string;
  type_equipement: string;
  quantite: number;
  actif: boolean;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: any;
}

// ============================================================================
// API CLIENT PRINCIPAL
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  /**
   * Charge le token depuis le localStorage
   */
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  /**
   * Sauvegarde le token
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  /**
   * Construit les headers avec le token JWT
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ✅ Charge le token s'il existe
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Construit l'URL avec les paramètres de query
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window?.location?.origin || 'http://localhost:3000');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * GET - Récupère les données
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = this.buildUrl(endpoint, params);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // ✅ Gère 401 Unauthorized (token expiré)
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        throw new Error('Authentification requise');
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  /**
   * POST - Crée une nouvelle ressource
   */
  async post<T>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Authentification requise');
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  /**
   * PUT - Remplace une ressource
   */
  async put<T>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Authentification requise');
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  /**
   * PATCH - Met à jour partiellement une ressource
   */
  async patch<T>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Authentification requise');
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API PATCH Error:', error);
      throw error;
    }
  }

  /**
   * DELETE - Supprime une ressource
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        throw new Error('Authentification requise');
      }

      if (!response.ok && response.status !== 204) {
        const errorData: ApiError = await response.json().catch(() => ({}));
        throw this.createError(response.status, errorData);
      }

      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }

  /**
   * Crée une erreur formatée
   */
  private createError(status: number, data: ApiError): Error {
    const message = data.detail || data.error || `Erreur API: ${status}`;
    const error = new Error(message);
    (error as any).status = status;
    (error as any).data = data;
    return error;
  }
}

// ============================================================================
// INSTANCE SINGLETON
// ============================================================================

export const apiClient = new ApiClient();

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Formate les erreurs API pour l'affichage
 */
export function formatApiError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.detail) {
    return error.detail;
  }

  if (error?.error) {
    return error.error;
  }

  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }

  return 'Une erreur est survenue';
}

/**
 * Vérifie si c'est une erreur API
 */
export function isApiError(error: any): boolean {
  return error instanceof Error || typeof error === 'object';
}