'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Search, ChevronDown, Clock, Edit2, Check } from 'lucide-react';
import { Salarie } from '@/lib/salarie-api';
import { Societe } from '@/lib/societe-api';
import { Service } from '@/lib/service-api';
import { Grade } from '@/lib/grade-api';

interface Departement {
  id: number;
  numero: string;
  nom: string;
  region: string;
  chef_lieu: string;
  nombre_circuits: number;
}

interface CreneauTravail {
  id: number;
  nom: string;
  heure_debut: string;
  heure_fin: string;
  heure_pause_debut: string;
  heure_pause_fin: string;
}

interface SalarieForResponsable {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  service_nom?: string;
  grade_nom?: string;
}

interface SalarieFormProps {
  salarie?: Salarie | null;
  societes: Societe[];
  services: Service[];
  grades: Grade[];
  departements?: Departement[];
  creneauxTravail?: CreneauTravail[];
  salariesForResponsable?: SalarieForResponsable[];
  onSave: (data: Omit<Salarie, 'id'> | Partial<Salarie>) => Promise<void>;
  onCancel: () => void;
}

export default function SalarieForm({
  salarie,
  societes,
  services,
  grades,
  departements = [],
  creneauxTravail = [],
  salariesForResponsable = [],
  onSave,
  onCancel,
}: SalarieFormProps) {
  const [formData, setFormData] = useState({
    nom: salarie?.nom || '',
    prenom: salarie?.prenom || '',
    matricule: salarie?.matricule || '',
    genre: salarie?.genre || 'm',
    date_naissance: salarie?.date_naissance || '',
    telephone: salarie?.telephone || '',
    mail_professionnel: salarie?.mail_professionnel || '',
    telephone_professionnel: salarie?.telephone_professionnel || '',
    extension_3cx: salarie?.extension_3cx || '',
    societe: salarie?.societe || (societes.length > 0 ? societes[0].id : 0),
    service: salarie?.service || undefined,
    grade: salarie?.grade || undefined,
    poste: salarie?.poste || '',
    circuit: salarie?.circuit || undefined,
    date_embauche: salarie?.date_embauche || '',
    statut: salarie?.statut || 'actif',
    en_poste: salarie?.en_poste ?? true,
    responsable_direct: salarie?.responsable_direct || undefined,
    creneau_travail: salarie?.creneau_travail || undefined,
    departements: salarie?.departements || [],
    heure_pause_debut: salarie?.heure_pause_debut || '',
    heure_pause_fin: salarie?.heure_pause_fin || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoPosteSuggestion, setAutoPosteSuggestion] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // États pour les départements
  const [departementSearch, setDepartementSearch] = useState('');
  const [showDepartementList, setShowDepartementList] = useState(false);
  const [tempSelectedDepartements, setTempSelectedDepartements] = useState<number[]>(salarie?.departements || []);
  const [selectedDepartementDetails, setSelectedDepartementDetails] = useState<Departement[]>([]);

  // États pour le Responsable Direct
  const [responsableSearch, setResponsableSearch] = useState('');
  const [showResponsableList, setShowResponsableList] = useState(false);
  const [filteredResponsables, setFilteredResponsables] = useState<SalarieForResponsable[]>([]);
  const [selectedResponsableDetails, setSelectedResponsableDetails] = useState<SalarieForResponsable | null>(null);

  // États pour le Créneau de travail
  const [selectedCreneauDetails, setSelectedCreneauDetails] = useState<CreneauTravail | null>(null);
  
  // ✅ NOUVEAU - État pour mode édition des pauses
  const [editingPause, setEditingPause] = useState(false);
  const [tempPauseDebut, setTempPauseDebut] = useState('');
  const [tempPauseFin, setTempPauseFin] = useState('');

  // Filtrer les départements selon la recherche
  const filteredDepartements = departements.filter((dept) =>
    dept.numero.toLowerCase().includes(departementSearch.toLowerCase()) ||
    dept.nom.toLowerCase().includes(departementSearch.toLowerCase())
  );

  // Filtrer les responsables selon la recherche
  useEffect(() => {
    if (responsableSearch.trim()) {
      const filtered = salariesForResponsable.filter((salarie) =>
        salarie.matricule.toLowerCase().includes(responsableSearch.toLowerCase()) ||
        salarie.nom.toLowerCase().includes(responsableSearch.toLowerCase()) ||
        salarie.prenom.toLowerCase().includes(responsableSearch.toLowerCase())
      );
      setFilteredResponsables(filtered);
    } else {
      setFilteredResponsables(salariesForResponsable);
    }
  }, [responsableSearch, salariesForResponsable]);

  // Récupérer les infos du responsable sélectionné
  useEffect(() => {
    if (formData.responsable_direct) {
      const responsable = salariesForResponsable.find((s) => s.id === formData.responsable_direct);
      setSelectedResponsableDetails(responsable || null);
    } else {
      setSelectedResponsableDetails(null);
    }
  }, [formData.responsable_direct, salariesForResponsable]);

  // Récupérer les infos du créneau sélectionné
  useEffect(() => {
    if (formData.creneau_travail) {
      const creneau = creneauxTravail.find((c) => c.id === formData.creneau_travail);
      setSelectedCreneauDetails(creneau || null);
      
      // Initialiser les champs temporaires si on entre en mode édition
      if (creneau && !editingPause) {
        setTempPauseDebut(formData.heure_pause_debut || creneau.heure_pause_debut);
        setTempPauseFin(formData.heure_pause_fin || creneau.heure_pause_fin);
      }
    } else {
      setSelectedCreneauDetails(null);
    }
  }, [formData.creneau_travail, creneauxTravail]);

  // Auto-générer le poste quand service ou grade change
  useEffect(() => {
    if (formData.service && formData.grade) {
      const serviceName = services.find((s) => s.id === formData.service)?.nom || '';
      const gradeName = grades.find((g) => g.id === formData.grade)?.nom || '';

      if (serviceName && gradeName) {
        const suggestion = `${gradeName} - ${serviceName}`;
        setAutoPosteSuggestion(suggestion);

        if (!formData.poste || formData.poste.includes(' - ')) {
          setFormData((prev) => ({
            ...prev,
            poste: suggestion,
          }));
        }
      }
    }
  }, [formData.service, formData.grade, services, grades]);

  // Mettre à jour les infos des départements sélectionnés
  useEffect(() => {
    const selected = departements.filter((d) => formData.departements.includes(d.id));
    setSelectedDepartementDetails(selected);
  }, [formData.departements, departements]);

  // Initialiser les départements temporaires
  useEffect(() => {
    setTempSelectedDepartements(formData.departements);
  }, [showDepartementList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (['societe', 'service', 'grade', 'circuit', 'responsable_direct', 'creneau_travail'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gérer la sélection temporaire multi-département
  const handleDepartementToggle = (deptId: number) => {
    setTempSelectedDepartements((prev) => {
      return prev.includes(deptId)
        ? prev.filter((id) => id !== deptId)
        : [...prev, deptId];
    });
  };

  // Valider et appliquer les choix des départements
  const handleValidateDepartements = () => {
    setFormData((prev) => ({
      ...prev,
      departements: tempSelectedDepartements,
    }));
    setShowDepartementList(false);
  };

  // Annuler et restaurer l'état précédent des départements
  const handleCancelDepartements = () => {
    setTempSelectedDepartements(formData.departements);
    setShowDepartementList(false);
  };

  // Supprimer un département directement de la vue READ-ONLY
  const handleDepartementRemove = (deptId: number) => {
    setFormData((prev) => ({
      ...prev,
      departements: prev.departements.filter((id) => id !== deptId),
    }));
  };

  // Sélectionner le responsable depuis la liste
  const handleSelectResponsable = (responsableId: number) => {
    setFormData((prev) => ({
      ...prev,
      responsable_direct: responsableId,
    }));
    setShowResponsableList(false);
    setResponsableSearch('');
  };

  // Supprimer le responsable direct
  const handleResponsableRemove = () => {
    setFormData((prev) => ({
      ...prev,
      responsable_direct: undefined,
    }));
    setResponsableSearch('');
  };

  // Supprimer le créneau de travail
  const handleCreneauRemove = () => {
    setFormData((prev) => ({
      ...prev,
      creneau_travail: undefined,
      heure_pause_debut: '',
      heure_pause_fin: '',
    }));
    setEditingPause(false);
  };

  // ✅ NOUVEAU - Ouvrir l'éditeur de pause
  const handleOpenPauseEditor = () => {
    if (selectedCreneauDetails) {
      setTempPauseDebut(formData.heure_pause_debut || selectedCreneauDetails.heure_pause_debut);
      setTempPauseFin(formData.heure_pause_fin || selectedCreneauDetails.heure_pause_fin);
    }
    setEditingPause(true);
  };

  // ✅ NOUVEAU - Confirmer les changements de pause
  const handleConfirmPause = () => {
    setFormData((prev) => ({
      ...prev,
      heure_pause_debut: tempPauseDebut,
      heure_pause_fin: tempPauseFin,
    }));
    setEditingPause(false);
  };

  // ✅ NOUVEAU - Annuler l'édition de pause
  const handleCancelPause = () => {
    setEditingPause(false);
  };

  const handleApplySuggestion = () => {
    if (autoPosteSuggestion) {
      setFormData((prev) => ({
        ...prev,
        poste: autoPosteSuggestion,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est obligatoire';
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Le matricule est obligatoire';
    }

    if (!formData.societe || formData.societe === 0) {
      newErrors.societe = 'La société est obligatoire';
    }

    if (!formData.date_embauche) {
      newErrors.date_embauche = "La date d'embauche est obligatoire";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseApiError = (errorResponse: any): string => {
    if (typeof errorResponse === 'string') {
      return errorResponse;
    }

    if (errorResponse.detail) {
      return errorResponse.detail;
    }

    if (errorResponse.message) {
      return errorResponse.message;
    }

    if (typeof errorResponse === 'object') {
      const fieldErrors = Object.entries(errorResponse)
        .map(([field, messages]: [string, any]) => {
          const fieldName = field.replace(/_/g, ' ');
          const msg = Array.isArray(messages) ? messages.join(', ') : messages;
          return `${fieldName}: ${msg}`;
        })
        .join('\n');

      if (fieldErrors) {
        return fieldErrors;
      }
    }

    return 'Une erreur inconnue s\'est produite';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    console.log('📤 Envoi du formulaire avec les données :', formData);

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err: any) {
      console.error('❌ Erreur lors de la sauvegarde :', err);

      let errorMessage = 'Erreur lors de la sauvegarde';

      if (err.response?.data) {
        errorMessage = parseApiError(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (errorMessage.includes('societe_id') || errorMessage.includes('societe')) {
        errorMessage = `⚠️ Problème avec la société : ${errorMessage}\n\nVérifiez que vous avez sélectionné une société valide.`;
      }

      if (errorMessage.includes('IntegrityError') || errorMessage.includes('NOT NULL')) {
        errorMessage = `⚠️ Un champ obligatoire est manquant. Vérifiez tous les champs marqués avec *.`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statutOptions = [
    { value: 'actif', label: 'Actif' },
    { value: 'suspendu', label: 'Suspendu' },
    { value: 'absent', label: 'Absent' },
    { value: 'conge', label: 'Congé' },
    { value: 'demission', label: 'Démission' },
    { value: 'licencie', label: 'Licencié' },
    { value: 'retraite', label: 'Retraité' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-8">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {salarie ? 'Modifier le salarié' : 'Ajouter un salarié'}
        </h2>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Erreur générale */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="text-red-700 dark:text-red-300 flex-shrink-0" size={20} />
              <p className="text-red-700 dark:text-red-300 whitespace-pre-line text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Section Identité */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Identité</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.nom
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
                placeholder="Dupont"
              />
              {validationErrors.nom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.nom}</p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.prenom
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
                placeholder="Jean"
              />
              {validationErrors.prenom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.prenom}</p>
              )}
            </div>

            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Matricule *
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  validationErrors.matricule
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
                placeholder="MAT001"
              />
              {validationErrors.matricule && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.matricule}</p>
              )}
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">Masculin</option>
                <option value="f">Féminin</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Téléphone personnel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Téléphone personnel
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        </div>

        {/* Section Organisation */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Organisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Société */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Société *
              </label>
              <select
                name="societe"
                value={formData.societe}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  validationErrors.societe
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
              >
                <option value="">-- Sélectionnez une société --</option>
                {societes.map((societe) => (
                  <option key={societe.id} value={societe.id}>
                    {societe.nom}
                  </option>
                ))}
              </select>
              {validationErrors.societe && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.societe}</p>
              )}
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Service
              </label>
              <select
                name="service"
                value={formData.service || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun service --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Grade
              </label>
              <select
                name="grade"
                value={formData.grade || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun grade --</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsable Direct */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Responsable direct
              </label>
              
              {/* Champ affichage + Bouton Afficher/Masquer */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={selectedResponsableDetails 
                      ? `${selectedResponsableDetails.matricule} - ${selectedResponsableDetails.nom} ${selectedResponsableDetails.prenom}`
                      : "Chercher par matricule, nom ou prénom..."
                    }
                    value={responsableSearch}
                    onChange={(e) => setResponsableSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowResponsableList(!showResponsableList)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  {showResponsableList ? '▼' : '▶'}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${showResponsableList ? 'rotate-180' : ''}`}
                  />
                </button>

                {selectedResponsableDetails && (
                  <button
                    type="button"
                    onClick={handleResponsableRemove}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                    title="Retirer le responsable"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Liste Déroulante - Visible seulement si showResponsableList */}
              {showResponsableList && (
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 p-3 mt-2 max-h-64 overflow-y-auto">
                  {filteredResponsables.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                      Aucun responsable trouvé
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredResponsables.map((resp) => (
                        <button
                          key={resp.id}
                          type="button"
                          onClick={() => handleSelectResponsable(resp.id)}
                          className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900 border border-slate-200 dark:border-slate-700 transition text-sm"
                        >
                          <div className="font-medium text-slate-900 dark:text-white">
                            {resp.matricule} - {resp.nom} {resp.prenom}
                          </div>
                          {(resp.service_nom || resp.grade_nom) && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {resp.grade_nom && <span>{resp.grade_nom}</span>}
                              {resp.service_nom && (
                                <span> {resp.grade_nom ? '•' : ''} {resp.service_nom}</span>
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Poste avec suggestion auto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Poste {autoPosteSuggestion && <span className="text-blue-600 dark:text-blue-400 text-xs font-normal">(suggestion)</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="poste"
                  value={formData.poste}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Développeur Senior"
                />
                {autoPosteSuggestion && (
                  <button
                    type="button"
                    onClick={handleApplySuggestion}
                    title={`Appliquer: ${autoPosteSuggestion}`}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition text-xs font-medium whitespace-nowrap"
                  >
                    ✓ Appliquer
                  </button>
                )}
              </div>
              {autoPosteSuggestion && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Suggestion: <span className="font-mono text-blue-600 dark:text-blue-400">{autoPosteSuggestion}</span>
                </p>
              )}
            </div>

            {/* Départements */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Départements (multi-sélection) - {formData.departements.length} sélectionné(s)
              </label>
              
              {/* Champ de recherche + Bouton Afficher/Masquer */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Rechercher par code (ex: 75) ou nom (ex: Paris)..."
                    value={departementSearch}
                    onChange={(e) => setDepartementSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowDepartementList(!showDepartementList)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 whitespace-nowrap font-medium"
                >
                  {showDepartementList ? '▼ Masquer' : '▶ Afficher'}
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${showDepartementList ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* Liste Déroulante - Visible seulement si showDepartementList */}
              {showDepartementList && (
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 p-4 mb-4">
                  {/* Grille de Départements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto mb-4">
                    {filteredDepartements.length === 0 ? (
                      <div className="col-span-full text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                        Aucun département trouvé
                      </div>
                    ) : (
                      filteredDepartements.map((dept) => (
                        <label
                          key={dept.id}
                          className="flex items-start gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedDepartements.includes(dept.id)}
                            onChange={() => handleDepartementToggle(dept.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {dept.numero}
                            </div>
                            <div className="font-medium text-slate-700 dark:text-slate-300 text-xs truncate">
                              {dept.nom}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {dept.chef_lieu}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  {/* Boutons Valider et Annuler */}
                  <div className="flex gap-2 border-t border-slate-300 dark:border-slate-600 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelDepartements}
                      className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition font-medium"
                    >
                      ✕ Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleValidateDepartements}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                    >
                      ✓ Valider ({tempSelectedDepartements.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Afficher les Départements Sélectionnés en READ-ONLY */}
              {selectedDepartementDetails.length > 0 && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">
                    📍 Départements Sélectionnés ({selectedDepartementDetails.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDepartementDetails.map((dept) => (
                      <div
                        key={dept.id}
                        className="relative p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-300 dark:border-blue-700 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                {dept.numero}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                {dept.nom}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                              <div>
                                <span className="font-medium">Chef-lieu:</span> {dept.chef_lieu}
                              </div>
                              <div>
                                <span className="font-medium">Région:</span> {dept.region}
                              </div>
                              <div>
                                <span className="font-medium">Circuits:</span> {dept.nombre_circuits}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDepartementRemove(dept.id)}
                            className="flex-shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                            title="Retirer ce département"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Créneau de travail */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Créneau de travail
              </label>
              <select
                name="creneau_travail"
                value={formData.creneau_travail || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun créneau --</option>
                {creneauxTravail.map((creneau) => (
                  <option key={creneau.id} value={creneau.id}>
                    {creneau.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ NOUVEAU - Affichage du créneau avec bouton Personnaliser */}
            {selectedCreneauDetails && !editingPause && (
              <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                    <Clock size={18} />
                    Créneau "{selectedCreneauDetails.nom}"
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleOpenPauseEditor}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition flex items-center gap-1"
                    >
                      <Edit2 size={14} />
                      Personnaliser pauses
                    </button>
                    <button
                      type="button"
                      onClick={handleCreneauRemove}
                      className="flex-shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Retirer ce créneau"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Affichage READ-ONLY des horaires */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded p-3 border border-purple-200 dark:border-purple-700">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Début</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {selectedCreneauDetails.heure_debut}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded p-3 border border-purple-200 dark:border-purple-700">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Fin</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {selectedCreneauDetails.heure_fin}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded p-3 border border-orange-200 dark:border-orange-700">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Pause début</div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formData.heure_pause_debut || selectedCreneauDetails.heure_pause_debut}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded p-3 border border-orange-200 dark:border-orange-700">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Pause fin</div>
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formData.heure_pause_fin || selectedCreneauDetails.heure_pause_fin}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NOUVEAU - Éditeur de pause (mode édition) */}
            {editingPause && selectedCreneauDetails && (
              <div className="md:col-span-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="text-sm font-bold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <Edit2 size={18} />
                  Personnaliser les horaires de pause
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Pause début */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Début de pause
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={tempPauseDebut}
                        onChange={(e) => setTempPauseDebut(e.target.value)}
                        className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-lg"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (défaut: {selectedCreneauDetails.heure_pause_debut})
                      </span>
                    </div>
                  </div>

                  {/* Pause fin */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Fin de pause
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={tempPauseFin}
                        onChange={(e) => setTempPauseFin(e.target.value)}
                        className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-lg"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        (défaut: {selectedCreneauDetails.heure_pause_fin})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Boutons Confirmer et Annuler */}
                <div className="flex gap-2 border-t border-orange-200 dark:border-orange-800 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelPause}
                    className="flex-1 px-4 py-2 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition font-medium"
                  >
                    ✕ Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPause}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Confirmer
                  </button>
                </div>
              </div>
            )}

            {/* Date d'embauche */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date d'embauche *
              </label>
              <input
                type="date"
                name="date_embauche"
                value={formData.date_embauche}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  validationErrors.date_embauche
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                }`}
              />
              {validationErrors.date_embauche && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.date_embauche}</p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Statut
              </label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Statut actuel : <span className="font-medium">{formData.statut}</span>
              </p>
            </div>

            {/* En poste */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="en_poste"
                  checked={formData.en_poste}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">En poste</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section Contact */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Professionnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email professionnel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email professionnel
              </label>
              <input
                type="email"
                name="mail_professionnel"
                value={formData.mail_professionnel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jean.dupont@company.com"
              />
            </div>

            {/* Téléphone professionnel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Téléphone professionnel
              </label>
              <input
                type="tel"
                name="telephone_professionnel"
                value={formData.telephone_professionnel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Extension 3CX */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Extension 3CX
              </label>
              <input
                type="text"
                name="extension_3cx"
                value={formData.extension_3cx}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
