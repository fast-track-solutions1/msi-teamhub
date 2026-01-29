// src/components/organigramme/ServiceNode.tsx
// ============================================================================
// COMPOSANT RÉCURSIF - Affiche un service + ses enfants + employés
// ============================================================================

'use client';

import React, { useState } from 'react';
import { ServiceNode as ServiceNodeType } from '@/lib/types/organigramme-types';
import EmployeeCard from './EmployeeCard';
import styles from './ServiceNode.module.css';

interface ServiceNodeProps {
  node: ServiceNodeType;
  level: number; // Profondeur dans l'arborescence (0 = racine)
}

/**
 * 🌳 Composant récursif pour afficher un service et ses enfants
 */
export default function ServiceNode({ node, level }: ServiceNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.serviceNodeContainer} style={{ '--level': level } as React.CSSProperties}>
      {/* En-tête du service */}
      <div className={styles.serviceHeader}>
        {/* Bouton expand/collapse */}
        {hasChildren && (
          <button
            className={styles.expandButton}
            onClick={toggleExpand}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Replier' : 'Déplier'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <div className={styles.expandPlaceholder}></div>}

        {/* Titre du service */}
        <div className={styles.serviceInfo}>
          <h3 className={styles.serviceName}>
            🏢 {node.nom}
          </h3>
          <span className={styles.employeeCount}>
            {node.salaries.length} employé{node.salaries.length > 1 ? 's' : ''}
          </span>
          {hasChildren && (
            <span className={styles.childrenCount}>
              {node.children.length} service{node.children.length > 1 ? 's' : ''} enfant{node.children.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Contenu du service (expandable) */}
      {isExpanded && (
        <div className={styles.serviceContent}>
          {/* Employés du service */}
          {node.salaries.length > 0 && (
            <div className={styles.employeesSection}>
              <h4 className={styles.sectionTitle}>👥 Équipe ({node.salaries.length})</h4>
              <div className={styles.employeesList}>
                {node.salaries.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    level={level}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Services enfants */}
          {hasChildren && (
            <div className={styles.childrenSection}>
              <h4 className={styles.sectionTitle}>
                📂 Services enfants ({node.children.length})
              </h4>
              <div className={styles.childrenList}>
                {node.children.map((child) => (
                  <ServiceNode
                    key={child.id}
                    node={child}
                    level={level + 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}