"""
Script de diagnostico v2 - testa combinacoes com kid header e diferentes headers HTTP.
Execute: python testar_api.py
"""

import json
import time
import uuid
from pathlib import Path

import jwt
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

CONFIG_PATH = Path(__file__).parent / "dynamox_config.json"
BASE_URL = "https://api.dynamox.solutions"


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def make_jwt(config, iss, sub, aud=None, kid=None):
    private_key = serialization.load_pem_private_key(
        config["privateKey"].encode(), password=None, backend=default_backend()
    )
    now = int(time.time())
    payload = {"iss": iss, "sub": sub, "iat": now, "exp": now + 300, "jti": str(uuid.uuid4())}
    if aud:
        payload["aud"] = aud
    headers = {}
    if kid:
        headers["kid"] = kid
    return jwt.encode(payload, private_key, algorithm="RS256", headers=headers if headers else None)


def test(label, headers_http, path="/v2/machines"):
    try:
        resp = requests.get(BASE_URL + path, headers=headers_http, timeout=10)
        status = resp.status_code
        body = resp.text[:150]
        ok = status == 200
        prefix = "[OK!] " if ok else "[...] "
        print(prefix + label)
        print("      HTTP " + str(status) + " -> " + body)
        print()
        return ok
    except Exception as e:
        print("[ERR] " + label + ": " + str(e)[:100])
        print()
        return False


cfg = load_config()
app_id = cfg["applicationId"]
key_id = cfg["_id"]
email = cfg["email"]

print("=" * 65)
print("  Diagnostico Dynamox API v2")
print("  ApplicationId : " + app_id)
print("  KeyId (_id)   : " + key_id)
print("  Email         : " + email)
print("=" * 65)
print()

found = False

# --- Bloco 1: JWT com kid=_id ---
print("-- Bloco 1: JWT com kid = _id --")
for iss, sub, aud, desc in [
    (app_id, email,   BASE_URL, "iss=appId sub=email aud=url"),
    (app_id, app_id,  BASE_URL, "iss=appId sub=appId aud=url"),
    (app_id, email,   None,     "iss=appId sub=email sem aud"),
    (key_id, email,   BASE_URL, "iss=keyId sub=email aud=url"),
    (key_id, app_id,  BASE_URL, "iss=keyId sub=appId aud=url"),
]:
    token = make_jwt(cfg, iss, sub, aud, kid=key_id)
    if test(desc + " kid=_id", {"Authorization": "Bearer " + token, "Content-Type": "application/json"}):
        found = True
        break

# --- Bloco 2: JWT com kid=applicationId ---
if not found:
    print("-- Bloco 2: JWT com kid = applicationId --")
    for iss, sub, aud, desc in [
        (app_id, email,  BASE_URL, "iss=appId sub=email aud=url"),
        (app_id, email,  None,     "iss=appId sub=email sem aud"),
        (key_id, email,  BASE_URL, "iss=keyId sub=email aud=url"),
    ]:
        token = make_jwt(cfg, iss, sub, aud, kid=app_id)
        if test(desc + " kid=appId", {"Authorization": "Bearer " + token, "Content-Type": "application/json"}):
            found = True
            break

# --- Bloco 3: Headers alternativos ---
if not found:
    print("-- Bloco 3: Headers HTTP alternativos --")
    token = make_jwt(cfg, app_id, email, BASE_URL, kid=key_id)
    for header_name, header_value in [
        ("X-Api-Key",       token),
        ("X-Auth-Token",    token),
        ("Api-Key",         token),
        ("Authorization",   "Token " + token),
        ("Authorization",   "JWT " + token),
    ]:
        if test(header_name + ": " + header_value[:30] + "...", {header_name: header_value, "Content-Type": "application/json"}):
            found = True
            break

# --- Bloco 4: applicationId como API key ---
if not found:
    print("-- Bloco 4: ApplicationId como chave simples --")
    for header_name in ["X-Api-Key", "X-Application-Id", "Authorization"]:
        value = app_id if header_name != "Authorization" else "Bearer " + app_id
        if test(header_name + "=" + app_id, {header_name: value, "Content-Type": "application/json"}):
            found = True
            break

print("=" * 65)
if found:
    print("AUTENTICACAO FUNCIONANDO! Me mande um print desta tela.")
else:
    print("Nenhuma combinacao funcionou.")
    print("Provavelmente a API precisa de ativacao pelo suporte Dynamox.")
    print("Contate o suporte e pergunte: 'Como autenticar via JWT RSA na API?'")
print("=" * 65)

input("\nPressione Enter para fechar...")
