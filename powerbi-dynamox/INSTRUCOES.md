# Dynamox API → Power BI

## Pré-requisitos

```bash
pip install PyJWT cryptography requests pandas flask
```

---

## Opção 1 — Conector Python (recomendado)

> Funciona offline, sem servidor rodando.

1. Copie a pasta `powerbi-dynamox` para o seu PC (ex: `C:\PowerBI\Dynamox\`)
2. Edite `dynamox_powerbi.py` e ajuste a variável `CONFIG_PATH`:
   ```python
   CONFIG_PATH = Path(r"C:\PowerBI\Dynamox\dynamox_config.json")
   ```
3. No **Power BI Desktop**:
   - **Obter Dados** → **Outro** → **Script Python**
   - Cole o conteúdo completo de `dynamox_powerbi.py`
   - Clique em **OK**
4. O Power BI mostrará as tabelas: `machines`, `sensors`, `alerts`, `measurements`
5. Selecione as tabelas desejadas → **Carregar**

---

## Opção 2 — Servidor REST local

> Útil para atualização automática ou múltiplos relatórios.

1. Execute o servidor na sua máquina:
   ```bash
   python dynamox_server.py
   ```
2. No **Power BI Desktop**:
   - **Obter Dados** → **Web**
   - URL: `http://localhost:8765/machines`
   - Repita para cada endpoint: `/sensors`, `/alerts`, `/measurements`

### Endpoints disponíveis

| Endpoint | Descrição |
|---|---|
| `GET /machines` | Lista todas as máquinas |
| `GET /sensors` | Lista todos os sensores |
| `GET /alerts` | Lista alertas ativos |
| `GET /measurements?limit=500` | Últimas medições |
| `GET /measurements?machineId=X` | Medições de uma máquina |
| `GET /health` | Verifica conexão |

---

## Atualização automática no Power BI Service

Para publicar o relatório no **Power BI Service** com atualização agendada,
use o **Power BI Gateway (modo pessoal)** na máquina onde o servidor local
está rodando, ou migre o `dynamox_server.py` para um servidor com IP fixo
(Azure App Service, AWS EC2, etc.) e aponte o Power BI para o endereço público.

---

## Arquivos

| Arquivo | Descrição |
|---|---|
| `dynamox_config.json` | Credenciais da API (não versionei em repositório público) |
| `dynamox_auth.py` | Módulo de autenticação JWT |
| `dynamox_powerbi.py` | Script para conector Python do Power BI |
| `dynamox_server.py` | Servidor REST local (alternativa Web) |
| `requirements.txt` | Dependências Python |
