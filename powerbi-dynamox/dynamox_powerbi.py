"""
Dynamox → Power BI (Conector Python)
=====================================
Como usar no Power BI Desktop:
  1. Obter Dados → Python Script
  2. Cole este código inteiro na caixa de script
  3. O Power BI exibirá as tabelas: machines, sensors, alerts

Requisitos (instale no mesmo Python que o Power BI usa):
  pip install requests PyJWT cryptography pandas
"""

import json
import time
import uuid
from pathlib import Path

import jwt
import pandas as pd
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization

# ── Configuração ─────────────────────────────────────────────────────────────
CONFIG_PATH = Path(r"C:\PowerBI\Dynamox\dynamox_config.json")  # ajuste o caminho
BASE_URL = "https://api.dynamox.net"
# ─────────────────────────────────────────────────────────────────────────────


def _load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def _generate_token(config):
    private_key = serialization.load_pem_private_key(
        config["privateKey"].encode(), password=None, backend=default_backend()
    )
    now = int(time.time())
    payload = {
        "iss": config["applicationId"],
        "sub": config["email"],
        "aud": BASE_URL,
        "iat": now,
        "exp": now + 3600,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, private_key, algorithm="RS256")


def _headers(config):
    return {
        "Authorization": f"Bearer {_generate_token(config)}",
        "Content-Type": "application/json",
    }


def _get(path, config, params=None):
    resp = requests.get(f"{BASE_URL}{path}", headers=_headers(config), params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


# ── Busca de dados ────────────────────────────────────────────────────────────
cfg = _load_config()

# Máquinas
try:
    raw_machines = _get("/v2/machines", cfg)
    machines = pd.json_normalize(
        raw_machines.get("data", raw_machines) if isinstance(raw_machines, dict) else raw_machines
    )
except Exception as e:
    machines = pd.DataFrame({"erro": [str(e)]})

# Sensores
try:
    raw_sensors = _get("/v2/sensors", cfg)
    sensors = pd.json_normalize(
        raw_sensors.get("data", raw_sensors) if isinstance(raw_sensors, dict) else raw_sensors
    )
except Exception as e:
    sensors = pd.DataFrame({"erro": [str(e)]})

# Alertas
try:
    raw_alerts = _get("/v2/alerts", cfg)
    alerts = pd.json_normalize(
        raw_alerts.get("data", raw_alerts) if isinstance(raw_alerts, dict) else raw_alerts
    )
except Exception as e:
    alerts = pd.DataFrame({"erro": [str(e)]})

# Medições dos sensores (últimas leituras)
try:
    raw_measurements = _get("/v2/measurements", cfg, params={"limit": 500})
    measurements = pd.json_normalize(
        raw_measurements.get("data", raw_measurements)
        if isinstance(raw_measurements, dict)
        else raw_measurements
    )
except Exception as e:
    measurements = pd.DataFrame({"erro": [str(e)]})

# O Power BI exporá cada DataFrame como uma tabela separada:
# machines, sensors, alerts, measurements
