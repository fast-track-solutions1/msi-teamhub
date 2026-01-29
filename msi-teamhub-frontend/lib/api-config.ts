// lib/api-config.ts

// ✅ DÉTERMINER L'URL API SELON LE CONTEXTE
const getBaseUrl = () => {
  const mode = process.env.NEXT_PUBLIC_ENV || "local";
  
  if (mode === "network") {
    // Mode réseau : collègues accèdent via l'IP
    return "http://172.168.1.47:8000/api";
  } else {
    // Mode local : tu développes en localhost
    return "http://localhost:8000/api";
  }
};

const BASE_URL = getBaseUrl();

// S'assurer que /api est présent dans l'URL
const API_BASE_URL = BASE_URL.includes('/api') ? BASE_URL : `${BASE_URL}/api`;

console.log('[api-config] API_BASE_URL:', API_BASE_URL);
console.log('[api-config] Mode:', process.env.NEXT_PUBLIC_ENV || 'local');


// ✅ FONCTION POUR DEPARTEMENTS
export const getDepartements = async () => {
  try {
    const token = localStorage.getItem('access_token');

    
    // ✅ NOUVEAU : Variables pour la pagination
    let allResults = [];
    let nextUrl = null;
    let url = `${API_BASE_URL}/departements/?limit=200`;
    
    console.log(`[getDepartements] Appel API : ${url}`);
    
    // ✅ NOUVEAU : BOUCLE pour toutes les pages
    do {
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
      console.log(`[getDepartements] Page reçue : ${data.results?.length || 0} résultats`);
      
      // ✅ NOUVEAU : Accumuler les résultats
      allResults = [...allResults, ...(data.results || [])];
      
      // ✅ NOUVEAU : Vérifier la prochaine page
      nextUrl = data.next || null;
      url = nextUrl || '';
      
    } while (nextUrl); // ✅ NOUVEAU : Tant qu'il y a une prochaine page
    
    console.log(`[getDepartements] ✅ Succès TOTAL, ${allResults.length} résultats`);
    return { results: allResults }; // ✅ NOUVEAU : Retourner tous les résultats
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
// ✅ FONCTION POUR SALARIES AVEC PAGINATION
export const getSalaries = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    let allResults = [];
    let nextUrl = null;
    let url = `${API_BASE_URL}/salaries/?limit=200`;
    
    console.log(`[getSalaries] Appel API : ${url}`);
    
    do {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`[getSalaries] Status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Impossible de récupérer les salariés`);
      }

      const data = await response.json();
      console.log(`[getSalaries] Page reçue : ${data.results?.length || 0} résultats`);
      
      allResults = [...allResults, ...(data.results || [])];
      nextUrl = data.next || null;
      url = nextUrl || '';
      
    } while (nextUrl);
    
    console.log(`[getSalaries] ✅ Succès TOTAL, ${allResults.length} résultats`);
    return { results: allResults };
  } catch (error: any) {
    console.error('[getSalaries] Erreur:', error.message);
    throw error;
  }
};


export { API_BASE_URL };
