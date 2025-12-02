from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# ✅ IMPORTER LES FONCTIONS D'ADMIN IMPORT
from api.admin_views import (
    admin_import_page,
    admin_download_template,
    get_model_structure_ajax,
    admin_import_history,
)

urlpatterns = [
    # ============================================================================
    # ✅ ROUTES D'IMPORT ADMIN
    # ============================================================================
    path('admin/import/', admin_import_page, name='admin_import_page'),
    path('admin/import/download-template/', admin_download_template, name='admin_download_template'),
    path('admin/import/api/structure/', get_model_structure_ajax, name='admin_import_structure_ajax'),
    path('admin/import/history/', admin_import_history, name='admin_import_history'),
    
    # Django Admin
    path('admin/', admin.site.urls),
    
    # ============================================================================
    # JWT AUTHENTICATION ENDPOINTS
    # ============================================================================
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ============================================================================
    # API REST
    # ============================================================================
    path('api/', include('api.urls')),
]

# ============================================================================
# SERVIR LES FICHIERS STATIQUES ET MEDIA EN DÉVELOPPEMENT
# ============================================================================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# ============================================================================
# PERSONNALISATION DU SITE ADMIN
# ============================================================================
admin.site.site_header = "MSI TeamHub"
admin.site.site_title = "MSI TeamHub Admin"
admin.site.index_title = "Bienvenue dans MSI TeamHub"
