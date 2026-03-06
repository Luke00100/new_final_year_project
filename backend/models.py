from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    chunk_count = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QueryLog(Base):
    """Stores each chat query with its classification for analytics."""
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query_text = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # Support, HR, Marketing, IT, Finance
    response_time_ms = Column(Integer, nullable=True)  # Response time in milliseconds
    status = Column(String, default="Resolved")  # Resolved, Partial, Escalated
    sources_used = Column(Integer, default=0)  # Number of source documents used
    created_at = Column(DateTime(timezone=True), server_default=func.now())
