/**
 * 🌳 HierarchyTree - Arbre hiérarchique récursif optimisé
 * Affiche la structure complète avec expand/collapse
 */

'use client';

import { memo, useCallback, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import DepartmentSection from './DepartmentSection';

export interface HierarchyNode {
  id: number;
  nom: string;
  prenom: string;
  gradenom: string;
  poste: string;
  mail?: string;
  phone?: string;
  extension_3cx?: string;
  responsable_direct_nom?: string;
  matricule: string;
  statut: string;
  totalcircuits: number;
  departements: Array<{
    id: number;
    numero: string;
    nom: string;
    region: string;
    circuits_count: number;
  }>;
  children: HierarchyNode[];
}

export interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  onSelectEmployee?: (employee: HierarchyNode) => void;
  expandedByDefault?: boolean;
  maxDepthDisplay?: number;
}

/**
 * Composant Node récursif - Mémorisé pour performance
 */
interface NodeRendererProps {
  node: HierarchyNode;
  depth: number;
  isExpanded: boolean;
  onToggle: (nodeId: number) => void;
  onSelect?: (employee: HierarchyNode) => void;
  maxDepthDisplay?: number;
}

const NodeRenderer = memo(
  ({
    node,
    depth,
    isExpanded,
    onToggle,
    onSelect,
    maxDepthDisplay,
  }: NodeRendererProps) => {
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = depth === 0;
    const hasDepartments = node.departements && node.departements.length > 0;
    const shouldHideDeeper = maxDepthDisplay && depth >= maxDepthDisplay;

    const handleToggle = useCallback(() => {
      onToggle(node.id);
    }, [node.id, onToggle]);

    const handleSelect = useCallback(() => {
      onSelect?.(node);
    }, [node, onSelect]);

    return (
      <div className="mb-6">
        {/* === RACINE (Pas de connecteur parent) === */}
        {isRoot && (
          <>
            {/* Carte root */}
            <div className="mb-6">
              <EmployeeCard
                id={node.id}
                nom={node.nom}
                prenom={node.prenom}
                gradenom={node.gradenom}
                poste={node.poste}
                mail={node.mail}
                phone={node.phone}
                extension_3cx={node.extension_3cx}
                responsable_direct_nom={node.responsable_direct_nom}
                totalcircuits={node.totalcircuits}
                statut={node.statut}
                matricule={node.matricule}
                depth="root"
                hasChildren={hasChildren && !shouldHideDeeper}
                onToggleChildren={handleToggle}
                onSelect={handleSelect}
              />

              {/* Départements root */}
              {hasDepartments && (
                <div className="mt-6">
                  <DepartmentSection
                    departments={node.departements}
                    isRoot={true}
                    onSelectDepartment={() => {}}
                  />
                </div>
              )}
            </div>

            {/* Enfants root */}
            {hasChildren && isExpanded && !shouldHideDeeper && (
              <div className="mt-8 ml-8 relative">
                {/* Ligne verticale */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600"></div>

                {/* Enfants */}
                <div className="space-y-0">
                  {node.children.map((child) => (
                    <NodeRenderer
                      key={child.id}
                      node={child}
                      depth={depth + 1}
                      isExpanded={isExpanded}
                      onToggle={onToggle}
                      onSelect={onSelect}
                      maxDepthDisplay={maxDepthDisplay}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === ENFANT (Avec connecteur parent) === */}
        {!isRoot && (
          <>
            <div className="flex items-start">
              {/* Connecteur T */}
              <div className="w-8 flex justify-center relative flex-shrink-0">
                <div className="absolute top-0 w-0.5 h-4 bg-slate-300 dark:bg-slate-600"></div>
                <div className="absolute top-4 w-4 h-0.5 bg-slate-300 dark:bg-slate-600"></div>
              </div>

              {/* Contenu enfant */}
              <div className="flex-1 min-w-0">
                {/* Carte enfant */}
                <EmployeeCard
                  id={node.id}
                  nom={node.nom}
                  prenom={node.prenom}
                  gradenom={node.gradenom}
                  poste={node.poste}
                  mail={node.mail}
                  phone={node.phone}
                  extension_3cx={node.extension_3cx}
                  responsable_direct_nom={node.responsable_direct_nom}
                  totalcircuits={node.totalcircuits}
                  statut={node.statut}
                  matricule={node.matricule}
                  depth="child"
                  hasChildren={hasChildren && !shouldHideDeeper}
                  onToggleChildren={handleToggle}
                  onSelect={handleSelect}
                />

                {/* Départements enfant */}
                {hasDepartments && (
                  <div className="mt-4">
                    <DepartmentSection
                      departments={node.departements}
                      isRoot={false}
                      onSelectDepartment={() => {}}
                    />
                  </div>
                )}

                {/* Nombre de collaborateurs */}
                {hasChildren && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    👥 {node.children.length} collaborateur{node.children.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Enfants (récursion) */}
            {hasChildren && isExpanded && !shouldHideDeeper && (
              <div className="mt-4 ml-8 relative">
                {/* Ligne verticale */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-600"></div>

                {/* Enfants */}
                <div className="space-y-0">
                  {node.children.map((child) => (
                    <NodeRenderer
                      key={child.id}
                      node={child}
                      depth={depth + 1}
                      isExpanded={isExpanded}
                      onToggle={onToggle}
                      onSelect={onSelect}
                      maxDepthDisplay={maxDepthDisplay}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Message limite profondeur */}
        {shouldHideDeeper && hasChildren && (
          <div className="mt-4 ml-8 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-200">
              ⚠️ Profondeur maximale atteinte ({maxDepthDisplay} niveaux)
            </p>
          </div>
        )}
      </div>
    );
  }
);

NodeRenderer.displayName = 'NodeRenderer';

/**
 * Composant principal HierarchyTree
 */
export default function HierarchyTree({
  nodes,
  onSelectEmployee,
  expandedByDefault = true,
  maxDepthDisplay,
}: HierarchyTreeProps) {
  // État: qui est expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(() => {
    if (!expandedByDefault) return new Set();

    // Expand tous les nœuds par défaut
    const allIds = new Set<number>();
    const collectIds = (nodeList: HierarchyNode[]) => {
      nodeList.forEach((n) => {
        allIds.add(n.id);
        if (n.children?.length > 0) {
          collectIds(n.children);
        }
      });
    };
    collectIds(nodes);
    return allIds;
  });

  // Toggle un nœud
  const handleToggleNode = useCallback((nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          ❌ Aucun data disponible
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {nodes.map((node) => (
        <NodeRenderer
          key={node.id}
          node={node}
          depth={0}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={handleToggleNode}
          onSelect={onSelectEmployee}
          maxDepthDisplay={maxDepthDisplay}
        />
      ))}
    </div>
  );
}
