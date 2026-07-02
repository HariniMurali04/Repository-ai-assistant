from app.services.embeddings import create_faiss_index
from app.utils.chunker import chunk_text
from app.services.parser import read_code_files
from fastapi import APIRouter, UploadFile, File
import os
import zipfile
import shutil

router = APIRouter()

UPLOAD_FOLDER = "uploaded_repo"


@router.post("/upload")
async def upload_repository(file: UploadFile = File(...)):

    # Remove previous uploaded project
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)

    os.makedirs(UPLOAD_FOLDER)

    zip_path = "repository.zip"

    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(UPLOAD_FOLDER)

    code_files = read_code_files()

    all_chunks = []

    for file in code_files:
        chunks = chunk_text(file["content"])

        for chunk in chunks:
            all_chunks.append({
                "file_name": file["file_name"],
                "file_path": file["file_path"],
                "content": chunk
            })

    create_faiss_index(all_chunks)        

    return {
    "message": "Repository indexed successfully!",
    "total_files": len(code_files),
    "total_chunks": len(all_chunks),
    "files": [file["file_name"] for file in code_files]
}