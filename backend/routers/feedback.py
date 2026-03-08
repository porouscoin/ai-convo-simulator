import json
from fastapi import APIRouter, HTTPException
from models.schemas import FeedbackRequest
from services.feedback_analyzer import build_feedback_prompt
from services.groq_client import generate_feedback
from db.supabase_client import get_supabase

router = APIRouter()


@router.post("/feedback")
async def create_feedback(request: FeedbackRequest):
    """
    Generate post-conversation feedback and save it to Supabase.
    Returns structured feedback JSON.
    """
    db = get_supabase()

    # Check if feedback already exists for this session
    existing = db.table("feedback").select("id").eq("session_id", request.session_id).execute()
    if existing.data:
        return existing.data[0]

    history = [{"role": m.role, "content": m.content} for m in request.conversation_history]
    messages = build_feedback_prompt(
        scenario_title=request.scenario_title,
        personality_type=request.personality_type.value,
        user_goal=request.user_goal,
        conversation_history=history,
    )

    raw = await generate_feedback(
        system_prompt=messages[0]["content"],
        conversation_history=messages[1:],
    )

    # Parse JSON from the model output
    try:
        cleaned = raw.strip()
        # Strip markdown code fences (```json ... ``` or ``` ... ```)
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first line (``` or ```json) and last ``` line
            cleaned = "\n".join(
                line for line in lines[1:]
                if line.strip() != "```"
            ).strip()
        feedback_data = json.loads(cleaned)
    except (json.JSONDecodeError, IndexError) as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse feedback JSON: {str(e)} | Raw: {raw[:300]}")

    # Get user_id from the session
    session = db.table("sessions").select("user_id").eq("id", request.session_id).limit(1).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    user_id = session.data[0]["user_id"]

    # Save to database
    record = db.table("feedback").insert({
        "session_id": request.session_id,
        "user_id": user_id,
        "overall_score": feedback_data.get("overall_score"),
        "strengths": feedback_data.get("strengths", []),
        "weaknesses": feedback_data.get("weaknesses", []),
        "key_moments": [json.dumps(m) for m in feedback_data.get("key_moments", [])],
        "better_responses": feedback_data.get("better_responses", []),
        "personality_insight": feedback_data.get("personality_insight"),
        "full_analysis": feedback_data.get("full_analysis"),
        "scores": feedback_data.get("scores", {}),
    }).execute()

    if not record.data:
        raise HTTPException(status_code=500, detail="Failed to save feedback")

    return {**record.data[0], **feedback_data}


@router.get("/feedback/{session_id}")
def get_feedback(session_id: str):
    """Retrieve saved feedback for a session. Returns 202 if still generating."""
    db = get_supabase()
    # Use limit(1) instead of .single() so 0 rows doesn't raise an exception
    result = db.table("feedback").select("*").eq("session_id", session_id).limit(1).execute()

    if not result.data:
        # 202 Accepted = request is valid but feedback isn't ready yet
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=202, content={"status": "generating"})

    return result.data[0]
