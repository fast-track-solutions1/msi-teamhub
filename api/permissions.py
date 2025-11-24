from rest_framework import permissions


# ============================================================================
# PERMISSIONS PERSONNALISÉES - RÔLES
# ============================================================================

class IsAdmin(permissions.BasePermission):
    """Autoriser uniquement les administrateurs"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsRH(permissions.BasePermission):
    """Autoriser utilisateurs avec rôle RH"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(nom='rh').exists()


class IsIT(permissions.BasePermission):
    """Autoriser utilisateurs avec rôle IT"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(nom='it').exists()


class IsDAF(permissions.BasePermission):
    """Autoriser utilisateurs DAF"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(nom='daf').exists()


class IsComptable(permissions.BasePermission):
    """Autoriser utilisateurs comptables"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(nom='comptable').exists()


class IsResponsableService(permissions.BasePermission):
    """Autoriser responsables de service"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.roles.filter(nom='responsable_service').exists()


class IsSalarie(permissions.BasePermission):
    """Autoriser salariés"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profil_salarie')


# ============================================================================
# PERMISSIONS COMPOSÉES
# ============================================================================

class CanViewSalaries(permissions.BasePermission):
    """Autoriser consultation salariés selon rôle"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin peut voir tous
        if request.user.is_staff:
            return True
        
        # Rôles autorisés
        return request.user.roles.filter(
            nom__in=['rh', 'daf', 'comptable', 'responsable_service']
        ).exists()


class CanEditSalaries(permissions.BasePermission):
    """Autoriser édition salariés"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Seulement admin et RH
        if request.user.is_staff:
            return True
        
        return request.user.roles.filter(nom='rh').exists()


class CanValidateRequests(permissions.BasePermission):
    """Autoriser validation demandes (congés, acomptes, etc.)"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin, RH, Responsable service peuvent valider
        if request.user.is_staff:
            return True
        
        return request.user.roles.filter(
            nom__in=['rh', 'responsable_service']
        ).exists()


class CanManageDocuments(permissions.BasePermission):
    """Autoriser gestion documents"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin, RH, DAF, Comptable gèrent les documents
        if request.user.is_staff:
            return True
        
        return request.user.roles.filter(
            nom__in=['rh', 'daf', 'comptable']
        ).exists()


class CanViewOwnData(permissions.BasePermission):
    """Autoriser salarié à voir ses propres données"""
    
    def has_object_permission(self, request, view, obj):
        # Les salariés voient leurs propres infos
        if hasattr(request.user, 'profil_salarie'):
            return obj == request.user.profil_salarie
        
        # Admin et RH voient tout
        if request.user.is_staff or request.user.roles.filter(nom='rh').exists():
            return True
        
        return False


class CanManageEquipment(permissions.BasePermission):
    """Autoriser gestion équipements IT"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin et IT gèrent les équipements
        if request.user.is_staff:
            return True
        
        return request.user.roles.filter(nom='it').exists()


class CanViewFinancial(permissions.BasePermission):
    """Autoriser consultation données financières"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin, DAF, Comptable voient les données financières
        if request.user.is_staff:
            return True
        
        return request.user.roles.filter(
            nom__in=['daf', 'comptable']
        ).exists()
