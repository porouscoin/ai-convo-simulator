import json
from models.schemas import PersonalityType


FEEDBACK_SYSTEM_PROMPT = """You are an expert communication coach analyzing a conversation simulation.
Your job is to give the user honest, specific, and actionable feedback on their performance.

Analyze the full conversation transcript provided and produce feedback in the following JSON format — 
output ONLY valid JSON, no markdown, no additional text:

{
  "overall_score": <integer 1-10>,
  "scores": {
    "clarity": <integer 1-10>,
    "persuasion": <integer 1-10>,
    "emotional_control": <integer 1-10>,
    "adaptability": <integer 1-10>
  },
  "strengths": [<string>, <string>, ...],
  "weaknesses": [<string>, <string>, ...],
  "key_moments": [
    {
      "quote": "<exact short quote or paraphrase from user>",
      "impact": "<what worked or went wrong and why>"
    }
  ],
  "better_responses": [
    {
      "original": "<exact or paraphrased thing the user said>",
      "suggested": "<a better response>",
      "reason": "<why this would have worked better>"
    }
  ],
  "personality_insight": "<specific advice for communicating with this personality type based on what happened>",
  "full_analysis": "<2-3 paragraph honest analysis of the conversation: what they did well, where they lost ground, and the most important thing to practice next time>"
}

Rules:
- Reference specific moments from the conversation, not generic advice.
- Be direct and honest — do not sugarcoat poor performance.
- Make all suggestions concrete and actionable, not vague.
- The personality_insight must be tailored to what actually happened in the conversation with this specific MBTI type.
"""


def build_feedback_prompt(
    scenario_title: str,
    personality_type: str,
    user_goal: str,
    conversation_history: list[dict],
) -> list[dict]:
    """
    Build the messages list for the feedback generation call.
    """
    transcript = "\n".join(
        f"{'USER' if m['role'] == 'user' else 'AI PERSONA'}: {m['content']}"
        for m in conversation_history
    )

    user_message = f"""Please analyze this conversation simulation and provide feedback.

SCENARIO: {scenario_title}
AI PERSONA PERSONALITY: {personality_type}
USER'S STATED GOAL: {user_goal}

FULL TRANSCRIPT:
{transcript}

Provide feedback in the exact JSON format specified."""

    return [
        {"role": "system", "content": FEEDBACK_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]
