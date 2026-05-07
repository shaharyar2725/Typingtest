// Real typing speed data used across the site for SEO content and interactive widgets.
// Primary source: 10.4M tests aggregated; secondary: industry benchmarks.

export interface ProfessionSpeed {
  role: string;
  category: string;
  minWpm: number;
  typicalWpm: number;
  accuracy: number;
  note: string;
}

export const PROFESSION_SPEEDS: ProfessionSpeed[] = [
  { role: 'Casual user / student', category: 'General', minWpm: 0, typicalWpm: 41, accuracy: 92, note: 'Global average across all typists' },
  { role: 'Office / admin', category: 'Office', minWpm: 40, typicalWpm: 55, accuracy: 95, note: 'General correspondence and document work' },
  { role: 'Executive assistant', category: 'Office', minWpm: 65, typicalWpm: 75, accuracy: 97, note: 'Dictation, scheduling, multi-format docs' },
  { role: 'Legal secretary', category: 'Legal', minWpm: 65, typicalWpm: 80, accuracy: 98, note: 'Strict accuracy requirements for legal docs' },
  { role: 'Paralegal', category: 'Legal', minWpm: 60, typicalWpm: 70, accuracy: 97, note: 'Brief writing and case documentation' },
  { role: 'Data entry clerk', category: 'Data', minWpm: 60, typicalWpm: 70, accuracy: 98, note: 'High-volume repetitive entry; accuracy critical' },
  { role: 'Medical transcriptionist', category: 'Medical', minWpm: 65, typicalWpm: 80, accuracy: 98, note: 'Medical terminology; zero tolerance for errors' },
  { role: 'General transcriptionist', category: 'Transcription', minWpm: 65, typicalWpm: 80, accuracy: 97, note: 'Audio-to-text conversion at volume' },
  { role: 'Court reporter (digital)', category: 'Legal', minWpm: 80, typicalWpm: 95, accuracy: 99, note: 'Real-time; certified minimum varies by jurisdiction' },
  { role: 'Programmer / developer', category: 'Tech', minWpm: 50, typicalWpm: 65, accuracy: 96, note: 'Accuracy matters more than raw speed' },
  { role: 'Writer / journalist', category: 'Creative', minWpm: 65, typicalWpm: 85, accuracy: 94, note: 'Must keep pace with train of thought' },
  { role: 'Customer support rep', category: 'Office', minWpm: 40, typicalWpm: 55, accuracy: 95, note: 'Live chat; speed directly impacts tickets/hour' },
  { role: 'Virtual assistant', category: 'Office', minWpm: 55, typicalWpm: 65, accuracy: 96, note: 'Diverse tasks; speed = more clients served' },
  { role: 'Stenographer', category: 'Legal', minWpm: 180, typicalWpm: 225, accuracy: 99.9, note: 'Stenotype machine — not a standard keyboard' },
];

export type ProfessionCategory = 'All' | 'General' | 'Office' | 'Legal' | 'Data' | 'Medical' | 'Transcription' | 'Tech' | 'Creative';

export const PROFESSION_CATEGORIES: ProfessionCategory[] = [
  'All', 'General', 'Office', 'Legal', 'Data', 'Medical', 'Transcription', 'Tech', 'Creative',
];

// WPM Percentile lookup table
// Based on a right-skewed distribution with mean ~41.6 WPM (10.4M test sample)
const WPM_PERCENTILE_BREAKPOINTS: [number, number][] = [
  [10, 2],
  [15, 5],
  [20, 10],
  [25, 18],
  [30, 28],
  [35, 38],
  [40, 49],
  [45, 58],
  [50, 66],
  [55, 73],
  [60, 79],
  [65, 84],
  [70, 88],
  [75, 91],
  [80, 93],
  [85, 95],
  [90, 96],
  [95, 97],
  [100, 98],
  [110, 98],
  [120, 99],
];

export function getWpmPercentile(wpm: number): number {
  if (wpm <= 0) return 0;
  if (wpm >= 120) return 99;

  for (let i = 0; i < WPM_PERCENTILE_BREAKPOINTS.length; i++) {
    const [maxWpm, pct] = WPM_PERCENTILE_BREAKPOINTS[i];
    if (wpm <= maxWpm) {
      if (i === 0) return pct;
      const [prevWpm, prevPct] = WPM_PERCENTILE_BREAKPOINTS[i - 1];
      // Linear interpolation between breakpoints
      const ratio = (wpm - prevWpm) / (maxWpm - prevWpm);
      return Math.round(prevPct + ratio * (pct - prevPct));
    }
  }
  return 99;
}

export function getWpmLevel(wpm: number): { label: string; color: string; description: string } {
  if (wpm < 20) return { label: 'Beginner', color: 'text-orange-500', description: 'Just starting out — home row practice will unlock the biggest gains.' };
  if (wpm < 35) return { label: 'Below average', color: 'text-amber-500', description: 'With daily drills you could reach average within 3–4 weeks.' };
  if (wpm < 50) return { label: 'Average', color: 'text-yellow-500', description: 'Right at the global average. Consistent practice will take you above 60 WPM.' };
  if (wpm < 65) return { label: 'Above average', color: 'text-lime-500', description: 'Above average. You type without thinking about most keys.' };
  if (wpm < 80) return { label: 'Proficient', color: 'text-green-500', description: 'Professional level. Most job requirements fall in this range.' };
  if (wpm < 100) return { label: 'Fast', color: 'text-cyan-500', description: 'Deep muscle memory across the full keyboard. Accuracy is your next challenge.' };
  return { label: 'Elite', color: 'text-primary', description: 'Competitive-typist territory. You\'re faster than 98%+ of people worldwide.' };
}

// WPM improvement timeline data (weeks to reach milestone from a starting point)
// Based on 15–20 min/day deliberate practice
export function getImprovementTimeline(currentWpm: number, targetWpm: number): {
  weeks: number;
  note: string;
} {
  const gain = Math.max(0, targetWpm - currentWpm);
  if (gain <= 0) return { weeks: 0, note: "You're already there!" };

  // Rough: ~5–8 WPM gain per week for beginners, ~2–3 WPM for intermediate, ~1 WPM for advanced
  let wpm = currentWpm;
  let weeks = 0;
  while (wpm < targetWpm && weeks < 52) {
    const weeklyGain = wpm < 30 ? 7 : wpm < 50 ? 4 : wpm < 70 ? 2.5 : 1.5;
    wpm += weeklyGain;
    weeks++;
  }

  const note =
    weeks <= 2 ? 'A couple of focused sessions away.'
    : weeks <= 4 ? 'About a month of daily practice.'
    : weeks <= 8 ? 'A couple of months with consistent sessions.'
    : weeks <= 16 ? 'A few months — completely achievable with daily 15-min sessions.'
    : 'A longer journey, but entirely achievable with persistence.';

  return { weeks, note };
}
