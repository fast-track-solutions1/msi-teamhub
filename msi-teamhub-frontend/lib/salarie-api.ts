// lib/salarie-api.ts

// Assurer que l'URL contient toujours /api
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// S'assurer que /api est présent dans l'URL
const API_BASE_URL = BASE_URL.includes('/api') ? BASE_URL : `${BASE_URL}/api`;

console.log('[salarie-api] API_BASE_URL:', API_BASE_URL);

export interface Salarie {
  id: number;
  user: number | null;
  nom: string;
  prenom: string;
  matricule: string;
  genre: 'm' | 'f';
  date_naissance: string | null;
  jour_mois_naissance: string | null;
  telephone: string | null;
  mail_professionnel: string | null;
  telephone_professionnel: string | null;
  extension_3cx: string | null;
  societe: number;
  societe_nom?: string;
  service: number | null;
  service_nom?: string;
  grade: number | null;
  grade_nom?: string;
  responsable_direct: number | null;
  responsable_nom?: string;
  poste: string | null;
  departements: number[];
  departements_list?: string[];
  circuit: number | null;
  date_embauche: string;
  anciennete?: string;
  statut: 'actif' | 'suspendu' | 'absent' | 'conge' | 'demission' | 'licencie' | 'retraite';
  date_sortie: string | null;
  en_poste: boolean;
  creneau_travail: number | null;
  creneau_nom?: string;
  statut_actuel?: string;
  date_creation: string;
  date_modification: string;
}

export interface SalarieListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Salarie[];
}

// Récupérer tous les salariés
export const getSalaries = async (): Promise<Salarie[] | SalarieListResponse> => {
  try {
    const token = localStorage.getItem('access_token');

    if (!token) {
      console.warn('⚠️  Aucun token trouvé, vérifiez votre authentification');
    }

    const url = `${API_BASE_URL}/salaries/`;
    console.log(`[getSalaries] Appel API : ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[getSalaries] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getSalaries] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur ${response.status}: Impossible de récupérer les salariés`);
    }

    const data = await response.json();
    console.log(`[getSalaries] ✅ Succès, ${Array.isArray(data) ? data.length : data.results?.length || 0} résultats`);
    return data;
  } catch (error: any) {
    console.error('[getSalaries] Erreur complète:', error);
    throw error;
  }
};

// Récupérer un salarié par ID
export const getSalarie = async (id: number): Promise<Salarie> => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/salaries/${id}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getSalarie] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur ${response.status}: Impossible de récupérer le salarié`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[getSalarie] Erreur:', error.message);
    throw error;
  }
};

// Créer un salarié
export const createSalarie = async (data: Partial<Salarie>): Promise<Salarie> => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/salaries/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[createSalarie] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur ${response.status}: Impossible de créer le salarié`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[createSalarie] Erreur:', error.message);
    throw error;
  }
};

// Mettre à jour un salarié
export const updateSalarie = async (id: number, data: Partial<Salarie>): Promise<Salarie> => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/salaries/${id}/`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[updateSalarie] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur ${response.status}: Impossible de mettre à jour le salarié`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[updateSalarie] Erreur:', error.message);
    throw error;
  }
};

// Supprimer un salarié
export const deleteSalarie = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/salaries/${id}/`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[deleteSalarie] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur ${response.status}: Impossible de supprimer le salarié`);
    }
  } catch (error: any) {
    console.error('[deleteSalarie] Erreur:', error.message);
    throw error;
  }
};

// Export objet API
export const salarieApi = {
  getSalaries,
  getSalarie,
  createSalarie,
  updateSalarie,
  deleteSalarie,
};