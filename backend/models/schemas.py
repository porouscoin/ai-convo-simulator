from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class PersonalityType(str, Enum):
    INTJ = "INTJ"
    INTP = "INTP"
    ENTJ = "ENTJ"
    ENTP = "ENTP"
    INFJ = "INFJ"
    INFP = "INFP"
    ENFJ = "ENFJ"
    ENFP = "ENFP"
    ISTJ = "ISTJ"
    ISFJ = "ISFJ"
    ESTJ = "ESTJ"
    ESFJ = "ESFJ"
    ISTP = "ISTP"
    ISFP = "ISFP"
    ESTP = "ESTP"
    ESFP = "ESFP"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ConversationLanguage(str, Enum):
    ENGLISH = "english"
    ROMAN_URDU = "roman_urdu"


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    conversation_history: List[Message]
    scenario_title: str
    personality_type: PersonalityType
    difficulty: DifficultyLevel
    context: str
    user_goal: str
    language: ConversationLanguage = ConversationLanguage.ENGLISH


class SessionCreate(BaseModel):
    scenario_id: str
    personality_type: PersonalityType
    difficulty: DifficultyLevel
    language: ConversationLanguage = ConversationLanguage.ENGLISH
    context: str
    user_goal: str


class SessionUpdate(BaseModel):
    status: str  # 'completed' | 'abandoned'


class FeedbackRequest(BaseModel):
    session_id: str
    conversation_history: List[Message]
    scenario_title: str
    personality_type: PersonalityType
    user_goal: str
    language: ConversationLanguage = ConversationLanguage.ENGLISH
