"""
Script de diagnostico - testa varias combinacoes de autenticacao
para encontrar o formato correto do JWT para a API Dynamox.
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


def make_jwt(config, iss, sub, aud=None):
    private_key = serialization.load_pem_private_key(
        config["privateKey"].encode(), password=None, backend=default_backend()
    )
    now = int(time.time())
    payload = {
        "iss": iss,
        "sub": sub,
        "iat": now,
        "exp": now + 300,
        "jti": str(uuid.uuid4()),
    }
    if aud:
        payload["aud"] = aud
    return jwt.encode(payload, private_key, algorithm="RS256")


def test(label, token, path="/v2/machines"):
    try:
        resp = requests.get(
            BASE_URL + path,
            headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
            timeout=10,
            allow_redirects=True,
        )
        result = "HTTP " + str(resp.status_code)
        if resp.status_code == 200:
            result += " [SUCESSO!] " + resp.text[:200]
        else:
            result += " -> " + resp.text[:200]
    except Exception as e:
        result = "ERRO: " + str(e)[:100]
    print(("[OK]  " if "SUCESSO" in result else "[...] ") + label + ": " + result)
    print()
    return "SUCESSO" in result


cfg = load_config()
app_id = cfg["applicationId"]
email = cfg["email"]

print("=" * 60)
print("  Diagnostico de autenticacao Dynamox API")
print("  Base URL: " + BASE_URL)
print("  ApplicationId: " + app_id)
print("  Email: " + email)
print("=" * 60)
print()

combos = [
    ("iss=appId, sub=email, aud=base_url",
     make_jwt(cfg, app_id, email, BASE_URL)),
    ("iss=appId, sub=appId, aud=base_url",
     make_jwt(cfg, app_id, app_id, BASE_URL)),
    ("iss=appId, sub=email, sem aud",
     make_jwt(cfg, app_id, email, None)),
    ("iss=email, sub=email, aud=base_url",
     make_jwt(cfg, email, email, BASE_URL)),
    ("iss=appId, sub=email, aud=http (sem https)",
     make_jwt(cfg, app_id, email, "http://api.dynamox.solutions")),
    ("iss=appId, sub=email, aud=dominio simples",
     make_jwt(cfg, app_id, email, "api.dynamox.solutions")),
    ("iss=appId, sub=email, aud=dynamox.solutions",
     make_jwt(cfg, app_id, email, "dynamox.solutions")),
    ("iss=appId, sub=appId, sem aud",
     make_jwt(cfg, app_id, app_id, None)),
]

# Testa tambem endpoints alternativos
paths = ["/v2/machines", "/machines", "/v1/machines", "/api/v2/machines"]

found = False
for label, token in combos:
    if test(label, token):
        print(">>> COMBINACAO CORRETA ENCONTRADA: " + label)
        found = True
        break

if not found:
    print("Nenhuma combinacao padrao funcionou. Testando caminhos alternativos...")
    print()
    token = make_jwt(cfg, app_id, email, BASE_URL)
    for path in paths:
        if test("iss=appId sub=email aud=base_url path=" + path, token, path):
            print(">>> CAMINHO CORRETO: " + path)
            found = True
            break

if not found:
    print("=" * 60)
    print("Nao foi possivel autenticar automaticamente.")
    print("Verifique com o suporte Dynamox o formato correto do JWT")
    print("ou se o applicationId esta habilitado para API access.")
    print("=" * 60)
else:
    print("=" * 60)
    print("Autenticacao funcionando! Execute iniciar_dynamox.bat")
    print("=" * 60)

input("\nPressione Enter para fechar...")
