# history_utils.py

from django.contrib.admin.models import LogEntry, ADDITION, CHANGE
from django.contrib.contenttypes.models import ContentType

from .models import FichePoste


def log_fiche_poste_action(user, fiche: FichePoste, action_flag: int, change_message: str = ""):
    """
    Crée une entrée d'historique (LogEntry) pour une fiche de poste,
    comme le fait l'admin Django.
    """
    if user is None or not user.is_authenticated:
        # On ne log pas si on n'a pas d'utilisateur
        return

    content_type = ContentType.objects.get_for_model(FichePoste)

    LogEntry.objects.log_action(
        user_id=user.pk,
        content_type_id=content_type.pk,
        object_id=str(fiche.pk),
        object_repr=str(fiche),  # __str__ du modèle (ex: titre)
        action_flag=action_flag,
        change_message=change_message or "",
    )
