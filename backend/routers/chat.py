from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas import ChatRequest, ChatResponse
from services.chat_service import chat_with_rag
from auth import verify_token
from database import get_db
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/api/chat", tags=["Chat"])
security = HTTPBearer()


@router.post("/", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
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

    try:
        user_id = payload.get("user_id")
        result = chat_with_rag(request.message, user_id=user_id, db_session=db)
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}",
        )
