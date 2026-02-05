import os
import numpy as np
import faiss
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
chat_model = genai.GenerativeModel('gemini-2.0-flash')

# Load same embedding model as store
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_query(query: str):
    # Embed single query
    vec = embed_model.encode([query])
    faiss.normalize_L2(vec)
    return vec.astype("float32")

def retrieve(query, index, chunks, k=4):
    qvec = embed_query(query)
    # Search FAISS
    _, ids = index.search(qvec, k)

    results = []
    for i in ids[0]:
        if i != -1:
            results.append(chunks[i])

    return results

def generate_answer(user_question, retrieved_chunks):
    context = "\n\n".join(retrieved_chunks)
    
    prompt = f"""
    You are an Expert.
    Use only the provided context to answer the question.
    If the answer is not in the context, say you don't know.

    Context:
    {context}

    Question:
    {user_question}
    """

    response = chat_model.generate_content(prompt)
    return response.text

# OPENAI Dependancy

# import numpy as np
# import faiss
# from openai import OpenAI

# client = OpenAI()
# CHAT_MODEL = "gpt-5.2"
# EMBED_MODEL = "text-embedding-3-small"


# def embed_query(query: str):
#     resp = client.embeddings.create(model=EMBED_MODEL, input=[query])
#     vec = np.array([resp.data[0].embedding], dtype="float32")
#     faiss.normalize_L2(vec)
#     return vec


# def retrieve(query, index, chunks, k=4):
#     qvec = embed_query(query)
#     _, ids = index.search(qvec, k)

#     results = []
#     for i in ids[0]:
#         if i != -1:
#             results.append(chunks[i])

#     return results


# def generate_answer(user_question, retrieved_chunks):
#     context = "\n\n".join(retrieved_chunks)

#     response = client.responses.create(
#         model=CHAT_MODEL,
#         instructions=(
#             "You are an Insurance Agency Customer Care assistant. "
#             "Use only the provided context to answer. "
#             "If the answer is not present, say you do not have it and offer human support."
#         ),
#         input=f"Context:\n{context}\n\nQuestion:\n{user_question}",
#     )

#     return response.output_text