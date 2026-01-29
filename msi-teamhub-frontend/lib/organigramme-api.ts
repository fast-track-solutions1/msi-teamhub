import { Service, Salarie, PaginatedResponse } from './organigramme-types';

// Utilise directement NEXT_PUBLIC_API_URL (172.168.1.47:8000)
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/**
 * 🔐 Récupère le token d'authentification depuis le localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Essaye différentes clés possibles
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('auth_token') ||
    null
  );
}

/**
 * 🔗 Récupère les headers avec authentification
 */
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * 🔗 Récupère tous les services
 */
export const getAllServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: PaginatedResponse<Service> = await response.json();
    return data.results || data.data || [];
  } catch (error) {
    console.error('❌ Erreur getAllServices:', error);
    throw error;
  }
};

/**
 * 🔗 Récupère un service spécifique
 */
export const getService = async (serviceId: string | number): Promise<Service> => {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: Service = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur getService:', error);
    throw error;
  }
};

/**
 * 🔗 Récupère tous les salariés
 */
export const getAllSalaries = async (): Promise<Salarie[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/salaries/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: PaginatedResponse<Salarie> = await response.json();
    return data.results || data.data || [];
  } catch (error) {
    console.error('❌ Erreur getAllSalaries:', error);
    throw error;
  }
};

/**
 * 🔗 Récupère un salarié spécifique
 */
export const getSalarie = async (salarieId: number): Promise<Salarie> => {
  try {
    const response = await fetch(`${API_BASE_URL}/salaries/${salarieId}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: Salarie = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur getSalarie:', error);
    throw error;
  }
};

/**
 * 🔗 Récupère les salariés par service
 */
export const getSalariesByService = async (serviceId: number): Promise<Salarie[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/salaries/?service=${serviceId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data: PaginatedResponse<Salarie> = await response.json();
    return data.results || data.data || [];
  } catch (error) {
    console.error('❌ Erreur getSalariesByService:', error);
    throw error;
  }
};