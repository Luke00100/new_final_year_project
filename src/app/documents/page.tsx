"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: number;
  filename: string;
  file_type: string;
  chunk_count: number;
  created_at: string;
}

const API = "http://localhost:8000/api/documents";

function fileIcon(type: string) {
  if (type === "pdf") return "📕";
  if (type === "docx") return "📘";
  return "📄";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  const fetchDocuments = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const res = await fetch(`${API}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocuments(data);
    } catch {
      // silently fail — list stays empty
    } finally {
      setLoadingDocs(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function uploadFile(file: File) {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext ?? "")) {
      setUploadStatus({ type: "error", message: "Unsupported file type. Use PDF, DOCX, or TXT." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "File exceeds the 10MB limit." });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) { router.push("/login"); return; }

      const data = await res.json();

      if (!res.ok) {
        setUploadStatus({ type: "error", message: data.detail || "Upload failed." });
        return;
      }

      setUploadStatus({
        type: "success",
        message: `"${data.filename}" uploaded successfully — ${data.chunk_count} chunks indexed.`,
      });
      await fetchDocuments();
    } catch {
      setUploadStatus({ type: "error", message: "Could not reach the backend. Is it running?" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteDocument(id: number) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    setDeletingId(id);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push("/login"); return; }
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">AI Knowledge Assistant</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="/chat" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Chat
          </a>
          <a href="/documents" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white">
            Documents
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Upload and manage your knowledge base documents</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors font-medium"
          >
            {uploading ? "Uploading…" : "+ Upload Document"}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center mb-6 transition-colors cursor-pointer ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400"
          } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <>
              <p className="text-4xl mb-3">⏳</p>
              <p className="text-gray-700 font-medium">Uploading and indexing…</p>
              <p className="text-sm text-gray-400 mt-1">Please wait</p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-3">📁</p>
              <p className="text-gray-700 font-medium">
                Drag and drop a file here, or <span className="text-indigo-600 underline">browse</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Supports PDF, DOCX, and TXT — max 10MB</p>
            </>
          )}
        </div>

        {/* Upload status banner */}
        {uploadStatus && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
              uploadStatus.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span>{uploadStatus.type === "success" ? "✅ " : "❌ "}{uploadStatus.message}</span>
            <button onClick={() => setUploadStatus(null)} className="ml-4 text-lg leading-none opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Uploaded Documents</h3>
            <span className="text-sm text-gray-400">{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
          </div>

          {loadingDocs ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : documents.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">No documents uploaded yet. Add one above to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fileIcon(doc.file_type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {timeAgo(doc.created_at)} · {doc.chunk_count} chunk{doc.chunk_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Indexed</span>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-gray-300 hover:text-red-500 disabled:opacity-40 transition-colors text-lg leading-none"
                      title="Delete document"
                    >
                      {deletingId === doc.id ? "…" : "🗑"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
