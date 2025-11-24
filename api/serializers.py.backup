from rest_framework import serializers
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser
)

# ============================================================================
# SERIALIZERS DE BASE
# ============================================================================

class SocieteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Societe
        fields = ('id', 'nom', 'email', 'telephone', 'adresse', 'ville', 'code_postal', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ('id', 'nom', 'societe', 'description', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ('id', 'intitule', 'societe', 'description', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = ('id', 'numero', 'nom', 'description', 'actif', 'date_creation')
        read_only_fields = ('date_creation',)


class TypeAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeAcces
        fields = ('id', 'nom', 'societe', 'description', 'date_creation')
        read_only_fields = ('date_creation',)


class OutilTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutilTravail
        fields = ('id', 'nom', 'categorie', 'description', 'url_acces', 'date_creation')
        read_only_fields = ('date_creation',)


class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = ('id', 'nom', 'type_equipement', 'numero_serie', 'marque', 'modele', 'description', 'date_creation')
        read_only_fields = ('date_creation',)


# ============================================================================
# SERIALIZERS POUR SALARIES
# ============================================================================

class SalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Salarie
        fields = (
            'id', 'prenom', 'nom', 'email_professionnel', 'email_personnel',
            'telephone_professionnel', 'telephone_personnel', 'numero_professionnel',
            'date_embauche', 'date_sortie', 'societe', 'service', 'grade',
            'statut', 'genre', 'adresse', 'actif', 'date_creation'
        )
        read_only_fields = ('date_creation',)


class EquipementInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipementInstance
        fields = ('id', 'nom', 'equipement', 'salarié', 'etat', 'date_attribution', 'date_fin', 'notes')
        read_only_fields = ('date_attribution',)


class HistoriqueSalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueSalarie
        fields = ('id', 'salarié', 'type_modification', 'description', 'date_modification', 'utilisateur')
        read_only_fields = ('date_modification',)


class DocumentSalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentSalarie
        fields = ('id', 'salarié', 'type_document', 'nom', 'date_creation', 'notes')
        read_only_fields = ('date_creation',)


# ============================================================================
# SERIALIZERS POUR HORAIRES & CONGES
# ============================================================================

class CreneauTravailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreneauTravail
        fields = ('id', 'nom', 'heure_debut', 'heure_fin', 'description')


class HoraireSalarieSerializer(serializers.ModelSerializer):
    creneaux = CreneauTravailSerializer(many=True, read_only=True)

    class Meta:
        model = HoraireSalarie
        fields = ('id', 'salarié', 'type_horaire', 'creneaux', 'date_debut', 'date_fin', 'notes')
        read_only_fields = ('date_debut',)


class DemandeCongeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandeConge
        fields = ('id', 'salarié', 'date_debut', 'date_fin', 'statut', 'motif', 'date_demande', 'date_decision')
        read_only_fields = ('date_demande',)


class SoldeCongeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoldeConge
        fields = ('id', 'salarié', 'annee', 'jours_acquis', 'jours_utilises', 'jours_restants', 'date_maj')
        read_only_fields = ('date_maj',)


# ============================================================================
# SERIALIZERS POUR ACCES & AUTORISATIONS
# ============================================================================

class AccesSalarieSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccesSalarie
        fields = ('id', 'salarié', 'outil', 'type_acces', 'date_debut', 'date_fin', 'notes', 'date_creation')
        read_only_fields = ('date_debut', 'date_creation')


class TypeApplicationAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeApplicationAcces
        fields = ('id', 'nom', 'categorie', 'description', 'date_creation')
        read_only_fields = ('date_creation',)


class AccesApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccesApplication
        fields = ('id', 'salarié', 'application', 'date_debut', 'date_fin', 'notes')
        read_only_fields = ('date_debut',)


class FicheParametresUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = FicheParametresUser
        fields = ('id', 'salarié', 'theme_couleur', 'langue', 'notifications_activees', 'date_creation', 'date_modification')
        read_only_fields = ('date_creation', 'date_modification')


# ============================================================================
# SERIALIZERS POUR FICHES DE POSTE
# ============================================================================

class FichePosteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FichePoste
        fields = (
            'id', 'titre', 'service', 'grade', 'description',
            'competences_requises', 'responsabilites', 'salaire_min', 'salaire_max', 'date_creation'
        )
        read_only_fields = ('date_creation',)


class OutilFichePosteSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutilFichePoste
        fields = ('id', 'fiche_poste', 'outil_travail', 'type_acces_requis', 'date_creation')
        read_only_fields = ('date_creation',)


# ============================================================================
# SERIALIZERS POUR AMELIORATIONS & TRAVAUX EXCEPTIONNELS
# ============================================================================

class AmeliorationProposeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmeliorationProposee
        fields = (
            'id', 'titre', 'fiche_poste', 'salarié', 'description',
            'priorite', 'statut_projet', 'date_proposition', 'date_implementation'
        )
        read_only_fields = ('date_proposition',)


class TravauxExceptionnelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravauxExceptionnels
        fields = ('id', 'salarié', 'date_travail', 'heures', 'type_travail', 'statut', 'notes', 'date_creation')
        read_only_fields = ('date_creation',)


# ============================================================================
# NESTED SERIALIZERS (POUR LISTES DETAILLEES)
# ============================================================================

class SalarieDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un salarié avec toutes ses informations"""
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_intitule = serializers.CharField(source='grade.intitule', read_only=True)
    societe_nom = serializers.CharField(source='societe.nom', read_only=True)
    equipements = EquipementInstanceSerializer(read_only=True, many=True)
    historique = HistoriqueSalarieSerializer(read_only=True, many=True)
    acces_outils = AccesSalarieSerializer(read_only=True, many=True)

    class Meta:
        model = Salarie
        fields = (
            'id', 'prenom', 'nom', 'email_professionnel', 'email_personnel',
            'telephone_professionnel', 'telephone_personnel', 'numero_professionnel',
            'date_embauche', 'date_sortie', 'societe', 'societe_nom', 'service',
            'service_nom', 'grade', 'grade_intitule', 'statut', 'genre', 'adresse',
            'actif', 'equipements', 'historique', 'acces_outils', 'date_creation'
        )
        read_only_fields = ('date_creation', 'service_nom', 'grade_intitule', 'societe_nom', 'equipements', 'historique', 'acces_outils')


class ServiceDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un service"""
    societe_nom = serializers.CharField(source='societe.nom', read_only=True)
    salaries = SalarieSerializer(source='salaries.all', read_only=True, many=True)

    class Meta:
        model = Service
        fields = ('id', 'nom', 'societe', 'societe_nom', 'description', 'actif', 'salaries', 'date_creation')
        read_only_fields = ('date_creation', 'societe_nom', 'salaries')


class FichePosteDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour une fiche de poste"""
    service_nom = serializers.CharField(source='service.nom', read_only=True)
    grade_intitule = serializers.CharField(source='grade.intitule', read_only=True)
    outils = OutilFichePosteSerializer(read_only=True, many=True)

    class Meta:
        model = FichePoste
        fields = (
            'id', 'titre', 'service', 'service_nom', 'grade', 'grade_intitule',
            'description', 'competences_requises', 'responsabilites', 'salaire_min',
            'salaire_max', 'outils', 'date_creation'
        )
        read_only_fields = ('date_creation', 'service_nom', 'grade_intitule', 'outils')
