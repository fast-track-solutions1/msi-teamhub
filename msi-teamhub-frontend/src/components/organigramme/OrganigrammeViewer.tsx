// src/components/organigramme/OrganigrammeViewer.tsx
// ============================================================================
// COMPOSANT PRINCIPAL - Affiche l'organigramme complet
// ============================================================================

'use client';

import React from 'react';
import { useOrganigrammeData } from '@/lib/hooks/useOrganigrammeData';
import ServiceNode from './ServiceNode';
import styles from './OrganigrammeViewer.module.css';

/**
 * 📊 Composant principal pour afficher l'organigramme
 */
export default function OrganigrammeViewer() {
  const { hierarchy, stats, loading, error } = useOrganigrammeData();

  // 🔄 État de chargement
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>⏳ Chargement de l'organigramme...</p>
        </div>
      </div>
    );
  }

  // ❌ État erreur
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>❌ Erreur : {error}</p>
          <button onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // 📊 Affichage principal
  return (
    <div className={styles.container}>
      {/* En-tête avec statistiques */}
      <div className={styles.header}>
        <h1>🏢 Organigramme MSI TeamHub</h1>
        <p>Organisation complète de l'entreprise</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalSalaries}</div>
            <div className={styles.statLabel}>Salariés Total</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.salariesActifs}</div>
            <div className={styles.statLabel}>Actifs</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalServices}</div>
            <div className={styles.statLabel}>Services</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.niveauxHierarchie}</div>
            <div className={styles.statLabel}>Niveaux</div>
          </div>
        </div>
      )}

      {/* État vide */}
      {hierarchy.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Pas de services à afficher</p>
        </div>
      ) : (
        /* Arborescence des services */
        <div className={styles.tree}>
          {hierarchy.map((service) => (
            <ServiceNode key={service.id} node={service} level={0} />
          ))}
        </div>
      )}
    </div>
  );
}