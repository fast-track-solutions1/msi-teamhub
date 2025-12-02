# api/admin.py - Configuration complète avec ImportLog

from django.contrib import admin
from api.widgets import DualListWidget
from django.http import HttpResponse
from django.utils.html import format_html
import csv
from datetime import datetime
from .models import (
    Societe, Service, Grade, Departement, TypeAcces, OutilTravail, Circuit,
    Equipement, Salarie, AccesSalarie, HistoriqueSalarie, FichePoste,
    OutilFichePoste, AmeliorationProposee, EquipementInstance, CreneauTravail,
    HoraireSalarie, DocumentSalarie, DemandeConge, SoldeConge, TravauxExceptionnels,
    TypeApplicationAcces, AccesApplication, FicheParametresUser, Role,
    DemandeAcompte, DemandeSortie, ImportLog
)

# ============================================================================
# PERSONNALISATION DU SITE ADMIN
# ============================================================================

admin.site.site_header = "MSI TeamHub"
admin.site.site_title = "MSI TeamHub Admin"
admin.site.index_title = "Bienvenue dans MSI TeamHub"
admin.site.site_url = None


# ============================================================================
# ACTION EXPORT CSV - Pour tous les modèles
# ============================================================================

def export_as_csv(modeladmin, request, queryset):
    """Action admin pour exporter en CSV"""
    model_name = queryset.model.__name__
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{model_name}_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    
    # Récupérer les champs (sauf id et auto-generated)
    fields = [f.name for f in queryset.model._meta.fields
              if f.name not in ['id', 'date_creation', 'date_modification', 'date_derniere_maj']]
    
    writer = csv.DictWriter(response, fieldnames=fields)
    writer.writeheader()
    for obj in queryset:
        row = {field: getattr(obj, field, '') for field in fields}
        writer.writerow(row)
    
    return response

export_as_csv.short_description = "📥 Exporter en CSV"


# ============================================================================
# MIXIN - Ajoute Import/Export à tous les ModelAdmin
# ============================================================================

class BatchImportExportMixin:
    """Mixin pour ajouter des boutons Import/Export dans l'admin"""
    actions = [export_as_csv]


# ============================================================================
# IMPORT LOG ADMIN
# ============================================================================

@admin.register(ImportLog)
class ImportLogAdmin(admin.ModelAdmin):
    """Configuration admin pour les logs d'import en masse"""
    list_display = ('api_name', 'get_statut_badge', 'total_lignes', 'lignes_succes', 'lignes_erreur', 'get_taux_badge', 'date_creation', 'cree_par')
    list_filter = ('statut', 'api_name', 'date_creation')
    search_fields = ('api_name', 'fichier_nom')
    readonly_fields = ('date_creation', 'date_modification', 'formatted_taux_succes')
    
    fieldsets = (
        ('📋 Infos Import', {
            'fields': ('api_name', 'fichier_nom', 'cree_par')
        }),
        ('📊 Résultats', {
            'fields': ('total_lignes', 'lignes_succes', 'lignes_erreur', 'statut', 'formatted_taux_succes')
        }),
        ('⚠️ Détails Erreurs', {
            'fields': ('details_erreurs',),
            'classes': ('collapse',)
        }),
        ('🗓️ Dates', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
    
    def formatted_taux_succes(self, obj):
        """Affiche le taux de succès formaté"""
        return f"{obj.get_taux_succes()}%"
    formatted_taux_succes.short_description = "Taux de succès"
    
    def get_statut_badge(self, obj):
        """Retourne un badge coloré pour le statut"""
        colors = {
            'succes': 'green',
            'echec': 'red',
            'partiel': 'orange',
            'en_cours': 'blue'
        }
        color = colors.get(obj.statut, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_statut_display()
        )
    get_statut_badge.short_description = "Statut"
    
    def get_taux_badge(self, obj):
        """Retourne un badge pour le taux de succès"""
        taux = obj.get_taux_succes()
        if taux == 100:
            color = 'green'
        elif taux >= 50:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{:.0f}%</span>',
            color,
            taux
        )
    get_taux_badge.short_description = "Taux ✅"


# ============================================================================
# ADMIN CONFIGS - Avec support Import/Export
# ============================================================================

@admin.register(Societe)
class SocieteAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'email', 'ville', 'actif', 'date_creation')
    list_filter = ('actif', 'date_creation')
    search_fields = ('nom', 'email', 'ville')
    readonly_fields = ('date_creation',)


@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ('numero', 'nom', 'region', 'chef_lieu', 'societe', 'nombre_circuits', 'actif')
    list_filter = ('actif', 'societe', 'region')
    search_fields = ('numero', 'nom', 'region', 'chef_lieu')
    readonly_fields = ('date_creation',)


@admin.register(Circuit)
class CircuitAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'departement', 'actif')
    list_filter = ('departement', 'actif')
    search_fields = ('nom',)


@admin.register(Service)
class ServiceAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'societe', 'responsable', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)


@admin.register(Grade)
class GradeAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'societe', 'ordre', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)


@admin.register(TypeAcces)
class TypeAccesAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)


@admin.register(OutilTravail)
class OutilTravailAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)


@admin.register(CreneauTravail)
class CreneauTravailAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'societe', 'heure_debut', 'heure_fin', 'actif')
    list_filter = ('societe', 'actif')
    search_fields = ('nom',)


@admin.register(Equipement)
class EquipementAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'type_equipement', 'stock_total', 'stock_disponible', 'actif')
    list_filter = ('type_equipement', 'actif')
    search_fields = ('nom',)


@admin.register(EquipementInstance)
class EquipementInstanceAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('equipement', 'numero_serie', 'salarie', 'date_affectation', 'etat')
    list_filter = ('equipement', 'etat', 'date_affectation')
    search_fields = ('numero_serie', 'salarie__matricule')


@admin.register(TypeApplicationAcces)
class TypeApplicationAccesAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'actif')
    list_filter = ('actif',)
    search_fields = ('nom',)


@admin.register(Salarie)
class SalarieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('matricule', 'prenom', 'nom', 'mail_professionnel', 'service', 'statut')
    list_filter = ('societe', 'service', 'grade', 'statut', 'date_embauche')
    search_fields = ('matricule', 'prenom', 'nom', 'mail_professionnel')
    readonly_fields = ('date_creation', 'date_modification', 'get_circuits_display')
    exclude = ('circuit',)
    
    def get_circuits_display(self, obj):
        """Affiche les circuits associés aux départements du salarié"""
        if obj.departements.exists():
            circuits = []
            for dept in obj.departements.all():
                circuits.extend(dept.circuits.values_list('nom', flat=True))
            return ', '.join(set(circuits)) if circuits else "Aucun circuit"
        return "Aucun département sélectionné"
    
    get_circuits_display.short_description = "Circuits (calculé depuis les départements)"
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == 'departements':
            from api.widgets import DualListWidget
            kwargs['widget'] = DualListWidget(choices=Departement.objects.values_list('id', 'nom'))
        return super().formfield_for_manytomany(db_field, request, **kwargs)
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == 'departements':
            from api.widgets import DualListWidget
            kwargs['widget'] = DualListWidget(choices=Departement.objects.values_list('id', 'nom'))
        return super().formfield_for_manytomany(db_field, request, **kwargs)



@admin.register(HistoriqueSalarie)
class HistoriqueSalarieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'service_ancien', 'service_nouveau', 'grade_ancien', 'grade_nouveau', 'date_changement')
    list_filter = ('salarie', 'date_changement')
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_changement',)


@admin.register(HoraireSalarie)
class HoraireSalarieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'date_debut', 'date_fin', 'heure_debut', 'heure_fin')
    list_filter = ('salarie', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')


@admin.register(AccesApplication)
class AccesApplicationAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'application', 'type_application', 'date_debut', 'date_fin')
    list_filter = ('type_application', 'date_debut')
    search_fields = ('salarie__matricule', 'application')


@admin.register(AccesSalarie)
class AccesSalarieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'type_acces', 'date_debut', 'date_fin')
    list_filter = ('type_acces', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')


@admin.register(DemandeConge)
class DemandeCongeAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'type_conge', 'date_debut', 'date_fin', 'statut', 'date_creation')
    list_filter = ('statut', 'type_conge', 'date_debut')
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_creation', 'date_modification')


@admin.register(SoldeConge)
class SoldeCongeAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'conges_acquis', 'conges_utilises', 'conges_restants')
    list_filter = ('salarie',)
    search_fields = ('salarie__matricule', 'salarie__nom')
    readonly_fields = ('date_derniere_maj',)


@admin.register(DemandeAcompte)
class DemandeAcompteAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'montant', 'date_demande', 'statut')
    list_filter = ('statut', 'date_demande')
    search_fields = ('salarie__matricule', 'salarie__nom')


@admin.register(DemandeSortie)
class DemandeSortieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'date_sortie', 'heure_debut', 'heure_fin', 'motif', 'statut')
    list_filter = ('statut', 'date_sortie')
    search_fields = ('salarie__matricule', 'salarie__nom', 'motif')


@admin.register(TravauxExceptionnels)
class TravauxExceptionnelsAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'date_travail', 'nombre_heures', 'statut', 'date_creation')
    list_filter = ('statut', 'date_travail')
    search_fields = ('salarie__matricule', 'salarie__nom', 'description_travail')


@admin.register(DocumentSalarie)
class DocumentSalarieAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('salarie', 'type_document', 'titre', 'date_upload')
    list_filter = ('type_document', 'date_upload')
    search_fields = ('salarie__matricule', 'salarie__nom', 'titre')
    readonly_fields = ('date_upload',)


@admin.register(FichePoste)
class FichePosteAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('titre', 'service', 'grade', 'statut', 'date_creation')
    list_filter = ('service', 'grade', 'statut', 'date_creation')
    search_fields = ('titre', 'service__nom')
    readonly_fields = ('date_creation', 'date_modification')


@admin.register(OutilFichePoste)
class OutilFichePosteAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('fiche_poste', 'outil_travail', 'obligatoire')
    list_filter = ('fiche_poste', 'obligatoire')
    search_fields = ('fiche_poste__titre', 'outil_travail__nom')


@admin.register(AmeliorationProposee)
class AmeliorationProposeeAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('titre', 'fiche_poste', 'salarie_proposant', 'priorite', 'statut', 'date_proposition')
    list_filter = ('statut', 'priorite', 'date_proposition')
    search_fields = ('titre', 'fiche_poste__titre', 'salarie_proposant__nom')
    readonly_fields = ('date_proposition',)


@admin.register(FicheParametresUser)
class FicheParametresUserAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('user', 'theme', 'langue', 'notifications_actives')
    list_filter = ('theme', 'langue', 'notifications_actives')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('date_creation', 'date_modification')


@admin.register(Role)
class RoleAdmin(BatchImportExportMixin, admin.ModelAdmin):
    list_display = ('nom', 'can_view_salaries', 'can_edit_salaries', 'can_validate_requests')
    list_filter = ('nom',)
