import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from services.rag_service import search_similar
from services.classification_service import classify_query

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are an AI Knowledge Assistant for a company. Your role is to answer questions based on the company's internal documents.

Rules:
- Only answer based on the provided context from the documents.
- If the context doesn't contain enough information to answer the question, say so clearly.
- Be concise and professional in your responses.
- Reference which document the information came from when possible.
- If no relevant documents are found, let the user know they should upload relevant documents first."""


def chat_with_rag(user_message: str, user_id: int = None, db_session=None) -> dict:
    """Process a user message through the RAG pipeline and return an LLM response."""
    
    start_time = time.time()
    
    # Classify the query
    category = classify_query(user_message)

    # Search for relevant chunks
    relevant_chunks = search_similar(user_message, n_results=5)

    # Build context from retrieved chunks
    if relevant_chunks:
        context_parts = []
        for i, chunk in enumerate(relevant_chunks):
            filename = chunk["metadata"].get("filename", "Unknown")
            context_parts.append(f"[Source: {filename}]\n{chunk['content']}")
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "No relevant documents found in the knowledge base."

    # Build the prompt
    user_prompt = f"""Context from company documents:
{context}

---

User question: {user_message}

Please answer the question based on the context provided above."""

    # Call OpenAI
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3,
        max_tokens=1000
    )

    answer = response.choices[0].message.content
    
    # Calculate response time
    response_time_ms = int((time.time() - start_time) * 1000)

    # Format sources - deduplicate by filename, keeping the best (lowest distance) match
    sources = []
    seen_files = set()
    for chunk in relevant_chunks:
        filename = chunk["metadata"].get("filename", "Unknown")
        # Only add each file once (first occurrence has lowest distance since results are sorted)
        if filename not in seen_files:
            seen_files.add(filename)
            sources.append({
                "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
                "filename": filename,
                "distance": chunk["distance"]
            })

    # Determine status based on sources found
    if not relevant_chunks:
        status = "Partial"
    elif len(relevant_chunks) >= 3:
        status = "Resolved"
    else:
        status = "Resolved"

    # Log the query to database if session provided
    if db_session:
        from models import QueryLog
        query_log = QueryLog(
            user_id=user_id,
            query_text=user_message,
            category=category,
            response_time_ms=response_time_ms,
            status=status,
            sources_used=len(sources)
        )
        db_session.add(query_log)
        db_session.commit()

    return {
        "answer": answer,
        "sources": sources,
        "category": category,
        "response_time_ms": response_time_ms
    }
