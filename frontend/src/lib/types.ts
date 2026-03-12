export const PERSONALITY_TYPES = [
  { value: "INTJ", label: "INTJ — The Strategist", description: "Blunt, logical, hard to impress. Dismisses emotional arguments." },
  { value: "INTP", label: "INTP — The Analyst", description: "Curious, plays devil's advocate, slow to commit." },
  { value: "ENTJ", label: "ENTJ — The Commander", description: "Assertive, results-focused, impatient with vagueness." },
  { value: "ENTP", label: "ENTP — The Debater", description: "Debates for sport, challenges every assumption." },
  { value: "INFJ", label: "INFJ — The Advocate", description: "Reads people deeply, values authenticity, ethics-driven." },
  { value: "INFP", label: "INFP — The Mediator", description: "Idealistic, emotionally sensitive, values-led." },
  { value: "ENFJ", label: "ENFJ — The Protagonist", description: "Warm but opinionated, people-focused, empathetic." },
  { value: "ENFP", label: "ENFP — The Champion", description: "Enthusiastic, responds to vision and passion." },
  { value: "ISTJ", label: "ISTJ — The Inspector", description: "Rule-following, skeptical of change, needs facts and precedents." },
  { value: "ISFJ", label: "ISFJ — The Protector", description: "Cautious, risk-averse, resistant to being rushed." },
  { value: "ESTJ", label: "ESTJ — The Executive", description: "Values hierarchy and structure, wants concrete plans." },
  { value: "ESFJ", label: "ESFJ — The Consul", description: "Relationship-focused, dislikes open conflict, social proof matters." },
  { value: "ISTP", label: "ISTP — The Virtuoso", description: "Pragmatic, terse, wants to see what actually works." },
  { value: "ISFP", label: "ISFP — The Adventurer", description: "Guided by values, sensitive to tone, hard to read." },
  { value: "ESTP", label: "ESTP — The Entrepreneur", description: "Action-oriented, bottom-line focused, reads people well." },
  { value: "ESFP", label: "ESFP — The Entertainer", description: "Social, easily charmed, goes with gut feeling." },
] as const;

export const DIFFICULTY_LEVELS = [
  {
    value: "easy",
    label: "Easy",
    description: "The AI gives you reasonable benefit of the doubt. Good for first practice.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Moderate resistance. The AI challenges weak points and needs solid arguments.",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Highly skeptical. The AI pushes back on almost everything. Requires excellent arguments.",
  },
] as const;

export const CONVERSATION_LANGUAGES = [
  {
    value: "english",
    label: "English",
    description: "Default language for conversation and feedback.",
  },
  {
    value: "roman_urdu",
    label: "Roman Urdu",
    description: "Urdu written in Latin script (Roman Urdu).",
  },
] as const;

export type PersonalityType = typeof PERSONALITY_TYPES[number]["value"];
export type DifficultyLevel = "easy" | "medium" | "hard";
export type ConversationLanguage = "english" | "roman_urdu";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  default_context: string | null;
  default_goal: string | null;
}

export interface Session {
  id: string;
  scenario_id: string;
  personality_type: PersonalityType;
  difficulty: DifficultyLevel;
  language: ConversationLanguage;
  context: string;
  user_goal: string;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  ended_at: string | null;
  scenarios?: { title: string; category: string };
  messages?: Message[];
}

export interface FeedbackScore {
  clarity: number;
  persuasion: number;
  emotional_control: number;
  adaptability: number;
}

export interface FeedbackData {
  id: string;
  session_id: string;
  overall_score: number;
  scores: FeedbackScore;
  strengths: string[];
  weaknesses: string[];
  key_moments: Array<{ quote: string; impact: string }>;
  better_responses: Array<{ original: string; suggested: string; reason: string }>;
  personality_insight: string;
  full_analysis: string;
}
