from fastapi import APIRouter
from pydantic import BaseModel

from app.services.embeddings import search_chunks
from app.services.llm import generate_answer

router = APIRouter()

class Question(BaseModel):
    question: str

@router.post("/ask")
async def ask_repository(data: Question):
    results = search_chunks(data.question)

    if not results:
        return {
            "question": data.question,
            "answer": "Please upload and index a repository first."
        }

    answer = generate_answer(data.question, results)

    return {
        "question": data.question,
        "answer": answer,
        "sources": [
            {
                "file_name": chunk["file_name"],
                "file_path": chunk["file_path"]
            }
            for chunk in results
        ]
    }