# api/views.py - STRUCTURE CORRECTE - FICHIER COMPLET CORRIGÉ

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
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie, ImportLog
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

from .permissions import (
    IsAdmin, IsRH, IsIT, IsDAF, IsComptable, IsResponsableService, IsSalarie,
    CanViewSalaries, CanEditSalaries, CanValidateRequests, CanManageDocuments,
    CanViewOwnData, CanManageEquipment, CanViewFinancial
)

from .utils import (
    IMPORT_CONFIG, parse_value, get_current_data,
    generate_template_dataframe
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
        if hasattr(user, 'profil_salarie'):
            return Salarie.objects.filter(user=user)
        if user.roles.filter(nom__in=['rh', 'responsable_service']).exists():
            return Salarie.objects.all()
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

# ============================================================================
# IMPORT EN MASSE - ENDPOINTS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_list_apis(request):
    """Retourne la liste de toutes les APIs disponibles pour import"""
    data = []
    for api_name, cfg in IMPORT_CONFIG.items():
        data.append({
            "api_name": api_name,
            "label": cfg["label"],
            "fields": cfg["fields"],
            "required": cfg["required"],
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_get_structure(request, api_name):
    """Retourne la structure (colonnes) d'une API + données actuelles"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return Response({"error": "API inconnue"}, status=404)
    current_data = get_current_data(api_name)
    return Response({
        "api_name": api_name,
        "label": cfg["label"],
        "fields": cfg["fields"],
        "required": cfg["required"],
        "field_types": cfg["field_types"],
        "current_data": current_data,
        "total_records": len(current_data) if current_data else 0,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_download_template(request, api_name):
    """Télécharge un template Excel vide avec la structure de l'API"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return Response({"error": "API inconnue"}, status=404)
    
    df = generate_template_dataframe(api_name)
    if df is None:
        return Response({"error": "Erreur génération template"}, status=400)
    
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=api_name)
        workbook = writer.book
        worksheet = writer.sheets[api_name]
        
        header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        header_font = Font(color="FFFFFF", bold=True, size=11)
        header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        border = Border(
            left=Side(style='thin'),
            right=Side(style='thin'),
            top=Side(style='thin'),
            bottom=Side(style='thin')
        )
        
        for cell in worksheet[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = header_alignment
            cell.border = border
        
        # ← LISTES DÉROULANTES POUR LES CHAMPS FK
        fk_fields = cfg.get('fk_fields', {})
        if fk_fields:
            from openpyxl.worksheet.datavalidation import DataValidation
            
            for field, fk_model in fk_fields.items():
                if field in cfg['fields']:
                    col_index = cfg['fields'].index(field) + 1
                    col_letter = get_column_letter(col_index)
                    
                    fk_objects = fk_model.objects.all().values_list('nom', flat=True)
                    fk_list = ','.join([str(obj) for obj in fk_objects])
                    
                    dv = DataValidation(type='list', formula1=f'"{fk_list}"', allow_blank=True)
                    dv.error = 'Sélectionnez une valeur valide'
                    dv.errorTitle = 'Valeur invalide'
                    worksheet.add_data_validation(dv)
                    
                    for row in range(2, 1000):
                        dv.add(f'{col_letter}{row}')
        
        for i, field in enumerate(cfg["fields"], 1):
            col_letter = get_column_letter(i)
            worksheet.column_dimensions[col_letter].width = 20
        
        info_sheet = workbook.create_sheet("Instructions")
        info_sheet['A1'] = "Colonnes obligatoires :"
        info_sheet['A2'] = ", ".join(cfg["required"])
        info_sheet['A4'] = "Champs disponibles :"
        for i, field in enumerate(cfg["fields"], 5):
            field_type = cfg["field_types"].get(field, "string")
            info_sheet[f'A{i}'] = f"- {field} ({field_type})"
    
    buffer.seek(0)
    response = HttpResponse(
        buffer.getvalue(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    filename = f"template_{api_name}.xlsx"
    response['Content-Disposition'] = f'attachment; filename={smart_str(filename)}'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_upload_file(request, api_name):
    """Upload et valide un fichier Excel"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return Response({"error": "API inconnue"}, status=404)
    
    f = request.FILES.get('file')
    if not f:
        return Response({
            "error": "Aucun fichier envoyé (clé 'file' attendue)"
        }, status=400)
    
    try:
        df = pd.read_excel(f)
    except Exception as e:
        return Response({
            "error": "Erreur lecture fichier Excel",
            "details": str(e)
        }, status=400)
    
    model = cfg["model"]
    fields = cfg["fields"]
    required = cfg["required"]
    fk_fields = cfg.get("fk_fields", {})
    fk_lookup = cfg.get("fk_lookup", {})
    field_types = cfg.get("field_types", {})
    
    erreurs = []
    succes = 0
    donnees_valides = []
    
    # Vérifier colonnes attendues
    missing_cols = [c for c in fields if c not in df.columns]
    if missing_cols:
        return Response({
            "error": "Colonnes manquantes dans le fichier Excel",
            "missing_columns": missing_cols,
            "expected_columns": fields,
        }, status=400)
    
    # Valider et traiter chaque ligne
    for index, row in df.iterrows():
        ligne_num = index + 2
        data = {}
        ligne_erreurs = []
        
        for field in fields:
            value = row.get(field)
            
            # Vérifier si champ obligatoire est vide
            if field in required and (pd.isna(value) or value == ""):
                ligne_erreurs.append(f"❌ Champ obligatoire manquant: '{field}'")
                continue
            
            # Si vide et pas obligatoire
            if pd.isna(value) or value == "":
                data[field] = None
                continue
            
            # Parser la valeur
            try:
                field_type = field_types.get(field, "string")
                parsed_value = parse_value(value, field_type)
            except ValueError as e:
                ligne_erreurs.append(f"❌ {field}: {e}")
                continue
            
            # Traiter les ForeignKey
            if field in fk_fields:
                fk_model = fk_fields[field]
                lookup_field = fk_lookup.get(field, "nom")
                try:
                    obj = fk_model.objects.get(**{lookup_field: str(parsed_value).strip()})
                    data[field] = obj
                except fk_model.DoesNotExist:
                    ligne_erreurs.append(
                        f"❌ {field}: Impossible de trouver {fk_model.__name__} avec {lookup_field}='{parsed_value}'"
                    )
                    continue
                except Exception as e:
                    ligne_erreurs.append(f"❌ {field}: Erreur FK: {e}")
                    continue
            else:
                data[field] = parsed_value
        
        # Si erreurs sur la ligne, la marquer
        if ligne_erreurs:
            erreurs.append({
                "ligne": ligne_num,
                "erreurs": ligne_erreurs,
            })
            continue
        
        donnees_valides.append(data)
    
    # Créer les objets en base
    for idx, data in enumerate(donnees_valides):
        try:
            model.objects.create(**data)
            succes += 1
        except Exception as e:
            erreurs.append({
                "ligne": idx + 2,
                "erreurs": [f"❌ Erreur création: {str(e)}"],
            })
    
    # Déterminer le statut final
    statut_final = 'succes' if len(erreurs) == 0 else ('partiel' if succes > 0 else 'erreur')
    
    # Créer le log
    log = ImportLog.objects.create(
        api_name=api_name,
        fichier_nom=f.name if f else None,
        total_lignes=len(df),
        lignes_succes=succes,
        lignes_erreur=len(erreurs),
        statut=statut_final,
        details_erreurs=json.dumps(erreurs, ensure_ascii=False, indent=2),
        cree_par=request.user if request.user.is_authenticated else None,
    )
    
    return Response({
        "api_name": api_name,
        "fichier": f.name,
        "total_lignes": len(df),
        "lignes_succes": succes,
        "lignes_erreur": len(erreurs),
        "statut": statut_final,
        "taux_succes": f"{(succes / len(df) * 100):.1f}%" if len(df) > 0 else "0%",
        "erreurs": erreurs[:20],
        "import_log_id": log.id,
    }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_get_history(request):
    """Retourne l'historique des imports"""
    logs = ImportLog.objects.all().values(
        'id', 'api_name', 'fichier_nom', 'total_lignes',
        'lignes_succes', 'lignes_erreur', 'statut',
        'cree_par__username', 'date_creation'
    ).order_by('-date_creation')[:50]
    return Response({
        "total": len(logs),
        "logs": list(logs),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def import_get_details(request, log_id):
    """Retourne les détails d'un import spécifique"""
    try:
        log = ImportLog.objects.get(id=log_id)
    except ImportLog.DoesNotExist:
        return Response({"error": "Log non trouvé"}, status=404)
    
    return Response({
        "id": log.id,
        "api_name": log.api_name,
        "fichier_nom": log.fichier_nom,
        "total_lignes": log.total_lignes,
        "lignes_succes": log.lignes_succes,
        "lignes_erreur": log.lignes_erreur,
        "statut": log.statut,
        "taux_succes": log.get_taux_succes(),
        "details_erreurs": log.details_erreurs,
        "cree_par": log.cree_par.username if log.cree_par else "Anonyme",
        "date_creation": log.date_creation.isoformat(),
    })

# ============================================================================
# VIEWSET IMPORTLOG
# ============================================================================

class ImportLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour logs d'import - Lecture seule"""
    queryset = ImportLog.objects.all()
    serializer_class = ImportLogSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filterset_fields = ['api_name', 'statut']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']
