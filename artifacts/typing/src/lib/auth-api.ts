const TOKEN_KEY = "typeflow_auth_token";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  avatarId: number | null;
  avatarUrl: string | null;
}

export interface Avatar {
  id: number;
  url: string;
  label: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function jsonOrThrow(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchAvatars(): Promise<Avatar[]> {
  const res = await fetch("/api/avatars");
  const data = await jsonOrThrow(res);
  return data.avatars ?? [];
}

export async function signup(input: {
  email: string;
  password: string;
  username: string;
  avatarId: number;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await jsonOrThrow(res);
  setStoredToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await jsonOrThrow(res);
  setStoredToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", headers: authHeaders() });
  } catch {
    // ignore network errors on logout
  }
  setStoredToken(null);
}

export async function fetchMe(): Promise<AuthUser | null> {
  if (!getStoredToken()) return null;
  try {
    const res = await fetch("/api/auth/me", { headers: authHeaders() });
    if (res.status === 401) {
      setStoredToken(null);
      return null;
    }
    const data = await jsonOrThrow(res);
    return data.user;
  } catch {
    return null;
  }
}

export async function updateAvatar(avatarId: number): Promise<AuthUser> {
  const res = await fetch("/api/auth/avatar", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ avatarId }),
  });
  const data = await jsonOrThrow(res);
  return data.user;
}

export interface LeaderboardEntry {
  username: string;
  avatarUrl: string | null;
  wpm: number;
  accuracy: number;
  runs: number;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`/api/leaderboard`);
  const data = await jsonOrThrow(res);
  return data.entries ?? [];
}

export async function submitScore(score: {
  wpm: number;
  accuracy: number;
  errors: number;
  mode: string;
  durationSec: number;
}): Promise<boolean> {
  if (!getStoredToken()) return false;
  try {
    const res = await fetch("/api/leaderboard/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ ...score, language: "en" }),
    });
    if (res.status === 401) {
      setStoredToken(null);
      return false;
    }
    return res.ok;
  } catch {
    return false;
  }
}
