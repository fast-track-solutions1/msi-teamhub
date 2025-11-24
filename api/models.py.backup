from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

# ============================================================================
# MODELES DE BASE - PARAMÉTRAGE
# ============================================================================

class Societe(models.Model):
    """Représente une société/entreprise"""
    nom = models.CharField(max_length=255, unique=True)
    email = models.EmailField(null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)
    ville = models.CharField(max_length=100, null=True, blank=True)
    code_postal = models.CharField(max_length=10, null=True, blank=True)
    activite = models.CharField(max_length=255, null=True, blank=True)
    clients = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Sociétés"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Departement(models.Model):
    """Représente un département géographique (France)"""
    numero = models.CharField(max_length=3, unique=True)
    nom = models.CharField(max_length=100)
    region = models.CharField(max_length=100, null=True, blank=True)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='departements')
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['numero']
        unique_together = ['societe', 'numero']

    def __str__(self):
        return f"{self.numero} - {self.nom}"


class Circuit(models.Model):
    """Représente un circuit dans un département"""
    nom = models.CharField(max_length=100)
    departement = models.ForeignKey(Departement, on_delete=models.CASCADE, related_name='circuits')
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['departement', 'nom']
        unique_together = ['departement', 'nom']

    def __str__(self):
        return f"{self.departement.numero} - {self.nom}"


class Service(models.Model):
    """Représente un service/département RH"""
    nom = models.CharField(max_length=100)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='services')
    description = models.TextField(null=True, blank=True)
    responsable = models.ForeignKey('Salarie', on_delete=models.SET_NULL, null=True, blank=True, related_name='services_responsable')
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Services"
        ordering = ['societe', 'nom']
        unique_together = ['societe', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.societe.nom})"


class Grade(models.Model):
    """Représente un grade/niveau hiérarchique"""
    nom = models.CharField(max_length=100)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='grades')
    ordre = models.IntegerField(default=0)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['societe', 'ordre', 'nom']
        unique_together = ['societe', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.societe.nom})"


class TypeAcces(models.Model):
    """Types d'accès (locaux, distance, etc.)"""
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Types d'accès"

    def __str__(self):
        return self.nom


class OutilTravail(models.Model):
    """Outils de travail (logiciels, etc.)"""
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class CreneauTravail(models.Model):
    """Créneaux horaires disponibles"""
    nom = models.CharField(max_length=100)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='creneaux_travail')
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    heure_pause_debut = models.TimeField(null=True, blank=True)
    heure_pause_fin = models.TimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['societe', 'heure_debut']
        unique_together = ['societe', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.heure_debut} - {self.heure_fin})"


class Equipement(models.Model):
    """Types d'équipements informatiques"""
    TYPES_EQUIPEMENT = [
        ('casque', 'Casque'),
        ('pc', 'PC'),
        ('laptop', 'Laptop'),
        ('souris', 'Souris'),
        ('telephone', 'Téléphone'),
        ('carte_sim', 'Carte SIM'),
        ('ecran', 'Écran'),
        ('clavier', 'Clavier'),
        ('docking', 'Docking Station'),
        ('autre', 'Autre'),
    ]

    nom = models.CharField(max_length=100)
    type_equipement = models.CharField(max_length=50, choices=TYPES_EQUIPEMENT)
    description = models.TextField(null=True, blank=True)
    stock_total = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    stock_disponible = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['type_equipement', 'nom']
        unique_together = ['nom', 'type_equipement']

    def __str__(self):
        return f"{self.nom} ({self.type_equipement})"


# ============================================================================
# MODELES SALARIÉS
# ============================================================================

class Salarie(models.Model):
    """Représente un salarié"""
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('conge', 'Congé'),
        ('arret_maladie', 'Arrêt maladie'),
    ]

    GENRE_CHOICES = [
        ('m', 'Masculin'),
        ('f', 'Féminin'),
        ('autre', 'Autre'),
    ]

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='profil_salarie')

    # Informations personnelles
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)
    genre = models.CharField(max_length=10, choices=GENRE_CHOICES)
    date_naissance = models.DateField(null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)
    mail_professionnel = models.EmailField(null=True, blank=True)
    telephone_professionnel = models.CharField(max_length=20, null=True, blank=True)
    extension_3cx = models.CharField(max_length=10, null=True, blank=True)

    # Infos professionnelles
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='salaries')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    responsable_direct = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordonnes')
    poste = models.CharField(max_length=255, null=True, blank=True)
    departement = models.ForeignKey(Departement, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    circuit = models.ForeignKey(Circuit, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    date_embauche = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='actif')
    date_sortie = models.DateField(null=True, blank=True)

    # Horaires
    creneau_travail = models.ForeignKey(CreneauTravail, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    en_poste = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nom', 'prenom']
        unique_together = ['societe', 'matricule']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"

    def get_anciennete(self):
        """Retourne ancienneté au format '5 ans, 3 mois'"""
        if not self.date_embauche:
            return None
        today = date.today()
        if self.statut == 'inactif' and self.date_sortie:
            today = self.date_sortie
        diff = relativedelta(today, self.date_embauche)
        return f"{diff.years} ans, {diff.months} mois"

    def get_statut_actuel(self):
        """Retourne le statut actuel : EN_POSTE, EN_PAUSE, HORS_HORAIRES"""
        if not self.creneau_travail:
            return "NON_CONFIG"
        now = datetime.now().time()
        if self.creneau_travail.heure_pause_debut and self.creneau_travail.heure_pause_fin:
            if self.creneau_travail.heure_pause_debut <= now <= self.creneau_travail.heure_pause_fin:
                return "EN_PAUSE"
        if self.creneau_travail.heure_debut <= now <= self.creneau_travail.heure_fin:
            return "EN_POSTE"
        return "HORS_HORAIRES"

    @property
    def jour_mois_naissance(self):
        """Retourne jour/mois naissance pour anniversaire"""
        if not self.date_naissance:
            return None
        return f"{self.date_naissance.day:02d}/{self.date_naissance.month:02d}"


class HistoriqueSalarie(models.Model):
    """Historique des évolutions professionnelles du salarié"""
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='historique')
    service_ancien = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='historique_ancien')
    service_nouveau = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='historique_nouveau')
    grade_ancien = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True, related_name='historique_ancien')
    grade_nouveau = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True, related_name='historique_nouveau')
    date_changement = models.DateField(auto_now_add=True)
    motif = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-date_changement']

    def __str__(self):
        return f"{self.salarie} - {self.date_changement}"


class HoraireSalarie(models.Model):
    """Horaires supplémentaires configurés pour un salarié"""
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='horaires_supplementaires')
    date_debut = models.DateField()
    date_fin = models.DateField(null=True, blank=True)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    heure_pause_debut = models.TimeField(null=True, blank=True)
    heure_pause_fin = models.TimeField(null=True, blank=True)
    motif = models.CharField(max_length=255, null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_debut']

    def __str__(self):
        return f"{self.salarie} - {self.date_debut}"


# ============================================================================
# ÉQUIPEMENTS AFFECTÉS
# ============================================================================

class EquipementInstance(models.Model):
    """Instance physique d'un équipement attribué à un salarié"""
    ETAT_CHOICES = [
        ('neuf', 'Neuf'),
        ('bon', 'Bon état'),
        ('usure', 'Usure légère'),
        ('defaut', 'Défaut'),
        ('hors_service', 'Hors service'),
    ]

    equipement = models.ForeignKey(Equipement, on_delete=models.CASCADE, related_name='instances')
    model = models.CharField(max_length=255, null=True, blank=True)
    numero_serie = models.CharField(max_length=255, unique=True, null=True, blank=True)
    salarie = models.ForeignKey(Salarie, on_delete=models.SET_NULL, null=True, blank=True, related_name='equipements')
    date_affectation = models.DateField()
    date_retrait = models.DateField(null=True, blank=True)
    etat = models.CharField(max_length=50, choices=ETAT_CHOICES, default='bon')
    notes = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_affectation']

    def __str__(self):
        return f"{self.equipement.nom} - {self.numero_serie or 'N/A'}"


# ============================================================================
# ACCÈS APPLICATIFS
# ============================================================================

class TypeApplicationAcces(models.Model):
    """Types d'applications (mail, VPN, etc.)"""
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Types d'accès application"

    def __str__(self):
        return self.nom


class AccesApplication(models.Model):
    """Accès applicatif d'un salarié"""
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_applicatif')
    type_application = models.ForeignKey(TypeApplicationAcces, on_delete=models.CASCADE)
    application = models.CharField(max_length=255)
    identifiant = models.CharField(max_length=255, default='APP_ID')  # ✅ AJOUT DEFAULT
    mot_de_passe = models.CharField(max_length=255, default='APP_PWD')  # ✅ AJOUT DEFAULT
    url = models.URLField(null=True, blank=True)
    date_debut = models.DateField(auto_now_add=True)
    date_fin = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['application']
        unique_together = ['salarie', 'application']

    def __str__(self):
        return f"{self.salarie.matricule} - {self.application}"


class AccesSalarie(models.Model):
    """Accès physiques du salarié"""
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_locaux')
    type_acces = models.ForeignKey(TypeAcces, on_delete=models.CASCADE)
    description = models.CharField(max_length=255, null=True, blank=True)
    date_debut = models.DateField(auto_now_add=True)
    date_fin = models.DateField(null=True, blank=True)

    class Meta:
        unique_together = ['salarie', 'type_acces']

    def __str__(self):
        return f"{self.salarie.matricule} - {self.type_acces.nom}"


# ============================================================================
# DEMANDES (CONGÉS, ACOMPTES, SORTIES)
# ============================================================================

class DemandeConge(models.Model):
    """Demande de congé"""
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('soumise', 'Soumise'),
        ('validée_direct', 'Validée par responsable direct'),
        ('validée_service', 'Validée par responsable service'),
        ('approuvée', 'Approuvée'),
        ('rejetée', 'Rejetée'),
    ]

    TYPE_CONGE = [
        ('normal', 'Congé normal'),
        ('maladie', 'Congé maladie'),
        ('maternite', 'Congé maternité'),
        ('sans_solde', 'Congé sans solde'),
        ('sabbatique', 'Congé sabbatique'),
    ]

    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='demandes_conge')
    type_conge = models.CharField(max_length=50, choices=TYPE_CONGE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    nombre_jours = models.DecimalField(max_digits=5, decimal_places=2)
    motif = models.TextField(null=True, blank=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='brouillon')
    valide_par_direct = models.BooleanField(default=False)
    date_validation_direct = models.DateTimeField(null=True, blank=True)
    commentaire_direct = models.TextField(null=True, blank=True)
    valide_par_service = models.BooleanField(default=False)
    date_validation_service = models.DateTimeField(null=True, blank=True)
    commentaire_service = models.TextField(null=True, blank=True)
    rejete = models.BooleanField(default=False)
    date_rejet = models.DateTimeField(null=True, blank=True)
    motif_rejet = models.TextField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"{self.salarie.matricule} - {self.type_conge} ({self.date_debut})"


class SoldeConge(models.Model):
    """Solde de congés pour chaque salarié"""
    salarie = models.OneToOneField(Salarie, on_delete=models.CASCADE, related_name='solde_conge')
    conges_acquis = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    conges_utilises = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    conges_restants = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    date_derniere_maj = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Solde - {self.salarie.matricule}"


class DemandeAcompte(models.Model):
    """Demande d'acompte"""
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('soumise', 'Soumise'),
        ('validée_direct', 'Validée par responsable'),
        ('validée_service', 'Validée par responsable service'),
        ('approuvée', 'Approuvée'),
        ('rejetée', 'Rejetée'),
        ('payée', 'Payée'),
    ]

    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='demandes_acompte')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    motif = models.TextField()
    date_demande = models.DateField(auto_now_add=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='brouillon')
    valide_par_direct = models.BooleanField(default=False)
    date_validation_direct = models.DateTimeField(null=True, blank=True)
    valide_par_service = models.BooleanField(default=False)
    date_validation_service = models.DateTimeField(null=True, blank=True)
    date_paiement = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-date_demande']

    def __str__(self):
        return f"Acompte - {self.salarie.matricule} ({self.montant}€)"


class DemandeSortie(models.Model):
    """Demande de sortie/absence non programmée"""
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('soumise', 'Soumise'),
        ('validée_direct', 'Validée par responsable'),
        ('validée_service', 'Validée par responsable service'),
        ('approuvée', 'Approuvée'),
        ('rejetée', 'Rejetée'),
    ]

    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='demandes_sortie')
    date_sortie = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    motif = models.CharField(max_length=255)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='brouillon')
    valide_par_direct = models.BooleanField(default=False)
    date_validation_direct = models.DateTimeField(null=True, blank=True)
    valide_par_service = models.BooleanField(default=False)
    date_validation_service = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-date_sortie']

    def __str__(self):
        return f"Sortie - {self.salarie.matricule} ({self.date_sortie})"


class TravauxExceptionnels(models.Model):
    """Travaux/sorties exceptionnels (samedi, dimanche)"""
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('soumise', 'Soumise'),
        ('validée_direct', 'Validée par responsable'),
        ('validée_service', 'Validée par responsable service'),
        ('approuvée', 'Approuvée'),
        ('rejetée', 'Rejetée'),
    ]

    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='travaux_exceptionnels')
    date_travail = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    nombre_heures = models.DecimalField(max_digits=5, decimal_places=2)
    description_travail = models.TextField()
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='brouillon')
    valide_par_direct = models.BooleanField(default=False)
    date_validation_direct = models.DateTimeField(null=True, blank=True)
    valide_par_service = models.BooleanField(default=False)
    date_validation_service = models.DateTimeField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_travail']

    def __str__(self):
        return f"Travaux - {self.salarie.matricule} ({self.date_travail})"


# ============================================================================
# DOCUMENTS
# ============================================================================

class DocumentSalarie(models.Model):
    """Documents RH du salarié (fiches de paie, contrats, etc.)"""
    TYPE_DOCUMENT = [
        ('fiche_paie', 'Fiche de paie'),
        ('contrat', 'Contrat'),
        ('attestation_salaire', 'Attestation de salaire'),
        ('attestation_travail', 'Attestation de travail'),
        ('demande_demission', 'Demande de démission'),
        ('autre', 'Autre'),
    ]

    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='documents')
    type_document = models.CharField(max_length=50, choices=TYPE_DOCUMENT)
    titre = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    fichier = models.FileField(upload_to='documents/%Y/%m/%d/')
    date_document = models.DateField(null=True, blank=True)
    date_upload = models.DateTimeField(auto_now_add=True)
    accessible_par_salarie = models.BooleanField(default=True)
    accessible_par_admin = models.BooleanField(default=True)
    accessible_par_rh = models.BooleanField(default=True)
    accessible_par_daf = models.BooleanField(default=True)
    accessible_par_comptable = models.BooleanField(default=True)

    class Meta:
        ordering = ['-date_upload']

    def __str__(self):
        return f"{self.salarie.matricule} - {self.type_document}"


# ============================================================================
# FICHES DE POSTE
# ============================================================================

class FichePoste(models.Model):
    """Fiche de poste"""
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('en_revision', 'En révision'),
        ('archivé', 'Archivé'),
    ]

    titre = models.CharField(max_length=255)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='fiches_poste')
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    responsable_service = models.ForeignKey(Salarie, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField()
    taches = models.TextField()
    competences_requises = models.TextField(null=True, blank=True)
    moyens_correction = models.TextField(null=True, blank=True)
    problemes = models.TextField(null=True, blank=True)
    propositions = models.TextField(null=True, blank=True)
    defauts = models.TextField(null=True, blank=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='actif')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['service', 'titre']
        unique_together = ['service', 'titre']

    def __str__(self):
        return self.titre


class AmeliorationProposee(models.Model):
    """Améliorations proposées pour une fiche de poste"""
    STATUT_CHOICES = [
        ('proposal', 'Proposition'),
        ('examinee', 'Examinée'),
        ('en_cours', 'En cours'),
        ('completee', 'Complétée'),
        ('rejetee', 'Rejetée'),
    ]

    fiche_poste = models.ForeignKey(FichePoste, on_delete=models.CASCADE, related_name='ameliorations')
    salarie_proposant = models.ForeignKey(Salarie, on_delete=models.CASCADE)
    titre = models.CharField(max_length=255)
    description = models.TextField()
    raison = models.TextField(default='Non spécifiée')  # ✅ AJOUT DEFAULT
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='proposal')
    date_proposition = models.DateTimeField(auto_now_add=True)
    date_examen = models.DateTimeField(null=True, blank=True)
    examinee_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ameliorations_examinees')
    priorite = models.IntegerField(default=0)
    responsables = models.CharField(max_length=255, null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-date_proposition']

    def __str__(self):
        return f"{self.titre} ({self.fiche_poste.titre})"


class OutilFichePoste(models.Model):
    """Outils nécessaires pour une fiche de poste"""
    fiche_poste = models.ForeignKey(FichePoste, on_delete=models.CASCADE, related_name='outils')
    outil_travail = models.ForeignKey(OutilTravail, on_delete=models.CASCADE)
    obligatoire = models.BooleanField(default=True)

    class Meta:
        unique_together = ['fiche_poste', 'outil_travail']

    def __str__(self):
        return f"{self.fiche_poste.titre} - {self.outil_travail.nom}"


# ============================================================================
# MODELES PARAMÉTRAGES UTILISATEUR
# ============================================================================

class FicheParametresUser(models.Model):
    """Paramètres de configuration pour chaque utilisateur"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parametres')
    theme = models.CharField(max_length=50, default='light')
    langue = models.CharField(max_length=10, default='fr')
    notifications_actives = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Paramètres - {self.user.username}"


# ============================================================================
# MODELE RÔLE
# ============================================================================

class Role(models.Model):
    """Rôles utilisateur pour permissions granulaires"""
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('rh', 'Responsable RH'),
        ('it', 'Responsable Informatique'),
        ('daf', 'DAF (Directeur Admin Financier)'),
        ('comptable', 'Comptable'),
        ('responsable_service', 'Responsable de Service'),
        ('salarie', 'Salarié'),
    ]

    nom = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(null=True, blank=True)
    utilisateurs = models.ManyToManyField(User, related_name='roles')
    can_view_salaries = models.BooleanField(default=False)
    can_edit_salaries = models.BooleanField(default=False)
    can_validate_requests = models.BooleanField(default=False)
    can_view_financial = models.BooleanField(default=False)
    can_edit_financial = models.BooleanField(default=False)
    can_manage_it = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.get_nom_display()
