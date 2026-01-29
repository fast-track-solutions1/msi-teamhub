/**
 * 🏢 Logique de création de la pyramide hiérarchique
 */

import { Service, Salarie } from './organigramme-types';
import { getRankByGrade } from './organigramme-utils';

export interface PyramidNode {
  id: number;
  nom: string;
  level: number;
  children: PyramidNode[];
  salaries: Salarie[];
}

/**
 * 🏗️ Construit la pyramide hiérarchique des services
 */
export const buildServicePyramid = (
  servicesInput: Service[] | Record<number, Service>,
  parentId: number | null = null
): PyramidNode[] => {
  const services = Array.isArray(servicesInput)
    ? servicesInput
    : Object.values(servicesInput);

  return services
    .filter((s) => s.parentservice === parentId)
    .map((service) => ({
      id: service.id,
      nom: service.nom,
      level: 0,
      children: buildServicePyramid(services, service.id),
      salaries: [],
    }));
};


  return services
    .filter((s) => s.parentservice === parentId)
    .map((service) => ({
      id: service.id,
      nom: service.nom,
      level: 0,
      children: buildServicePyramid(services, service.id),
      salaries: [],
    }));
};

/**
 * 🏗️ Construit la structure pyramidale à partir d'un service root
 */
export const buildPyramidalStructure = (
  rootService: Service,
  salaries: Salarie[],
  serviceMap: Record<number, Service>,
  allServices?: Service[]
): PyramidNode => {
  const services = allServices || Object.values(serviceMap);

  // Créer le nœud root avec ses enfants
  const root: PyramidNode = {
    id: rootService.id,
    nom: rootService.nom,
    level: 0,
    children: buildServicePyramid(services, rootService.id),
    salaries: [],
  };

  // Assigner les salariés
  return assignSalariesToNode(root, salaries);
};

/**
 * 👥 Assigne les salariés à un nœud et ses enfants
 */
const assignSalariesToNode = (node: PyramidNode, salaries: Salarie[]): PyramidNode => {
  const nodeSalaries = salaries.filter((s) => s.service === node.id);

  return {
    ...node,
    salaries: nodeSalaries.sort((a, b) => getRankByGrade(a) - getRankByGrade(b)),
    children: node.children.map((child) => assignSalariesToNode(child, salaries)),
  };
};

/**
 * 👥 Assigne les salariés aux services dans la pyramide
 */
export const assignSalariesToPyramid = (
  nodes: PyramidNode[],
  salaries: Salarie[],
  serviceMap: Record<number, Service>
): PyramidNode[] => {
  return nodes.map((node) => {
    // Trouve tous les salariés du service
    const nodeSalaries = salaries.filter((s) => s.service === node.id);

    return {
      ...node,
      salaries: nodeSalaries.sort((a, b) => getRankByGrade(a) - getRankByGrade(b)),
      children: assignSalariesToPyramid(node.children, salaries, serviceMap),
    };
  });
};

/**
 * 📊 Calcule les statistiques de la pyramide
 */
export const calculateStatistics = (nodes: PyramidNode[]) => {
  let totalServices = 0;
  let totalSalaries = 0;
  let maxDepth = 0;

  const traverse = (node: PyramidNode, depth: number) => {
    totalServices++;
    totalSalaries += node.salaries.length;
    maxDepth = Math.max(maxDepth, depth);

    node.children.forEach((child) => traverse(child, depth + 1));
  };

  nodes.forEach((node) => traverse(node, 1));

  return {
    totalServices,
    totalSalaries,
    maxDepth,
  };
};

/**
 * 📊 Calcule les statistiques pour un seul nœud
 */
export const calculateNodeStatistics = (node: PyramidNode) => {
  let totalServices = 0;
  let totalSalaries = 0;
  let maxDepth = 0;

  const traverse = (n: PyramidNode, depth: number) => {
    totalServices++;
    totalSalaries += n.salaries.length;
    maxDepth = Math.max(maxDepth, depth);
    n.children.forEach((child) => traverse(child, depth + 1));
  };

  traverse(node, 1);

  return {
    totalServices,
    totalSalaries,
    maxDepth,
  };
};

/**
 * 🔍 Recherche un service dans la pyramide
 */
export const findServiceInPyramid = (
  nodes: PyramidNode[],
  serviceId: number
): PyramidNode | null => {
  for (const node of nodes) {
    if (node.id === serviceId) {
      return node;
    }

    const found = findServiceInPyramid(node.children, serviceId);
    if (found) return found;
  }

  return null;
};

/**
 * 📈 Aplattit la pyramide en liste
 */
export const flattenPyramid = (nodes: PyramidNode[]): PyramidNode[] => {
  const result: PyramidNode[] = [];

  const traverse = (node: PyramidNode) => {
    result.push(node);
    node.children.forEach((child) => traverse(child));
  };

  nodes.forEach((node) => traverse(node));
  return result;
};

/**
 * 🎯 Obtient le chemin d'un service (pour breadcrumb)
 */
export const getServicePath = (
  nodes: PyramidNode[],
  serviceId: number,
  path: PyramidNode[] = []
): PyramidNode[] => {
  for (const node of nodes) {
    if (node.id === serviceId) {
      return [...path, node];
    }

    const found = getServicePath(node.children, serviceId, [...path, node]);
    if (found.length > path.length) return found;
  }

  return path;
};

/**
 * 📊 Compte les niveaux de profondeur
 */
export const getMaxDepth = (nodes: PyramidNode[]): number => {
  if (nodes.length === 0) return 0;

  let maxDepth = 1;

  const traverse = (node: PyramidNode, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    node.children.forEach((child) => traverse(child, depth + 1));
  };

  nodes.forEach((node) => traverse(node, 1));

  return maxDepth;
};

/**
 * 🎨 Calcule la largeur de la pyramide
 */
export const getWidthPerLevel = (nodes: PyramidNode[]): Record<number, number> => {
  const widths: Record<number, number> = {};

  const traverse = (node: PyramidNode, depth: number) => {
    if (!widths[depth]) widths[depth] = 0;
    widths[depth]++;

    node.children.forEach((child) => traverse(child, depth + 1));
  };

  nodes.forEach((node) => traverse(node, 1));

  return widths;
};