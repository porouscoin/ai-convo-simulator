import os
from groq import AsyncGroq
from typing import AsyncGenerator

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

CHAT_MODEL = "llama-3.3-70b-versatile"
FEEDBACK_MODEL = "llama-3.3-70b-versatile"


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
        max_tokens=512,
        temperature=0.85,
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
        max_tokens=1024,
        temperature=0.6,
    )

    return response.choices[0].message.content
