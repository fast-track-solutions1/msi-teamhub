from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from datetime import datetime, date

from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie
)

from .serializers import (
    SocieteSerializer, ServiceSerializer, GradeSerializer, DepartementSerializer,
    TypeAccesSerializer, OutilTravailSerializer, EquipementSerializer,
    SalarieDetailSerializer, SalarieListSerializer, EquipementInstanceSerializer, 
    HistoriqueSalarieSerializer, DocumentSalarieSerializer, CreneauTravailSerializer,
    HoraireSalarieSerializer, DemandeCongeSerializer, SoldeCongeSerializer,
    AccesSalarieSerializer, TypeApplicationAccesSerializer, AccesApplicationSerializer,
    FicheParametresUserSerializer, CircuitSerializer, RoleSerializer,
    DemandeAcompteSerializer, DemandeSortieSerializer, TravauxExceptionnelsSerializer,
    FichePosteDetailSerializer, AmeliorationProposeeSerializer
)

from .permissions import (
    IsAdmin, IsRH, IsIT, IsDAF, IsComptable, IsResponsableService, IsSalarie,
    CanViewSalaries, CanEditSalaries, CanValidateRequests, CanManageDocuments,
    CanViewOwnData, CanManageEquipment, CanViewFinancial
)

# ============================================================================
# VIEWSETS BASE - PARAMÉTRAGE
# ============================================================================

class SocieteViewSet(viewsets.ModelViewSet):
    """ViewSet pour Societes - Admin seulement"""
    queryset = Societe.objects.all()
    serializer_class = SocieteSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['nom', 'actif']
    search_fields = ['nom', 'email', 'adresse']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']


class DepartementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Departements"""
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['societe', 'numero', 'actif']
    search_fields = ['nom', 'numero', 'region']
    ordering_fields = ['numero', 'nom']
    ordering = ['numero']


class CircuitViewSet(viewsets.ModelViewSet):
    """ViewSet pour Circuits - Nouveau"""
    queryset = Circuit.objects.all()
    serializer_class = CircuitSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['departement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour Services"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']


class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet pour Grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']
    ordering_fields = ['ordre', 'nom']


class TypeAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'accès"""
    queryset = TypeAcces.objects.all()
    serializer_class = TypeAccesSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom']


class OutilTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Outils de travail"""
    queryset = OutilTravail.objects.all()
    serializer_class = OutilTravailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom', 'description']


class CreneauTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Créneaux de travail"""
    queryset = CreneauTravail.objects.all()
    serializer_class = CreneauTravailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']


class EquipementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Équipements"""
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsAuthenticated, CanManageEquipment]
    filterset_fields = ['type_equipement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'type_equipement']


class TypeApplicationAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'applications"""
    queryset = TypeApplicationAcces.objects.all()
    serializer_class = TypeApplicationAccesSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['actif']
    search_fields = ['nom']


# ============================================================================
# VIEWSET SALARIÉ
# ============================================================================

class SalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour Salariés - Avec permissions granulaires"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'service', 'grade', 'statut', 'departement']
    search_fields = ['nom', 'prenom', 'matricule', 'mail_professionnel']
    ordering_fields = ['nom', 'prenom', 'date_embauche', 'date_creation']
    ordering = ['nom', 'prenom']
    
    def get_queryset(self):
        """Filtre les salariés selon le rôle de l'utilisateur"""
        user = self.request.user
        
        if user.is_staff:
            return Salarie.objects.all()
        
        # Salarié voit seulement sa fiche
        if hasattr(user, 'profil_salarie'):
            return Salarie.objects.filter(user=user)
        
        # RH, responsable service voient leurs salariés
        if user.roles.filter(nom__in=['rh', 'responsable_service']).exists():
            return Salarie.objects.all()
        
        # DAF, Comptable voient les salariés
        if user.roles.filter(nom__in=['daf', 'comptable']).exists():
            return Salarie.objects.all()
        
        return Salarie.objects.none()
    
    def get_serializer_class(self):
        """Retourne serializer selon action"""
        if self.action in ['list', 'retrieve']:
            return SalarieDetailSerializer
        return SalarieListSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def ma_fiche(self, request):
        """Endpoint pour voir sa propre fiche"""
        if not hasattr(request.user, 'profil_salarie'):
            return Response({'error': 'Vous n\'avez pas de profil salarié'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = SalarieDetailSerializer(request.user.profil_salarie)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def equipements(self, request, pk=None):
        """Liste équipements du salarié"""
        salarie = self.get_object()
        equipements = EquipementInstance.objects.filter(salarie=salarie)
        serializer = EquipementInstanceSerializer(equipements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def acces_applicatif(self, request, pk=None):
        """Liste accès applicatif"""
        salarie = self.get_object()
        acces = AccesApplication.objects.filter(salarie=salarie)
        serializer = AccesApplicationSerializer(acces, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statut_actuel(self, request, pk=None):
        """Retourne statut en poste/pause"""
        salarie = self.get_object()
        return Response({
            'statut_actuel': salarie.get_statut_actuel(),
            'anciennete': salarie.get_anciennete(),
            'jour_mois_naissance': salarie.jour_mois_naissance
        })
    
    @action(detail=False, methods=['get'])
    def annuaire(self, request):
        """Liste complète pour annuaire (infos publiques)"""
        salaries = self.get_queryset().filter(statut='actif')
        serializer = SalarieListSerializer(salaries, many=True)
        return Response(serializer.data)


class EquipementInstanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour instances équipements affectés"""
    queryset = EquipementInstance.objects.all()
    serializer_class = EquipementInstanceSerializer
    permission_classes = [IsAuthenticated, CanManageEquipment]
    filterset_fields = ['equipement', 'salarie', 'etat']
    ordering_fields = ['date_affectation']


class AccesApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès applicatifs"""
    queryset = AccesApplication.objects.all()
    serializer_class = AccesApplicationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'application']
    search_fields = ['application']


class AccesSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès physiques"""
    queryset = AccesSalarie.objects.all()
    serializer_class = AccesSalarieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'type_acces']


class HoraireSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour horaires supplémentaires"""
    queryset = HoraireSalarie.objects.all()
    serializer_class = HoraireSalarieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'date_debut']


class HistoriqueSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour historique salariés"""
    queryset = HistoriqueSalarie.objects.all()
    serializer_class = HistoriqueSalarieSerializer
    permission_classes = [IsAuthenticated, CanViewSalaries]
    filterset_fields = ['salarie']
    ordering_fields = ['date_changement']
    ordering = ['-date_changement']


# ============================================================================
# VIEWSETS DEMANDES (CONGÉS, ACOMPTES, SORTIES)
# ============================================================================

class DemandeCongeViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes de congé - Avec validations multi-niveaux"""
    queryset = DemandeConge.objects.all()
    serializer_class = DemandeCongeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut', 'type_conge']
    ordering_fields = ['date_debut', 'date_creation']
    ordering = ['-date_creation']
    
    def get_queryset(self):
        """Filtre selon rôle"""
        user = self.request.user
        if user.is_staff or user.roles.filter(nom__in=['rh', 'comptable', 'daf']).exists():
            return DemandeConge.objects.all()
        if hasattr(user, 'profil_salarie'):
            return DemandeConge.objects.filter(salarie=user.profil_salarie)
        return DemandeConge.objects.none()
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        """Valider par responsable direct"""
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.commentaire_direct = request.data.get('commentaire', '')
        demande.save()
        
        return Response({'status': 'Validée par responsable direct'}, 
                       status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        """Valider par responsable service"""
        demande = self.get_object()
        
        if not demande.valide_par_direct:
            return Response({'error': 'Doit être validée par responsable direct d\'abord'},
                           status=status.HTTP_400_BAD_REQUEST)
        
        demande.valide_par_service = True
        demande.date_validation_service = datetime.now()
        demande.commentaire_service = request.data.get('commentaire', '')
        demande.statut = 'approuvée'
        demande.save()
        
        return Response({'status': 'Approuvée par responsable service'}, 
                       status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def rejeter(self, request, pk=None):
        """Rejeter la demande"""
        demande = self.get_object()
        demande.rejete = True
        demande.date_rejet = datetime.now()
        demande.motif_rejet = request.data.get('motif_rejet', '')
        demande.statut = 'rejetée'
        demande.save()
        
        return Response({'status': 'Demande rejetée'}, 
                       status=status.HTTP_200_OK)


class SoldeCongeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture-seule pour solde congés"""
    queryset = SoldeConge.objects.all()
    serializer_class = SoldeCongeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie']


class DemandeAcompteViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes d'acompte"""
    queryset = DemandeAcompte.objects.all()
    serializer_class = DemandeAcompteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_demande']
    ordering = ['-date_demande']
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_direct(self, request, pk=None):
        """Valider par responsable direct"""
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.statut = 'validée_direct'
        demande.save()
        return Response({'status': 'Validée par responsable direct'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateRequests])
    def valider_service(self, request, pk=None):
        """Valider par responsable service"""
        demande = self.get_object()
        demande.valide_par_service = True
        demande.date_validation_service = datetime.now()
        demande.statut = 'approuvée'
        demande.save()
        return Response({'status': 'Approuvée par responsable service'})


class DemandeSortieViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes de sortie"""
    queryset = DemandeSortie.objects.all()
    serializer_class = DemandeSortieSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_sortie']
    ordering = ['-date_sortie']


class TravauxExceptionnelsViewSet(viewsets.ModelViewSet):
    """ViewSet pour travaux exceptionnels"""
    queryset = TravauxExceptionnels.objects.all()
    serializer_class = TravauxExceptionnelsSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_travail']
    ordering = ['-date_travail']


# ============================================================================
# VIEWSETS DOCUMENTS
# ============================================================================

class DocumentSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour documents - Avec permissions de visibilité"""
    queryset = DocumentSalarie.objects.all()
    serializer_class = DocumentSalarieSerializer
    permission_classes = [IsAuthenticated, CanManageDocuments]
    filterset_fields = ['salarie', 'type_document']
    ordering_fields = ['date_upload']
    ordering = ['-date_upload']


# ============================================================================
# VIEWSETS FICHES DE POSTE
# ============================================================================

class FichePosteViewSet(viewsets.ModelViewSet):
    """ViewSet pour fiches de poste"""
    queryset = FichePoste.objects.all()
    serializer_class = FichePosteDetailSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['service', 'grade', 'statut']
    search_fields = ['titre', 'description']
    ordering_fields = ['titre', 'service']


class AmeliorationProposeeViewSet(viewsets.ModelViewSet):
    """ViewSet pour améliorations proposées"""
    queryset = AmeliorationProposee.objects.all()
    serializer_class = AmeliorationProposeeSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['fiche_poste', 'salarie_proposant', 'statut']
    ordering_fields = ['date_proposition', 'priorite']
    ordering = ['-priorite', '-date_proposition']


# ============================================================================
# VIEWSETS PARAMÉTRAGE
# ============================================================================

class FicheParametresUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour paramètres utilisateur"""
    queryset = FicheParametresUser.objects.all()
    serializer_class = FicheParametresUserSerializer
    permission_classes = [IsAuthenticated]


class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture-seule pour rôles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
