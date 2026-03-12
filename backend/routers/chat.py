import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest
from services.personality import build_system_prompt
from services.groq_client import stream_chat_response
from db.supabase_client import get_supabase

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Streaming SSE endpoint. Sends the user's message to the AI persona
    and streams back the response token by token.
    Also persists both messages to Supabase.
    """
    system_prompt = build_system_prompt(
        scenario_title=request.scenario_title,
        personality_type=request.personality_type.value,
        difficulty=request.difficulty.value,
        context=request.context,
        user_goal=request.user_goal,
        response_language=request.language.value,
    )

    history = [{"role": m.role, "content": m.content} for m in request.conversation_history]
    history.append({"role": "user", "content": request.message})

    # Persist user message
    db = get_supabase()
    db.table("messages").insert({
        "session_id": request.session_id,
        "role": "user",
        "content": request.message,
    }).execute()

    collected_response: list[str] = []

    async def event_stream():
        async for chunk in stream_chat_response(system_prompt, history):
            collected_response.append(chunk)
            # SSE format: data: <payload>\n\n
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"

        full_response = "".join(collected_response)

        # Persist AI response after streaming completes
        db.table("messages").insert({
            "session_id": request.session_id,
            "role": "assistant",
            "content": full_response,
        }).execute()

        yield f"data: {json.dumps({'done': True, 'full_response': full_response})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
