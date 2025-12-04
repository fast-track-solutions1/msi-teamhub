'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Departement } from '@/lib/departement-api';
import { Societe } from '@/lib/societe-api';

interface DepartmentFormProps {
  departement?: Departement | null;
  societes: Societe[];
  onSave: (data: Omit<Departement, 'id' | 'date_creation' | 'circuits' | 'label_complet'> | Partial<Departement>) => Promise<void>;
  onCancel: () => void;
}

export default function DepartmentForm({ departement, societes, onSave, onCancel }: DepartmentFormProps) {
  const [formData, setFormData] = useState({
    numero: departement?.numero || '',
    nom: departement?.nom || '',
    region: departement?.region || '',
    chef_lieu: departement?.chef_lieu || '',
    societe: departement?.societe || (societes.length > 0 ? societes[0].id : 0),
    nombre_circuits: departement?.nombre_circuits || 1,
    actif: departement?.actif ?? true,
  });

  // ✅ IMPORTANT : Mettre à jour le formulaire quand departement change
  useEffect(() => {
    if (departement) {
      const nombreCircuits = departement.nombre_circuits ?? 1;
      setFormData({
        numero: departement.numero,
        nom: departement.nom,
        region: departement.region || '',
        chef_lieu: departement.chef_lieu || '',
        societe: departement.societe,
        nombre_circuits: nombreCircuits,
        actif: departement.actif,
      });
      console.log('📝 Formulaire initialisé avec:', {
        ...departement,
        nombre_circuits: nombreCircuits
      });
    }
  }, [departement]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'societe' || name === 'nombre_circuits') {
      const numValue = Number(value);
      console.log(`📝 Changement ${name}:`, numValue);
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
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
    if (!formData.numero.trim()) {
      setError('Le numéro de département est obligatoire');
      return;
    }

    if (!formData.nom.trim()) {
      setError('Le nom du département est obligatoire');
      return;
    }

    if (!formData.societe) {
      setError('La société est obligatoire');
      return;
    }

    if (formData.nombre_circuits < 1 || isNaN(formData.nombre_circuits)) {
      setError('Le nombre de circuits doit être au moins 1');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Envoi des données:', formData);
      await onSave(formData);
      console.log('✅ Sauvegarde réussie');
    } catch (err: any) {
      console.error('❌ Erreur sauvegarde:', err);
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
            {departement ? 'Modifier le département' : 'Ajouter un département'}
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
            {/* Numéro (obligatoire) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Numéro *
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                disabled={loading || !!departement}
                required
                maxLength={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="Ex: 01, 75, 2A..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {departement ? '⚠️ Le numéro ne peut pas être modifié' : '2 ou 3 caractères (01-95, 2A, 2B, 971-976)'}
              </p>
            </div>

            {/* Nom (obligatoire) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Ex: Ain, Paris, Nord..."
              />
            </div>

            {/* Région */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Région
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Ex: Île-de-France, Auvergne-Rhône-Alpes..."
              />
            </div>

            {/* Chef-lieu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chef-lieu
              </label>
              <input
                type="text"
                name="chef_lieu"
                value={formData.chef_lieu}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Ex: Bourg-en-Bresse, Paris, Lille..."
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

            {/* Nombre de circuits - CHAMP CLÉ */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre de circuits *
              </label>
              <input
                type="number"
                name="nombre_circuits"
                value={formData.nombre_circuits}
                onChange={handleChange}
                disabled={loading}
                required
                min="1"
                step="1"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="1"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Valeur actuelle: <strong>{formData.nombre_circuits}</strong>
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
                Département actif
              </label>
            </div>
          </div>

          {/* 💡 Info */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Astuce :</strong> Le numéro de département doit être unique par société.
              <br />
              Utilisez les codes officiels : 01-95 pour la métropole, 2A et 2B pour la Corse, 971-976 pour l'Outre-mer.
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
              {departement ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
