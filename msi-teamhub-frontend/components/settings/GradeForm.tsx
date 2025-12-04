'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Grade } from '@/lib/grade-api';
import { Societe } from '@/lib/societe-api';

interface GradeFormProps {
  grade?: Grade | null;
  societes: Societe[];
  onSave: (data: Omit<Grade, 'id' | 'date_creation' | 'societe_nom'> | Partial<Grade>) => Promise<void>;
  onCancel: () => void;
}

export default function GradeForm({ grade, societes, onSave, onCancel }: GradeFormProps) {
  const [formData, setFormData] = useState({
    nom: grade?.nom || '',
    societe: grade?.societe || (societes.length > 0 ? societes[0].id : 0),
    ordre: grade?.ordre || 0,
    actif: grade?.actif ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'societe' || name === 'ordre') {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Validation
    if (!formData.nom.trim()) {
      setError('Le nom est obligatoire');
      return;
    }

    if (!formData.societe) {
      setError('La société est obligatoire');
      return;
    }

    if (formData.ordre < 0) {
      setError("L'ordre ne peut pas être négatif");
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 🎯 En-tête */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {grade ? 'Modifier le grade' : 'Ajouter un grade'}
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* 📝 Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ❌ Erreur */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-red-900 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          {/* 🎯 Champs du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom (obligatoire) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom du grade *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Ex: Directeur, Manager, Assistant..."
              />
            </div>

            {/* Société (obligatoire) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Société *
              </label>
              <select
                name="societe"
                value={formData.societe}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors cursor-pointer"
              >
                <option value="">-- Sélectionnez une société --</option>
                {societes.map((societe) => (
                  <option key={societe.id} value={societe.id}>
                    {societe.nom}
                  </option>
                ))}
              </select>
              {societes.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                  ⚠️ Aucune société disponible. Créez-en une d'abord.
                </p>
              )}
            </div>

            {/* Ordre hiérarchique */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ordre hiérarchique
              </label>
              <input
                type="number"
                name="ordre"
                value={formData.ordre}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Plus le chiffre est bas, plus le grade est élevé (0 = le plus haut)
              </p>
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3 pt-7">
              <input
                type="checkbox"
                id="actif"
                name="actif"
                checked={formData.actif}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Grade actif
              </label>
            </div>
          </div>

          {/* 💡 Info hiérarchie */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Astuce :</strong> L'ordre hiérarchique permet d'organiser vos grades du plus élevé au plus bas.
              <br />
              Exemple : Directeur (0), Manager (1), Assistant (2)
            </p>
          </div>

          {/* 🎯 Boutons d'action */}
          <div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading || societes.length === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {grade ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
