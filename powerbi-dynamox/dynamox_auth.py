"""
Dynamox API Authentication Helper
Gera tokens JWT assinados com a chave RSA privada para autenticação na API Dynamox.
"""

import json
import time
import uuid
from pathlib import Path

import jwt  # PyJWT
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend


CONFIG_PATH = Path(__file__).parent / "dynamox_config.json"
BASE_URL = "https://api.dynamox.solutions"


def load_config() -> dict:
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def generate_token(config: dict) -> str:
    """Gera um JWT assinado com a chave RSA privada."""
    private_key_pem = config["privateKey"].encode()
    private_key = serialization.load_pem_private_key(
        private_key_pem, password=None, backend=default_backend()
    )

    now = int(time.time())
    payload = {
        "iss": config["applicationId"],
        "sub": config["email"],
        "aud": BASE_URL,
        "iat": now,
        "exp": now + 3600,  # validade de 1 hora
        "jti": str(uuid.uuid4()),
    }

    token = jwt.encode(payload, private_key, algorithm="RS256")
    return token


def get_headers(config: dict | None = None) -> dict:
    """Retorna os headers HTTP com o token de autorização."""
    if config is None:
        config = load_config()
    token = generate_token(config)
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


if __name__ == "__main__":
    cfg = load_config()
    token = generate_token(cfg)
    print("Token gerado com sucesso:")
    print(token)
