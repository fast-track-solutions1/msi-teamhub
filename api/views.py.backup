from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser
)
from .serializers import (
    SocieteSerializer, ServiceSerializer, GradeSerializer, DepartementSerializer,
    TypeAccesSerializer, OutilTravailSerializer, EquipementSerializer,
    SalarieSerializer, EquipementInstanceSerializer, HistoriqueSalarieSerializer,
    DocumentSalarieSerializer, CreneauTravailSerializer, HoraireSalarieSerializer,
    DemandeCongeSerializer, SoldeCongeSerializer, AccesSalarieSerializer,
    TypeApplicationAccesSerializer, AccesApplicationSerializer, FicheParametresUserSerializer,
    FichePosteSerializer, OutilFichePosteSerializer, AmeliorationProposeeSerializer,
    TravauxExceptionnelsSerializer, SalarieDetailSerializer, ServiceDetailSerializer,
    FichePosteDetailSerializer
)

# ============================================================================
# VIEWSETS DE BASE
# ============================================================================

class SocieteViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les sociétés"""
    queryset = Societe.objects.all()
    serializer_class = SocieteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['actif']
    search_fields = ['nom', 'email', 'ville']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']

    @action(detail=False, methods=['get'])
    def actives(self, request):
        """Récupère les sociétés actives"""
        societes = self.queryset.filter(actif=True)
        serializer = self.get_serializer(societes, many=True)
        return Response(serializer.data)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les services"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom', 'societe__nom']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']


class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'actif']
    search_fields = ['intitule', 'societe__nom']
    ordering_fields = ['intitule', 'date_creation']
    ordering = ['intitule']


class DepartementViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les départements"""
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['actif']
    search_fields = ['numero', 'nom']
    ordering_fields = ['numero', 'date_creation']
    ordering = ['numero']


class TypeAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les types d'accès"""
    queryset = TypeAcces.objects.all()
    serializer_class = TypeAccesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['societe']
    search_fields = ['nom', 'societe__nom']


class OutilTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les outils de travail"""
    queryset = OutilTravail.objects.all()
    serializer_class = OutilTravailSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['categorie']
    search_fields = ['nom', 'categorie']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']


class EquipementViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les équipements"""
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type_equipement', 'marque']
    search_fields = ['nom', 'numero_serie', 'marque', 'modele']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']


# ============================================================================
# VIEWSETS POUR SALARIES
# ============================================================================

class SalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les salariés"""
    queryset = Salarie.objects.all()
    serializer_class = SalarieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'service', 'grade', 'statut', 'actif']
    search_fields = ['prenom', 'nom', 'email_professionnel', 'numero_professionnel']
    ordering_fields = ['prenom', 'nom', 'date_embauche', 'date_creation']
    ordering = ['prenom', 'nom']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SalarieDetailSerializer
        return SalarieSerializer

    @action(detail=False, methods=['get'])
    def actifs(self, request):
        """Récupère les salariés actifs"""
        salaries = self.queryset.filter(actif=True)
        serializer = self.get_serializer(salaries, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def acces(self, request, pk=None):
        """Récupère tous les accès d'un salarié"""
        salarie = self.get_object()
        acces = AccesSalarie.objects.filter(salarié=salarie)
        serializer = AccesSalarieSerializer(acces, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def equipements(self, request, pk=None):
        """Récupère tous les équipements d'un salarié"""
        salarie = self.get_object()
        equipements = EquipementInstance.objects.filter(salarié=salarie)
        serializer = EquipementInstanceSerializer(equipements, many=True)
        return Response(serializer.data)


class EquipementInstanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les instances d'équipement"""
    queryset = EquipementInstance.objects.all()
    serializer_class = EquipementInstanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarié', 'equipement', 'etat']
    search_fields = ['nom', 'salarié__prenom', 'salarié__nom']
    ordering_fields = ['date_attribution', 'etat']
    ordering = ['-date_attribution']


class HistoriqueSalarieViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter l'historique des salariés"""
    queryset = HistoriqueSalarie.objects.all()
    serializer_class = HistoriqueSalarieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['salarié', 'type_modification']
    ordering_fields = ['date_modification']
    ordering = ['-date_modification']


class DocumentSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les documents des salariés"""
    queryset = DocumentSalarie.objects.all()
    serializer_class = DocumentSalarieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarié', 'type_document']
    search_fields = ['nom', 'salarié__prenom', 'salarié__nom']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']


# ============================================================================
# VIEWSETS POUR HORAIRES & CONGES
# ============================================================================

class CreneauTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les créneaux de travail"""
    queryset = CreneauTravail.objects.all()
    serializer_class = CreneauTravailSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['nom']
    ordering_fields = ['heure_debut', 'heure_fin']
    ordering = ['heure_debut']


class HoraireSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les horaires des salariés"""
    queryset = HoraireSalarie.objects.all()
    serializer_class = HoraireSalarieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['salarié', 'type_horaire']
    ordering_fields = ['date_debut', 'date_fin']
    ordering = ['-date_debut']


class DemandeCongeViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les demandes de congés"""
    queryset = DemandeConge.objects.all()
    serializer_class = DemandeCongeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['salarié', 'statut']
    ordering_fields = ['date_debut', 'date_demande']
    ordering = ['-date_demande']

    @action(detail=False, methods=['get'])
    def en_attente(self, request):
        """Récupère les demandes en attente"""
        demandes = self.queryset.filter(statut='PENDING')
        serializer = self.get_serializer(demandes, many=True)
        return Response(serializer.data)


class SoldeCongeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter les soldes de congés"""
    queryset = SoldeConge.objects.all()
    serializer_class = SoldeCongeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['salarié', 'annee']
    ordering_fields = ['annee']
    ordering = ['-annee']


# ============================================================================
# VIEWSETS POUR ACCES & AUTORISATIONS
# ============================================================================

class AccesSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les accès des salariés"""
    queryset = AccesSalarie.objects.all()
    serializer_class = AccesSalarieSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarié', 'outil', 'type_acces']
    search_fields = ['salarié__prenom', 'salarié__nom', 'outil__nom']
    ordering_fields = ['date_debut', 'date_fin']
    ordering = ['-date_debut']


class TypeApplicationAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les types d'applications"""
    queryset = TypeApplicationAcces.objects.all()
    serializer_class = TypeApplicationAccesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['categorie']
    search_fields = ['nom', 'categorie']


class AccesApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les accès aux applications"""
    queryset = AccesApplication.objects.all()
    serializer_class = AccesApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['salarié', 'application']
    ordering_fields = ['date_debut', 'date_fin']
    ordering = ['-date_debut']


class FicheParametresUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les paramètres utilisateurs"""
    queryset = FicheParametresUser.objects.all()
    serializer_class = FicheParametresUserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['salarié', 'theme_couleur', 'langue']

    @action(detail=False, methods=['get'])
    def mon_profil(self, request):
        """Récupère les paramètres de l'utilisateur connecté"""
        try:
            parametres = FicheParametresUser.objects.get(salarié__user=request.user)
            serializer = self.get_serializer(parametres)
            return Response(serializer.data)
        except FicheParametresUser.DoesNotExist:
            return Response({'detail': 'Paramètres non trouvés'}, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# VIEWSETS POUR FICHES DE POSTE
# ============================================================================

class FichePosteViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les fiches de poste"""
    queryset = FichePoste.objects.all()
    serializer_class = FichePosteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['service', 'grade']
    search_fields = ['titre', 'service__nom', 'grade__intitule']
    ordering_fields = ['titre', 'date_creation']
    ordering = ['titre']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FichePosteDetailSerializer
        return FichePosteSerializer


class OutilFichePosteViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les outils des fiches de poste"""
    queryset = OutilFichePoste.objects.all()
    serializer_class = OutilFichePosteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['fiche_poste', 'outil_travail']


# ============================================================================
# VIEWSETS POUR AMELIORATIONS & TRAVAUX EXCEPTIONNELS
# ============================================================================

class AmeliorationProposeeViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les améliorations proposées"""
    queryset = AmeliorationProposee.objects.all()
    serializer_class = AmeliorationProposeeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarié', 'fiche_poste', 'statut_projet', 'priorite']
    search_fields = ['titre', 'description', 'salarié__prenom', 'salarié__nom']
    ordering_fields = ['priorite', 'date_proposition', 'date_implementation']
    ordering = ['-priorite', '-date_proposition']

    @action(detail=False, methods=['get'])
    def approuvees(self, request):
        """Récupère les améliorations approuvées"""
        ameliorations = self.queryset.filter(statut_projet='APPROUVEE')
        serializer = self.get_serializer(ameliorations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def implementees(self, request):
        """Récupère les améliorations implémentées"""
        ameliorations = self.queryset.filter(statut_projet='IMPLEMENTEE')
        serializer = self.get_serializer(ameliorations, many=True)
        return Response(serializer.data)


class TravauxExceptionnelsViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les travaux exceptionnels"""
    queryset = TravauxExceptionnels.objects.all()
    serializer_class = TravauxExceptionnelsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['salarié', 'type_travail', 'statut']
    search_fields = ['salarié__prenom', 'salarié__nom', 'type_travail']
    ordering_fields = ['date_travail', 'heures', 'statut']
    ordering = ['-date_travail']

    @action(detail=False, methods=['get'])
    def non_compenses(self, request):
        """Récupère les travaux non compensés"""
        travaux = self.queryset.exclude(statut='COMPENSATED')
        serializer = self.get_serializer(travaux, many=True)
        return Response(serializer.data)
