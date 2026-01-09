// @/lib/salarie-api.ts - Client API complet avec LOGS et CORRECTIONS

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// INTERFACES
// ============================================================================

export interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  genre: 'm' | 'f' | 'autre';
  date_naissance?: string;
  telephone?: string;
  mail_professionnel?: string;
  telephone_professionnel?: string;
  extension_3cx?: string;
  photo?: string;
  societe: number;
  service?: number | null;
  grade?: number | null;
  responsable_direct?: number | null;
  poste?: string;
  departements: number[];
  circuit?: number | null;
  date_embauche: string;
  statut: 'actif' | 'inactif' | 'conge' | 'arret_maladie';
  date_sortie?: string | null;
  creneau_travail?: number | null;
  en_poste?: boolean;
  date_creation: string;
  date_modification: string;
  service_nom?: string;
  grade_nom?: string;
  societe_nom?: string;
  responsable_direct_nom?: string;
}

interface ApiResponse<T = any> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  detail?: string;
  error?: string;
}

// ============================================================================
// CLASSE API
// ============================================================================

class SalarieApi {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_BASE}/api/salaries`;
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
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs API - VERSION AVEC LOGS COMPLETS
   */
  private async handleError(response: Response) {
    let errorData: any = {};
    let responseText = '';
    
    console.log('═══════════════════════════════════════');
    console.log('🔴 ERREUR API DÉTECTÉE');
    console.log('═══════════════════════════════════════');
    console.log('📊 Status:', response.status);
    console.log('📊 StatusText:', response.statusText);
    
    try {
      responseText = await response.text();
      
      console.log('📋 RESPONSE TEXT BRUT:');
      console.log(responseText);
      console.log('📋 RESPONSE TEXT LENGTH:', responseText.length);
      
      if (responseText && responseText.length > 0) {
        try {
          errorData = JSON.parse(responseText);
          console.log('✅ JSON PARSÉ:');
          console.log(JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log('❌ PAS DU JSON VALIDE');
          errorData = { raw: responseText };
        }
      } else {
        console.log('⚠️ RESPONSE TEXT EST VIDE!');
      }
    } catch (e) {
      console.error('❌ Erreur lors de la lecture de la réponse:', e);
    }

    const message = errorData?.detail || errorData?.error || errorData?.raw || `Erreur ${response.status}`;
    
    console.log('═══════════════════════════════════════');
    console.log('🔴 ERREUR API COMPLÈTE:');
    console.log({
      status: response.status,
      statusText: response.statusText,
      message,
      responseText,
      errorData,
    });
    console.log('═══════════════════════════════════════');

    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  async getSalaries(): Promise<Salarie[]> {
    try {
      let allSalaries: Salarie[] = [];
      let url: string | null = `${this.baseUrl}/`;
      
      while (url) {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });
        
        if (!response.ok) {
          await this.handleError(response);
        }
        
        const data: ApiResponse<Salarie> = await response.json();
        allSalaries = [...allSalaries, ...(data.results || [])];
        url = data.next || null;
      }
      
      console.log(`✅ ${allSalaries.length} salariés chargés au total`);
      return allSalaries;
    } catch (error) {
      console.error('❌ Erreur getSalaries:', error);
      throw error;
    }
  }

  async getSalarieById(id: number): Promise<Salarie> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Erreur getSalarieById(${id}):`, error);
      throw error;
    }
  }

  async createSalarie(
    data: Omit<Salarie, 'id' | 'date_creation' | 'date_modification'>
  ): Promise<Salarie> {
    try {
      console.log('📤 Création salarié avec données:', data);

      const response = await fetch(`${this.baseUrl}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const created = await response.json();
      console.log('✅ Salarié créé:', created);
      return created;
    } catch (error) {
      console.error('❌ Erreur createSalarie:', error);
      throw error;
    }
  }

  /**
   * PUT /api/salaries/{id}/ - VERSION AVEC LOGS + CORRECTIONS
   */
  async updateSalarie(id: number, data: Partial<Salarie>): Promise<Salarie> {
    try {
      console.log(`📝 Mise à jour salarié ${id}:`, data);

      const current = await this.getSalarieById(id);
      console.log('📋 Salarié actuel:', current);

      const mergedData = {
        ...current,
        ...data,
      };

      // Construction de cleanData AVEC les corrections
      const cleanData = {
        nom: mergedData.nom,
        prenom: mergedData.prenom,
        matricule: mergedData.matricule,

        // 1️⃣ Normaliser le genre (M/F → m/f) pour matcher les choices Django
        genre: mergedData.genre
          ? mergedData.genre.toLowerCase()
          : 'm',

        // 2️⃣ Ne pas envoyer "" comme date (Django n'aime pas)
        date_naissance: mergedData.date_naissance
          ? mergedData.date_naissance
          : null,

        telephone: mergedData.telephone,
        mail_professionnel: mergedData.mail_professionnel,
        telephone_professionnel: mergedData.telephone_professionnel,
        extension_3cx: mergedData.extension_3cx,
        photo: mergedData.photo,
        societe: mergedData.societe,
        service: mergedData.service,
        grade: mergedData.grade,
        responsable_direct: mergedData.responsable_direct,
        poste: mergedData.poste,
        departements: mergedData.departements || [],
        circuit: mergedData.circuit,
        date_embauche: mergedData.date_embauche,

        // 3️⃣ Mapper le statut du front vers les choices Django
        statut:
          mergedData.statut === 'OK'
            ? 'actif'
            : mergedData.statut ?? 'actif',

        date_sortie: mergedData.date_sortie || null,
        creneau_travail: mergedData.creneau_travail,
        en_poste: mergedData.en_poste ?? false,
      };

      console.log('═══════════════════════════════════════');
      console.log('📤 DONNÉES À ENVOYER:');
      console.log(JSON.stringify(cleanData, null, 2));
      console.log('═══════════════════════════════════════');

      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const updated = await response.json();
      console.log('✅ Salarié mis à jour:', JSON.stringify(updated, null, 2));
      return updated;

    } catch (error) {
      console.error(`❌ Erreur updateSalarie(${id}):`, error);
      throw error;
    }
  }

  async deleteSalarie(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok && response.status !== 204) {
        await this.handleError(response);
      }

      console.log(`✅ Salarié ${id} supprimé`);
    } catch (error) {
      console.error(`❌ Erreur deleteSalarie(${id}):`, error);
      throw error;
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const salarieApi = new SalarieApi();
export const getSalaries = () => salarieApi.getSalaries();
