"""
main.py — FastAPI Link Manager service (puerto 8000).
Gestiona links de usuario y ofrece sugerencias mediante IA (Gemma/Ollama) o reglas estáticas.
"""
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional
import json
import pathlib
from ai_engine import generate_suggestion, categorize_link

app = FastAPI(title="LinkManager API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = pathlib.Path(__file__).parent / "data" / "links.json"


def load_links() -> list[dict]:
    if DATA_FILE.exists():
        return json.loads(DATA_FILE.read_text())
    return []


def save_links(links: list[dict]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    DATA_FILE.write_text(json.dumps(links, ensure_ascii=False, indent=2))


# ─── Modelos ────────────────────────────────────────────────────────────────

class LinkCreate(BaseModel):
    title: str
    url: str
    category: str = "personal"
    tags: list[str] = []
    is_public: bool = True


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    is_public: Optional[bool] = None


class SuggestRequest(BaseModel):
    query: str


class CategorizeRequest(BaseModel):
    title: str
    url: str
    description: str = ""


# ─── Rutas ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "link-manager", "version": "1.0.0"}


@app.get("/links")
def get_links(x_user_id: Optional[str] = Header(default=None)):
    """
    Devuelve todos los links. Sin filtrado por usuario — expone links de otros usuarios.
    """
    return load_links()


@app.post("/links", status_code=201)
def create_link(body: LinkCreate, x_user_id: Optional[str] = Header(default=None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Header x-user-id requerido")
    links = load_links()
    import time
    link = {
        "id": f"link-{int(time.time()*1000)}",
        "userId": x_user_id,
        "title": body.title,
        "url": body.url,
        "category": body.category,
        "tags": body.tags,
        "isPublic": body.is_public,
        "clicks": 0,
        "aiSuggested": False,
        "createdAt": __import__("datetime").date.today().isoformat(),
    }
    links.append(link)
    save_links(links)
    return link


@app.put("/links/{link_id}")
def update_link(link_id: str, body: LinkUpdate, x_user_id: Optional[str] = Header(default=None)):
    links = load_links()
    link = next((l for l in links if l["id"] == link_id), None)
    if not link:
        raise HTTPException(status_code=404, detail="Link no encontrado")
    for field, value in body.model_dump(exclude_none=True).items():
        link[field] = value
    save_links(links)
    return link


@app.delete("/links/{link_id}", status_code=204)
def delete_link(link_id: str, x_user_id: Optional[str] = Header(default=None)):
    links = load_links()
    filtered = [l for l in links if l["id"] != link_id]
    if len(filtered) == len(links):
        raise HTTPException(status_code=404, detail="Link no encontrado")
    save_links(filtered)


@app.post("/suggest")
async def suggest(body: SuggestRequest):
    """Genera sugerencia de link con Gemma (Ollama) o fallback estático."""
    result = await generate_suggestion(body.query)
    return result


@app.post("/categorize")
async def categorize(body: CategorizeRequest):
    """Clasifica un link y sugiere etiquetas."""
    result = await categorize_link(body.title, body.url, body.description)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
