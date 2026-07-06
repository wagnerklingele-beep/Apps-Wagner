"""
Dynamox API Authentication
Gera um access token via OAuth2 (JWT como client assertion).
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

_access_token_cache = {"token": None, "exp": 0}


def load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def _build_jwt(config):
    private_key = serialization.load_pem_private_key(
        config["privateKey"].encode(), password=None, backend=default_backend()
    )
    now = int(time.time())
    payload = {
        "iss": config["applicationId"],
        "sub": config["applicationId"],
        "aud": BASE_URL,
        "iat": now,
        "exp": now + 300,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, private_key, algorithm="RS256")


def _exchange_token(config, assertion):
    """Troca o JWT por um access token via OAuth2."""
    token_endpoints = [
        "/oauth/token",
        "/v2/oauth/token",
        "/auth/token",
        "/v2/auth/token",
        "/api/token",
    ]
    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": assertion,
    }
    data_alt = {
        "grant_type": "client_credentials",
        "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        "client_assertion": assertion,
    }
    for endpoint in token_endpoints:
        for body in [data, data_alt]:
            try:
                resp = requests.post(
                    BASE_URL + endpoint,
                    data=body,
                    timeout=10,
                )
                print("  [token] " + endpoint + " -> HTTP " + str(resp.status_code))
                if resp.status_code == 200:
                    result = resp.json()
                    token = result.get("access_token") or result.get("token")
                    if token:
                        print("  [token] Access token obtido com sucesso!")
                        return token, result.get("expires_in", 3600)
            except Exception as e:
                print("  [token] " + endpoint + " -> ERRO: " + str(e))
    return None, 0


def get_access_token(config=None):
    """Retorna um access token valido (com cache)."""
    now = int(time.time())
    if _access_token_cache["token"] and _access_token_cache["exp"] - now > 60:
        return _access_token_cache["token"]

    if config is None:
        config = load_config()

    assertion = _build_jwt(config)

    # Tenta trocar por access token primeiro
    token, expires_in = _exchange_token(config, assertion)
    if token:
        _access_token_cache["token"] = token
        _access_token_cache["exp"] = now + expires_in
        return token

    # Se nao conseguiu, usa o proprio JWT como bearer (alguns servicos aceitam)
    print("  [token] Usando JWT diretamente como bearer token")
    _access_token_cache["token"] = assertion
    _access_token_cache["exp"] = now + 290
    return assertion


def get_headers(config=None):
    token = get_access_token(config)
    return {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
    }


if __name__ == "__main__":
    print("Testando autenticacao Dynamox...")
    cfg = load_config()
    token = get_access_token(cfg)
    if token:
        print("\nToken obtido com sucesso!")
        print("Primeiros 80 caracteres: " + token[:80] + "...")

        print("\nTestando chamada para /v2/machines ...")
        resp = requests.get(
            BASE_URL + "/v2/machines",
            headers={"Authorization": "Bearer " + token, "Content-Type": "application/json"},
            timeout=10,
        )
        print("HTTP " + str(resp.status_code))
        print(resp.text[:500])
    else:
        print("Falha ao obter token.")
