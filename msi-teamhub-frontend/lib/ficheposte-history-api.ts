import { apiClient } from './api';

export interface HistoryEntry {
  id: number;
  action_time: string;
  user: {
    username: string;
    full_name: string;
  };
  action_flag: number;
  action_label: string;
  change_message: string;
}

export async function getFichePosteHistory(fichePosteId: number): Promise<HistoryEntry[]> {
  const response = await apiClient.get<HistoryEntry[]>(`/api/fiches-poste/${fichePosteId}/history/`);
  return response;
}
