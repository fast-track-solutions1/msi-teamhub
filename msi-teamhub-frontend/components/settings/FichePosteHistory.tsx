'use client';

import React, { useEffect, useState } from 'react';
import { getFichePosteHistory, HistoryEntry } from '@/lib/ficheposte-history-api';
import { Clock, User, FileText } from 'lucide-react';

interface FichePosteHistoryProps {
  fichePosteId: number;
}

export default function FichePosteHistory({ fichePosteId }: FichePosteHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [fichePosteId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getFichePosteHistory(fichePosteId);
      setHistory(data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const parseChangeMessage = (message: string): string => {
    try {
      // Le message est au format "[{'changed': {'fields': ['Field1', 'Field2']}}]"
      const parsed = JSON.parse(message.replace(/'/g, '"'));
      if (parsed && parsed.length > 0 && parsed[0].changed) {
        const fields = parsed[0].changed.fields;
        return `Modification de ${fields.join(', ')}`;
      }
      return message;
    } catch {
      return message;
    }
  };

  const getActionIcon = (actionFlag: number) => {
    switch (actionFlag) {
      case 1: return '✨'; // Création
      case 2: return '✏️'; // Modification
      case 3: return '🗑️'; // Suppression
      default: return '📝';
    }
  };

  const getActionColor = (actionFlag: number) => {
    switch (actionFlag) {
      case 1: return 'bg-green-50 border-green-200 text-green-800';
      case 2: return 'bg-blue-50 border-blue-200 text-blue-800';
      case 3: return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Aucun historique disponible pour cette fiche de poste</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5 text-teal-600" />
        Historique des modifications
      </h3>

      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative pl-12">
              {/* Point sur la timeline */}
              <div className={`absolute left-2 w-4 h-4 rounded-full ${
                index === 0 ? 'bg-teal-600' : 'bg-gray-300'
              } border-2 border-white`}></div>

              {/* Carte de l'entrée */}
              <div className={`border rounded-lg p-4 ${getActionColor(entry.action_flag)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getActionIcon(entry.action_flag)}</span>
                    <span className="font-semibold">{entry.action_label}</span>
                  </div>
                  <span className="text-xs opacity-75">
                    {formatDate(entry.action_time)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm mb-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{entry.user.full_name}</span>
                  <span className="opacity-60">({entry.user.username})</span>
                </div>

                <p className="text-sm">
                  {parseChangeMessage(entry.change_message)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center pt-4">
        {history.length} {history.length === 1 ? 'entrée' : 'entrées'} au total
      </div>
    </div>
  );
}
