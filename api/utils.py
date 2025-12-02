# api/utils.py - NOUVEAU FICHIER À CRÉER
from collections import OrderedDict
import pandas as pd
from datetime import time

# Import tous tes modèles
from .models import (
    Societe, Departement, Circuit, Service, Grade,
    CreneauTravail, Equipement, Salarie,
    TypeAcces, OutilTravail, TypeApplicationAcces
)

# ============================================================================
# CONFIGURATION DES APIs IMPORTABLES
# ============================================================================

IMPORT_CONFIG = OrderedDict({
"departement": {
    "label": "Département",
    "model": Departement,
    "fields": [
        "numero", "nom", "region", "chef_lieu", "societe",
        "nombre_circuits", "actif",
    ],
    "required": ["numero", "nom", "societe"],
    "field_types": {
        "numero": "string",
        "nom": "string",
        "region": "string",
        "chef_lieu": "string",
        "nombre_circuits": "integer",
        "actif": "boolean",
    },

    },
    
    "circuit": {
        "label": "Circuit",
        "model": Circuit,
        "fields": [
            "nom", "departement", "description", "actif",
        ],
        "required": ["nom", "departement"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "departement": Departement,
        },
        "fk_lookup": {
            "departement": "numero",
        },
    },
    
    "service": {
        "label": "Service",
        "model": Service,
        "fields": [
            "nom", "societe", "description", "responsable", "actif",
        ],
        "required": ["nom", "societe"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
            "responsable": Salarie,
        },
        "fk_lookup": {
            "societe": "nom",
            "responsable": "matricule",
        },
    },
    
    "grade": {
        "label": "Grade",
        "model": Grade,
        "fields": ["nom", "societe", "ordre", "actif"],
        "required": ["nom", "societe"],
        "field_types": {
            "nom": "string",
            "ordre": "integer",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
        },
        "fk_lookup": {
            "societe": "nom",
        },
    },
    
    "creneau_travail": {
        "label": "Créneau de travail",
        "model": CreneauTravail,
        "fields": [
            "nom", "societe",
            "heure_debut", "heure_fin",
            "heure_pause_debut", "heure_pause_fin",
            "description", "actif",
        ],
        "required": ["nom", "societe", "heure_debut", "heure_fin"],
        "field_types": {
            "nom": "string",
            "heure_debut": "time",
            "heure_fin": "time",
            "heure_pause_debut": "time",
            "heure_pause_fin": "time",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {
            "societe": Societe,
        },
        "fk_lookup": {
            "societe": "nom",
        },
    },
    
    "equipement": {
        "label": "Équipement",
        "model": Equipement,
        "fields": [
            "nom", "type_equipement",
            "description", "stock_total",
            "stock_disponible", "actif",
        ],
        "required": ["nom", "type_equipement"],
        "field_types": {
            "nom": "string",
            "type_equipement": "choice",
            "description": "string",
            "stock_total": "integer",
            "stock_disponible": "integer",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
        "choices": {
            "type_equipement": [
                "casque", "pc", "laptop", "souris", "telephone", 
                "carte_sim", "ecran", "clavier", "docking", "autre"
            ],
        },
    },
    
    "type_acces": {
        "label": "Type d'accès",
        "model": TypeAcces,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
    
    "outil_travail": {
        "label": "Outil de travail",
        "model": OutilTravail,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
    
    "type_application_acces": {
        "label": "Type d'application",
        "model": TypeApplicationAcces,
        "fields": ["nom", "description", "actif"],
        "required": ["nom"],
        "field_types": {
            "nom": "string",
            "description": "string",
            "actif": "boolean",
        },
        "fk_fields": {},
        "fk_lookup": {},
    },
})


# ============================================================================
# FONCTIONS UTILITAIRES
# ============================================================================

def parse_value(value, field_type):
    """Parse une valeur selon son type"""
    if pd.isna(value) or value == "":
        return None
    
    value_str = str(value).strip()
    
    if field_type == "string":
        return value_str
    
    elif field_type == "integer":
        try:
            return int(value_str)
        except ValueError:
            raise ValueError(f"Impossible de convertir '{value_str}' en entier")
    
    elif field_type == "boolean":
        if value_str.lower() in ["true", "1", "oui", "yes", "o"]:
            return True
        elif value_str.lower() in ["false", "0", "non", "no", "n"]:
            return False
        else:
            raise ValueError(f"Impossible de convertir '{value_str}' en booléen (true/false, oui/non, 1/0)")
    
    elif field_type == "time":
        try:
            if ":" in value_str:
                parts = value_str.split(":")
                hour = int(parts[0])
                minute = int(parts[1])
                second = int(parts[2]) if len(parts) > 2 else 0
                return time(hour, minute, second)
            else:
                raise ValueError("Format attendu: HH:MM ou HH:MM:SS")
        except Exception as e:
            raise ValueError(f"Impossible de convertir '{value_str}' en heure: {e}")
    
    elif field_type == "choice":
        return value_str
    
    else:
        return value_str


def get_current_data(api_name):
    """Récupère la liste actuelle de l'API"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return None
    
    model = cfg["model"]
    objects = model.objects.all().values(*cfg["fields"])
    return list(objects)


def generate_template_dataframe(api_name):
    """Génère un DataFrame vide avec la structure de l'API"""
    cfg = IMPORT_CONFIG.get(api_name)
    if not cfg:
        return None
    
    # Créer une ligne d'exemple
    example_row = {}
    for field in cfg["fields"]:
        field_type = cfg["field_types"].get(field, "string")
        
        if field_type == "boolean":
            example_row[field] = "oui"
        elif field_type == "integer":
            example_row[field] = "0"
        elif field_type == "time":
            example_row[field] = "09:00:00"
        elif field_type == "choice":
            choices = cfg.get("choices", {}).get(field, [])
            example_row[field] = choices[0] if choices else ""
        else:
            example_row[field] = ""
    
    df = pd.DataFrame([example_row])
    return df
