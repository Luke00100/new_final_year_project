import os
from openai import OpenAI
from dotenv import load_dotenv
from services.rag_service import search_similar

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are an AI Knowledge Assistant for a company. Your role is to answer questions based on the company's internal documents.

Rules:
- Only answer based on the provided context from the documents.
- If the context doesn't contain enough information to answer the question, say so clearly.
- Be concise and professional in your responses.
- Reference which document the information came from when possible.
- If no relevant documents are found, let the user know they should upload relevant documents first."""


def chat_with_rag(user_message: str) -> dict:
    """Process a user message through the RAG pipeline and return an LLM response."""

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

    # Format sources
    sources = []
    for chunk in relevant_chunks:
        sources.append({
            "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "filename": chunk["metadata"].get("filename", "Unknown"),
            "distance": chunk["distance"]
        })

    return {
        "answer": answer,
        "sources": sources
    }
