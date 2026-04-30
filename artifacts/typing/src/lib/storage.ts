export interface AppState {
  settings: {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    stopOnError: boolean;
    mode: 'time' | 'words' | 'quote' | 'daily';
    duration: number; // 15, 30, 60, 120
    wordCount: number; // 10, 25, 50, 100
    funMode: 'words' | 'quotes' | 'code' | 'punctuation';
  };
  history: TypingResult[];
  lessonProgress: Record<string, {
    completed: boolean;
    bestWpm: number;
    bestAccuracy: number;
    attempts: number;
  }>;
  dailyChallenge: {
    date: string;
    completed: boolean;
    bestWpm: number;
  };
}

export interface TypingResult {
  id: string;
  mode: string;
  durationSec: number;
  wpm: number;
  accuracy: number;
  errors: number;
  timestamp: number;
  snippet: string;
  history?: { t: number, wpm: number, errors: number }[];
  missedKeys?: Record<string, number>;
}

const DEFAULT_STATE: AppState = {
  settings: {
    theme: 'system',
    soundEnabled: true,
    stopOnError: false,
    mode: 'time',
    duration: 30,
    wordCount: 50,
    funMode: 'words'
  },
  history: [],
  lessonProgress: {},
  dailyChallenge: {
    date: '',
    completed: false,
    bestWpm: 0
  }
};

const STORAGE_KEY = 'typeflow:v1';

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...parsed.settings } };
  } catch (e) {
    console.error("Failed to load state", e);
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function updateSettings(settings: Partial<AppState['settings']>) {
  const state = loadState();
  state.settings = { ...state.settings, ...settings };
  saveState(state);
  return state.settings;
}

export function addResult(result: TypingResult) {
  const state = loadState();
  state.history.unshift(result);
  if (state.history.length > 50) {
    state.history = state.history.slice(0, 50);
  }
  saveState(state);
}

export function getResult(id: string): TypingResult | undefined {
  const state = loadState();
  return state.history.find(r => r.id === id);
}

export function updateLessonProgress(slug: string, wpm: number, accuracy: number, passed: boolean) {
  const state = loadState();
  const current = state.lessonProgress[slug] || { completed: false, bestWpm: 0, bestAccuracy: 0, attempts: 0 };
  
  state.lessonProgress[slug] = {
    completed: current.completed || passed,
    bestWpm: Math.max(current.bestWpm, wpm),
    bestAccuracy: Math.max(current.bestAccuracy, accuracy),
    attempts: current.attempts + 1
  };
  
  saveState(state);
  return state.lessonProgress;
}

export function updateDailyChallenge(date: string, wpm: number) {
  const state = loadState();
  state.dailyChallenge = {
    date,
    completed: true,
    bestWpm: Math.max(state.dailyChallenge.date === date ? state.dailyChallenge.bestWpm : 0, wpm)
  };
  saveState(state);
}
