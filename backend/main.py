"""
FastAPI server — Manzi Law Assistant
Run: uvicorn main:app --reload --port 8000
"""

import os
import anthropic
import chromadb
import voyageai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

app = FastAPI(title="Manzi Law Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients ──────────────────────────────────────────────────────────────────
voyage_client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
chroma_client = chromadb.PersistentClient(path="./chroma_db")

try:
    collection = chroma_client.get_collection("law_documents")
except Exception:
    collection = None

# ── Prompts ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Manzi, an expert legal assistant specializing in Rwandan law.

Your role:
- Answer questions based ONLY on the legal document excerpts provided to you
- Always cite the specific article, section, or provision you are referencing
- If the answer is not found in the provided excerpts, clearly say so — do not guess
- Be precise, professional, and easy to understand

Language rule:
- ALWAYS respond in the SAME language the user used to ask the question
- If the user asks in Kinyarwanda → answer in Kinyarwanda
- If the user asks in French → answer in French
- If the user asks in English → answer in English

Format your answers clearly. When citing a provision, mention the document name and article number if available."""

# ── Schemas ───────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[Message]] = []


class Source(BaseModel):
    label: str
    page: int
    relevance: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    indexed = collection.count() if collection else 0
    return {
        "status": "ok",
        "indexed_chunks": indexed,
        "ready": indexed > 0,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if not collection or collection.count() == 0:
        raise HTTPException(
            status_code=503,
            detail="Documents not indexed yet. Run ingest.py first.",
        )

    # 1. Embed the user question
    query_embedding = voyage_client.embed(
        [request.message],
        model="voyage-law-2",
        input_type="query",
    ).embeddings[0]

    # 2. Retrieve top 5 relevant chunks from Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5,
        include=["documents", "metadatas", "distances"],
    )

    chunks = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    # 3. Build context block
    context_parts = []
    for chunk, meta in zip(chunks, metadatas):
        context_parts.append(
            f"[{meta['label']} — Page {meta['page']}]\n{chunk}"
        )
    context = "\n\n---\n\n".join(context_parts)

    # 4. Build messages — history + current question with context
    messages = []

    for msg in request.history[-6:]:  # keep last 3 turns
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({
        "role": "user",
        "content": (
            f"RELEVANT LEGAL PROVISIONS:\n\n{context}"
            f"\n\n---\n\nQUESTION: {request.message}"
        ),
    })

    # 5. Call Claude
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    answer = response.content[0].text

    # 6. Build sources list (deduplicated by label+page)
    seen = set()
    sources = []
    for meta, distance in zip(metadatas, distances):
        key = (meta["label"], meta["page"])
        if key not in seen:
            seen.add(key)
            sources.append(
                Source(
                    label=meta["label"],
                    page=meta["page"],
                    relevance=round(1 - distance, 3),
                )
            )

    return ChatResponse(answer=answer, sources=sources)
