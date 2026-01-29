'use client';

import React, { useState, useEffect } from 'react';
import { FichePoste, updateFichePoste, createFichePoste } from '@/lib/ficheposte-api';

interface Service {
  id: number;
  nom: string;
}

interface Grade {
  id: number;
  nom: string;
}

interface Salarie {
  id: number;
  prenom: string;
  nom: string;
}

interface FichePosteFormProps {
  fiche: FichePoste | null;
  services: Service[];
  grades: Grade[];
  salaries: Salarie[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FichePosteForm({
  fiche,
  services,
  grades,
  salaries,
  isOpen,
  onClose,
  onSuccess,
}: FichePosteFormProps) {
  const [formData, setFormData] = useState<Partial<FichePoste>>({
    titre: '',
    service: undefined,
    grade: undefined,
    responsable_service: null,
    description: '',
    taches: '',
    competences_requises: '',
    moyens_correction: '',
    problemes: '',
    propositions: '',
    defauts: '',
    statut: 'actif',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ CHARGER LA FICHE (SI MODIFICATION)
  useEffect(() => {
    if (fiche) {
      setFormData({
        ...fiche,
        responsable_service: fiche.responsable_service ? Number(fiche.responsable_service) : null,
      });
    } else {
      setFormData({
        titre: '',
        service: undefined,
        grade: undefined,
        responsable_service: null,
        description: '',
        taches: '',
        competences_requises: '',
        moyens_correction: '',
        problemes: '',
        propositions: '',
        defauts: '',
        statut: 'actif',
      });
    }
    setErrors({});
  }, [fiche, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre?.trim()) {
      newErrors.titre = 'Le titre est requis';
    }
    if (!formData.service) {
      newErrors.service = 'Le service est requis';
    }
    if (!formData.grade) {
      newErrors.grade = 'Le grade est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (fiche?.id) {
        await updateFichePoste(fiche.id, formData);
      } else {
        await createFichePoste(formData as Omit<FichePoste, 'id'>);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      setErrors({
        submit: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {fiche ? 'Modifier la Fiche de Poste' : 'Nouvelle Fiche de Poste'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erreur générale */}
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.titre || ''}
              onChange={(e) => handleChange('titre', e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.titre
                  ? 'border-red-500'
                  : 'border-slate-300 dark:border-slate-600'
              } dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              placeholder="Titre de la fiche de poste"
            />
            {errors.titre && (
              <p className="text-red-500 text-sm mt-1">{errors.titre}</p>
            )}
          </div>

          {/* Service & Grade */}
          <div className="grid grid-cols-2 gap-4">
            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Service *
              </label>
              <select
                value={formData.service || ''}
                onChange={(e) =>
                  handleChange('service', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.service
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                } dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              >
                <option value="">Choisir un service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nom}
                  </option>
                ))}
              </select>
              {errors.service && (
                <p className="text-red-500 text-sm mt-1">{errors.service}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Grade *
              </label>
              <select
                value={formData.grade || ''}
                onChange={(e) =>
                  handleChange('grade', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.grade
                    ? 'border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                } dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              >
                <option value="">Choisir un grade</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.nom}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
              )}
            </div>
          </div>

          {/* Responsable Service & Statut */}
          <div className="grid grid-cols-2 gap-4">
            {/* Responsable Service */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Responsable Service
              </label>
              <select
                value={formData.responsable_service || ''}
                onChange={(e) =>
                  handleChange(
                    'responsable_service',
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Aucun</option>
                {salaries.map((salarie) => (
                  <option key={salarie.id} value={salarie.id}>
                    {salarie.prenom} {salarie.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Statut
              </label>
              <select
                value={formData.statut || 'actif'}
                onChange={(e) => handleChange('statut', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="actif">Actif</option>
                <option value="en_revision">En révision</option>
                <option value="archivé">Archivé</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Description générale du poste"
            />
          </div>

          {/* Tâches */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Tâches principales
            </label>
            <textarea
              value={formData.taches || ''}
              onChange={(e) => handleChange('taches', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Énumérez les principales tâches"
            />
          </div>

          {/* Compétences */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Compétences requises
            </label>
            <textarea
              value={formData.competences_requises || ''}
              onChange={(e) => handleChange('competences_requises', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Compétences techniques et transversales requises"
            />
          </div>

          {/* Moyens de correction */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Moyens de correction
            </label>
            <textarea
              value={formData.moyens_correction || ''}
              onChange={(e) => handleChange('moyens_correction', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Ressources et outils disponibles"
            />
          </div>

          {/* Problèmes */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Problèmes identifiés
            </label>
            <textarea
              value={formData.problemes || ''}
              onChange={(e) => handleChange('problemes', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Problèmes ou dysfonctionnements"
            />
          </div>

          {/* Propositions */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Propositions d'amélioration
            </label>
            <textarea
              value={formData.propositions || ''}
              onChange={(e) => handleChange('propositions', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Suggestions d'amélioration"
            />
          </div>

          {/* Défauts */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Défauts constatés
            </label>
            <textarea
              value={formData.defauts || ''}
              onChange={(e) => handleChange('defauts', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Défauts ou lacunes constatés"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-400 transition-colors"
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


