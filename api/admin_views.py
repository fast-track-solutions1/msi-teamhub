# api/admin_views.py - INTERFACE D'IMPORT MODERNE (CORRIGÉE) ✅

from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
import requests
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# UTILITY - OBTENIR UN TOKEN JWT
# ============================================================================

def get_jwt_token_for_user(user):
    """Génère un token JWT pour l'utilisateur"""
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

# ============================================================================
# PAGE D'IMPORT PRINCIPALE
# ============================================================================

@staff_member_required
def admin_import_page(request):
    """
    Page d'import en masse dans Django Admin
    Accessible à /admin/import/
    
    Utilise la NOUVELLE API REST: /api/import/
    """
    result = None
    error = None
    models_list = []
    
    # 📡 Récupérer la liste des modèles disponibles
    try:
        access_token = get_jwt_token_for_user(request.user)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        response = requests.get(
            'http://localhost:8000/api/import/models/',
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            models_list = data.get('models', [])
    except Exception as e:
        logger.warning(f"Erreur récupération modèles: {str(e)}")
    
    # 📤 TRAITER L'UPLOAD DE FICHIER
    if request.method == 'POST':
        model_name = request.POST.get('model')
        file = request.FILES.get('file')
        
        if not model_name or not file:
            error = "❌ Veuillez sélectionner un modèle et un fichier"
            messages.error(request, error)
        else:
            try:
                access_token = get_jwt_token_for_user(request.user)
                headers = {'Authorization': f'Bearer {access_token}'}
                
                # 📡 Appeler le nouvel endpoint d'import
                response = requests.post(
                    'http://localhost:8000/api/import/upload/',
                    data={'model': model_name},
                    files={'file': file},
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # 📊 Afficher les résultats
                    inserted = result.get('inserted', 0)
                    updated = result.get('updated', 0)
                    errors = len(result.get('errors', []))
                    
                    if errors == 0:
                        messages.success(
                            request,
                            f"✅ Import réussi ! {inserted} ligne(s) insérée(s), {updated} mise(s) à jour."
                        )
                    else:
                        messages.warning(
                            request,
                            f"⚠️ Import partiel : {inserted + updated} succès, {errors} erreur(s)."
                        )
                else:
                    error_data = response.json()
                    error = f"❌ Erreur: {error_data.get('error', 'Erreur inconnue')}"
                    messages.error(request, error)
            
            except requests.exceptions.ConnectionError:
                error = "❌ Impossible de se connecter à l'API. Vérifiez que le serveur Django est lancé."
                messages.error(request, error)
                logger.error(f"Erreur connexion API: {error}")
            
            except Exception as e:
                error = f"❌ Erreur lors de l'import: {str(e)}"
                messages.error(request, error)
                logger.error(f"Erreur import: {str(e)}")
    
    context = {
        'result': result,
        'error': error,
        'models': models_list,
        'title': '📥 Importation en Masse',
    }
    
    return render(request, 'admin/import_page.html', context)

# ============================================================================
# TÉLÉCHARGER LE TEMPLATE EXCEL
# ============================================================================

@staff_member_required
@require_http_methods(["GET"])
def admin_download_template(request):
    """
    Télécharge un template Excel pour un modèle
    
    Query param: ?model=departement
    """
    model_name = request.GET.get('model', '')
    
    if not model_name:
        return HttpResponse('❌ Paramètre "model" requis', status=400)
    
    try:
        access_token = get_jwt_token_for_user(request.user)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # 📡 Appeler le nouvel endpoint de template
        response = requests.get(
            f'http://localhost:8000/api/import/template/?model={model_name}',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            # ✅ Le fichier Excel est retourné directement
            response_content = response.content
            
            http_response = HttpResponse(
                response_content,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            http_response['Content-Disposition'] = f'attachment; filename="template_{model_name}.xlsx"'
            return http_response
        else:
            error_data = response.json()
            return HttpResponse(f"❌ Erreur: {error_data.get('error', 'Erreur inconnue')}", status=400)
    
    except Exception as e:
        logger.error(f"Erreur téléchargement template: {str(e)}")
        return HttpResponse(f'❌ Erreur: {str(e)}', status=500)

# ============================================================================
# OBTENIR LA STRUCTURE D'UN MODÈLE (API AJAX)
# ============================================================================

@staff_member_required
@require_http_methods(["GET"])
def get_model_structure_ajax(request):
    """
    Endpoint AJAX pour récupérer la structure d'un modèle
    
    Query param: ?model=departement
    Returns: JSON avec structure du modèle
    """
    model_name = request.GET.get('model', '')
    
    if not model_name:
        return JsonResponse({'error': 'Paramètre "model" requis'}, status=400)
    
    try:
        access_token = get_jwt_token_for_user(request.user)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # 📡 Appeler l'endpoint de structure
        response = requests.get(
            f'http://localhost:8000/api/import/structure/?model={model_name}',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return JsonResponse(response.json())
        else:
            error_data = response.json()
            return JsonResponse({'error': error_data.get('error', 'Erreur')}, status=400)
    
    except Exception as e:
        logger.error(f"Erreur structure modèle: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

# ============================================================================
# AFFICHER L'HISTORIQUE DES IMPORTS
# ============================================================================

@staff_member_required
def admin_import_history(request):
    """
    Affiche l'historique des imports récents
    """
    history = []
    
    try:
        access_token = get_jwt_token_for_user(request.user)
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # 📡 Récupérer l'historique
        response = requests.get(
            'http://localhost:8000/api/import/history/',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            history = data.get('logs', [])
    
    except Exception as e:
        logger.warning(f"Erreur historique: {str(e)}")
    
    context = {
        'history': history,
        'title': '📊 Historique des Imports',
    }
    
    return render(request, 'admin/import_history.html', context)
