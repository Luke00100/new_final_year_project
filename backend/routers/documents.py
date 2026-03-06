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


@router.post("/upload", response_model=List[DocumentResponse])
async def upload_documents(
    files: List[UploadFile] = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Upload one or more documents."""
    # Verify user is authenticated
    payload = verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    uploaded_docs = []
    errors = []

    for file in files:
        # Check file extension
        extension = file.filename.lower().rsplit(".", 1)[-1] if "." in file.filename else ""
        if extension not in ALLOWED_EXTENSIONS:
            errors.append(f"{file.filename}: Unsupported file type '{extension}'")
            continue

        # Read file content
        file_bytes = await file.read()

        # Extract text
        try:
            content = extract_text(file.filename, file_bytes)
        except Exception as e:
            errors.append(f"{file.filename}: Failed to extract text - {str(e)}")
            continue

        if not content.strip():
            errors.append(f"{file.filename}: No text content could be extracted")
            continue

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
            print(f"Warning: Failed to generate embeddings for {file.filename}: {e}")

        uploaded_docs.append(DocumentResponse.model_validate(doc))

    # If no documents were uploaded successfully, raise an error
    if not uploaded_docs and errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(errors),
        )

    return uploaded_docs


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
