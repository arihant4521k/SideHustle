# 🚀 LLM ChatBot with Document Analysis (Full Stack)

A local LLM running on your laptop
A ChatGPT‑like web interface
AI that can search and answer using your own documents
Optional memory + custom behavior using system prompts

### Architecture
Ollama – runs AI models locally
OpenWebUI – browser interface (like ChatGPT)
nomic-embed-text – embedding model for document search

Embedding model → converts document text into vectors
Chat model → generates answers using retrieved chunks

Tech Stack
Ollama – runs AI models locally
OpenWebUI – browser interface (like ChatGPT)
nomic-embed-text – embedding model for document search

## Run The Project
  **Backend:**
  ```bash
    ollama pull gemma3:4b
    ollama pull nomic-embed-text
  ```

  **Frontend:**
  ```bash
    pip install open-webui
    open-webui serve
    OutPut - http://localhost:8080
  ```
