from pathlib import Path

import requests
from flask import Flask, jsonify, request
from dynamox_auth import get_headers, BASE_URL

app = Flask(__name__)

CONFIG_PATH = Path(__file__).parent / "dynamox_config.json"


def _proxy(path, params=None):
    try:
        headers = get_headers()
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
