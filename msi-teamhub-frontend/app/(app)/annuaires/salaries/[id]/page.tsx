'use client';
import { API_BASE_URL, getDepartements, getSalaries } from '@/lib/api-config';
import SalarieEquipements from '@/components/annuaire/SalarieEquipements';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  User,
  Building2,
  Award,
  Clock,
  Edit,
  Trash2,
  Users,
  Gift,
  PhoneCall,
} from 'lucide-react';


interface Salarie {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  genre: string;
  date_naissance: string;
  telephone: string;
  mail_professionnel: string;
  telephone_professionnel: string;
  extension_3cx: string;
  photo: string | null;
  societe: number;
  service: number;
  grade: number;
  responsable_direct: number | null;
  poste: string;
  departements: number[];
  date_embauche: string;
  statut: string;
  creneau_travail: number | null;
}


interface CreneauTravail {
  id: number;
  nom: string;
  heure_debut: string;
  heure_fin: string;
  heure_pause_debut: string | null;
  heure_pause_fin: string | null;
}


interface Societe {
  id: number;
  nom: string;
}


interface Service {
  id: number;
  nom: string;
  responsable: number | null;
}


interface Grade {
  id: number;
  nom: string;
}


interface Departement {
  id: number;
  numero: string;
  nom: string;
  region: string;
  cheflieu: string;
  nombre_circuits: number;
}


const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};


export default function SalarieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [salarie, setSalarie] = useState<Salarie | null>(null);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();

        // ✅ Appelle getDepartements et getSalaries AVEC pagination
        const departementsData = await getDepartements();
        const salariesData = await getSalaries();

        // ✅ Promise.all SANS departementsRes et salariesRes
        const [
          salarieRes,
          societesRes,
          servicesRes,
          gradesRes,
          creneauxRes,
        ] = await Promise.all([
          fetch(`http://localhost:8000/api/salaries/${id}/`, { headers }),
          fetch(`http://localhost:8000/api/societes/`, { headers }),
          fetch(`http://localhost:8000/api/services/`, { headers }),
          fetch(`http://localhost:8000/api/grades/`, { headers }),
          fetch(`http://localhost:8000/api/creneaux-travail/`, { headers }),
        ]);

        if (!salarieRes.ok) {
          if (salarieRes.status === 401) {
            throw new Error('Non authentifié. Veuillez vous connecter.');
          }
          throw new Error('Salarié non trouvé');
        }

        const salarieData = await salarieRes.json();
        const societesData = await societesRes.json();
        const servicesData = await servicesRes.json();
        const gradesData = await gradesRes.json();
        const creneauxData = await creneauxRes.json();

        setSalarie(salarieData);
        setSocietes(societesData.results || societesData);
        setServices(servicesData.results || servicesData);
        setGrades(gradesData.results || gradesData);
        
        // ✅ CORRECTION : Utilise departementsData.results directement
        setDepartements(departementsData.results || []);
        
        // ✅ CORRECTION : Utilise salariesData.results directement
        setSalaries(salariesData.results || []);
        
        setCreneaux(creneauxData.results || creneauxData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);


  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);


  // Helpers
  const getSocieteName = (id: number) =>
    societes.find((s) => s.id === id)?.nom || 'N/A';

  const getServiceName = (id: number) =>
    services.find((s) => s.id === id)?.nom || 'N/A';

  const getGradeName = (id: number) =>
    grades.find((g) => g.id === id)?.nom || 'N/A';

  const getResponsableName = (id: number | null) => {
    if (!id) return 'N/A';
    const resp = salaries.find((s) => s.id === id);
    return resp ? `${resp.prenom} ${resp.nom}` : 'N/A';
  };

  const getResponsableService = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service?.responsable) return 'N/A';
    return getResponsableName(service.responsable);
  };

  const getDepartementNames = (depts: number[]): string => {
    if (!depts || depts.length === 0) return 'N/A';
    return depts
      .map(id => departements.find(d => d.id === id)?.numero || 'N/A')
      .join(', ');
  };

  const getDepartementInfo = (deptId: number) =>
    departements.find((d) => d.id === deptId);

  const getCreneau = () => {
    if (!salarie?.creneau_travail) return null;
    return creneaux.find((c) => c.id === salarie.creneau_travail);
  };

  const getRegions = () => {
    if (!salarie?.departements || salarie.departements.length === 0)
      return 'N/A';
    const regions = salarie.departements
      .map((deptId) => getDepartementInfo(deptId)?.region)
      .filter((region, index, self) => region && self.indexOf(region) === index);
    return regions.length === 0 ? 'N/A' : regions.join(', ');
  };

  const getAnniversaireInfo = () => {
    if (!salarie?.date_naissance) return null;

    const today = new Date();
    const birthDate = new Date(salarie.date_naissance);
    let thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    let nextBirthday = thisYearBirthday;
    if (thisYearBirthday < today) {
      nextBirthday = new Date(
        today.getFullYear() + 1,
        birthDate.getMonth(),
        birthDate.getDate()
      );
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const joursSemaine = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];
    const mois = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ];

    const jourSemaine = joursSemaine[nextBirthday.getDay()];
    const jour = nextBirthday.getDate();
    const moisNom = mois[nextBirthday.getMonth()];
    const dateFormat = `${jourSemaine} ${jour} ${moisNom}`;

    return { dateFormat, daysLeft };
  };

  const anniversaireInfo = getAnniversaireInfo();
  const creneau = getCreneau();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error || !salarie)
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          {error?.includes('authentifi') && (
            <button
              onClick={() => router.push('/login')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter...
            </button>
          )}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* En-tête avec photo et infos principales */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Photo */}
            <div className="relative">
              {salarie.photo ? (
                <img
                  src={salarie.photo}
                  alt={`${salarie.prenom} ${salarie.nom}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl">
                  {salarie.prenom.charAt(0)}
                  {salarie.nom.charAt(0)}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">
                {salarie.prenom} {salarie.nom}
              </h1>
              <p className="text-xl text-blue-100 mb-3">{salarie.poste}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <MapPin size={16} />
                  <span>{getRegions()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Building2 size={16} />
                  <span>{getSocieteName(salarie.societe)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                  <Award size={16} />
                  <span>{getGradeName(salarie.grade)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(`/annuaires/salaries/${salarie.id}/edit`)
                }
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit size={20} />
              </button>
              <button
                className="p-3 bg-white/10 hover:bg-red-500/80 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identité */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Identité
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nom
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {salarie.nom}
                  </p>
                </div>

                {/* Prénom */}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Prénom
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {salarie.prenom}
                  </p>
                </div>

                {/* Matricule */}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Matricule
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {salarie.matricule}
                  </p>
                </div>

                {/* Genre */}
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Genre
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {salarie.genre === 'm' ? 'Masculin' : 'Féminin'}
                  </p>
                </div>

                {/* Anniversaire */}
                {anniversaireInfo && (
                  <div className="col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift size={20} className="text-purple-600 dark:text-purple-400" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Anniversaire
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {anniversaireInfo.dateFormat}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {anniversaireInfo.daysLeft === 0
                            ? "Aujourd'hui !"
                            : `dans ${anniversaireInfo.daysLeft} jour${
                                anniversaireInfo.daysLeft > 1 ? 's' : ''
                              }`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emploi */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-blue-600" />
                Emploi
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Service
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getServiceName(salarie.service)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Grade
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getGradeName(salarie.grade)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Responsable Direct
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getResponsableName(salarie.responsable_direct)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Responsable du Service
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getResponsableService(salarie.service)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Société
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getSocieteName(salarie.societe)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Date embauche
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(salarie.date_embauche).toLocaleDateString(
                      'fr-FR'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                Horaires
              </h2>
              {creneau ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Début
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {creneau.heure_debut}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Fin
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {creneau.heure_fin}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pause début
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {creneau.heure_pause_debut || '---'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Pause fin
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {creneau.heure_pause_fin || '---'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  Aucun créneau défini
                </p>
              )}
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone size={20} className="text-blue-600" />
                Contact
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Email
                    </p>
                    <a
                      href={`mailto:${salarie.mail_professionnel}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {salarie.mail_professionnel || '---'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Téléphone Prof
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {salarie.telephone_professionnel || '---'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Extension 3CX
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {salarie.extension_3cx || '---'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Téléphone Perso
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {salarie.telephone || '---'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Départements */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Départements
              </h2>

              <div className="space-y-3">
                {salarie.departements && salarie.departements.length > 0 ? (
                  salarie.departements.map((deptId) => {
                    const dept = getDepartementInfo(deptId);
                    if (!dept) return null;
                    return (
                      <div
                        key={dept.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {dept.numero} - {dept.nom}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          {dept.region}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {dept.nombre_circuits} circuit{dept.nombre_circuits !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">
                    Aucun département
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="mt-6">
          <SalarieEquipements
            salarieId={salarie.id}
            salarieNom={salarie.nom}
            salariePrenom={salarie.prenom}
          />
        </div>
      </div>
    </div>
  );
}