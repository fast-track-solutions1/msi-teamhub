// lib/auth/usePermissions.ts
'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/menu.types';

/**
 * Hook pour gérer l'utilisateur connecté et ses permissions
 * Utilise l'API Django /api/me/
 */
export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Récupère le token depuis le localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log('❌ Pas de token trouvé');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('🔍 Chargement utilisateur depuis API...');

        // Appelle ton endpoint Django
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const url = apiUrl.includes('/api') ? `${apiUrl}/me/` : `${apiUrl}/api/me/`;
        const response = await fetch(url, {

          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Utilisateur chargé:', userData);
          
          setUser({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            photo: userData.photo,
            role: userData.role || 'employee',
            permissions: userData.permissions || [],
            service: userData.service,
            department: userData.department,
          });
        } else {
          console.error('❌ Erreur API:', response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateur:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return user;
};

/**
 * Hook pour vérifier les permissions et rôles
 */
export const usePermissions = () => {
  const user = useUser();

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.every(role => user.role === role);
  };

  return {
    user,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
  };
};
