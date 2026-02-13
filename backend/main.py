from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import users

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Knowledge Assistant API", version="0.1.0")

# Allow Next.js frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "AI Knowledge Assistant API", "status": "running"}
