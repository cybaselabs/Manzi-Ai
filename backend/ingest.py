"""
Ingest pipeline: PDF → extract text → chunk → Voyage AI embed → Chroma
Run once: python ingest.py
"""

import os
import re
import pdfplumber
import chromadb
import voyageai
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
CHROMA_PATH = "./chroma_db"
PDF_DIR = "./pdfs"
CHUNK_SIZE = 1000   # characters
CHUNK_OVERLAP = 200
BATCH_SIZE = 64     # Voyage AI batch size

SOURCE_LABELS = {
    "swamplands_pmo_2024": "PMO No 001/2024 – Swamplands Law",
    "road_use_2026": "Road Use Law (March 2026)",
    "tax_law_2023": "Tax & Financial Law (September 2023)",
}

voyage_client = voyageai.Client(api_key=VOYAGE_API_KEY)
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def get_or_create_collection():
    return chroma_client.get_or_create_collection(
        name="law_documents",
        metadata={"hnsw:space": "cosine"},
    )


def extract_text_from_pdf(pdf_path: str) -> list[dict]:
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and text.strip():
                pages.append({"page": i + 1, "text": text.strip()})
    return pages


def chunk_by_articles(text: str) -> list[str]:
    """
    Split text on article boundaries (Article X / Ingingo ya X / ARTICLE X).
    Falls back to fixed-size chunking for non-article content.
    """
    article_pattern = re.compile(
        r"(?=(?:Article|ARTICLE|Ingingo\s+ya|INGINGO\s+YA)\s+\d+)",
        re.IGNORECASE,
    )
    parts = article_pattern.split(text)
    chunks = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        if len(part) <= CHUNK_SIZE:
            chunks.append(part)
        else:
            # Split large articles further with overlap
            start = 0
            while start < len(part):
                end = start + CHUNK_SIZE
                chunks.append(part[start:end])
                start += CHUNK_SIZE - CHUNK_OVERLAP

    return [c for c in chunks if len(c.strip()) > 50]


def ingest_pdf(pdf_path: str, source_key: str, collection):
    label = SOURCE_LABELS.get(source_key, source_key)
    print(f"\n📄 Processing: {label}")

    pages = extract_text_from_pdf(pdf_path)
    print(f"   Extracted {len(pages)} pages")

    # Check if already ingested
    existing = collection.get(where={"source": source_key}, limit=1)
    if existing["ids"]:
        print(f"   ⚠️  Already ingested — skipping. Delete chroma_db/ to re-index.")
        return

    all_chunks, all_metadatas, all_ids = [], [], []

    for page_data in pages:
        chunks = chunk_by_articles(page_data["text"])
        for i, chunk in enumerate(chunks):
            chunk_id = f"{source_key}_p{page_data['page']}_c{i}"
            all_chunks.append(chunk)
            all_metadatas.append({
                "source": source_key,
                "label": label,
                "page": page_data["page"],
            })
            all_ids.append(chunk_id)

    print(f"   {len(all_chunks)} chunks ready — embedding with voyage-law-2...")

    for i in range(0, len(all_chunks), BATCH_SIZE):
        batch_chunks = all_chunks[i : i + BATCH_SIZE]
        batch_meta = all_metadatas[i : i + BATCH_SIZE]
        batch_ids = all_ids[i : i + BATCH_SIZE]

        result = voyage_client.embed(
            batch_chunks,
            model="voyage-law-2",
            input_type="document",
        )
        collection.add(
            documents=batch_chunks,
            embeddings=result.embeddings,
            metadatas=batch_meta,
            ids=batch_ids,
        )
        print(f"   ✓ Batch {i // BATCH_SIZE + 1}/{-(-len(all_chunks) // BATCH_SIZE)} stored")

    print(f"   ✅ Done: {len(all_chunks)} chunks indexed for {label}")


def main():
    pdfs = {
        "swamplands_pmo_2024": f"{PDF_DIR}/swamplands.pdf",
        "road_use_2026": f"{PDF_DIR}/road_use.pdf",
        "tax_law_2023": f"{PDF_DIR}/tax_law.pdf",
    }

    collection = get_or_create_collection()

    missing = [k for k, v in pdfs.items() if not Path(v).exists()]
    if missing:
        print("\n❌ Missing PDF files:")
        for k in missing:
            print(f"   {pdfs[k]}")
        print(
            "\nCopy your PDFs into backend/pdfs/ and rename them:\n"
            "  swamplands.pdf  → PMO No 001/2024 Swamplands\n"
            "  road_use.pdf    → Road Use Law March 2026\n"
            "  tax_law.pdf     → Tax/Financial Law Sept 2023\n"
        )
        return

    for source_key, pdf_path in pdfs.items():
        ingest_pdf(pdf_path, source_key, collection)

    total = collection.count()
    print(f"\n🎉 Ingestion complete! Total chunks in DB: {total}")


if __name__ == "__main__":
    main()
