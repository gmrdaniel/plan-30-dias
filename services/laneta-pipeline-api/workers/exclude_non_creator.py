"""
Exclude Non-Creator Worker (extended)
======================================
Lógica de _filtro_prevalidacion.py: typos dominio, Gmail placeholder,
role-based extendido (sales@, ventas@, info@, contacto@, facturas@),
dummies, sintaxis RFC.

Writes to creator_inventory:
  non_creator_filter  ('passed' | 'excluded' | 'needs_review')
  non_creator_reason  (string con razón específica)
  email                (corregido si typo de dominio)
"""

import re
import logging
from typing import Optional, Tuple

from workers.db_helpers import safe_maybe_single

logger = logging.getLogger(__name__)


DOMAIN_TYPOS = {
    "gamil.com": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com",
    "gmaill.com": "gmail.com", "gmailcom": "gmail.com",
    "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.om": "gmail.com",
    "hotnail.com": "hotmail.com", "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com", "hormail.com": "hotmail.com",
    "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com",
    "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.co": "outlook.com",
    "iclould.com": "icloud.com", "icoud.com": "icloud.com",
}

ROLE_LOCALS = {
    # English
    "info", "support", "sales", "help", "service", "customerservice",
    "contact", "hello", "admin", "general", "inquiries", "inquiry",
    "booking", "press", "media", "team", "office", "experience",
    "businessinquiries", "reception", "postmaster", "webmaster",
    "abuse", "noc", "security", "marketing", "hr",
    "careers", "jobs", "enquiry", "enquiries",
    # Español
    "soporte", "ventas", "hola", "contacto", "facturas", "facturacion",
    "atencion", "atencionalcliente", "gerencia", "administracion",
    "comercial", "compras", "cobranzas", "rh", "recursoshumanos",
}

PERSONAL_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.ca", "yahoo.es", "yahoo.com.mx",
    "yahoo.co.uk", "yahoo.fr", "yahoo.de", "yahoo.it",
    "outlook.com", "outlook.es", "outlook.com.mx",
    "hotmail.com", "hotmail.es", "hotmail.com.mx", "hotmail.fr", "hotmail.it",
    "icloud.com", "me.com", "mac.com",
    "live.com", "live.com.mx", "live.es",
    "aol.com", "proton.me", "protonmail.com",
    "gmx.com", "gmx.net", "mail.com", "yandex.com", "yandex.ru",
}

DUMMY_LOCALS = {
    "test", "asdf", "qwerty", "noreply", "no-reply", "na", "n/a",
    "none", "null", "example", "user", "admin123",
}


def validate_email_extended(raw: str) -> Tuple[Optional[str], str]:
    if not raw:
        return None, "empty"
    email = raw.strip().lower()
    if "@" not in email:
        return None, "no_at"
    local, dom = email.rsplit("@", 1)

    original_local = local
    local = local.lstrip("-").lstrip(".")
    if local.startswith("www."):
        local = local[4:]
    if local.startswith("www") and len(local) > 3 and local[3] in ".-_":
        local = local[4:]
    if not local:
        return None, "empty_local_after_cleanup"
    prefix_cleaned = local != original_local

    domain_fixed = dom in DOMAIN_TYPOS
    dom = DOMAIN_TYPOS.get(dom, dom)

    if local.startswith(".") or local.endswith("."):
        return None, "invalid_syntax_dot"
    if ".." in local or ".." in dom:
        return None, "invalid_syntax_double_dot"
    if not re.match(r"^[a-z0-9._%+\-]+$", local):
        return None, "invalid_local_chars"
    if "." not in dom or dom.startswith(".") or dom.endswith("."):
        return None, "invalid_domain"
    if not re.match(r"^[a-z0-9.\-]+\.[a-z]{2,}$", dom):
        return None, "invalid_domain_format"

    if dom not in PERSONAL_DOMAINS:
        base = re.split(r"[-.+_]", local)[0]
        if base in ROLE_LOCALS:
            return None, f"role_based:{base}"
        if "-" in local and local.split("-")[0] in ROLE_LOCALS:
            return None, f"role_based:{local.split('-')[0]}"

    if local in DUMMY_LOCALS:
        return None, "dummy"

    if dom == "gmail.com" and len(local) <= 5 and local.isalpha():
        return None, "gmail_placeholder"

    cleaned = f"{local}@{dom}"
    if domain_fixed:
        return cleaned, "cleaned:typo_fixed"
    if prefix_cleaned or cleaned != email:
        return cleaned, "cleaned"
    return cleaned, "ok"


async def run(db, entity_type: str, entity_id: str, config: dict) -> dict:
    if entity_type != "creator":
        return {"success": False, "error": f"Unsupported entity_type: {entity_type}"}

    entity = safe_maybe_single(
        db.table("creator_inventory")
          .select("email, non_creator_filter, non_creator_reason")
          .eq("id", entity_id)
    )
    if not entity or not entity.get("email"):
        return {"success": False, "error": "Entity not found or no email"}

    raw_email = entity["email"]
    cleaned, reason = validate_email_extended(raw_email)

    old_value = {
        "email": raw_email,
        "non_creator_filter": entity.get("non_creator_filter"),
        "non_creator_reason": entity.get("non_creator_reason"),
    }

    if cleaned is None:
        update = {
            "non_creator_filter": "excluded",
            "non_creator_reason": reason,
        }
        db.table("creator_inventory").update(update).eq("id", entity_id).execute()
        return {
            "success": True,
            "old_value": old_value,
            "new_value": update,
            "result_label": f"excluded:{reason}",
        }

    update = {
        "non_creator_filter": "passed",
        "non_creator_reason": None,
    }
    if cleaned != raw_email.strip().lower():
        update["email"] = cleaned
    db.table("creator_inventory").update(update).eq("id", entity_id).execute()

    return {
        "success": True,
        "old_value": old_value,
        "new_value": update,
        "result_label": "passed" if reason == "ok" else f"passed:{reason}",
    }
