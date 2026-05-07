export interface AppState {
  settings: {
    theme: 'light' | 'dark' | 'system';
    soundEnabled: boolean;
    soundOnError: boolean;
    soundOnSuccess: boolean;
    soundOnKey: boolean;
    stopOnError: boolean;
    mode: 'time' | 'words' | 'quote' | 'daily';
    duration: number;
    wordCount: number;
    funMode: 'words' | 'quotes' | 'code' | 'punctuation';
    fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    linesVisible: 1 | 2 | 3 | 4 | 5 | 10 | 15 | 20;
  };
  history: TypingResult[];
  lessonProgress: Record<string, {
    completed: boolean;
    bestWpm: number;
    bestAccuracy: number;
    attempts: number;
  }>;
}

export interface TypingResult {
  id: string;
  mode: string;
  durationSec: number;
  wpm: number;
  accuracy: number;
  errors: number;
  modifications?: number;
  timestamp: number;
  snippet: string;
  history?: { t: number; wpm: number; errors: number }[];
  missedKeys?: Record<string, number>;
}

const DEFAULT_STATE: AppState = {
  settings: {
    theme: 'system',
    soundEnabled: true,
    soundOnError: true,
    soundOnSuccess: true,
    soundOnKey: false,
    stopOnError: false,
    mode: 'time',
    duration: 30,
    wordCount: 50,
    funMode: 'words',
    fontSize: 'md',
    linesVisible: 2,
  },
  history: [],
  lessonProgress: {},
};

const STORAGE_KEY = 'typeflow:v1';

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silently ignore storage errors (e.g. private browsing quota)
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
  return loadState().history.find(r => r.id === id);
}

export function updateLessonProgress(
  slug: string,
  wpm: number,
  accuracy: number,
  passed: boolean,
) {
  const state = loadState();
  const current = state.lessonProgress[slug] ?? {
    completed: false,
    bestWpm: 0,
    bestAccuracy: 0,
    attempts: 0,
  };
  state.lessonProgress[slug] = {
    completed: current.completed || passed,
    bestWpm: Math.max(current.bestWpm, wpm),
    bestAccuracy: Math.max(current.bestAccuracy, accuracy),
    attempts: current.attempts + 1,
  };
  saveState(state);
  return state.lessonProgress;
}
