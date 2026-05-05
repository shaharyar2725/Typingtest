import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  runs: number;
}

export async function signup(input: {
  email: string;
  password: string;
  username: string;
}): Promise<{ user: AuthUser }> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Signup failed — please try again.");

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: data.user.id, username: input.username.trim() });

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error(
      profileError.code === "23505"
        ? "That username is already taken."
        : profileError.message,
    );
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      username: input.username.trim(),
    },
  };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign in failed.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", data.user.id)
    .single();

  return {
    user: {
      id: data.user.id,
      email: data.user.email!,
      username: profile?.username ?? data.user.email!,
    },
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    username: profile?.username ?? user.email!,
  };
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("username, wpm, accuracy, runs");

  if (error) {
    console.error("fetchLeaderboard:", error.message);
    return [];
  }

  return (data ?? []) as LeaderboardEntry[];
}

export async function submitScore(score: {
  wpm: number;
  accuracy: number;
  errors: number;
  mode: string;
  durationSec: number;
}): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) return false;

  const { error } = await supabase.from("scores").insert({
    user_id: user.id,
    username: profile.username,
    wpm: score.wpm,
    accuracy: score.accuracy,
    errors: score.errors,
    mode: score.mode,
    duration_sec: score.durationSec,
    language: "en",
  });

  return !error;
}
