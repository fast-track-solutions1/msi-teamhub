'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Award,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Cake,
  Edit2,
  Share2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Pause,
  LogOut,
  LogIn,
} from 'lucide-react';
import { getSalarie, Salarie } from '@/lib/salarie-api';
import { getSocietes, Societe } from '@/lib/societe-api';
import { getServices, Service } from '@/lib/service-api';
import { getGrades, Grade } from '@/lib/grade-api';
import { getDepartements } from '@/lib/departement-api';

interface Departement {
  id: number;
  numero: string;
  nom: string;
  region: string;
  chef_lieu: string;
}

export default function SalarieDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [salarie, setSalarie] = useState<Salarie | null>(null);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [salarieData, societesData, servicesData, gradesData, departementsData] = await Promise.all([
          getSalarie(id),
          getSocietes(),
          getServices(),
          getGrades(),
          getDepartements(),
        ]);

        setSalarie(salarieData);
        setSocietes(societesData);
        setServices(servicesData);
        setGrades(gradesData);
        setDepartements(departementsData);
      } catch (err: any) {
        console.error('Erreur:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !salarie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error || 'Salarié non trouvé'}</p>
          </div>
        </div>
      </div>
    );
  }

  const getSocieteName = (id: number) => societes.find((s) => s.id === id)?.nom || 'N/A';
  const getServiceName = (id: number | null) => services.find((s) => s.id === id)?.nom || 'N/A';
  const getGradeName = (id: number | null) => grades.find((g) => g.id === id)?.nom || 'N/A';

  const getInitials = (nom: string, prenom: string) => {
    if (!nom && !prenom) return '?';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = (statut: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      actif: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200' },
      suspendu: { bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-800 dark:text-yellow-200' },
      absent: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-200' },
      conge: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-200' },
    };
    const labels: { [key: string]: string } = {
      actif: 'Actif',
      suspendu: 'Suspendu',
      absent: 'Absent',
      conge: 'Congé',
      demission: 'Démission',
      licencie: 'Licencié',
      retraite: 'Retraité',
    };
    return { bg: colors[statut]?.bg || colors['actif'].bg, text: colors[statut]?.text || colors['actif'].text, label: labels[statut] || statut };
  };

  // 🎂 Calculer l'anniversaire
  const getAnniversaireInfo = (dateNaissance: string | null) => {
    if (!dateNaissance) return null;

    const birth = new Date(dateNaissance);
    const today = new Date();
    
    let nextAnniversary = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextAnniversary < today) {
      nextAnniversary = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }

    const daysLeft = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const age = today.getFullYear() - birth.getFullYear();

    return {
      daysLeft,
      age,
      dateFormat: birth.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' }),
    };
  };

  const anniversaireInfo = getAnniversaireInfo(salarie.date_naissance);
  const statusBadge = getStatusBadge(salarie.statut);
  const affectedDepts = departements.filter((d) => salarie.departements?.includes(d.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Boutons haut */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition">
              <Share2 className="h-4 w-4" />
              Partager
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition">
              <Edit2 className="h-4 w-4" />
              Modifier
            </button>
          </div>
        </div>

        {/* En-tête principal */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Photo */}
            <div className="flex-shrink-0">
              {salarie.photo ? (
                <img
                  src={salarie.photo}
                  alt={`${salarie.prenom} ${salarie.nom}`}
                  className="h-44 w-44 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              ) : (
                <div className="h-44 w-44 rounded-full bg-white/20 flex items-center justify-center text-white text-7xl font-bold border-4 border-white shadow-2xl">
                  {getInitials(salarie.nom, salarie.prenom)}
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-2">
                {salarie.prenom} {salarie.nom}
              </h1>
              <p className="text-xl font-semibold text-blue-100 mb-6">
                {salarie.poste || '---'}
              </p>

              {/* Grille infos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase">Service</p>
                  <p className="text-sm font-bold">{getServiceName(salarie.service)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase">Grade</p>
                  <p className="text-sm font-bold">{getGradeName(salarie.grade)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase">Extension 3CX</p>
                  <p className="text-sm font-bold">{salarie.extension_3cx || '---'}</p>
                </div>
              </div>

              {/* Départements affectés */}
              {affectedDepts.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-blue-200 font-semibold uppercase mb-2">Départements</p>
                  <div className="flex flex-wrap gap-2">
                    {affectedDepts.map((dept) => (
                      <span
                        key={dept.id}
                        className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold border border-white/30"
                      >
                        {dept.numero} - {dept.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges statut */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                  {statusBadge.label}
                </div>

                {salarie.en_poste ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100/20 rounded-full border border-white/30">
                    <CheckCircle className="h-5 w-5 animate-pulse" />
                    <span className="text-sm font-semibold">En poste</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100/20 rounded-full border border-white/30">
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-semibold">Hors poste</span>
                  </div>
                )}

                {anniversaireInfo && anniversaireInfo.daysLeft <= 7 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100/20 rounded-full border border-white/30 animate-bounce">
                    <Cake className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      Anniv. dans {anniversaireInfo.daysLeft} j
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grille 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Identité */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Identité
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Matricule</p>
                <p className="text-slate-900 dark:text-white font-mono font-semibold text-lg">{salarie.matricule}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Genre</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {salarie.genre === 'm' ? '👨 Masculin' : '👩 Féminin'}
                </p>
              </div>


              {anniversaireInfo && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">🎂 Anniversaire</p>
                  <p className="text-slate-900 dark:text-white font-semibold">{anniversaireInfo.dateFormat}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {anniversaireInfo.daysLeft === 0 ? '🎉 Aujourd\'hui !' : `dans ${anniversaireInfo.daysLeft} jours`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{anniversaireInfo.age} ans</p>
                </div>
              )}
            </div>
          </div>

          {/* Emploi */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-green-600" />
              Emploi
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Service</p>
                <p className="text-slate-900 dark:text-white font-semibold">{getServiceName(salarie.service)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Grade</p>
                <p className="text-slate-900 dark:text-white font-semibold">{getGradeName(salarie.grade)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Société</p>
                <p className="text-slate-900 dark:text-white font-semibold">{getSocieteName(salarie.societe)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Date embauche</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {new Date(salarie.date_embauche).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Horaires & Disponibilité */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Horaires
            </h2>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-2">Créneau</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {salarie.creneau_nom || '---'}
                </p>
              </div>

              {salarie.heure_pause_debut && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-2">Pauses</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Pause className="h-4 w-4 text-orange-600" />
                    <span className="text-slate-900 dark:text-white">
                      {salarie.heure_pause_debut} → {salarie.heure_pause_fin}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${salarie.en_poste ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {salarie.en_poste ? '✅ En poste actuellement' : '❌ Hors poste'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Départements affectés */}
        {affectedDepts.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Départements affectés ({affectedDepts.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affectedDepts.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {dept.numero}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{dept.nom}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{dept.chef_lieu}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{dept.region}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Professionnel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Contact Professionnel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <a
              href={`mailto:${salarie.mail_professionnel}`}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
            >
              <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Email</p>
                <p className="text-slate-900 dark:text-white font-semibold break-all">
                  {salarie.mail_professionnel || '---'}
                </p>
              </div>
            </a>

            {/* Téléphone Professionnel */}
            <a
              href={`tel:${salarie.telephone_professionnel}`}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
            >
              <Phone className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Téléphone</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {salarie.telephone_professionnel || '---'}
                </p>
              </div>
            </a>
          </div>

          {/* Extension 3CX */}
          {salarie.extension_3cx && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Building2 className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Extension 3CX</p>
                  <p className="text-slate-900 dark:text-white font-bold text-2xl">
                    {salarie.extension_3cx}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Personnel */}
        {salarie.telephone && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-red-600" />
              Contact Personnel
            </h2>

            <a
              href={`tel:${salarie.telephone}`}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
            >
              <Phone className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-1">Téléphone</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {salarie.telephone}
                </p>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
