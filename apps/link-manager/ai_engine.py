"""
ai_engine.py — Motor de IA para sugerencias de links.
Intenta usar Gemma 2:2b vía Ollama local; si no está disponible, usa reglas estáticas.
"""
import httpx
import json
from typing import Optional

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma2:2b"

STATIC_SUGGESTIONS = [
    {
        "title": "The Pragmatic Programmer",
        "url": "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
        "category": "aprendizaje",
        "tags": ["programación", "buenas prácticas", "libros"],
        "description": "Referencia clásica de desarrollo de software profesional."
    },
    {
        "title": "Hacker News",
        "url": "https://news.ycombinator.com",
        "category": "noticias",
        "tags": ["tech", "startups", "noticias"],
        "description": "Agregador de noticias tecnológicas de Y Combinator."
    },
    {
        "title": "Excalidraw",
        "url": "https://excalidraw.com",
        "category": "herramienta",
        "tags": ["diagramas", "diseño", "colaboración"],
        "description": "Pizarra virtual para diagramas de arquitectura rápidos."
    },
    {
        "title": "roadmap.sh",
        "url": "https://roadmap.sh",
        "category": "aprendizaje",
        "tags": ["carrera", "frontend", "backend", "devops"],
        "description": "Rutas de aprendizaje para desarrolladores en 2026."
    },
    {
        "title": "Overleaf",
        "url": "https://overleaf.com",
        "category": "herramienta",
        "tags": ["LaTeX", "documentos", "académico"],
        "description": "Editor LaTeX colaborativo en línea."
    },
]

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "trabajo":        ["trabajo", "empresa", "negocio", "profesional", "reunión", "proyecto"],
    "aprendizaje":    ["aprender", "tutorial", "curso", "documentación", "guía", "libro", "estudio"],
    "noticias":       ["noticia", "actualidad", "diario", "blog", "newsletter", "rss"],
    "entretenimiento":["juego", "música", "película", "serie", "ocio", "entretenimiento"],
    "herramienta":    ["herramienta", "utilidad", "app", "software", "servicio", "api", "dev"],
    "personal":       ["personal", "diario", "familia", "social", "amistad"],
}


def classify_category(title: str, url: str, description: str = "") -> str:
    text = f"{title} {url} {description}".lower()
    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] = sum(1 for kw in keywords if kw in text)
    best = max(scores, key=lambda k: scores[k])
    return best if scores[best] > 0 else "personal"


def suggest_tags(title: str, url: str) -> list[str]:
    text = f"{title} {url}".lower()
    all_tags = [
        "react", "typescript", "python", "javascript", "frontend", "backend",
        "devops", "cloud", "aws", "docker", "kubernetes", "seguridad", "ia",
        "diseño", "ux", "datos", "machine learning", "open source",
    ]
    return [t for t in all_tags if t in text][:5]


async def ask_gemma(prompt: str) -> Optional[str]:
    """Intenta consultar Gemma vía Ollama. Devuelve None si no está disponible."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                OLLAMA_URL,
                json={"model": MODEL, "prompt": prompt, "stream": False},
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("response", "").strip()
    except (httpx.ConnectError, httpx.TimeoutException, httpx.RequestError):
        pass
    return None


async def generate_suggestion(query: str) -> dict:
    """Genera una sugerencia de link basada en la consulta."""
    prompt = (
        f"Eres un asistente de gestión de contenido digital. "
        f"El usuario busca links sobre: '{query}'. "
        f"Sugiere UN recurso web útil. Responde en JSON con campos: "
        f"title, url, category (trabajo/aprendizaje/noticias/entretenimiento/herramienta/personal), "
        f"tags (lista de strings), description."
    )
    ai_response = await ask_gemma(prompt)
    if ai_response:
        try:
            # Intentar parsear JSON del modelo
            start = ai_response.find("{")
            end = ai_response.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(ai_response[start:end])
                return {**parsed, "source": "gemma"}
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback: regla estática basada en keywords
    import random
    suggestion = random.choice(STATIC_SUGGESTIONS)
    return {**suggestion, "source": "static"}


async def categorize_link(title: str, url: str, description: str = "") -> dict:
    """Categoriza y sugiere etiquetas para un link."""
    prompt = (
        f"Categoriza el siguiente enlace. Título: '{title}', URL: '{url}'. "
        f"Categorías posibles: trabajo, aprendizaje, noticias, entretenimiento, herramienta, personal. "
        f"Responde SOLO con JSON: {{category: string, tags: [string], confidence: float}}"
    )
    ai_response = await ask_gemma(prompt)
    if ai_response:
        try:
            start = ai_response.find("{")
            end = ai_response.rfind("}") + 1
            if start >= 0 and end > start:
                parsed = json.loads(ai_response[start:end])
                return {**parsed, "source": "gemma"}
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback estático
    return {
        "category": classify_category(title, url, description),
        "tags": suggest_tags(title, url),
        "confidence": 0.6,
        "source": "static",
    }
