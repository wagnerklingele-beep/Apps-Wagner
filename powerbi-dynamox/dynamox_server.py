import json
import time
import uuid
from pathlib import Path

import jwt
import requests
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from flask import Flask, jsonify, request

app = Flask(__name__)

CONFIG_PATH = Path(__file__).parent / "dynamox_config.json"
BASE_URL = "https://api.dynamox.solutions"

_token_cache = {"token": None, "exp": 0}


def _load_config():
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def _get_token():
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


def _proxy(path, params=None):
    try:
        headers = {
            "Authorization": "Bearer " + _get_token(),
            "Content-Type": "application/json",
        }
        resp = requests.get(
            BASE_URL + path,
            headers=headers,
            params=params,
            timeout=10,
        )
        print("[OK] " + path + " -> HTTP " + str(resp.status_code))
        try:
            return resp.status_code, resp.json()
        except Exception:
            return resp.status_code, {"erro": resp.text[:500]}
    except requests.exceptions.Timeout:
        print("[ERRO] Timeout em " + path)
        return 504, {"erro": "Timeout ao conectar com a API Dynamox"}
    except requests.exceptions.ConnectionError as e:
        print("[ERRO] Conexao em " + path + ": " + str(e))
        return 503, {"erro": "Sem conexao com a API Dynamox: " + str(e)}
    except Exception as e:
        print("[ERRO] " + path + ": " + str(e))
        return 500, {"erro": str(e)}


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
    params = {"limit": request.args.get("limit", 500)}
    if request.args.get("machineId"):
        params["machineId"] = request.args.get("machineId")
    if request.args.get("sensorId"):
        params["sensorId"] = request.args.get("sensorId")
    status, data = _proxy("/v2/measurements", params=params)
    return jsonify(data), status


@app.route("/health")
def health():
    return jsonify({"status": "ok", "baseUrl": BASE_URL})


if __name__ == "__main__":
    print("Servidor Dynamox iniciado em http://localhost:8765")
    print("Use estes endpoints no Power BI (Obter Dados - Web):")
    for route in ["/machines", "/sensors", "/alerts", "/measurements"]:
        print("  http://localhost:8765" + route)
    app.run(host="127.0.0.1", port=8765, debug=False)
