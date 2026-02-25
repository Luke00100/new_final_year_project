from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from database import get_db
from models import Document
from schemas import DocumentResponse
from services.document_processor import extract_text
from services.rag_service import chunk_and_store, delete_document_chunks
from auth import verify_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

router = APIRouter(prefix="/api/documents", tags=["Documents"])
security = HTTPBearer()

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    # Verify user is authenticated
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Check file extension
    extension = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {extension}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    file_bytes = await file.read()

    # Extract text
    try:
        content = extract_text(file.filename, file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text: {str(e)}",
        )

    if not content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No text content could be extracted from the file",
        )

    # Store document in PostgreSQL
    doc = Document(
        filename=file.filename,
        file_type=extension,
        content=content,
        uploaded_by=int(payload["sub"]),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Chunk and store embeddings in ChromaDB
    try:
        chunk_count = chunk_and_store(doc.id, file.filename, content)
        doc.chunk_count = chunk_count
        db.commit()
        db.refresh(doc)
    except Exception as e:
        # Document is saved but embeddings failed - log but don't fail
        print(f"Warning: Failed to generate embeddings: {e}")

    return DocumentResponse.model_validate(doc)


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    return [DocumentResponse.model_validate(doc) for doc in documents]


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    # Remove from ChromaDB
    delete_document_chunks(document_id)

    # Remove from PostgreSQL
    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully"}
