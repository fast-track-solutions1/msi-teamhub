// src/components/organigramme/EmployeeCard.tsx
// ============================================================================
// COMPOSANT EMPLOYÉ - Affiche les infos d'un employé
// ============================================================================

'use client';

import React, { useState } from 'react';
import { SalarieInService } from '@/lib/types/organigramme-types';
import styles from './EmployeeCard.module.css';

interface EmployeeCardProps {
  employee: SalarieInService;
  level: number;
}

/**
 * 👤 Composant pour afficher une fiche employé
 */
export default function EmployeeCard({ employee, level }: EmployeeCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={styles.employeeCard}
      style={{ '--level': level } as React.CSSProperties}
    >
      {/* Contenu cliquable */}
      <button
        className={styles.cardHeader}
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
      >
        {/* Avatar */}
        <div className={styles.avatar}>
          {employee.photo ? (
            <img
              src={employee.photo}
              alt={`${employee.prenom} ${employee.nom}`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {employee.prenom.charAt(0)}{employee.nom.charAt(0)}
            </div>
          )}
        </div>

        {/* Info principale */}
        <div className={styles.info}>
          <h4 className={styles.name}>
            {employee.prenom} {employee.nom}
          </h4>
          <p className={styles.grade}>{employee.grade_nom || 'N/A'}</p>
          {employee.poste && (
            <p className={styles.position}>{employee.poste}</p>
          )}
        </div>

        {/* Indicateur détails */}
        <div className={styles.indicator}>
          {showDetails ? '▲' : '▼'}
        </div>
      </button>

      {/* Détails (expandable) */}
      {showDetails && (
        <div className={styles.details}>
          {/* Email */}
          {employee.mail_professionnel && (
            <div className={styles.detailRow}>
              <span className={styles.label}>📧 Email:</span>
              <a href={`mailto:${employee.mail_professionnel}`}>
                {employee.mail_professionnel}
              </a>
            </div>
          )}

          {/* Téléphone */}
          {employee.telephone_professionnel && (
            <div className={styles.detailRow}>
              <span className={styles.label}>📱 Tél:</span>
              <a href={`tel:${employee.telephone_professionnel}`}>
                {employee.telephone_professionnel}
              </a>
            </div>
          )}

          {/* Extension 3CX */}
          {employee.extension_3cx && (
            <div className={styles.detailRow}>
              <span className={styles.label}>☎️ Extension:</span>
              <span>{employee.extension_3cx}</span>
            </div>
          )}

          {/* Salaire (si disponible et connaissance de l'utilisateur) */}
          {employee.salaire && (
            <div className={styles.detailRow}>
              <span className={styles.label}>💰 Salaire:</span>
              <span>{new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(employee.salaire)}</span>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => {
                if (employee.mail_professionnel) {
                  window.location.href = `mailto:${employee.mail_professionnel}`;
                }
              }}
              disabled={!employee.mail_professionnel}
            >
              ✉️ Envoyer email
            </button>
            <button
              className={styles.actionButton}
              onClick={() => {
                if (employee.telephone_professionnel) {
                  window.location.href = `tel:${employee.telephone_professionnel}`;
                }
              }}
              disabled={!employee.telephone_professionnel}
            >
              📞 Appeler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}