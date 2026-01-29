// lib/menu/menuConfig.ts
import {
  Home, Users, FileText, BookOpen, FolderOpen, Monitor, Lightbulb, Shield,
  Award, Building2, Building, Wrench, DollarSign, LayoutDashboard, Clock,
  CheckCircle, History, FileCheck, FileClock, UserCog, Settings, Lock,
  Mail, Database, HardDrive, TrendingUp, Clipboard
} from 'lucide-react';
import { MenuItem } from '@/types/menu.types';

export const menuConfig: MenuItem[] = [
  // ===== MENU PRINCIPAL =====
  {
    id: 'accueil',
    label: 'Accueil',
    href: '/dashboard',
    icon: Home,
    roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
  },

  // ===== ANNUAIRES =====
  {
    id: 'annuaires',
    label: 'Annuaires',
    icon: BookOpen,
    href: '#',
    roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
    submenu: [
      {
        id: 'annuaires-dashboard',
        label: 'Tableau de bord',
        href: '/annuaires',
        icon: LayoutDashboard,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'salaries',
        label: 'Salariés',
        href: '/annuaires/salaries',
        icon: Users,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'societes',
        label: 'Sociétés',
        href: '/annuaires/societes',
        icon: Building2,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'departements',
        label: 'Départements',
        href: '/annuaires/departements',
        icon: Building,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'services',
        label: 'Services',
        href: '/annuaires/services',
        icon: Wrench,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'grades',
        label: 'Grades',
        href: '/annuaires/grades',
        icon: Award,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'equipements',
        label: 'Équipements',
        href: '/annuaires/equipements',
        icon: Monitor,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'fiches-postes',
        label: 'Fiches de postes',
        href: '/annuaires/fiches-postes',
        icon: FileText,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'organigrammes',
        label: 'Organigrammes',
        href: '/annuaires/organigrammes',
        icon: TrendingUp,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
    ],
  },

  // ===== MES DEMANDES =====
  {
    id: 'demandes',
    label: 'Mes Demandes',
    icon: FileText,
    href: '#',
    roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
    submenu: [
      {
        id: 'demande-equipements',
        label: 'Équipements IT',
        href: '/demandes/equipements',
        icon: Monitor,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'demande-rh',
        label: 'Demandes RH',
        href: '/demandes/rh',
        icon: FileText,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
        submenu: [
          {
            id: 'demande-conges',
            label: 'Congés',
            href: '/demandes/conges',
            icon: Clock,
            roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
          },
          {
            id: 'demande-attestations',
            label: 'Attestations',
            href: '/demandes/attestations',
            icon: FileCheck,
            roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
          },
          {
            id: 'demande-autres',
            label: 'Autres demandes',
            href: '/demandes/autres',
            icon: Clipboard,
            roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
          },
        ],
      },
      {
        id: 'demande-evolution',
        label: 'Évolution de poste',
        href: '/demandes/evolution',
        icon: TrendingUp,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
    ],
  },

  // ===== MON COFFRE-FORT =====
  {
    id: 'coffre-fort',
    label: 'Mon Coffre-Fort',
    icon: FolderOpen,
    href: '#',
    roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
    submenu: [
      {
        id: 'cf-salaires',
        label: 'Bulletins de salaire',
        href: '/coffre-fort/salaires',
        icon: DollarSign,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'cf-contrats',
        label: 'Contrats',
        href: '/coffre-fort/contrats',
        icon: FileCheck,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'cf-attestations',
        label: 'Attestations',
        href: '/coffre-fort/attestations',
        icon: FileClock,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
      {
        id: 'cf-documents',
        label: 'Documents admin',
        href: '/coffre-fort/documents',
        icon: FileText,
        roles: ['employee', 'team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
      },
    ],
  },

  // ===== DIVIDER =====
  {
    id: 'divider-1',
    label: '',
    icon: null,
    roles: ['team_lead', 'hr_manager', 'it_manager', 'director', 'admin'],
    divider: true,
  },

  // ===== MON ÉQUIPE (Responsables) =====
  {
    id: 'team',
    label: 'Mon Équipe',
    icon: Users,
    href: '/team',
    roles: ['team_lead', 'director', 'admin'],
  },

  // ===== RH =====
  {
    id: 'rh',
    label: 'Ressources Humaines',
    icon: Users,
    href: '#',
    roles: ['hr_manager', 'admin'],
    submenu: [
      {
        id: 'rh-dashboard',
        label: 'Dashboard RH',
        href: '/rh/dashboard',
        icon: LayoutDashboard,
        roles: ['hr_manager', 'admin'],
      },
      {
        id: 'rh-demandes',
        label: 'Demandes à valider',
        href: '/rh/demandes',
        icon: CheckCircle,
        roles: ['hr_manager', 'admin'],
      },
      {
        id: 'rh-traitement',
        label: 'Traitement & Paie',
        href: '/rh/traitement',
        icon: DollarSign,
        roles: ['hr_manager', 'admin'],
      },
      {
        id: 'rh-reporting',
        label: 'Reporting',
        href: '/rh/reporting',
        icon: TrendingUp,
        roles: ['hr_manager', 'admin'],
      },
    ],
  },

  // ===== IT =====
  {
    id: 'it',
    label: 'Équipements IT',
    icon: Monitor,
    href: '#',
    roles: ['it_manager', 'admin'],
    submenu: [
      {
        id: 'it-dashboard',
        label: 'Dashboard IT',
        href: '/it/dashboard',
        icon: LayoutDashboard,
        roles: ['it_manager', 'admin'],
      },
      {
        id: 'it-inventaire',
        label: 'Inventaire',
        href: '/it/inventaire',
        icon: Database,
        roles: ['it_manager', 'admin'],
      },
      {
        id: 'it-demandes',
        label: 'Demandes à traiter',
        href: '/it/demandes',
        icon: Clipboard,
        roles: ['it_manager', 'admin'],
      },
      {
        id: 'it-maintenance',
        label: 'Maintenance',
        href: '/it/maintenance',
        icon: Wrench,
        roles: ['it_manager', 'admin'],
      },
    ],
  },

  // ===== AMÉLIORATION CONTINUE =====
  {
    id: 'innovation',
    label: 'Amélioration Continue',
    icon: Lightbulb,
    href: '#',
    roles: ['director', 'admin'],
    submenu: [
      {
        id: 'innov-dashboard',
        label: 'Dashboard',
        href: '/innovation/dashboard',
        icon: LayoutDashboard,
        roles: ['director', 'admin'],
      },
      {
        id: 'innov-propositions',
        label: 'Propositions reçues',
        href: '/innovation/propositions',
        icon: Lightbulb,
        roles: ['director', 'admin'],
      },
      {
        id: 'innov-affecter',
        label: 'Affecter aux services',
        href: '/innovation/affecter',
        icon: Users,
        roles: ['director', 'admin'],
      },
      {
        id: 'innov-projets',
        label: 'Projets en cours',
        href: '/innovation/projets',
        icon: TrendingUp,
        roles: ['director', 'admin'],
      },
      {
        id: 'innov-reporting',
        label: 'Reporting',
        href: '/innovation/reporting',
        icon: FileText,
        roles: ['director', 'admin'],
      },
    ],
  },

  // ===== DIVIDER =====
  {
    id: 'divider-2',
    label: '',
    icon: null,
    roles: ['admin'],
    divider: true,
  },

  // ===== ADMINISTRATION =====
  {
    id: 'admin',
    label: 'Administration',
    icon: Shield,
    href: '#',
    roles: ['admin'],
    submenu: [
      {
        id: 'admin-dashboard',
        label: 'Dashboard Admin',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        roles: ['admin'],
      },

      // ===== Utilisateurs & Permissions =====
      {
        id: 'admin-users',
        label: 'Utilisateurs & Permissions',
        icon: UserCog,
        href: '#',
        roles: ['admin'],
        submenu: [
          {
            id: 'admin-users-list',
            label: 'Gestion des utilisateurs',
            href: '/admin/utilisateurs',
            icon: Users,
            roles: ['admin'],
          },
          {
            id: 'admin-users-create',
            label: 'Créer utilisateur',
            href: '/admin/utilisateurs/creer',
            icon: Users,
            roles: ['admin'],
          },
          {
            id: 'admin-roles',
            label: 'Rôles & Permissions',
            href: '/admin/roles',
            icon: Shield,
            roles: ['admin'],
          },
          {
            id: 'admin-mdp',
            label: 'Réinitialiser mot de passe',
            href: '/admin/mdp',
            icon: Lock,
            roles: ['admin'],
          },
        ],
      },

      // ===== Paramètres Entreprise =====
      {
        id: 'admin-entreprise',
        label: 'Paramètres Entreprise',
        icon: Building2,
        href: '#',
        roles: ['admin'],
        submenu: [
          {
            id: 'admin-societes',
            label: 'Sociétés',
            href: '/settings/companies',
            icon: Building2,
            roles: ['admin'],
          },
          {
            id: 'admin-departements',
            label: 'Départements',
            href: '/settings/departments',
            icon: Building,
            roles: ['admin'],
          },
          {
            id: 'admin-services',
            label: 'Services',
            href: '/settings/services',
            icon: Wrench,
            roles: ['admin'],
          },
          {
            id: 'admin-grades',
            label: 'Grades',
            href: '/settings/grades',
            icon: Award,
            roles: ['admin'],
          },
        ],
      },

      // ===== Paramètres RH =====
      {
        id: 'admin-rh-params',
        label: 'Paramètres RH',
        icon: DollarSign,
        href: '#',
        roles: ['admin'],
        submenu: [
          {
            id: 'admin-salaires',
            label: 'Salaires',
            href: '/settings/salaries',
            icon: DollarSign,
            roles: ['admin'],
          },
          {
            id: 'admin-fiches',
            label: 'Fiches de postes',
            href: '/settings/fiches',
            icon: FileText,
            roles: ['admin'],
          },
        ],
      },

      // ===== Paramètres IT =====
      {
        id: 'admin-it-params',
        label: 'Paramètres IT',
        icon: Monitor,
        href: '#',
        roles: ['admin'],
        submenu: [
          {
            id: 'admin-equipements',
            label: 'Équipements',
            href: '/settings/equipment',
            icon: Monitor,
            roles: ['admin'],
          },
        ],
      },

      // ===== Configuration Système =====
      {
        id: 'admin-config',
        label: 'Configuration Système',
        icon: Settings,
        href: '#',
        roles: ['admin'],
        submenu: [
          {
            id: 'admin-securite',
            label: 'Sécurité',
            href: '/admin/config/securite',
            icon: Lock,
            roles: ['admin'],
          },
          {
            id: 'admin-email',
            label: 'Email & Notifications',
            href: '/admin/config/email',
            icon: Mail,
            roles: ['admin'],
          },
          {
            id: 'admin-backup',
            label: 'Sauvegardes',
            href: '/admin/config/sauvegardes',
            icon: HardDrive,
            roles: ['admin'],
          },
          {
            id: 'admin-logs',
            label: 'Logs & Monitoring',
            href: '/admin/config/logs',
            icon: Database,
            roles: ['admin'],
          },
        ],
      },
    ],
  },
];
