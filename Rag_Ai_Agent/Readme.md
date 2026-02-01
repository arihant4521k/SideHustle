# 🚀 RAG ChatBot (Full Stack)

In this tutorial, we will build a **Retrieval Augmented Generation (RAG)** agent.

### What is RAG?
A normal chatbot answers questions based on memory or keyword-based logic coded into it. 

A **RAG ChatBot**, on the other hand, retrieves information from specific documents *before* generating a response. This allows it to provide accurate, context-aware answers based on your private data.

### Architecture
This app has two main parts:
* **Backend (Python):** Reads PDFs, chunks text, creates embeddings, stores them in a Vector DB, and generates answers via AI.
* **Frontend (React):** A clean, modern chat interface that allows PDF uploads and conversation.

---

## 🛠️ Tech Stack

### **Backend**
* **FastAPI** - High-performance API Server
* **PyPDF** - PDF text extraction
* **Sentence-Transformers** - Local, free embedding model (`all-MiniLM-L6-v2`)
* **FAISS** - Vector Database for similarity search
* **Google Gemini API** - LLM for answer generation (Free Tier)

### **Frontend**
* **Vite + React** - Fast frontend tooling
* **HeroUI (NextUI)** - Beautiful UI components
* **Tailwind CSS** - Styling framework
* **Framer Motion** - Animations

---

## 📂 Project Structure

```text
root/
├── backend/
│   ├── .env                    # API Keys (Create this file)
│   ├── main.py                 # API Entry point
│   ├── rag/
│   │   ├── pdf_to_text.py      # Extracts text from PDF
│   │   ├── chunking.py         # Splits text into chunks
│   │   ├── embed_store.py      # Handles FAISS and Embeddings
│   │   ├── rag_answer.py       # Interacts with Gemini API
│   │   └── make_sample_pdf.py  # Creates a dummy PDF for testing
│   └── data/
│       └── knowledge.pdf       # Stores uploaded PDF
│
└── frontend/
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── ChatWidget.jsx
        └── styles.css
```

## Run The Project
  **Prerequisites: Python 3.9+**
  **Backend:**
  ```bash
    cd backend
    echo "GEMINi_API_KEY=(Your Api Key From AiStudio)" > .env
    python -m venv .venv
    source .venv/bin/activate  #For Mac Or Linux
    .venv/bin/activate  #For Windows
    pip install -r requirements.txt
    python rag/make_sample_pdf.py
    uvicorn main:app --reload --port 8000
  ```
  
  **Build the index once:**
  ```bash
    curl -X POST http://localhost:8000/ingest
  ```

  **Frontend:**
  ```bash
    cd frontend
    npm install
    npm run dev
  ```
