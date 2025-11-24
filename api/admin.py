from django.contrib import admin
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie
)

@admin.register(Societe)
class SocieteAdmin(admin.ModelAdmin):
    list_display = ('nom', 'email', 'ville', 'actif', 'date_creation')
    list_filter = ('actif', 'date_creation')
    search_fields = ('nom', 'email', 'ville')
    readonly_fields = ('date_creation',)

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nom', 'region', 'societe', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('numero', 'nom', 'region')

@admin.register(Circuit)
class CircuitAdmin(admin.ModelAdmin):
    list_display = ('nom', 'departement', 'actif')
    list_filter = ('departement', 'actif')
    search_fields = ('nom',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'responsable', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'ordre', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)

@admin.register(TypeAcces)
class TypeAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)

@admin.register(OutilTravail)
class OutilTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)

@admin.register(CreneauTravail)
class CreneauTravailAdmin(admin.ModelAdmin):
    list_display = ('nom', 'societe', 'heure_debut', 'heure_fin', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)

@admin.register(Equipement)
class EquipementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_equipement', 'stock_total', 'stock_disponible', 'actif')
    list_filter = ('type_equipement', 'actif')
    search_fields = ('nom',)

@admin.register(EquipementInstance)
class EquipementInstanceAdmin(admin.ModelAdmin):
    list_display = ('equipement', 'numero_serie', 'salarie', 'date_affectation', 'etat')
    list_filter = ('equipement', 'etat', 'date_affectation')
    search_fields = ('numero_serie', 'salarie__matricule')

@admin.register(TypeApplicationAcces)
class TypeApplicationAccesAdmin(admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)

@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'prenom', 'nom', 'mail_professionnel', 'service', 'statut')
    list_filter = ('societe', 'service', 'grade', 'statut', 'date_embauche')
    search_fields = ('matricule', 'prenom', 'nom', 'mail_professionnel')
    readonly_fields = ('date_creation', 'date_modification')

@admin.register(HistoriqueSalarie)
class HistoriqueSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'service_ancien', 'service_nouveau', 'grade_ancien', 'grade_nouveau', 'date_changement')
    list_filter = ('salarie', 'date_changement')
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_changement',)

@admin.register(HoraireSalarie)
class HoraireSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_debut', 'date_fin', 'heure_debut', 'heure_fin')
    list_filter = ('salarie', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')

@admin.register(AccesApplication)
class AccesApplicationAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'application', 'type_application', 'date_debut', 'date_fin')
    list_filter = ('type_application', 'date_debut')
    search_fields = ('salarie__matricule', 'application')

@admin.register(AccesSalarie)
class AccesSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_acces', 'date_debut', 'date_fin')
    list_filter = ('type_acces', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')

@admin.register(DemandeConge)
class DemandeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_conge', 'date_debut', 'date_fin', 'statut', 'date_creation')
    list_filter = ('statut', 'type_conge', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_creation', 'date_modification')

@admin.register(SoldeConge)
class SoldeCongeAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'conges_acquis', 'conges_utilises', 'conges_restants')
    list_filter = ('salarie',)
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_derniere_maj',)

@admin.register(DemandeAcompte)
class DemandeAcompteAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'montant', 'date_demande', 'statut')
    list_filter = ('statut', 'date_demande')
    search_fields = ('salarie__matricule', 'salarie__nom')

@admin.register(DemandeSortie)
class DemandeSortieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_sortie', 'heure_debut', 'heure_fin', 'motif', 'statut')
    list_filter = ('statut', 'date_sortie')
    search_fields = ('salarie__matricule', 'salarie__nom', 'motif')

@admin.register(TravauxExceptionnels)
class TravauxExceptionnelsAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'date_travail', 'nombre_heures', 'statut', 'date_creation')
    list_filter = ('statut', 'date_travail')
    search_fields = ('salarie__matricule', 'salarie__nom', 'description_travail')

@admin.register(DocumentSalarie)
class DocumentSalarieAdmin(admin.ModelAdmin):
    list_display = ('salarie', 'type_document', 'titre', 'date_upload')
    list_filter = ('type_document', 'date_upload')
    search_fields = ('salarie__matricule', 'salarie__nom', 'titre')
    readonly_fields = ('date_upload',)

@admin.register(FichePoste)
class FichePosteAdmin(admin.ModelAdmin):
    list_display = ('titre', 'service', 'grade', 'statut', 'date_creation')
    list_filter = ('service', 'grade', 'statut', 'date_creation')
    search_fields = ('titre', 'service__nom')
    readonly_fields = ('date_creation', 'date_modification')

@admin.register(OutilFichePoste)
class OutilFichePosteAdmin(admin.ModelAdmin):
    list_display = ('fiche_poste', 'outil_travail', 'obligatoire')
    list_filter = ('fiche_poste', 'obligatoire')
    search_fields = ('fiche_poste__titre', 'outil_travail__nom')

@admin.register(AmeliorationProposee)
class AmeliorationProposeeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'fiche_poste', 'salarie_proposant', 'priorite', 'statut', 'date_proposition')
    list_filter = ('statut', 'priorite', 'date_proposition')
    search_fields = ('titre', 'fiche_poste__titre', 'salarie_proposant__nom')
    readonly_fields = ('date_proposition',)

@admin.register(FicheParametresUser)
class FicheParametresUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'langue', 'notifications_actives')
    list_filter = ('theme', 'langue', 'notifications_actives')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('date_creation', 'date_modification')

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('nom', 'can_view_salaries', 'can_edit_salaries', 'can_validate_requests')
    list_filter = ('nom',)
    search_fields = ('nom',)
    readonly_fields = ('date_creation',)
