// lib/hooks/useOrganigrammeData.ts
// ============================================================================
// HOOK PERSONNALISÉ - Récupère et construit la hiérarchie organigramme
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { organigrammeApi } from '@/lib/api/organigramme-api';
import {
  Service,
  Salarie,
  Grade,
  ServiceNode,
  SalarieInService,
  OrganigrammeStats,
} from '@/lib/types/organigramme-types';

/**
 * 🎣 Hook pour gérer l'organigramme
 */
export function useOrganigrammeData() {
  // État
  const [services, setServices] = useState<Service[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [hierarchy, setHierarchy] = useState<ServiceNode[]>([]);
  const [stats, setStats] = useState<OrganigrammeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Chargement des données organigramme...');

        // Récupérer les 3 éléments en parallèle
        const [servicesData, salariesData, gradesData] = await Promise.all([
          organigrammeApi.getAllServices(),
          organigrammeApi.getAllSalaries(),
          organigrammeApi.getAllGrades(),
        ]);

        console.log('✅ Données reçues:', {
          services: servicesData.length,
          salaries: salariesData.length,
          grades: gradesData.length,
        });

        setServices(servicesData);
        setSalaries(salariesData);
        setGrades(gradesData);

        // Construire la hiérarchie
        const hierarchyData = buildHierarchy(
          servicesData,
          salariesData,
          gradesData
        );
        setHierarchy(hierarchyData);

        console.log('✅ Hiérarchie construite avec', hierarchyData.length, 'racines');

        // Calculer les statistiques
        const statsData = calculateStats(
          servicesData,
          salariesData,
          hierarchyData
        );
        setStats(statsData);

        console.log('✅ Statistiques calculées:', statsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);
        console.error('❌ Erreur lors du chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { services, salaries, grades, hierarchy, stats, loading, error };
}

// ============================================================================
// 🏗️ FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Construit la hiérarchie des services avec les salariés
 */
function buildHierarchy(
  services: Service[],
  salaries: Salarie[],
  grades: Grade[]
): ServiceNode[] {
  // Créer les maps pour accès rapide
  const servicesMap = new Map(services.map((s) => [s.id, s]));
  const gradesMap = new Map(grades.map((g) => [g.id, g]));

  // Grouper les salariés par service
  const salariesByService = new Map<number, SalarieInService[]>();

  salaries.forEach((salarie) => {
    if (!salarie.service) return;

    // Récupérer le grade du salarié
    const grade = gradesMap.get(salarie.grade);

    const salarieInService: SalarieInService = {
      id: salarie.id,
      nom: salarie.nom,
      prenom: salarie.prenom,
      grade_nom: grade?.nom || 'N/A',
      ordre: grade?.ordre || 999,
      email: salarie.email,
      mail_professionnel: salarie.mail_professionnel,
      telephone_professionnel: salarie.telephone_professionnel,
      photo: salarie.photo,
      poste: salarie.poste,
      extension_3cx: salarie.extension_3cx,
      salaire: salarie.salaire,
    };

    if (!salariesByService.has(salarie.service)) {
      salariesByService.set(salarie.service, []);
    }
    salariesByService.get(salarie.service)!.push(salarieInService);
  });

  // Trier les salariés de chaque service par ordre de grade
  salariesByService.forEach((employees) => {
    employees.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  });

  /**
   * Fonction récursive pour construire un nœud
   */
  const buildNode = (serviceId: number): ServiceNode | null => {
    const service = servicesMap.get(serviceId);
    if (!service) return null;

    // Trouver les services enfants
    const childServices = services.filter(
      (s) => s.parent_service === serviceId || s.parentservice === serviceId
    );

    // Construire les enfants récursivement
    const children = childServices
      .map((child) => buildNode(child.id))
      .filter((node): node is ServiceNode => node !== null);

    // Récupérer les salariés du service
    const serviceEmployees = salariesByService.get(serviceId) || [];

    return {
      id: serviceId,
      nom: service.nom,
      children,
      salaries: serviceEmployees,
    };
  };

  // Trouver les services racines (sans parent)
  const rootServices = services.filter(
    (s) => !s.parent_service && !s.parentservice
  );

  console.log('🌱 Services racines:', rootServices.map((s) => s.nom));

  // Construire la hiérarchie
  const hierarchy = rootServices
    .map((root) => buildNode(root.id))
    .filter((node): node is ServiceNode => node !== null);

  return hierarchy;
}

/**
 * Calcule les statistiques de l'organigramme
 */
function calculateStats(
  services: Service[],
  salaries: Salarie[],
  hierarchy: ServiceNode[]
): OrganigrammeStats {
  // Compter la profondeur
  const getMaxDepth = (node: ServiceNode): number => {
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getMaxDepth));
  };

  const niveauxHierarchie =
    hierarchy.length > 0 ? Math.max(...hierarchy.map(getMaxDepth)) : 1;

  // Compter par service et grade
  const salariesParService: Record<number, number> = {};
  const salariesParGrade: Record<number, number> = {};

  salaries.forEach((s) => {
    if (s.service) {
      salariesParService[s.service] = (salariesParService[s.service] || 0) + 1;
    }
    if (s.grade) {
      salariesParGrade[s.grade] = (salariesParGrade[s.grade] || 0) + 1;
    }
  });

  return {
    totalServices: services.length,
    totalSalaries: salaries.length,
    salariesActifs: salaries.filter((s) => s.en_poste === true).length,
    salariesInactifs: salaries.filter((s) => s.en_poste !== true).length,
    niveauxHierarchie,
    salariesParService,
    salariesParGrade,
  };
}

/**
 * Aplatit la hiérarchie en une liste simple de nœuds
 */
export function flattenHierarchy(nodes: ServiceNode[]): ServiceNode[] {
  const flattened: ServiceNode[] = [];

  const traverse = (node: ServiceNode) => {
    flattened.push(node);
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return flattened;
}

/**
 * Compte le nombre total d'employés dans la hiérarchie
 */
export function countTotalEmployees(nodes: ServiceNode[]): number {
  let total = 0;

  const traverse = (node: ServiceNode) => {
    total += node.salaries.length;
    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);
  return total;
}