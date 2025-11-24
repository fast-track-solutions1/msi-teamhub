from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSets paramétrages
    SocieteViewSet, DepartementViewSet, CircuitViewSet, ServiceViewSet, 
    GradeViewSet, TypeAccesViewSet, OutilTravailViewSet, CreneauTravailViewSet,
    EquipementViewSet, TypeApplicationAccesViewSet,
    
    # ViewSets salariés
    SalarieViewSet, EquipementInstanceViewSet, AccesApplicationViewSet,
    AccesSalarieViewSet, HoraireSalarieViewSet, HistoriqueSalarieViewSet,
    
    # ViewSets demandes
    DemandeCongeViewSet, SoldeCongeViewSet, DemandeAcompteViewSet, 
    DemandeSortieViewSet, TravauxExceptionnelsViewSet,
    
    # ViewSets documents
    DocumentSalarieViewSet,
    
    # ViewSets fiches de poste
    FichePosteViewSet, AmeliorationProposeeViewSet,
    
    # ViewSets paramétrage
    FicheParametresUserViewSet, RoleViewSet
)

# Créer le routeur
router = DefaultRouter()

# ============================================================================
# ROUTES PARAMÉTRAGES
# ============================================================================
router.register(r'societes', SocieteViewSet, basename='societe')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'circuits', CircuitViewSet, basename='circuit')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'types-acces', TypeAccesViewSet, basename='type-acces')
router.register(r'outils-travail', OutilTravailViewSet, basename='outil-travail')
router.register(r'creneaux-travail', CreneauTravailViewSet, basename='creneau-travail')
router.register(r'equipements', EquipementViewSet, basename='equipement')
router.register(r'types-application-acces', TypeApplicationAccesViewSet, basename='type-application-acces')

# ============================================================================
# ROUTES SALARIÉS
# ============================================================================
router.register(r'salaries', SalarieViewSet, basename='salarie')
router.register(r'equipement-instances', EquipementInstanceViewSet, basename='equipement-instance')
router.register(r'acces-application', AccesApplicationViewSet, basename='acces-application')
router.register(r'acces-salarie', AccesSalarieViewSet, basename='acces-salarie')
router.register(r'horaires-salarie', HoraireSalarieViewSet, basename='horaire-salarie')
router.register(r'historique-salarie', HistoriqueSalarieViewSet, basename='historique-salarie')

# ============================================================================
# ROUTES DEMANDES
# ============================================================================
router.register(r'demandes-conge', DemandeCongeViewSet, basename='demande-conge')
router.register(r'solde-conge', SoldeCongeViewSet, basename='solde-conge')
router.register(r'demandes-acompte', DemandeAcompteViewSet, basename='demande-acompte')
router.register(r'demandes-sortie', DemandeSortieViewSet, basename='demande-sortie')
router.register(r'travaux-exceptionnels', TravauxExceptionnelsViewSet, basename='travaux-exceptionnels')

# ============================================================================
# ROUTES DOCUMENTS
# ============================================================================
router.register(r'documents-salarie', DocumentSalarieViewSet, basename='document-salarie')

# ============================================================================
# ROUTES FICHES DE POSTE
# ============================================================================
router.register(r'fiches-poste', FichePosteViewSet, basename='fiche-poste')
router.register(r'ameliorations-proposees', AmeliorationProposeeViewSet, basename='amelioration-proposee')

# ============================================================================
# ROUTES PARAMÉTRAGE
# ============================================================================
router.register(r'fiche-parametres-user', FicheParametresUserViewSet, basename='fiche-parametres-user')
router.register(r'roles', RoleViewSet, basename='role')

# URLs
urlpatterns = [
    path('', include(router.urls)),
]
