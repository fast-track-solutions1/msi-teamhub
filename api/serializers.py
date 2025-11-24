from rest_framework import serializers
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role, 
    DemandeAcompte, DemandeSortie
)
from django.contrib.auth.models import User
from datetime import date

# ============================================================================
# SERIALIZERS DE BASE - PARAMÉTRAGES
# ============================================================================

class SocieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Societe
        fields = ('id', 'nom', 'email', 'telephone', 'adresse', 'ville', 
                  'code_postal', 'activite', 'clients', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class CircuitSerializer(serializers.ModelSerializer):
    departement_nom = serializers.CharField(source='departement.nom', read_only=True)
    
    class Meta:
        model = Circuit
        fields = ('id', 'nom', 'departement', 'departement_nom', 'description', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class DepartementSerializer(serializers.ModelSerializer):
    circuits = CircuitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Departement
        fields = ('id', 'numero', 'nom', 'region', 'societe', 'circuits', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class ServiceSerializer(serializers.ModelSerializer):
    responsable_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Service
        fields = ('id', 'nom', 'societe', 'description', 'responsable', 
                  'responsable_info', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)
    
    def get_responsable_info(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ('id', 'nom', 'societe', 'ordre', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class TypeAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeAcces
        fields = ('id', 'nom', 'description', 'actif')


class OutilTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutilTravail
        fields = ('id', 'nom', 'description', 'actif')


class CreneauTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreneauTravail
        fields = ('id', 'nom', 'societe', 'heure_debut', 'heure_fin', 
                  'heure_pause_debut', 'heure_pause_fin', 'description', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = ('id', 'nom', 'type_equipement', 'description', 'stock_total', 
                  'stock_disponible', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class TypeApplicationAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeApplicationAcces
        fields = ('id', 'nom', 'description', 'actif')


# ============================================================================
# SERIALIZERS SALARIÉ
# ============================================================================

class EquipementInstanceSerializer(serializers.ModelSerializer):
    equipement_nom = serializers.CharField(source='equipement.nom', read_only=True)
    
    class Meta:
        model = EquipementInstance
        fields = ('id', 'equipement', 'equipement_nom', 'model', 'numero_serie', 
                  'salarie', 'date_affectation', 'date_retrait', 'etat', 'notes', 'date_creation')
        read_only_fields = ('date_creation',)


class AccesApplicationSerializer(serializers.ModelSerializer):
    application_display = serializers.CharField(source='get_type_application_display', read_only=True)
    
    class Meta:
        model = AccesApplication
        fields = ('id', 'salarie', 'type_application', 'application_display',
                  'application', 'identifiant', 'mot_de_passe', 'url', 
                  'date_debut', 'date_fin', 'notes')


class AccesSalarieSerializer(serializers.ModelSerializer):
    type_acces_nom = serializers.CharField(source='type_acces.nom', read_only=True)
    
    class Meta:
        model = AccesSalarie
        fields = ('id', 'salarie', 'type_acces', 'type_acces_nom', 
                  'description', 'date_debut', 'date_fin')


class HoraireSalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = HoraireSalarie
        fields = ('id', 'salarie', 'date_debut', 'date_fin', 'heure_debut', 
                  'heure_fin', 'heure_pause_debut', 'heure_pause_fin', 'motif', 'date_creation')
        read_only_fields = ('date_creation',)


class HistoriqueSalarieSerializer(serializers.ModelSerializer):
    service_ancien_nom = serializers.CharField(source='service_ancien.nom', read_only=True)
    service_nouveau_nom = serializers.CharField(source='service_nouveau.nom', read_only=True)
    grade_ancien_nom = serializers.CharField(source='grade_ancien.nom', read_only=True)
    grade_nouveau_nom = serializers.CharField(source='grade_nouveau.nom', read_only=True)
    
    class Meta:
        model = HistoriqueSalarie
        fields = ('id', 'salarie', 'service_ancien', 'service_ancien_nom', 
                  'service_nouveau', 'service_nouveau_nom',
                  'grade_ancien', 'grade_ancien_nom', 'grade_nouveau', 'grade_nouveau_nom',
                  'date_changement', 'motif', 'description')


class SalarieDetailSerializer(serializers.ModelSerializer):
    """Serializer COMPLET pour détail salarié (avec toutes infos)"""
    
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    societe_nom = serializers.CharField(source='societe.nom', read_only=True)
    responsable_nom = serializers.SerializerMethodField(read_only=True)
    creneau_nom = serializers.CharField(source='creneau_travail.nom', read_only=True)
    departement_num = serializers.CharField(source='departement.numero', read_only=True)
    
    anciennete = serializers.SerializerMethodField(read_only=True)
    statut_actuel = serializers.SerializerMethodField(read_only=True)
    jour_mois_naissance = serializers.CharField(read_only=True)
    
    equipements = EquipementInstanceSerializer(source='equipements', many=True, read_only=True)
    acces_applicatif = AccesApplicationSerializer(source='acces_applicatif', many=True, read_only=True)
    acces_locaux = AccesSalarieSerializer(source='acces_locaux', many=True, read_only=True)
    historique = HistoriqueSalarieSerializer(source='historique', many=True, read_only=True)
    horaires_supplementaires = HoraireSalarieSerializer(source='horaires_supplementaires', many=True, read_only=True)
    
    class Meta:
        model = Salarie
        fields = (
            'id', 'user', 'nom', 'prenom', 'matricule', 'genre', 
            'date_naissance', 'jour_mois_naissance',
            'telephone', 'mail_professionnel', 'telephone_professionnel', 'extension_3cx',
            'societe', 'societe_nom', 'service', 'service_nom', 'grade', 'grade_nom',
            'responsable_direct', 'responsable_nom', 'poste',
            'departement', 'departement_num', 'circuit',
            'date_embauche', 'anciennete', 'statut', 'date_sortie', 'en_poste',
            'creneau_travail', 'creneau_nom', 'statut_actuel',
            'equipements', 'acces_applicatif', 'acces_locaux', 
            'historique', 'horaires_supplementaires',
            'date_creation', 'date_modification'
        )
        read_only_fields = ('date_creation', 'date_modification', 'anciennete', 'statut_actuel')
    
    def get_responsable_nom(self, obj):
        if obj.responsable_direct:
            return f"{obj.responsable_direct.prenom} {obj.responsable_direct.nom}"
        return None
    
    def get_anciennete(self, obj):
        return obj.get_anciennete()
    
    def get_statut_actuel(self, obj):
        return obj.get_statut_actuel()


class SalarieListSerializer(serializers.ModelSerializer):
    """Serializer SIMPLE pour liste salariés (infos limitées)"""
    
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    jour_mois_naissance = serializers.CharField(read_only=True)
    statut_actuel = serializers.SerializerMethodField(read_only=True)
    anciennete = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Salarie
        fields = (
            'id', 'matricule', 'nom', 'prenom', 'genre', 'jour_mois_naissance',
            'service', 'service_nom', 'grade', 'grade_nom', 'poste',
            'mail_professionnel', 'telephone_professionnel', 'extension_3cx',
            'statut', 'anciennete', 'statut_actuel', 'date_embauche'
        )
    
    def get_anciennete(self, obj):
        return obj.get_anciennete()
    
    def get_statut_actuel(self, obj):
        return obj.get_statut_actuel()


class SoldeCongeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.CharField(source='salarie.matricule', read_only=True)
    
    class Meta:
        model = SoldeConge
        fields = ('id', 'salarie', 'salarie_info', 'conges_acquis', 
                  'conges_utilises', 'conges_restants', 'date_derniere_maj')
        read_only_fields = ('date_derniere_maj',)


# ============================================================================
# SERIALIZERS DEMANDES
# ============================================================================

class DemandeCongeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = DemandeConge
        fields = (
            'id', 'salarie', 'salarie_info', 'type_conge', 'date_debut', 'date_fin', 
            'nombre_jours', 'motif', 'statut', 'statut_display',
            'valide_par_direct', 'date_validation_direct', 'commentaire_direct',
            'valide_par_service', 'date_validation_service', 'commentaire_service',
            'rejete', 'date_rejet', 'motif_rejet',
            'date_creation', 'date_modification'
        )
        read_only_fields = ('date_creation', 'date_modification')
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"


class DemandeAcompteSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = DemandeAcompte
        fields = (
            'id', 'salarie', 'salarie_info', 'montant', 'motif', 'date_demande',
            'statut', 'valide_par_direct', 'date_validation_direct',
            'valide_par_service', 'date_validation_service',
            'date_paiement'
        )
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"


class DemandeSortieSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = DemandeSortie
        fields = (
            'id', 'salarie', 'salarie_info', 'date_sortie', 'heure_debut', 
            'heure_fin', 'motif', 'statut',
            'valide_par_direct', 'date_validation_direct',
            'valide_par_service', 'date_validation_service'
        )
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"


class TravauxExceptionnelsSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = TravauxExceptionnels
        fields = (
            'id', 'salarie', 'salarie_info', 'date_travail', 'heure_debut', 'heure_fin',
            'nombre_heures', 'description_travail', 'statut',
            'valide_par_direct', 'date_validation_direct',
            'valide_par_service', 'date_validation_service',
            'date_creation'
        )
        read_only_fields = ('date_creation',)
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"


# ============================================================================
# SERIALIZERS DOCUMENTS
# ============================================================================

class DocumentSalarieSerializer(serializers.ModelSerializer):
    """Serializer pour documents avec visibilité par rôle"""
    salarie_info = serializers.SerializerMethodField(read_only=True)
    type_display = serializers.CharField(source='get_type_document_display', read_only=True)
    
    class Meta:
        model = DocumentSalarie
        fields = (
            'id', 'salarie', 'salarie_info', 'type_document', 'type_display',
            'titre', 'description', 'fichier', 'date_document', 'date_upload',
            'accessible_par_salarie', 'accessible_par_admin', 'accessible_par_rh',
            'accessible_par_daf', 'accessible_par_comptable'
        )
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom} ({obj.salarie.matricule})"


# ============================================================================
# SERIALIZERS FICHES DE POSTE
# ============================================================================

class OutilFichePosteSerializer(serializers.ModelSerializer):
    outil_nom = serializers.CharField(source='outil_travail.nom', read_only=True)
    
    class Meta:
        model = OutilFichePoste
        fields = ('id', 'fiche_poste', 'outil_travail', 'outil_nom', 'obligatoire')


class AmeliorationProposeeSerializer(serializers.ModelSerializer):
    salarie_info = serializers.SerializerMethodField(read_only=True)
    examinee_par_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = AmeliorationProposee
        fields = (
            'id', 'fiche_poste', 'salarie_proposant', 'salarie_info',
            'titre', 'description', 'raison', 'statut',
            'date_proposition', 'date_examen', 'examinee_par', 'examinee_par_info',
            'priorite', 'responsables', 'deadline'
        )
    
    def get_salarie_info(self, obj):
        return f"{obj.salarie_proposant.prenom} {obj.salarie_proposant.nom}"
    
    def get_examinee_par_info(self, obj):
        if obj.examinee_par:
            return obj.examinee_par.get_full_name()
        return None


class FichePosteDetailSerializer(serializers.ModelSerializer):
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_nom = serializers.CharField(source='grade.nom', read_only=True)
    responsable_info = serializers.SerializerMethodField(read_only=True)
    outils = OutilFichePosteSerializer(many=True, read_only=True)
    ameliorations = AmeliorationProposeeSerializer(many=True, read_only=True)
    
    class Meta:
        model = FichePoste
        fields = (
            'id', 'titre', 'service', 'service_nom', 'grade', 'grade_nom',
            'responsable_service', 'responsable_info', 'description', 'taches',
            'competences_requises', 'moyens_correction', 'problemes',
            'propositions', 'defauts', 'statut', 'outils', 'ameliorations',
            'date_creation', 'date_modification'
        )
        read_only_fields = ('date_creation', 'date_modification')
    
    def get_responsable_info(self, obj):
        if obj.responsable_service:
            return f"{obj.responsable_service.prenom} {obj.responsable_service.nom}"
        return None


# ============================================================================
# SERIALIZERS PARAMÉTRAGE
# ============================================================================

class FicheParametresUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = FicheParametresUser
        fields = ('id', 'user', 'username', 'theme', 'langue', 
                  'notifications_actives', 'date_creation', 'date_modification')
        read_only_fields = ('date_creation', 'date_modification')


class RoleSerializer(serializers.ModelSerializer):
    nom_display = serializers.CharField(source='get_nom_display', read_only=True)
    
    class Meta:
        model = Role
        fields = (
            'id', 'nom', 'nom_display', 'description',
            'can_view_salaries', 'can_edit_salaries', 'can_validate_requests',
            'can_view_financial', 'can_edit_financial', 'can_manage_it',
            'date_creation'
        )
        read_only_fields = ('date_creation',)
