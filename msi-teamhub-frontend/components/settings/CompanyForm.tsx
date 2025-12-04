'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Societe } from '@/lib/societe-api';

interface CompanyFormProps {
  societe?: Societe | null;
  onSave: (data: Omit<Societe, 'id' | 'date_creation'> | Partial<Societe>) => Promise<void>;
  onCancel: () => void;
}

export default function CompanyForm({ societe, onSave, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    nom: societe?.nom || '',
    email: societe?.email || '',
    telephone: societe?.telephone || '',
    adresse: societe?.adresse || '',
    ville: societe?.ville || '',
    code_postal: societe?.code_postal || '',
    activite: societe?.activite || '',
    clients: societe?.clients || '',
    actif: societe?.actif ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
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
            {societe ? 'Modifier la société' : 'Ajouter une société'}
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

          {/* 🎯 Grille de champs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom (obligatoire) */}
            <div className="md:col-span-2">
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
                placeholder="Ex: ACME Corp"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="contact@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Adresse
              </label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                disabled={loading}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors resize-none"
                placeholder="123 Rue de la Paix"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Paris"
              />
            </div>

            {/* Code postal */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Code postal
              </label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="75001"
              />
            </div>

            {/* Activité */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Activité
              </label>
              <input
                type="text"
                name="activite"
                value={formData.activite}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors"
                placeholder="Ex: Logiciels"
              />
            </div>

            {/* Clients */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Clients
              </label>
              <textarea
                name="clients"
                value={formData.clients}
                onChange={handleChange}
                disabled={loading}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-colors resize-none"
                placeholder="Client A, Client B, Client C..."
              />
            </div>

            {/* Actif */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="actif"
                name="actif"
                checked={formData.actif}
                onChange={handleChange}
                disabled={loading}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="actif" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Actif
              </label>
            </div>
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {societe ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
