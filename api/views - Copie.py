# ============================================================================
# VIEWS.PY - AVEC SYSTÈME D'AUTORISATION COMPLET - CORRIGÉ
# ============================================================================
# CHANGEMENTS CLÉS:
# ✅ SocieteViewSet: Tous peuvent LIRE (ligne 129-140 modifiée)
# ✅ ServiceViewSet: Simplifié à [IsAuthenticated()] (ligne 160-165)
# ✅ GradeViewSet: Simplifié à [IsAuthenticated()] (ligne 179-184)
# ✅ RESTE: Inchangé
# ============================================================================


from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from datetime import datetime, date
import io, json, pandas as pd
from django.http import HttpResponse
from django.utils.encoding import smart_str
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from .serializers import UserMeSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserMeSerializer



from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie, ImportLog
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    """
    Endpoint pour récupérer l'utilisateur connecté avec ses rôles et permissions
    
    GET /api/me/ → Retourne les données utilisateur + rôle + permissions
    """
    try:
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la récupération de l\'utilisateur: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ✅ SERIALIZERS - UNE SEULE FOIS AU DÉBUT
from .serializers import (
    SocieteSerializer, ServiceSerializer, GradeSerializer, DepartementSerializer,
    TypeAccesSerializer, OutilTravailSerializer, EquipementSerializer,
    SalarieDetailSerializer, SalarieListSerializer, EquipementInstanceSerializer,
    HistoriqueSalarieSerializer, DocumentSalarieSerializer, CreneauTravailSerializer,
    HoraireSalarieSerializer, DemandeCongeSerializer, SoldeCongeSerializer,
    AccesSalarieSerializer, TypeApplicationAccesSerializer, AccesApplicationSerializer,
    FicheParametresUserSerializer, CircuitSerializer, RoleSerializer,
    DemandeAcompteSerializer, DemandeSortieSerializer, TravauxExceptionnelsSerializer,
    FichePosteDetailSerializer, AmeliorationProposeeSerializer, ImportLogSerializer
)


# ✅ IMPORT NEW PERMISSIONS - NOUVELLE VERSION
from .permissions import (
    IsAuthenticated as IsAuthenticatedPerm,
    IsAdmin,
    # SALARIES
    CanViewAllSalaries,
    CanViewOwnSalary,
    CanViewTeamSalaries,
    CanEditAllSalaries,
    CanEditOwnSalary,
    CanEditTeamSalaries,
    # LEAVE
    CanViewOwnLeaveRequests,
    CanViewAllLeaveRequests,
    CanCreateLeaveRequests,
    CanValidateLeaveRequestsDirect,
    CanValidateLeaveRequestsService,
    # EQUIPMENT
    CanViewOwnEquipment,
    CanViewAllEquipment,
    CanCreateEquipmentRequests,
    CanValidateEquipmentRequests,
    # DOCUMENTS
    CanViewOwnDocuments,
    CanViewAllDocuments,
    CanManageDocuments,
    # JOB EVOLUTION
    CanViewOwnJobEvolution,
    CanViewTeamJobEvolution,
    CanManageJobEvolution,
    # ADMIN
    CanAccessAdminPanel,
    CanExportData,
    CanManageAttendance,
)


from .utils import (
    IMPORT_CONFIG, parse_value, get_current_data,
    generate_template_dataframe
)



# ============================================================================
# VIEWSETS BASE - PARAMÉTRAGE
# ============================================================================


class SocieteViewSet(viewsets.ModelViewSet):
    """ViewSet pour Societes - Lecture pour tous, Modif pour Admin"""
    queryset = Societe.objects.all()
    serializer_class = SocieteSerializer
    filterset_fields = ['nom', 'actif']
    search_fields = ['nom', 'email', 'adresse']
    ordering_fields = ['nom', 'date_creation']
    ordering = ['nom']


    def get_permissions(self):
        """Tous les users authentifiés peuvent lire"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]  # ✅ CHANGEMENT: Tous les users
        return [IsAuthenticated(), IsAdmin()]  # Admin pour modifications



class DepartementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Departements"""
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    filterset_fields = ['societe', 'numero', 'actif']
    search_fields = ['nom', 'numero', 'region']
    ordering_fields = ['numero', 'nom']
    ordering = ['numero']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés peuvent voir"""
        return [IsAuthenticated()]



class CircuitViewSet(viewsets.ModelViewSet):
    """ViewSet pour Circuits - Nouveau"""
    queryset = Circuit.objects.all()
    serializer_class = CircuitSerializer
    filterset_fields = ['departement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés peuvent voir"""
        return [IsAuthenticated()]



class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet pour Services"""
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom']

    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'])
    def hierarchy(self, request, pk=None):
        """
        GET /api/services/{id}/hierarchy/
        Retourne l'organigramme hiérarchique du service
        Affiche tous les salariés du service avec leurs superviseurs
        """
        service = self.get_object()
        
        # Récupérer tous les salariés du service
        service_salaries = Salarie.objects.filter(
            service=service
        ).select_related('grade', 'responsable_direct')
        
        # Trouver les racines du service
        roots = [
            s for s in service_salaries 
            if not s.responsable_direct or s.responsable_direct.service_id != service.id
        ]
        
        # ✅ FONCTION INTERNE - CORRECTEMENT INDENTÉE
        def build_node(salarie):
            """Construit un nœud avec ses enfants et infos de départements"""
            
            # Récupérer tous les départements du salarié
            departements_data = []
            try:
                # Vérifier si le salarié a une relation avec Departement
                if hasattr(salarie, 'departements'):
                    depts = salarie.departements.all()
                elif hasattr(salarie, 'departement'):
                    if hasattr(salarie.departement, 'all'):
                        depts = salarie.departement.all()
                    else:
                        depts = [salarie.departement] if salarie.departement else []
                else:
                    depts = []
                
                # Construire les infos de département
                for dept in depts:
                    dept_info = {
                        'id': dept.id,
                        'nom': dept.nom,
                        'region': getattr(dept, 'region', 'N/A'),
                        'circuits_count': getattr(dept, 'nombre_circuits', 0),
                    }
                    departements_data.append(dept_info)
                    
            except Exception as e:
                print(f"❌ Erreur: {e}")
                departements_data = []
            
            # Nombre total de circuits
            total_circuits = sum(
                d.get('circuits_count', 0) for d in departements_data
            )
            
            return {
                'id': salarie.id,
                'nom': f"{salarie.prenom} {salarie.nom}",
                'grade_nom': salarie.grade.nom if salarie.grade else 'N/A',
                'poste': salarie.poste or 'N/A',
                'mail': salarie.mail_professionnel or '',
                'extension_3cx': salarie.extension_3cx or '',
                'phone': salarie.telephone_professionnel or '',
                'responsable_direct_nom': f"{salarie.responsable_direct.prenom} {salarie.responsable_direct.nom}" if salarie.responsable_direct else '',
                'photo': salarie.photo or '',
                'matricule': salarie.matricule,
                'statut': salarie.statut,
                'departements': departements_data,
                'total_circuits': total_circuits,
                'children': [
                    build_node(child)
                    for child in service_salaries
                    if child.responsable_direct and child.responsable_direct.id == salarie.id
                ]
            }
        
        # Construire l'arbre
        hierarchy = [build_node(root) for root in roots]
        
        return Response({
            'service': {
                'id': service.id,
                'nom': service.nom,
                'description': service.description or ''
            },
            'hierarchy': hierarchy,
            'total_salaries': len(service_salaries)
        })


class GradeViewSet(viewsets.ModelViewSet):
    """ViewSet pour Grades"""
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']
    ordering_fields = ['ordre', 'nom']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]  # ✅ CHANGEMENT: Simplifié



class TypeAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'accès"""
    queryset = TypeAcces.objects.all()
    serializer_class = TypeAccesSerializer
    filterset_fields = ['actif']
    search_fields = ['nom']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]



class OutilTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Outils de travail"""
    queryset = OutilTravail.objects.all()
    serializer_class = OutilTravailSerializer
    filterset_fields = ['actif']
    search_fields = ['nom', 'description']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]



class CreneauTravailViewSet(viewsets.ModelViewSet):
    """ViewSet pour Créneaux de travail"""
    queryset = CreneauTravail.objects.all()
    serializer_class = CreneauTravailSerializer
    filterset_fields = ['societe', 'actif']
    search_fields = ['nom']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]



# ============================================================================
# VIEWSET EQUIPEMENT
# ============================================================================


class EquipementViewSet(viewsets.ModelViewSet):
    """ViewSet pour Équipements"""
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    filterset_fields = ['type_equipement', 'actif']
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'type_equipement']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAllEquipment()]
        return [IsAuthenticated(), CanViewAllEquipment()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        if user.is_staff or user.has_perm('api.view_all_equipment'):
            return Equipement.objects.all()
        return Equipement.objects.none()


    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Retourne les statistiques des équipements"""
        from django.db.models import Count
        equipements = self.get_queryset()
        instances = EquipementInstance.objects.all()
        
        par_type = list(equipements.values('type_equipement').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        par_etat = list(instances.values('etat').annotate(
            count=Count('id')
        ).order_by('etat'))
        
        total_equipements = equipements.count()
        total_instances = instances.count()
        instances_actives = instances.filter(etat='actif').count() if instances.exists() else 0
        
        return Response({
            'total_equipements': total_equipements,
            'total_instances': total_instances,
            'instances_actives': instances_actives,
            'par_type': par_type,
            'par_etat': par_etat,
        })



class TypeApplicationAccesViewSet(viewsets.ModelViewSet):
    """ViewSet pour Types d'applications"""
    queryset = TypeApplicationAcces.objects.all()
    serializer_class = TypeApplicationAccesSerializer
    filterset_fields = ['actif']
    search_fields = ['nom']


    def get_permissions(self):
        """Tous les utilisateurs authentifiés"""
        return [IsAuthenticated()]



# ============================================================================
# VIEWSETS SALARIÉ
# ============================================================================


class SalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour Salariés - Avec permissions granulaires"""
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['societe', 'service', 'grade', 'statut']
    search_fields = ['nom', 'prenom', 'matricule', 'mail_professionnel']
    ordering_fields = ['nom', 'prenom', 'date_embauche', 'date_creation']
    ordering = ['nom', 'prenom']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAllSalaries()]
        elif self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), CanEditAllSalaries()]
        elif self.action == 'ma_fiche':
            return [IsAuthenticated(), CanViewOwnSalary()]
        return [IsAuthenticated()]


    def get_queryset(self):
        """Filtre les salariés selon le rôle de l'utilisateur"""
        user = self.request.user
        
        # Admin voit tout
        if user.is_staff:
            return Salarie.objects.all()
        
        # RH et comptable voient tout
        if user.has_perm('api.view_all_salaries'):
            return Salarie.objects.all()
        
        # Team leaders voient leur équipe
        if user.has_perm('api.view_team_salaries'):
            if hasattr(user, 'profil_salarie'):
                service = user.profil_salarie.service
                return Salarie.objects.filter(service=service)
        
        # User normal voit sa fiche
        if user.has_perm('api.view_own_salary'):
            if hasattr(user, 'profil_salarie'):
                return Salarie.objects.filter(id=user.profil_salarie.id)
        
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
    filterset_fields = ['equipement', 'salarie', 'etat']
    search_fields = ['numero_serie', 'model']
    ordering_fields = ['date_affectation', 'numero_serie']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAllEquipment()]
        elif self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), CanCreateEquipmentRequests()]
        elif self.action in ['destroy']:
            return [IsAuthenticated(), CanValidateEquipmentRequests()]
        return [IsAuthenticated()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        
        if user.is_staff or user.has_perm('api.view_all_equipment'):
            return EquipementInstance.objects.all()
        
        if user.has_perm('api.view_own_equipment'):
            if hasattr(user, 'profil_salarie'):
                return EquipementInstance.objects.filter(salarie=user.profil_salarie)
        
        return EquipementInstance.objects.none()



class AccesApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès applicatifs"""
    queryset = AccesApplication.objects.all()
    serializer_class = AccesApplicationSerializer
    filterset_fields = ['salarie', 'application']
    search_fields = ['application']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated()]



class AccesSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour accès physiques"""
    queryset = AccesSalarie.objects.all()
    serializer_class = AccesSalarieSerializer
    filterset_fields = ['salarie', 'type_acces']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated()]



class HoraireSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour horaires supplémentaires"""
    queryset = HoraireSalarie.objects.all()
    serializer_class = HoraireSalarieSerializer
    filterset_fields = ['salarie', 'date_debut']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated()]



class HistoriqueSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour historique salariés"""
    queryset = HistoriqueSalarie.objects.all()
    serializer_class = HistoriqueSalarieSerializer
    filterset_fields = ['salarie']
    ordering_fields = ['date_changement']
    ordering = ['-date_changement']


    def get_permissions(self):
        """Admin et RH seulement"""
        return [IsAuthenticated(), CanViewAllSalaries()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        if user.is_staff or user.has_perm('api.view_all_salaries'):
            return HistoriqueSalarie.objects.all()
        return HistoriqueSalarie.objects.none()



# ============================================================================
# VIEWSETS DEMANDES (CONGÉS, ACOMPTES, SORTIES)
# ============================================================================


class DemandeCongeViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes de congé - Avec validations multi-niveaux"""
    queryset = DemandeConge.objects.all()
    serializer_class = DemandeCongeSerializer
    filterset_fields = ['salarie', 'statut', 'type_conge']
    ordering_fields = ['date_debut', 'date_creation']
    ordering = ['-date_creation']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAllLeaveRequests()]
        elif self.action == 'create':
            return [IsAuthenticated(), CanCreateLeaveRequests()]
        elif self.action in ['valider_direct']:
            return [IsAuthenticated(), CanValidateLeaveRequestsDirect()]
        elif self.action in ['valider_service', 'rejeter']:
            return [IsAuthenticated(), CanValidateLeaveRequestsService()]
        return [IsAuthenticated()]


    def get_queryset(self):
        """Filtre selon rôle"""
        user = self.request.user
        
        # Admin voit tout
        if user.is_staff:
            return DemandeConge.objects.all()
        
        # RH et comptable voient tout
        if user.has_perm('api.view_all_leave_requests'):
            return DemandeConge.objects.all()
        
        # User normal voit ses demandes
        if user.has_perm('api.view_own_leave_requests'):
            if hasattr(user, 'profil_salarie'):
                return DemandeConge.objects.filter(salarie=user.profil_salarie)
        
        return DemandeConge.objects.none()


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def valider_direct(self, request, pk=None):
        """Valider par responsable direct"""
        demande = self.get_object()
        
        # Vérifier permission
        if not request.user.has_perm('api.validate_leave_requests_direct'):
            return Response({'error': 'Permission refusée'},
                          status=status.HTTP_403_FORBIDDEN)
        
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.commentaire_direct = request.data.get('commentaire', '')
        demande.save()
        return Response({'status': 'Validée par responsable direct'},
                       status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def valider_service(self, request, pk=None):
        """Valider par responsable service"""
        demande = self.get_object()
        
        # Vérifier permission
        if not request.user.has_perm('api.validate_leave_requests_service'):
            return Response({'error': 'Permission refusée'},
                          status=status.HTTP_403_FORBIDDEN)
        
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


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rejeter(self, request, pk=None):
        """Rejeter la demande"""
        demande = self.get_object()
        
        # Vérifier permission
        if not request.user.has_perm('api.validate_leave_requests_service'):
            return Response({'error': 'Permission refusée'},
                          status=status.HTTP_403_FORBIDDEN)
        
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
    filterset_fields = ['salarie']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated(), CanViewOwnLeaveRequests()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        
        if user.is_staff or user.has_perm('api.view_all_leave_requests'):
            return SoldeConge.objects.all()
        
        if hasattr(user, 'profil_salarie'):
            return SoldeConge.objects.filter(salarie=user.profil_salarie)
        
        return SoldeConge.objects.none()



class DemandeAcompteViewSet(viewsets.ModelViewSet):
    """ViewSet pour demandes d'acompte"""
    queryset = DemandeAcompte.objects.all()
    serializer_class = DemandeAcompteSerializer
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_demande']
    ordering = ['-date_demande']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['valider_direct', 'valider_service']:
            return [IsAuthenticated(), CanValidateLeaveRequestsDirect()]
        return [IsAuthenticated()]


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def valider_direct(self, request, pk=None):
        """Valider par responsable direct"""
        demande = self.get_object()
        demande.valide_par_direct = True
        demande.date_validation_direct = datetime.now()
        demande.statut = 'validée_direct'
        demande.save()
        return Response({'status': 'Validée par responsable direct'})


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
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
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_sortie']
    ordering = ['-date_sortie']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated()]



class TravauxExceptionnelsViewSet(viewsets.ModelViewSet):
    """ViewSet pour travaux exceptionnels"""
    queryset = TravauxExceptionnels.objects.all()
    serializer_class = TravauxExceptionnelsSerializer
    filterset_fields = ['salarie', 'statut']
    ordering_fields = ['date_travail']
    ordering = ['-date_travail']


    def get_permissions(self):
        """Permissions selon action"""
        return [IsAuthenticated()]



# ============================================================================
# VIEWSETS DOCUMENTS
# ============================================================================


class DocumentSalarieViewSet(viewsets.ModelViewSet):
    """ViewSet pour documents - Avec permissions de visibilité"""
    queryset = DocumentSalarie.objects.all()
    serializer_class = DocumentSalarieSerializer
    filterset_fields = ['salarie', 'type_document']
    ordering_fields = ['date_upload']
    ordering = ['-date_upload']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewAllDocuments()]
        elif self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), CanManageDocuments()]
        elif self.action == 'destroy':
            return [IsAuthenticated(), CanManageDocuments()]
        return [IsAuthenticated()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        
        # Admin voit tout
        if user.is_staff:
            return DocumentSalarie.objects.all()
        
        # RH et comptable voient tout
        if user.has_perm('api.view_all_documents'):
            return DocumentSalarie.objects.all()
        
        # User normal voit ses documents
        if user.has_perm('api.view_own_documents'):
            if hasattr(user, 'profil_salarie'):
                return DocumentSalarie.objects.filter(salarie=user.profil_salarie)
        
        return DocumentSalarie.objects.none()



# ============================================================================
# VIEWSETS FICHES DE POSTE
# ============================================================================


class FichePosteViewSet(viewsets.ModelViewSet):
    """ViewSet pour fiches de poste"""
    queryset = FichePoste.objects.all()
    serializer_class = FichePosteDetailSerializer
    filterset_fields = ['service', 'grade', 'statut']
    search_fields = ['titre', 'description']
    ordering_fields = ['titre', 'service']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), CanManageJobEvolution()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        
        # Tous les utilisateurs authentifiés peuvent voir
        return FichePoste.objects.all()



class AmeliorationProposeeViewSet(viewsets.ModelViewSet):
    """ViewSet pour améliorations proposées"""
    queryset = AmeliorationProposee.objects.all()
    serializer_class = AmeliorationProposeeSerializer
    filterset_fields = ['fiche_poste', 'salarie_proposant', 'statut']
    ordering_fields = ['date_proposition', 'priorite']
    ordering = ['-priorite', '-date_proposition']


    def get_permissions(self):
        """Permissions selon action"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewTeamJobEvolution()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), CanManageJobEvolution()]
        return [IsAuthenticated()]


    def get_queryset(self):
        """Filtre selon permissions"""
        user = self.request.user
        
        # Admin voit tout
        if user.is_staff:
            return AmeliorationProposee.objects.all()
        
        # RH voit tout
        if user.has_perm('api.view_team_job_evolution'):
            return AmeliorationProposee.objects.all()
        
        # User normal voit ses propositions
        if hasattr(user, 'profil_salarie'):
            return AmeliorationProposee.objects.filter(salarie_proposant=user.profil_salarie)
        
        return AmeliorationProposee.objects.none()



# ============================================================================
# VIEWSETS PARAMÉTRAGE
# ============================================================================


class FicheParametresUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour paramètres utilisateur"""
    queryset = FicheParametresUser.objects.all()
    serializer_class = FicheParametresUserSerializer


    def get_permissions(self):
        """Admin seulement"""
        return [IsAuthenticated(), IsAdmin()]



class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture-seule pour rôles"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


    def get_permissions(self):
        """Admin seulement"""
        return [IsAuthenticated(), IsAdmin()]



# ============================================================================
# VIEWSET IMPORTLOG
# ============================================================================


class ImportLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour logs d'import - Lecture seule"""
    queryset = ImportLog.objects.all()
    serializer_class = ImportLogSerializer
    filterset_fields = ['api_name', 'statut']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']


    def get_permissions(self):
        """Admin seulement"""
        return [IsAuthenticated(), IsAdmin()]


    def get_queryset(self):
        """Admin seulement"""
        if self.request.user.is_staff:
            return ImportLog.objects.all()
        return ImportLog.objects.none()
