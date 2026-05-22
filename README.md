# Threats-demo-4

## Ejecución en local

### Requisitos

- Node.js 20+ y npm
- Python 3.11+ (solo si quieres levantar `apps/link-manager`)
- Opcional: Ollama en `http://localhost:11434` para probar las sugerencias IA con Gemma

### Instalación

```bash
npm install
npm run install:all
```

### Arranque del frontend y la API

Desde la raíz del repositorio:

```bash
npm run dev
```

Esto levanta:

- Web en `http://localhost:5173`
- API en `http://localhost:3001`

Si prefieres arrancarlos por separado:

```bash
npm run dev:web
npm run dev:api
```

### Servicio Python opcional

Si quieres ejecutar el servicio `link-manager`:

```bash
cd apps/link-manager
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Quedará disponible en `http://localhost:8000`.

### Build

```bash
npm run build
npm --prefix apps/api run build
```
