// lib/api-config.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// S'assurer que /api est présent dans l'URL
const API_BASE_URL = BASE_URL.includes('/api') ? BASE_URL : `${BASE_URL}/api`;

console.log('[api-config] API_BASE_URL:', API_BASE_URL);

// ✅ FONCTION POUR DEPARTEMENTS
export const getDepartements = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/departements/`;
    
    console.log(`[getDepartements] Appel API : ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[getDepartements] Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Impossible de récupérer les départements`);
    }

    const data = await response.json();
    console.log(`[getDepartements] ✅ Succès, ${data.results?.length || 0} résultats`);
    return data;
  } catch (error: any) {
    console.error('[getDepartements] Erreur:', error.message);
    throw error;
  }
};

// ✅ FONCTION POUR CRENEAUX TRAVAIL
export const getCreneauxTravail = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/creneaux-travail/`;
    
    console.log(`[getCreneauxTravail] Appel API : ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[getCreneauxTravail] Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Impossible de récupérer les créneaux de travail`);
    }

    const data = await response.json();
    console.log(`[getCreneauxTravail] ✅ Succès, ${data.results?.length || 0} résultats`);
    return data;
  } catch (error: any) {
    console.error('[getCreneauxTravail] Erreur:', error.message);
    throw error;
  }
};

// ✅ NOUVELLE FONCTION - CHARGER LES SALARIÉS POUR RESPONSABLE DIRECT
export const getSalariesForResponsable = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/salaries/?limit=500`; // Charge jusqu'à 500 salariés
    
    console.log(`[getSalariesForResponsable] Appel API : ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[getSalariesForResponsable] Status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: Impossible de récupérer les salariés`);
    }

    const data = await response.json();
    console.log(`[getSalariesForResponsable] ✅ Succès, ${data.results?.length || 0} résultats`);
    
    // Retourner seulement les résultats
    return data.results || [];
  } catch (error: any) {
    console.error('[getSalariesForResponsable] Erreur:', error.message);
    throw error;
  }
};

export { API_BASE_URL };
