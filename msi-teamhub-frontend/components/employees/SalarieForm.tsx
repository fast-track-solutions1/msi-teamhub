'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Search, ChevronDown, Clock, Edit2, Check, Upload } from 'lucide-react';
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
  const [autoPosteSuggestion, setAutoPosteSuggestion] = useState('');
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

  // États pour mode édition des pauses
  const [editingPause, setEditingPause] = useState(false);
  const [tempPauseDebut, setTempPauseDebut] = useState('');
  const [tempPauseFin, setTempPauseFin] = useState('');

  // ✅ NOUVEAU - États pour la photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    salarie?.photo || null
  );

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
}, [responsableSearch]); // ✅ Enlève salariesForResponsable


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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  // Ouvrir l'éditeur de pause
  const handleOpenPauseEditor = () => {
    if (selectedCreneauDetails) {
      setTempPauseDebut(formData.heure_pause_debut || selectedCreneauDetails.heure_pause_debut);
      setTempPauseFin(formData.heure_pause_fin || selectedCreneauDetails.heure_pause_fin);
    }
    setEditingPause(true);
  };

  // Confirmer les changements de pause
  const handleConfirmPause = () => {
    setFormData((prev) => ({
      ...prev,
      heure_pause_debut: tempPauseDebut,
      heure_pause_fin: tempPauseFin,
    }));
    setEditingPause(false);
  };

  // Annuler l'édition de pause
  const handleCancelPause = () => {
    setEditingPause(false);
  };

  // ✅ NOUVEAU - Générer initiales pour avatar
  const getInitials = () => {
    const nom = formData.nom.trim();
    const prenom = formData.prenom.trim();
    if (!nom && !prenom) return '?';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  // ✅ NOUVEAU - Gestion upload photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }

      setPhotoFile(file);
      
      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Supprimer photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
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
      
      // Si photo, créer FormData
      if (photoFile) {
        const formDataWithFile = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) => formDataWithFile.append(key, item.toString()));
            } else {
              formDataWithFile.append(key, value.toString());
            }
          }
        });
        formDataWithFile.append('photo', photoFile);
        
        // @ts-ignore
        await onSave(formDataWithFile);
      } else {
        await onSave(formData);
      }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-2xl font-bold text-white">
            {salarie ? 'Modifier le salarié' : 'Ajouter un salarié'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Erreur générale */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* ✅ NOUVEAU - Section Photo */}
          <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              📸 Photo de profil
            </label>
            
            <div className="flex items-center gap-6">
              {/* Avatar ou Photo */}
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Photo"
                    className="h-24 w-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials()}
                  </div>
                )}
                
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Upload */}
              <div className="flex-1">
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors border border-blue-200 dark:border-blue-800 font-medium"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {photoPreview ? 'Changer la photo' : 'Télécharger une photo'}
                  </span>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  JPG, PNG ou GIF. Max 5MB. Recommandé: 400x400px
                </p>
              </div>
            </div>
          </div>

          {/* Section Identité */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              👤 Identité
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                {validationErrors.nom && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.nom}
                  </p>
                )}
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                {validationErrors.prenom && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.prenom}
                  </p>
                )}
              </div>

              {/* Matricule */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Matricule *
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                {validationErrors.matricule && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.matricule}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="m">Masculin</option>
                  <option value="f">Féminin</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Téléphone personnel */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Téléphone personnel
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="06 XX XX XX XX"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section Organisation */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              🏢 Organisation
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Société */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Société *
                </label>
                <select
                  name="societe"
                  value={formData.societe}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">-- Sélectionnez une société --</option>
                  {societes.map((societe) => (
                    <option key={societe.id} value={societe.id}>
                      {societe.nom}
                    </option>
                  ))}
                </select>
                {validationErrors.societe && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.societe}
                  </p>
                )}
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Service
                </label>
                <select
                  name="service"
                  value={formData.service || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Aucun grade --</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsable Direct - Section complète */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Responsable direct
                </label>

                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par matricule, nom, prénom..."
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
                    <ChevronDown className={`h-4 w-4 transition-transform ${showResponsableList ? 'rotate-180' : ''}`} />
                    {showResponsableList ? 'Masquer' : 'Afficher'}
                  </button>
                </div>

                {selectedResponsableDetails && (
                  <div className="mb-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {selectedResponsableDetails.matricule} - {selectedResponsableDetails.nom} {selectedResponsableDetails.prenom}
                      </div>
                      {(selectedResponsableDetails.service_nom || selectedResponsableDetails.grade_nom) && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {selectedResponsableDetails.grade_nom && <span>{selectedResponsableDetails.grade_nom}</span>}
                          {selectedResponsableDetails.service_nom && (
                            <span>{selectedResponsableDetails.grade_nom ? ' • ' : ''}{selectedResponsableDetails.service_nom}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleResponsableRemove}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {showResponsableList && (
                  <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 space-y-1">
                    {filteredResponsables.length === 0 ? (
                      <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
                        Aucun responsable trouvé
                      </p>
                    ) : (
                      filteredResponsables.map((resp) => (
                        <button
                          key={resp.id}
                          type="button"
                          onClick={() => handleSelectResponsable(resp.id)}
                          className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900 border border-slate-200 dark:border-slate-700 transition text-sm"
                        >
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {resp.matricule} - {resp.nom} {resp.prenom}
                          </div>
                          {(resp.service_nom || resp.grade_nom) && (
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                              {resp.grade_nom && <span className="text-blue-600 dark:text-blue-400">{resp.grade_nom}</span>}
                              {resp.service_nom && (
                                <span className="text-slate-500">
                                  {resp.grade_nom ? ' • ' : ''}{resp.service_nom}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Poste avec suggestion */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Poste {autoPosteSuggestion && <span className="text-xs text-blue-600 dark:text-blue-400">(suggestion)</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {autoPosteSuggestion && (
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                      <Check className="h-4 w-4" />
                      Appliquer
                    </button>
                  )}
                </div>
                {autoPosteSuggestion && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Suggestion: {autoPosteSuggestion}
                  </p>
                )}
              </div>

              {/* Départements - Section complète */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Départements (multi-sélection) - {formData.departements.length} sélectionné(s)
                </label>

                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un département..."
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
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDepartementList ? 'rotate-180' : ''}`} />
                    {showDepartementList ? 'Masquer' : 'Afficher'}
                  </button>
                </div>

                {showDepartementList && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {filteredDepartements.length === 0 ? (
                        <p className="col-span-2 text-center text-sm text-slate-500 dark:text-slate-400 py-4">
                          Aucun département trouvé
                        </p>
                      ) : (
                        filteredDepartements.map((dept) => (
                          <label
                            key={dept.id}
                            className="flex items-start gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition bg-white dark:bg-slate-800"
                          >
                            <input
                              type="checkbox"
                              checked={tempSelectedDepartements.includes(dept.id)}
                              onChange={() => handleDepartementToggle(dept.id)}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-bold text-slate-900 dark:text-white">{dept.numero}</div>
                              <div className="font-semibold text-slate-700 dark:text-slate-300">{dept.nom}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{dept.chef_lieu}</div>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleCancelDepartements}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition font-medium"
                      >
                        <X className="inline h-4 w-4 mr-1" />
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleValidateDepartements}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                      >
                        <Check className="inline h-4 w-4 mr-1" />
                        Valider ({tempSelectedDepartements.length})
                      </button>
                    </div>
                  </div>
                )}

                {selectedDepartementDetails.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      📍 Départements Sélectionnés ({selectedDepartementDetails.length})
                    </div>
                    {selectedDepartementDetails.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{dept.numero}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{dept.nom}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Chef-lieu: {dept.chef_lieu}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Région: {dept.region}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Circuits: {dept.nombre_circuits}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDepartementRemove(dept.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition p-1"
                          title="Retirer ce département"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Créneau de travail */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Créneau de travail
                </label>
                <select
                  name="creneau_travail"
                  value={formData.creneau_travail || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Aucun créneau --</option>
                  {creneauxTravail.map((creneau) => (
                    <option key={creneau.id} value={creneau.id}>
                      {creneau.nom}
                    </option>
                  ))}
                </select>

                {selectedCreneauDetails && !editingPause && (
                  <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          Créneau "{selectedCreneauDetails.nom}"
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenPauseEditor}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition text-sm font-medium flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Personnaliser pauses
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Début</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedCreneauDetails.heure_debut}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Fin</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedCreneauDetails.heure_fin}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pause début</div>
                        <div className="font-semibold text-orange-600 dark:text-orange-400">
                          {formData.heure_pause_debut || selectedCreneauDetails.heure_pause_debut}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Pause fin</div>
                        <div className="font-semibold text-orange-600 dark:text-orange-400">
                          {formData.heure_pause_fin || selectedCreneauDetails.heure_pause_fin}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingPause && selectedCreneauDetails && (
                  <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-bold text-slate-900 dark:text-white">
                        Personnaliser les horaires de pause
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Début de pause
                        </label>
                        <input
                          type="time"
                          value={tempPauseDebut}
                          onChange={(e) => setTempPauseDebut(e.target.value)}
                          className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-lg"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          (défaut: {selectedCreneauDetails.heure_pause_debut})
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Fin de pause
                        </label>
                        <input
                          type="time"
                          value={tempPauseFin}
                          onChange={(e) => setTempPauseFin(e.target.value)}
                          className="flex-1 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-lg"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          (défaut: {selectedCreneauDetails.heure_pause_fin})
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        onClick={handleCancelPause}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition font-medium"
                      >
                        <X className="inline h-4 w-4 mr-1" />
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPause}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                      >
                        <Check className="inline h-4 w-4 mr-1" />
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date d'embauche *
                </label>
                <input
                  type="date"
                  name="date_embauche"
                  value={formData.date_embauche}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                {validationErrors.date_embauche && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.date_embauche}
                  </p>
                )}
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Statut
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {statutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Statut actuel : {formData.statut}
                </p>
              </div>

              {/* En poste */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="en_poste"
                  checked={formData.en_poste}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  En poste
                </label>
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              📞 Contact Professionnel
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email professionnel */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email professionnel
                </label>
                <input
                  type="email"
                  name="mail_professionnel"
                  value={formData.mail_professionnel}
                  onChange={handleChange}
                  placeholder="prenom.nom@entreprise.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Téléphone professionnel */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Téléphone professionnel
                </label>
                <input
                  type="tel"
                  name="telephone_professionnel"
                  value={formData.telephone_professionnel}
                  onChange={handleChange}
                  placeholder="01 XX XX XX XX"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Extension 3CX */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Extension 3CX
                </label>
                <input
                  type="text"
                  name="extension_3cx"
                  value={formData.extension_3cx}
                  onChange={handleChange}
                  placeholder="XXX"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
