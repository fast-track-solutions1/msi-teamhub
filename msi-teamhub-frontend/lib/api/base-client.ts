// lib/api/base-client.ts
// ============================================================================
// BASE API CLIENT - Classe réutilisable pour tous les APIs
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 🔐 Récupère le token d'authentification depuis le localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    null
  );
}

/**
 * 🌐 Interface pour les réponses paginées
 */
export interface PaginatedResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  data?: T[];
}

/**
 * 🔗 Interface pour les erreurs API
 */
export interface ApiErrorData {
  detail?: string;
  error?: string;
  [key: string]: any;
}

/**
 * 📡 Classe de base pour tous les clients API
 */
export class ApiClient {
  protected baseUrl: string;
  protected token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    // Nettoyer la base URL (pas de slash final)
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.loadToken();
  }

  /**
   * Charge le token du localStorage
   */
  protected loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = getAuthToken();
    }
  }

  /**
   * Récupère les headers avec authentification
   */
  protected getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs API de manière cohérente
   */
  protected async handleError(response: Response, data?: any): Promise<never> {
    const message =
      data?.detail ||
      data?.error ||
      `Erreur API ${response.status}: ${response.statusText}`;

    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = data;

    console.error('❌ Erreur API:', {
      status: response.status,
      statusText: response.statusText,
      message,
      data,
    });

    throw error;
  }

  /**
   * GET - Récupère les données
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const url = new URL(endpoint, this.baseUrl);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value != null && value !== '') {
            url.searchParams.append(key, String(value));
          }
        });
      }

      console.log('🔍 API GET:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        await this.handleError(response, errorData);
      }

      const result = await response.json();
      console.log('✅ API GET Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur GET:', error);
      throw error;
    }
  }

  /**
   * POST - Crée une nouvelle ressource
   */
  async post<T = any>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = new URL(endpoint, this.baseUrl);

      console.log('📝 API POST:', url.toString(), 'Payload:', payload);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        await this.handleError(response, errorData);
      }

      const result = await response.json();
      console.log('✅ API POST Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur POST:', error);
      throw error;
    }
  }

  /**
   * PATCH - Met à jour partiellement une ressource
   */
  async patch<T = any>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = new URL(endpoint, this.baseUrl);

      console.log('⚙️ API PATCH:', url.toString(), 'Payload:', payload);

      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        await this.handleError(response, errorData);
      }

      const result = await response.json();
      console.log('✅ API PATCH Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur PATCH:', error);
      throw error;
    }
  }

  /**
   * PUT - Remplace complètement une ressource
   */
  async put<T = any>(endpoint: string, payload?: any): Promise<T> {
    try {
      const url = new URL(endpoint, this.baseUrl);

      console.log('🔄 API PUT:', url.toString(), 'Payload:', payload);

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        await this.handleError(response, errorData);
      }

      const result = await response.json();
      console.log('✅ API PUT Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur PUT:', error);
      throw error;
    }
  }

  /**
   * DELETE - Supprime une ressource
   */
  async delete<T = any>(endpoint: string): Promise<T | null> {
    try {
      const url = new URL(endpoint, this.baseUrl);

      console.log('🗑️ API DELETE:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      // 204 = No Content (succès sans réponse)
      if (response.status === 204) {
        console.log('✅ API DELETE Success (204)');
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        await this.handleError(response, errorData);
      }

      const result = await response.json();
      console.log('✅ API DELETE Success:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur DELETE:', error);
      throw error;
    }
  }
}

/**
 * Instance singleton pour utilisation directe
 */
export const apiClient = new ApiClient(API_BASE_URL);