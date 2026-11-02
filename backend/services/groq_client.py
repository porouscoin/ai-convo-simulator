import os
from groq import AsyncGroq
from typing import AsyncGenerator

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Groq retires models over time, so the model is set per deployment.
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "openai/gpt-oss-120b")
FEEDBACK_MODEL = os.getenv("GROQ_FEEDBACK_MODEL", CHAT_MODEL)


def _extra(model: str) -> dict:
    # GPT-OSS models reason before answering; keep it short so replies stay fast.
    return {"reasoning_effort": "low"} if model.startswith("openai/gpt-oss") else {}


async def stream_chat_response(
    system_prompt: str,
    conversation_history: list[dict],
) -> AsyncGenerator[str, None]:
    """
    Stream tokens from the Groq chat model.
    Yields text chunks as they arrive.
    """
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    stream = await client.chat.completions.create(
        model=CHAT_MODEL,
        messages=messages,
        stream=True,
        max_tokens=1024,  # reasoning models spend part of this before replying
        temperature=0.85,
        **_extra(CHAT_MODEL),
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def generate_feedback(
    system_prompt: str,
    conversation_history: list[dict],
) -> str:
    """
    Generate post-conversation feedback as a single response (no streaming).
    """
    messages = [{"role": "system", "content": system_prompt}] + conversation_history

    response = await client.chat.completions.create(
        model=FEEDBACK_MODEL,
        messages=messages,
        stream=False,
        max_tokens=4096,
        temperature=0.6,
        **_extra(FEEDBACK_MODEL),
    )

    return response.choices[0].message.content
