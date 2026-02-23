import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    const response = await axios.get(`${API_BASE_URL}/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erreur recuperation utilisateur:', error);
    return null;
  }
};
