"""
Dynamox → Power BI (Servidor Local REST)
=========================================
Alternativa ao conector Python: expõe endpoints REST que o Power BI
acessa via "Obter Dados → Web".

Iniciar o servidor:
  pip install flask requests PyJWT cryptography
  python dynamox_server.py

Endpoints disponíveis (use no Power BI → Web):
  http://localhost:8765/machines
  http://localhost:8765/sensors
  http://localhost:8765/alerts
  http://localhost:8765/measurements?limit=500
"""

import json
import time
import uuid
from pathlib import Path

import jwt
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from flask import Flask, Response, jsonify, request

app = Flask(__name__)

CONFIG_PATH = Path(__file__).parent / "dynamox_config.json"
BASE_URL = "https://api.dynamox.solutions"

_token_cache: dict = {"token": None, "exp": 0}


def _load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def _get_token():
    """Reutiliza o token enquanto estiver válido (com 60s de margem)."""
    now = int(time.time())
    if _token_cache["token"] and _token_cache["exp"] - now > 60:
        return _token_cache["token"]

    cfg = _load_config()
    private_key = serialization.load_pem_private_key(
        cfg["privateKey"].encode(), password=None, backend=default_backend()
    )
    exp = now + 3600
    payload = {
        "iss": cfg["applicationId"],
        "sub": cfg["email"],
        "aud": BASE_URL,
        "iat": now,
        "exp": exp,
        "jti": str(uuid.uuid4()),
    }
    token = jwt.encode(payload, private_key, algorithm="RS256")
    _token_cache["token"] = token
    _token_cache["exp"] = exp
    return token


def _proxy(path: str, params: dict | None = None):
    headers = {
        "Authorization": f"Bearer {_get_token()}",
        "Content-Type": "application/json",
    }
    resp = requests.get(f"{BASE_URL}{path}", headers=headers, params=params, timeout=30)
    return resp.status_code, resp.json()


# ── Rotas ─────────────────────────────────────────────────────────────────────

@app.route("/machines")
def machines():
    status, data = _proxy("/v2/machines")
    return jsonify(data), status


@app.route("/sensors")
def sensors():
    status, data = _proxy("/v2/sensors")
    return jsonify(data), status


@app.route("/alerts")
def alerts():
    status, data = _proxy("/v2/alerts")
    return jsonify(data), status


@app.route("/measurements")
def measurements():
    limit = request.args.get("limit", 500)
    machine_id = request.args.get("machineId")
    sensor_id = request.args.get("sensorId")
    params = {"limit": limit}
    if machine_id:
        params["machineId"] = machine_id
    if sensor_id:
        params["sensorId"] = sensor_id
    status, data = _proxy("/v2/measurements", params=params)
    return jsonify(data), status


@app.route("/health")
def health():
    return jsonify({"status": "ok", "baseUrl": BASE_URL})


# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Servidor Dynamox iniciado em http://localhost:8765")
    print("Use estes endpoints no Power BI (Obter Dados → Web):")
    for route in ["/machines", "/sensors", "/alerts", "/measurements"]:
        print(f"  http://localhost:8765{route}")
    app.run(host="127.0.0.1", port=8765, debug=False)
