from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

model = SentenceTransformer("all-MiniLM-L6-v2")

faiss_index = None
stored_chunks = []

def create_faiss_index(chunks):
    global faiss_index, stored_chunks

    stored_chunks = chunks

    texts = [chunk["content"] for chunk in chunks]

    embeddings = model.encode(texts)
    embeddings = np.array(embeddings).astype("float32")

    faiss_index = faiss.IndexFlatL2(embeddings.shape[1])
    faiss_index.add(embeddings)

def search_chunks(question, top_k=5):
    global faiss_index, stored_chunks

    if faiss_index is None:
        return []

    question_embedding = model.encode([question])
    question_embedding = np.array(question_embedding).astype("float32")

    distances, indices = faiss_index.search(question_embedding, top_k)

    results = []

    for idx in indices[0]:
        if idx != -1 and idx < len(stored_chunks):
            results.append(stored_chunks[idx])

    return results