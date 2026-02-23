from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie, ImportLog
)
from django.contrib.auth.models import User
from datetime import date

# ============================================
# SERIALIZER SOCIÉTÉ
# ============================================
class SocieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Societe
        fields = [
            'id', 'nom', 'email', 'telephone', 'adresse', 'ville',
            'code_postal', 'activite', 'clients', 'actif', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER CIRCUIT
# ============================================
class CircuitSerializer(serializers.ModelSerializer):
    departement_nom = serializers.CharField(source='departement.nom', read_only=True)
    
    class Meta:
        model = Circuit
        fields = [
            'id', 'nom', 'departement', 'departement_nom',
            'description', 'actif', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER DÉPARTEMENT
# ============================================
class DepartementSerializer(serializers.ModelSerializer):
    circuits = CircuitSerializer(many=True, read_only=True)
    label_complet = serializers.SerializerMethodField()
    
    class Meta:
        model = Departement
        fields = [
            'id', 'numero', 'nom', 'region', 'chef_lieu', 'societe',
            'nombre_circuits', 'circuits', 'actif', 'date_creation', 'label_complet',
        ]
        read_only_fields = ['date_creation']
    
    def get_label_complet(self, obj):
        """Retourne CODE - NOM - X circuits"""
        return f"{obj.numero} - {obj.nom} - {obj.nombre_circuits} circuits"

# ============================================
# SERIALIZER SERVICE
# ============================================
class ServiceSerializer(serializers.ModelSerializer):
    responsable_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'societe', 'description', 'responsable',
            'responsable_info', 'parentservice', 'actif', 'date_creation'  # ← parentservice SANS underscore
        ]
        read_only_fields = ['date_creation']
    
    def get_responsable_info(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None

# ============================================
# SERIALIZER GRADE
# ============================================
class GradeSerializer(serializers.ModelSerializer):
    echelon = serializers.IntegerField(source='ordre', read_only=True)  # ✅ ALIAS
    
    class Meta:
        model = Grade
        fields = ['id', 'nom', 'societe', 'ordre', 'echelon', 'actif', 'date_creation']
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER TYPE ACCÈS
# ============================================
class TypeAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeAcces
        fields = ['id', 'nom', 'description', 'actif']

# ============================================
# SERIALIZER OUTIL TRAVAIL
# ============================================
class OutilTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutilTravail
        fields = ['id', 'nom', 'description', 'actif']

# ============================================
# SERIALIZER CRÉNEAU TRAVAIL
# ============================================
class CreneauTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreneauTravail
        fields = [
            'id', 'nom', 'societe', 'heure_debut', 'heure_fin',
            'heure_pause_debut', 'heure_pause_fin', 'description',
            'actif', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER ÉQUIPEMENT
# ============================================
class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = [
            'id', 'nom', 'type_equipement', 'description',
            'stock_total', 'stock_disponible', 'actif', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER TYPE APPLICATION ACCÈS
# ============================================
class TypeApplicationAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeApplicationAcces
        fields = ['id', 'nom', 'description', 'actif']

# ============================================
# SERIALIZER SALARIÉ (SIMPLE)
# ============================================
class SalarieSerializer(serializers.ModelSerializer):
    """
    Serializer pour Salarie avec support multiple départements (M2M)
    """
    departements = PrimaryKeyRelatedField(
        queryset=Departement.objects.all(),
        many=True,
        required=False
    )
    responsable_direct = PrimaryKeyRelatedField(
        queryset=Salarie.objects.all(),
        many=False,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Salarie
        fields = [
            'id', 'user', 'nom', 'prenom', 'matricule', 'genre',
            'date_naissance', 'telephone', 'mail_professionnel',
            'telephone_professionnel', 'extension_3cx', 'photo', 'societe',
            'service', 'grade', 'responsable_direct', 'poste',
            'departements', 'circuit', 'date_embauche', 'statut',
            'date_sortie', 'en_poste', 'creneau_travail',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']
    
    def create(self, validated_data):
        departements_data = validated_data.pop('departements', [])
        salarie = Salarie.objects.create(**validated_data)
        salarie.departements.set(departements_data)
        return salarie
    
    def update(self, instance, validated_data):
        departements_data = validated_data.pop('departements', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if departements_data is not None:
            instance.departements.set(departements_data)
        return instance


# ============================================
# 🎯 SERIALIZER ÉQUIPEMENT INSTANCE (À JOUR)
# ============================================
class EquipementInstanceSerializer(serializers.ModelSerializer):
    """
    Serializer pour les instances d'équipement affectées aux salariés
    Retourne les détails complets de chaque équipement attribué
    """
    equipement_nom = serializers.CharField(
        source='equipement.nom',
        read_only=True
    )
    equipement_type = serializers.CharField(
        source='equipement.type_equipement',
        read_only=True
    )
    salarie_matricule = serializers.CharField(
        source='salarie.matricule',
        read_only=True,
        allow_null=True
    )
    salarie_nom = serializers.SerializerMethodField(read_only=True)
    etat_display = serializers.CharField(
        source='get_etat_display',
        read_only=True
    )
    duree_utilisation = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EquipementInstance
        fields = [
            'id',
            'equipement',
            'equipement_nom',
            'equipement_type',
            'model',
            'numero_serie',
            'salarie',
            'salarie_matricule',
            'salarie_nom',
            'date_affectation',
            'date_retrait',
            'etat',
            'etat_display',
            'notes',
            'duree_utilisation',
            'date_creation'
        ]
        read_only_fields = [
            'date_creation',
            'equipement_nom',
            'equipement_type',
            'salarie_nom',
            'etat_display',
            'duree_utilisation'
        ]

    def get_salarie_nom(self, obj):
        """Retourne le nom complet du salarié"""
        if obj.salarie:
            return f"{obj.salarie.prenom} {obj.salarie.nom}"
        return None

    def get_duree_utilisation(self, obj):
        """Calcule la durée d'utilisation en jours"""
        if not obj.date_affectation:
            return None
        fin = obj.date_retrait if obj.date_retrait else date.today()
        delta = (fin - obj.date_affectation).days
        return delta


# ============================================
# SERIALIZER ACCÈS APPLICATION
# ============================================
class AccesApplicationSerializer(serializers.ModelSerializer):
    application_display = serializers.CharField(source='get_type_application_display', read_only=True)
    
    class Meta:
        model = AccesApplication
        fields = [
            'id', 'salarie', 'type_application', 'application_display',
            'application', 'identifiant', 'mot_de_passe', 'url',
            'date_debut', 'date_fin', 'notes'
        ]

# ============================================
# SERIALIZER ACCÈS SALARIÉ
# ============================================
class AccesSalarieSerializer(serializers.ModelSerializer):
    type_acces_nom = serializers.CharField(source='type_acces.nom', read_only=True)
    
    class Meta:
        model = AccesSalarie
        fields = [
            'id', 'salarie', 'type_acces', 'type_acces_nom',
            'description', 'date_debut', 'date_fin'
        ]

# ============================================
# SERIALIZER HORAIRE SALARIÉ
# ============================================
class HoraireSalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraireSalarie
        fields = [
            'id', 'salarie', 'date_debut', 'date_fin', 'heure_debut',
            'heure_fin', 'heure_pause_debut', 'heure_pause_fin',
            'motif', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER HISTORIQUE SALARIÉ
# ============================================
class HistoriqueSalarieSerializer(serializers.ModelSerializer):
    service_ancien_nom = serializers.CharField(source='service_ancien.nom', read_only=True)
    service_nouveau_nom = serializers.CharField(source='service_nouveau.nom', read_only=True)
    grade_ancien_nom = serializers.CharField(source='grade_ancien.nom', read_only=True)
    grade_nouveau_nom = serializers.CharField(source='grade_nouveau.nom', read_only=True)
    
    class Meta:
        model = HistoriqueSalarie
        fields = [
            'id', 'salarie', 'service_ancien', 'service_ancien_nom',
            'service_nouveau', 'service_nouveau_nom', 'grade_ancien',
            'grade_ancien_nom', 'grade_nouveau', 'grade_nouveau_nom',
            'date_changement', 'motif', 'description'
        ]

# ============================================
# 🎯 SERIALIZER SALARIÉ DÉTAIL (À JOUR)
# ============================================
class SalarieDetailSerializer(serializers.ModelSerializer):
    """
    Serializer COMPLET pour détail salarié avec toutes infos
    INCLUT les équipements affectés
    """
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    societe_nom = serializers.CharField(source='societe.nom', read_only=True)
    responsable_nom = serializers.SerializerMethodField(read_only=True)
    creneau_nom = serializers.CharField(source='creneau_travail.nom', read_only=True)
    departements_list = serializers.SerializerMethodField(read_only=True)
    anciennete = serializers.SerializerMethodField(read_only=True)
    statut_actuel = serializers.SerializerMethodField(read_only=True)
    jour_mois_naissance = serializers.CharField(read_only=True)
    
    # 🎯 AJOUT DU CHAMP ÉQUIPEMENTS
    equipements = EquipementInstanceSerializer(many=True, read_only=True)
    
    acces_applicatif = AccesApplicationSerializer(many=True, read_only=True)
    acces_locaux = AccesSalarieSerializer(many=True, read_only=True)
    historique = HistoriqueSalarieSerializer(many=True, read_only=True)
    horaires_supplementaires = HoraireSalarieSerializer(many=True, read_only=True)

    class Meta:
        model = Salarie
        fields = [
            'id', 'user', 'nom', 'prenom', 'matricule', 'genre',
            'date_naissance', 'jour_mois_naissance', 'telephone',
            'mail_professionnel', 'telephone_professionnel', 'extension_3cx', 'photo',
            'societe', 'societe_nom',
            'service', 'service_nom',
            'grade', 'grade_nom',
            'responsable_direct', 'responsable_nom',
            'poste',
            'departements', 'departements_list',
            'circuit',
            'date_embauche', 'anciennete',
            'statut', 'date_sortie', 'en_poste',
            'creneau_travail', 'creneau_nom',
            'statut_actuel',
            'equipements',  # 🎯 NOUVEAU CHAMP
            'acces_applicatif', 'acces_locaux',
            'historique', 'horaires_supplementaires',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification', 'anciennete', 'statut_actuel']

    def get_responsable_nom(self, obj):
        if obj.responsable_direct:
            return f"{obj.responsable_direct.prenom} {obj.responsable_direct.nom}"
        return None

    def get_anciennete(self, obj):
        return obj.get_anciennete()

    def get_statut_actuel(self, obj):
        return obj.get_statut_actuel()

    def get_departements_list(self, obj):
        """Retourne la liste des départements (numéro + nom)"""
        return [f"{d.numero} - {d.nom}" for d in obj.departements.all()]

# ============================================
# SERIALIZER SALARIÉ LISTE
# ============================================
class SalarieListSerializer(serializers.ModelSerializer):
    """
    Serializer SIMPLE pour liste salariés (infos limitées)
    """
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    jour_mois_naissance = serializers.CharField(read_only=True)
    statut_actuel = serializers.SerializerMethodField(read_only=True)
    anciennete = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Salarie
        fields = [
            'id', 'matricule', 'nom', 'prenom', 'genre', 'jour_mois_naissance',
            'date_naissance', 'telephone',
            'service', 'service_nom', 'grade', 'grade_nom', 'poste',
            'mail_professionnel', 'telephone_professionnel', 'extension_3cx', 'photo',
            'societe',
            'responsable_direct',  # ✅
            'departements',        # ✅
            'creneau_travail',
            'circuit',
            'statut', 'anciennete', 'statut_actuel', 'date_embauche',
            'en_poste',
            'date_creation', 'date_modification'
]

    
    def get_anciennete(self, obj):
        return obj.get_anciennete()
    
    def get_statut_actuel(self, obj):
        return obj.get_statut_actuel()

# ============================================
# SERIALIZER SOLDE CONGÉ
# ============================================
class SoldeCongeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.CharField(source='salarie.matricule', read_only=True)
    
    class Meta:
        model = SoldeConge
        fields = [
            'id', 'salarie', 'salarie_info', 'conges_acquis',
            'conges_utilises', 'conges_restants', 'date_derniere_maj'
        ]
        read_only_fields = ['date_derniere_maj']

# ============================================
# SERIALIZER DEMANDE CONGÉ
# ============================================
class DemandeCongeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemandeConge
        fields = [
            'id', 'salarie', 'salarie_info', 'type_conge', 'date_debut',
            'date_fin', 'nombre_jours', 'motif', 'statut', 'statut_display',
            'valide_par_direct', 'date_validation_direct', 'commentaire_direct',
            'valide_par_service', 'date_validation_service', 'commentaire_service',
            'rejete', 'date_rejet', 'motif_rejet', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"

# ============================================
# SERIALIZER DEMANDE ACOMPTE
# ============================================
class DemandeAcompteSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = DemandeAcompte
        fields = [
            'id', 'salarie', 'salarie_info', 'montant', 'motif', 'date_demande',
            'statut', 'valide_par_direct', 'date_validation_direct',
            'valide_par_service', 'date_validation_service', 'date_paiement'
        ]
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"

# ============================================
# SERIALIZER DEMANDE SORTIE
# ============================================
class DemandeSortieSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = DemandeSortie
        fields = [
            'id', 'salarie', 'salarie_info', 'date_sortie', 'heure_debut',
            'heure_fin', 'motif', 'statut', 'valide_par_direct',
            'date_validation_direct', 'valide_par_service', 'date_validation_service'
        ]
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"

# ============================================
# SERIALIZER TRAVAUX EXCEPTIONNELS
# ============================================
class TravauxExceptionnelsSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = TravauxExceptionnels
        fields = [
            'id', 'salarie', 'salarie_info', 'date_travail', 'heure_debut',
            'heure_fin', 'nombre_heures', 'description_travail', 'statut',
            'valide_par_direct', 'date_validation_direct', 'valide_par_service',
            'date_validation_service', 'date_creation'
        ]
        read_only_fields = ['date_creation']
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"

# ============================================
# SERIALIZER DOCUMENT SALARIÉ
# ============================================
class DocumentSalarieSerializer(serializers.ModelSerializer):
    """
    Serializer pour documents avec visibilité par rôle
    """
    salarie_info = serializers.SerializerMethodField(read_only=True)
    type_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentSalarie
        fields = [
            'id', 'salarie', 'salarie_info', 'type_document', 'type_display',
            'titre', 'description', 'fichier', 'date_document', 'date_upload',
            'accessible_par_salarie', 'accessible_par_admin', 'accessible_par_rh',
            'accessible_par_daf', 'accessible_par_comptable'
        ]
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"

# ============================================
# SERIALIZER OUTIL FICHE POSTE
# ============================================
class OutilFichePosteSerializer(serializers.ModelSerializer):
    outil_nom = serializers.CharField(source='outil_travail.nom', read_only=True)
    
    class Meta:
        model = OutilFichePoste
        fields = ['id', 'fiche_poste', 'outil_travail', 'outil_nom', 'obligatoire']

# ============================================
# SERIALIZER AMÉLIORATION PROPOSÉE
# ============================================
class AmeliorationProposeeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    examinee_par_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = AmeliorationProposee
        fields = [
            'id', 'fiche_poste', 'salarie_proposant', 'salarie_info', 'titre',
            'description', 'raison', 'statut', 'date_proposition', 'date_examen',
            'examinee_par', 'examinee_par_info', 'priorite', 'responsables', 'deadline'
        ]
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie_proposant.prenom} {obj.salarie_proposant.nom}"
    
    def get_examinee_par_info(self, obj):
        if obj.examinee_par:
            return obj.examinee_par.get_full_name()
        return None

# ============================================
# SERIALIZER FICHE POSTE DÉTAIL
# ============================================
from rest_framework import serializers
from .models import FichePoste

class FichePosteDetailSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    responsable_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FichePoste
        fields = '__all__'
    
    def get_responsable_info(self, obj):
        if obj.responsable_service:
            return f"{obj.responsable_service.prenom} {obj.responsable_service.nom}"
        return None


# ============================================
# SERIALIZER FICHE PARAMÈTRES USER
# ============================================
class FicheParametresUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FicheParametresUser
        fields = [
            'id', 'user', 'username', 'theme', 'langue', 'notifications_actives',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']

# ============================================
# SERIALIZER RÔLE
# ============================================
class RoleSerializer(serializers.ModelSerializer):
    nom_display = serializers.CharField(source='get_nom_display', read_only=True)
    
    class Meta:
        model = Role
        fields = [
            'id', 'nom', 'nom_display', 'description', 'can_view_salaries',
            'can_edit_salaries', 'can_validate_requests', 'can_view_financial',
            'can_edit_financial', 'can_manage_it', 'date_creation'
        ]
        read_only_fields = ['date_creation']

# ============================================
# SERIALIZER IMPORT LOG
# ============================================
class ImportLogSerializer(serializers.ModelSerializer):
    """
    Sérializer pour les logs d'import
    """
    cree_par_username = serializers.CharField(source='cree_par.username', read_only=True, allow_null=True)
    taux_succes = serializers.SerializerMethodField()
    
    class Meta:
        model = ImportLog
        fields = [
            'id', 'api_name', 'fichier_nom', 'total_lignes', 'lignes_succes',
            'lignes_erreur', 'statut', 'taux_succes', 'details_erreurs',
            'cree_par', 'cree_par_username', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'taux_succes']
    
    def get_taux_succes(self, obj):
        """
        Calcule et retourne le taux de succès en %
        """
        return obj.get_taux_succes()
# Dans serializers.py - Ajoute cette nouvelle serializer

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Salarie, Role

class UserMeSerializer(serializers.ModelSerializer):
    """Serializer pour l'endpoint /api/me/"""
    
    role = serializers.SerializerMethodField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    service = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'role', 'permissions', 'service', 'department'
        ]
    
    def get_role(self, obj):
        """Détermine le rôle de l'utilisateur"""
        # Si admin
        if obj.is_staff:
            return 'admin'
        
        # Récupère les rôles de l'utilisateur
        roles = obj.roles.values_list('nom', flat=True) if hasattr(obj, 'roles') else []
        
        # Mappe vers le rôle principal
        if 'rh' in roles:
            return 'hr_manager'
        if 'it' in roles:
            return 'it_manager'
        if 'daf' in roles or 'comptable' in roles:
            return 'director'
        if 'responsable_service' in roles:
            return 'team_lead'
        
        # Sinon c'est un employé
        if hasattr(obj, 'profil_salarie'):
            return 'employee'
        
        return 'employee'
    
    def get_permissions(self, obj):
        """Retourne les permissions de l'utilisateur"""
        # À adapter selon ta logique de permissions
        return []
    
    def get_service(self, obj):
        """Retourne le service de l'utilisateur"""
        try:
            if hasattr(obj, 'profil_salarie'):
                return obj.profil_salarie.service.id
        except:
            pass
        return None
    
    def get_department(self, obj):
        """Retourne le département de l'utilisateur"""
        try:
            if hasattr(obj, 'profil_salarie'):
                return obj.profil_salarie.departement.id
        except:
            pass
        return None
# À la FIN de serializers.py

class UserMeSerializer(serializers.ModelSerializer):
    """Serializer pour l'endpoint /api/me/"""
    
    role = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'username',
            'role', 'is_admin', 'permissions', 
            'service', 'service_name',
            'department', 'department_name'
        ]
    
    def get_role(self, obj):
        """Détermine le rôle principal de l'utilisateur"""
        # ✅ Admin en priorité
        if obj.is_staff:
            return 'admin'
        
        # ✅ Récupère les rôles via ManyToMany
        roles_list = list(obj.roles.values_list('nom', flat=True))
        
        # ✅ Mappe vers rôle unique (priorité)
        if 'rh' in roles_list:
            return 'hr_manager'
        if 'it' in roles_list:
            return 'it_manager'
        if 'daf' in roles_list:
            return 'director'
        if 'comptable' in roles_list:
            return 'comptable'
        if 'responsable_service' in roles_list:
            return 'team_lead'
        
        # ✅ Vérifie si c'est un salarié
        if hasattr(obj, 'profil_salarie') and obj.profil_salarie:
            return 'employee'
        
        return 'guest'
    
    def get_is_admin(self, obj):
        """Retourne True si l'utilisateur est admin"""
        return obj.is_staff or obj.roles.filter(nom='admin').exists()
    
    def get_permissions(self, obj):
        """Retourne la liste des permissions de l'utilisateur"""
        permissions = []
        
        if obj.is_staff:
            return [
                'can_view_salaries', 'can_edit_salaries',
                'can_validate_requests', 'can_view_financial',
                'can_edit_financial', 'can_manage_it', 'can_manage_documents'
            ]
        
        # Récupère les rôles
        roles = obj.roles.all()
        
        # Construit les permissions selon les rôles
        for role in roles:
            if role.nom == 'rh':
                permissions.extend(['can_view_salaries', 'can_edit_salaries', 'can_validate_requests', 'can_manage_documents'])
            elif role.nom == 'it':
                permissions.append('can_manage_it')
            elif role.nom == 'daf':
                permissions.extend(['can_view_financial', 'can_view_salaries'])
            elif role.nom == 'comptable':
                permissions.extend(['can_view_financial', 'can_view_salaries'])
            elif role.nom == 'responsable_service':
                permissions.extend(['can_validate_requests', 'can_view_salaries'])
        
        # Enlève les doublons
        return list(set(permissions))
    
    def get_service(self, obj):
        """Retourne l'ID du service de l'utilisateur"""
        try:
            if hasattr(obj, 'profil_salarie') and obj.profil_salarie:
                return obj.profil_salarie.service.id
        except:
            pass
        return None
    
    def get_service_name(self, obj):
        """Retourne le nom du service"""
        try:
            if hasattr(obj, 'profil_salarie') and obj.profil_salarie:
                return obj.profil_salarie.service.nom
        except:
            pass
        return None
    
    def get_department(self, obj):
        """Retourne le département (premier si plusieurs)"""
        try:
            if hasattr(obj, 'profil_salarie') and obj.profil_salarie:
                depts = obj.profil_salarie.departements.all()
                if depts:
                    return depts[0].id
        except:
            pass
        return None
    
    def get_department_name(self, obj):
        """Retourne le nom du département"""
        try:
            if hasattr(obj, 'profil_salarie') and obj.profil_salarie:
                depts = obj.profil_salarie.departements.all()
                if depts:
                    first_dept = depts[0]
                    return f"{first_dept.numero} - {first_dept.nom}"
        except:
            pass
        return None