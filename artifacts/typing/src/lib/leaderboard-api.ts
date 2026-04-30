const TOKEN_KEY = "typeflow_user_token";
const USERNAME_KEY = "typeflow_username";

export interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  runs: number;
}

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStoredUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export async function claimUsername(username: string): Promise<{ username: string }> {
  const res = await fetch("/api/leaderboard/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to claim username");
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USERNAME_KEY, data.username);
  return { username: data.username };
}

export async function submitScore(score: {
  wpm: number;
  accuracy: number;
  errors: number;
  mode: string;
  durationSec: number;
}): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  try {
    const res = await fetch("/api/leaderboard/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...score }),
    });
    if (res.status === 401) {
      clearStoredUser();
      return false;
    }
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/leaderboard");
  if (!res.ok) throw new Error("Failed to load leaderboard");
  const data = await res.json();
  return data.entries ?? [];
}
