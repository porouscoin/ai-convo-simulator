const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export async function fetchScenarios(category?: string): Promise<Response> {
  const url = category
    ? `${API_URL}/api/scenarios?category=${category}`
    : `${API_URL}/api/scenarios`;
  return fetch(url);
}

export async function fetchScenario(id: string): Promise<Response> {
  return fetch(`${API_URL}/api/scenarios/${id}`);
}

export async function createSession(
  body: {
    scenario_id: string;
    personality_type: string;
    difficulty: string;
    context: string;
    user_goal: string;
  },
  userId: string
): Promise<Response> {
  return fetch(`${API_URL}/api/sessions?user_id=${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateSession(
  sessionId: string,
  status: "completed" | "abandoned"
): Promise<Response> {
  return fetch(`${API_URL}/api/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function fetchSession(sessionId: string): Promise<Response> {
  return fetch(`${API_URL}/api/sessions/${sessionId}`);
}

export async function fetchUserSessions(userId: string): Promise<Response> {
  return fetch(`${API_URL}/api/sessions?user_id=${userId}`);
}

export function streamChat(body: {
  session_id: string;
  message: string;
  conversation_history: Array<{ role: string; content: string }>;
  scenario_title: string;
  personality_type: string;
  difficulty: string;
  context: string;
  user_goal: string;
}): EventSource {
  // EventSource doesn't support POST, so we use fetch with streaming directly
  // This returns a fetch response — the caller handles reading the stream
  return null as unknown as EventSource; // placeholder type
}

export async function streamChatFetch(body: {
  session_id: string;
  message: string;
  conversation_history: Array<{ role: string; content: string }>;
  scenario_title: string;
  personality_type: string;
  difficulty: string;
  context: string;
  user_goal: string;
}): Promise<Response> {
  return fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function generateFeedback(body: {
  session_id: string;
  conversation_history: Array<{ role: string; content: string }>;
  scenario_title: string;
  personality_type: string;
  user_goal: string;
}): Promise<Response> {
  return fetch(`${API_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function fetchFeedback(sessionId: string): Promise<Response> {
  return fetch(`${API_URL}/api/feedback/${sessionId}`);
}
