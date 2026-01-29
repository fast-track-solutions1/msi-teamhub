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
    chef_lieu = models.CharField(max_length=100, null=True, blank=True)
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='departements')
    nombre_circuits = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['numero']
        unique_together = ['societe', 'numero']

    def __str__(self):
        return f"{self.numero} - {self.nom} - {self.nombre_circuits} circuits"


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
    
    # ← AJOUTER CES 5 LIGNES :
    parentservice = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sousservices'
    )
    
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
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='creneaux_travail', default=1)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    heure_pause_debut = models.TimeField(null=True, blank=True)
    heure_pause_fin = models.TimeField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['societe', 'heure_debut']
        unique_together = ['societe', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.heure_debut} - {self.heure_fin})"


class Equipement(models.Model):
    """Types d'équipements informatiques - Liste complète"""
    TYPES_EQUIPEMENT = [
        # ORDINATEURS & POSTES DE TRAVAIL
        ('pc_bureau', 'PC de Bureau'),
        ('laptop', 'Laptop / Ordinateur Portable'),
        ('tablette', 'Tablette'),
        ('all_in_one', 'Ordinateur Tout-en-Un'),
        ('poste_travail', 'Poste de Travail / Workstation'),
        # SERVEURS & INFRASTRUCTURE
        ('serveur', 'Serveur'),
        ('serveur_rack', 'Serveur Rack'),
        ('nas', 'NAS (Network Attached Storage)'),
        ('san', 'SAN (Storage Area Network)'),
        ('mainframe', 'Mainframe'),
        # PÉRIPHÉRIQUES & ACCESSOIRES PC
        ('clavier', 'Clavier'),
        ('souris', 'Souris'),
        ('souris_trackpad', 'Trackpad / Touchpad'),
        ('ecran', 'Écran / Moniteur'),
        ('ecran_tactile', 'Écran Tactile'),
        ('projecteur', 'Projecteur'),
        ('data_show', 'Data Show / Videoprojecteur'),
        ('docking', 'Docking Station'),
        ('hub_usb', 'Hub USB'),
        ('adaptateur', 'Adaptateur'),
        ('chargeur', 'Chargeur / Alimentation'),
        ('batterie', 'Batterie'),
        ('casque_audio', 'Casque Audio / Headset'),
        ('casque_usb', 'Casque USB'),
        ('microphone', 'Microphone'),
        ('haut_parleur', 'Haut-Parleur'),
        ('webcam', 'Webcam / Caméra Web'),
        ('cable_hdmi', 'Câble HDMI'),
        ('cable_usb', 'Câble USB'),
        ('cable_reseau', 'Câble Réseau / RJ45'),
        ('cable_alimentation', 'Câble d\'Alimentation'),
        ('multiprise', 'Multiprise / Rallonge'),
        # IMPRIMANTES & SCANNERS
        ('imprimante_laser', 'Imprimante Laser'),
        ('imprimante_inkjet', 'Imprimante Jet d\'Encre'),
        ('imprimante_3d', 'Imprimante 3D'),
        ('scanner_document', 'Scanner Document'),
        ('scanner_code_barre', 'Scanner Code-Barres'),
        ('scanner_main', 'Scanneur Portable'),
        ('multifonction', 'Multifonction (Imprim/Scan/Copie/Fax)'),
        ('photocopieur', 'Photocopieur'),
        ('fax', 'Fax / Téléfax'),
        # ÉQUIPEMENTS RÉSEAU
        ('routeur', 'Routeur'),
        ('routeur_wifi', 'Routeur WiFi'),
        ('switch_reseau', 'Switch Réseau / Commutateur'),
        ('switch_poe', 'Switch PoE'),
        ('point_acces_wifi', 'Point d\'Accès WiFi'),
        ('point_acces_mesh', 'Point d\'Accès WiFi Mesh'),
        ('modem', 'Modem'),
        ('modem_adsl', 'Modem ADSL'),
        ('firewall', 'Firewall / Pare-feu'),
        ('vpn', 'Passerelle VPN'),
        ('antenne_wifi', 'Antenne WiFi'),
        ('antenne_5g', 'Antenne 5G'),
        # TÉLÉPHONIE
        ('telephone_fixe', 'Téléphone Fixe'),
        ('telephone_ip', 'Téléphone IP'),
        ('telephone_mobile', 'Téléphone Mobile / Smartphone'),
        ('carte_sim', 'Carte SIM'),
        ('pabx', 'PABX / Autocommutateur'),
        ('centraliste', 'Poste Centraliste'),
        # STOCKAGE & SAUVEGARDE
        ('disque_dur', 'Disque Dur Interne'),
        ('disque_dur_externe', 'Disque Dur Externe'),
        ('ssd', 'SSD (Solid State Drive)'),
        ('ssd_externe', 'SSD Externe'),
        ('cle_usb', 'Clé USB'),
        ('cle_usb_securisee', 'Clé USB Sécurisée'),
        ('lecteur_cd_dvd', 'Lecteur CD/DVD'),
        ('graveur_dvd', 'Graveur DVD'),
        ('lecteur_blu_ray', 'Lecteur Blu-Ray'),
        ('bande_magnetique', 'Bande Magnétique (Sauvegarde)'),
        ('cartouche_backup', 'Cartouche Backup'),
        # COMPOSANTS INFORMATIQUES
        ('ram', 'Mémoire RAM'),
        ('processeur', 'Processeur / CPU'),
        ('carte_mere', 'Carte Mère'),
        ('carte_graphique', 'Carte Graphique / GPU'),
        ('carte_reseau', 'Carte Réseau'),
        ('carte_son', 'Carte Son'),
        ('alimentation_pc', 'Alimentation PC'),
        ('ventilateur', 'Ventilateur'),
        ('boitier_pc', 'Boîtier PC'),
        ('radiateur', 'Radiateur'),
        # ÉQUIPEMENTS DE SÉCURITÉ
        ('camera_surveillance', 'Caméra Surveillance / IP Cam'),
        ('camera_thermique', 'Caméra Thermique'),
        ('dvr_nvr', 'DVR / NVR (Enregistreur Vidéo)'),
        ('capteur_mouvement', 'Capteur de Mouvement'),
        ('lecteur_badge', 'Lecteur de Badge / RFID'),
        ('biometrie_scanner', 'Scanner Biométrique'),
        ('badge_securite', 'Badge de Sécurité'),
        # ÉQUIPEMENTS ÉLECTRIQUES
        ('onduleur_ups', 'Onduleur / UPS (Alimentation Secours)'),
        ('stabilisateur_tension', 'Stabilisateur de Tension'),
        ('generatrice', 'Génératrice'),
        ('clim_serveur', 'Climatisation Salle Serveur'),
        # ÉQUIPEMENTS DE CONFÉRENCE & COLLABORATION
        ('tableau_interactif', 'Tableau Interactif / Smartboard'),
        ('ecran_interactif', 'Écran Interactif'),
        ('camera_conference', 'Caméra de Conférence'),
        ('microphone_conference', 'Microphone de Conférence'),
        ('systeme_visio', 'Système de Vidéoconférence'),
        # AUTRES ÉQUIPEMENTS IT
        ('lecteur_code_barre_mobile', 'Lecteur Code-Barres Mobile'),
        ('terminal_pda', 'Terminal PDA'),
        ('lecteur_rfid', 'Lecteur RFID'),
        ('imprimante_etiquettes', 'Imprimante d\'Étiquettes'),
        ('balance_connectee', 'Balance Connectée'),
        ('chrono_badge', 'Système de Pointage / Badge Temps'),
        ('autre_it', 'Autre Équipement IT'),
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

    def recalculer_stock(self):
        """Recalcule stock_disponible = stock_total - instances affectées"""
        affected_count = EquipementInstance.objects.filter(
            equipement=self,
            date_retrait__isnull=True
        ).count()
        self.stock_disponible = max(0, self.stock_total - affected_count)

    def save(self, *args, **kwargs):
        """Recalcule automatiquement le stock avant sauvegarde"""
        self.recalculer_stock()
        super().save(*args, **kwargs)


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
    photo = models.ImageField(upload_to='salaries/photos/', null=True, blank=True)

    # Infos professionnelles
    societe = models.ForeignKey(Societe, on_delete=models.CASCADE, related_name='salaries')
    service = models.ForeignKey(Service, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True, related_name='salaries')
    responsable_direct = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordonnes')
    poste = models.CharField(max_length=255, null=True, blank=True)
    departements = models.ManyToManyField(Departement, blank=True, related_name='salaries')
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

    def save(self, *args, **kwargs):
        """Après création/modification → recalcule stock du parent"""
        super().save(*args, **kwargs)
        self.equipement.save()

    def delete(self, *args, **kwargs):
        """Après suppression → recalcule stock du parent"""
        equipement = self.equipement
        super().delete(*args, **kwargs)
        equipement.save()


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
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_applicatif', default=1)
    type_application = models.ForeignKey(TypeApplicationAcces, on_delete=models.CASCADE, default=1)
    application = models.CharField(max_length=255, default='APP')
    identifiant = models.CharField(max_length=255, default='APP_ID')
    mot_de_passe = models.CharField(max_length=255, default='APP_PWD')
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
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name='acces_locaux', default=1)
    type_acces = models.ForeignKey(TypeAcces, on_delete=models.CASCADE, default=1)
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
    type_conge = models.CharField(max_length=50, choices=TYPE_CONGE, default='normal')
    date_debut = models.DateField()
    date_fin = models.DateField()
    nombre_jours = models.DecimalField(max_digits=5, decimal_places=2, default=1)
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
    date_creation = models.DateTimeField(auto_now_add=True, null=True)
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
    motif = models.TextField(default='Demande d\'acompte')
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
    motif = models.CharField(max_length=255, default='Sortie exceptionnelle')
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
    nombre_heures = models.DecimalField(max_digits=5, decimal_places=2, default=1)
    description_travail = models.TextField(default='Travaux exceptionnels')
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
    type_document = models.CharField(max_length=50, choices=TYPE_DOCUMENT, default='autre')
    titre = models.CharField(max_length=255, default='Document')
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
    description = models.TextField(default='Description du poste')
    taches = models.TextField(default='Tâches principales')
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
    salarie_proposant = models.ForeignKey(Salarie, on_delete=models.CASCADE, default=1)
    titre = models.CharField(max_length=255, default='Amélioration')
    description = models.TextField(default='Description de l\'amélioration')
    raison = models.TextField(default='Non spécifiée')
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


# ============================================================================
# IMPORT EN MASSE - LOG
# ============================================================================

class ImportLog(models.Model):
    """Trace chaque import en masse avec détails"""
    STATUS_CHOICES = [
        ('en_cours', 'En cours'),
        ('succes', 'Succès'),
        ('erreur', 'Erreur'),
        ('partiel', 'Succès partiel'),
    ]

    api_name = models.CharField(max_length=100)
    fichier_nom = models.CharField(max_length=255, null=True, blank=True)
    total_lignes = models.IntegerField(default=0)
    lignes_succes = models.IntegerField(default=0)
    lignes_erreur = models.IntegerField(default=0)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_cours')
    details_erreurs = models.JSONField(default=dict, null=True, blank=True)
    cree_par = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='import_logs')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Log d'import"
        verbose_name_plural = "Logs d'import"

    def __str__(self):
        return f"{self.api_name} - {self.date_creation.strftime('%d/%m/%Y %H:%M')}"

    def get_taux_succes(self):
        """Retourne le % de succès"""
        if self.total_lignes == 0:
            return 0
        return round((self.lignes_succes / self.total_lignes) * 100, 2)
