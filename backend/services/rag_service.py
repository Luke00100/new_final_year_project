import os
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Initialise ChromaDB client with persistent storage
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(
    name="knowledge_base",
    metadata={"hnsw:space": "cosine"}
)

# Initialise OpenAI embeddings
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Text splitter configuration
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""]
)


def chunk_and_store(document_id: int, filename: str, content: str) -> int:
    """Split document into chunks, generate embeddings, and store in ChromaDB."""
    chunks = text_splitter.split_text(content)

    if not chunks:
        return 0

    # Generate embeddings for all chunks
    chunk_embeddings = embeddings.embed_documents(chunks)

    # Prepare data for ChromaDB
    ids = [f"doc_{document_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "document_id": document_id,
            "filename": filename,
            "chunk_index": i
        }
        for i in range(len(chunks))
    ]

    # Store in ChromaDB
    collection.add(
        ids=ids,
        embeddings=chunk_embeddings,
        documents=chunks,
        metadatas=metadatas
    )

    return len(chunks)


def search_similar(query: str, n_results: int = 5) -> list:
    """Search ChromaDB for chunks similar to the query."""
    query_embedding = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )

    formatted = []
    if results and results["documents"]:
        for i, doc in enumerate(results["documents"][0]):
            formatted.append({
                "content": doc,
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            })

    return formatted


def delete_document_chunks(document_id: int):
    """Remove all chunks for a document from ChromaDB."""
    try:
        collection.delete(
            where={"document_id": document_id}
        )
    except Exception:
        pass
