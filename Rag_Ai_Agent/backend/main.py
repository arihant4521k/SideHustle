import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env vars (GEMINI_API_KEY)
load_dotenv()

from rag.pdf_to_text import pdf_to_text
from rag.chunking import chunk_text
from rag.embed_store import build_and_save_index, load_index
from rag.rag_answer import retrieve, generate_answer

app = FastAPI()

# Setup paths
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True) # Ensure data folder exists

PDF_PATH = os.path.join(DATA_DIR, "knowledge.pdf")
INDEX_PATH = os.path.join(DATA_DIR, "index.faiss")
META_PATH = os.path.join(DATA_DIR, "chunks.json")

index = None
chunks = None

class ChatIn(BaseModel):
    message: str

# --- NEW: UPLOAD ENDPOINT ---
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Uploads a PDF file and overwrites the existing knowledge.pdf
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    # Save the file to knowledge.pdf
    try:
        with open(PDF_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

    return {"status": "success", "filename": file.filename, "message": "File uploaded. Run /ingest to process it."}

@app.post("/ingest")
def ingest():
    global index, chunks
    
    # 1. Check if PDF exists
    if not os.path.exists(PDF_PATH):
        return {"status": "error", "message": "No PDF found. Please upload one first using /upload"}

    # 2. Process
    try:
        text = pdf_to_text(PDF_PATH)
        new_chunks = chunk_text(text)
        
        if not new_chunks:
             return {"status": "error", "message": "PDF extracted text is empty."}

        build_and_save_index(new_chunks, INDEX_PATH, META_PATH)
        
        # 3. Reload into memory
        index, chunks = load_index(INDEX_PATH, META_PATH)
        
        return {"status": "ok", "chunks_count": len(chunks)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/chat")
def chat(payload: ChatIn):
    global index, chunks

    # Lazy load if server restarted
    if index is None or chunks is None:
        if os.path.exists(INDEX_PATH) and os.path.exists(META_PATH):
            index, chunks = load_index(INDEX_PATH, META_PATH)
        else:
            return {"answer": "System not ready. Please upload a PDF and run /ingest first."}

    hits = retrieve(payload.message, index, chunks)
    answer = generate_answer(payload.message, hits)

    return {"answer": answer}

# OPNEAI Dependancy

# import os
# from fastapi import FastAPI
# from pydantic import BaseModel

# from rag.pdf_to_text import pdf_to_text
# from rag.chunking import chunk_text
# from rag.embed_store import build_and_save_index, load_index
# from rag.rag_answer import retrieve, generate_answer

# app = FastAPI()

# DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
# PDF_PATH = os.path.join(DATA_DIR, "knowledge.pdf")
# INDEX_PATH = os.path.join(DATA_DIR, "index.faiss")
# META_PATH = os.path.join(DATA_DIR, "chunks.json")

# index = None
# chunks = None

# class ChatIn(BaseModel):
#     message: str


# @app.post("/ingest")
# def ingest():
#     global index, chunks

#     text = pdf_to_text(PDF_PATH)
#     chunks = chunk_text(text)
#     build_and_save_index(chunks, INDEX_PATH, META_PATH)
#     index, chunks = load_index(INDEX_PATH, META_PATH)

#     return {"status": "ok", "chunks": len(chunks)}


# @app.post("/chat")
# def chat(payload: ChatIn):
#     global index, chunks

#     if index is None or chunks is None:
#         if os.path.exists(INDEX_PATH) and os.path.exists(META_PATH):
#             index, chunks = load_index(INDEX_PATH, META_PATH)
#         else:
#             return {"answer": "Knowledge base not ingested yet. Call /ingest first."}

#     hits = retrieve(payload.message, index, chunks)
#     answer = generate_answer(payload.message, hits)

#     return {"answer": answer}