from fastapi import APIRouter, HTTPException
from models.schemas import SessionCreate, SessionUpdate
from db.supabase_client import get_supabase
from datetime import datetime, timezone

router = APIRouter()


@router.post("/sessions")
def create_session(body: SessionCreate, user_id: str):
    """Create a new conversation session."""
    db = get_supabase()
    result = db.table("sessions").insert({
        "user_id": user_id,
        "scenario_id": body.scenario_id,
        "personality_type": body.personality_type.value,
        "difficulty": body.difficulty.value,
        "language": body.language.value,
        "context": body.context,
        "user_goal": body.user_goal,
        "status": "active",
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    return result.data[0]


@router.patch("/sessions/{session_id}")
def update_session(session_id: str, body: SessionUpdate):
    """Mark a session as completed or abandoned."""
    db = get_supabase()
    update_data: dict = {"status": body.status}
    if body.status in ("completed", "abandoned"):
        update_data["ended_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("sessions").update(update_data).eq("id", session_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")

    return result.data[0]


@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    """Get a session with its messages."""
    db = get_supabase()
    session = db.table("sessions").select("*").eq("id", session_id).limit(1).execute()

    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.table("messages").select("*").eq("session_id", session_id).order("created_at").execute()

    return {**session.data[0], "messages": messages.data or []}


@router.get("/sessions")
def list_sessions(user_id: str):
    """List all sessions for a user, most recent first."""
    db = get_supabase()
    result = (
        db.table("sessions")
        .select("*, scenarios(title, category)")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .execute()
    )
    return result.data or []
