from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import chat, sessions, feedback, scenarios

app = FastAPI(title="AI Conversation Simulator API", version="1.0.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
