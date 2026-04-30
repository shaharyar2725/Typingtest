import { motion } from 'framer-motion';

interface KeyboardProps {
  nextKey?: string;
  pressedKey?: string;
}

const ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftR'],
  ['Space']
];

const FINGER_MAP: Record<string, string> = {
  '`': 'l-pinky', '1': 'l-pinky', 'q': 'l-pinky', 'a': 'l-pinky', 'z': 'l-pinky',
  '2': 'l-ring', 'w': 'l-ring', 's': 'l-ring', 'x': 'l-ring',
  '3': 'l-mid', 'e': 'l-mid', 'd': 'l-mid', 'c': 'l-mid',
  '4': 'l-index', 'r': 'l-index', 'f': 'l-index', 'v': 'l-index', '5': 'l-index', 't': 'l-index', 'g': 'l-index', 'b': 'l-index',
  '6': 'r-index', 'y': 'r-index', 'h': 'r-index', 'n': 'r-index', '7': 'r-index', 'u': 'r-index', 'j': 'r-index', 'm': 'r-index',
  '8': 'r-mid', 'i': 'r-mid', 'k': 'r-mid', ',': 'r-mid',
  '9': 'r-ring', 'o': 'r-ring', 'l': 'r-ring', '.': 'r-ring',
  '0': 'r-pinky', '-': 'r-pinky', '=': 'r-pinky', 'p': 'r-pinky', '[': 'r-pinky', ']': 'r-pinky', '\\': 'r-pinky', ';': 'r-pinky', "'": 'r-pinky', '/': 'r-pinky',
  'Space': 'thumbs'
};

const FINGER_COLORS = {
  'l-pinky': 'bg-pink-500/20 border-pink-500/30 text-pink-700 dark:text-pink-300',
  'l-ring': 'bg-rose-500/20 border-rose-500/30 text-rose-700 dark:text-rose-300',
  'l-mid': 'bg-orange-500/20 border-orange-500/30 text-orange-700 dark:text-orange-300',
  'l-index': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-300',
  'r-index': 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  'r-mid': 'bg-teal-500/20 border-teal-500/30 text-teal-700 dark:text-teal-300',
  'r-ring': 'bg-cyan-500/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
  'r-pinky': 'bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300',
  'thumbs': 'bg-violet-500/20 border-violet-500/30 text-violet-700 dark:text-violet-300',
  'default': 'bg-card border-border text-foreground'
};

export function Keyboard({ nextKey, pressedKey }: KeyboardProps) {
  
  const getWidthClass = (key: string) => {
    switch (key) {
      case 'Backspace': return 'w-[60px] md:w-[80px]';
      case 'Tab': return 'w-[50px] md:w-[60px]';
      case '\\': return 'w-[40px] md:w-[50px]';
      case 'Caps': return 'w-[60px] md:w-[75px]';
      case 'Enter': return 'w-[65px] md:w-[85px]';
      case 'Shift': return 'w-[80px] md:w-[100px]';
      case 'ShiftR': return 'w-[80px] md:w-[100px]';
      case 'Space': return 'w-[300px] md:w-[400px]';
      default: return 'w-[32px] md:w-[44px]';
    }
  };

  const getDisplayKey = (key: string) => {
    if (key === 'ShiftR') return 'Shift';
    if (key === 'Space') return '';
    return key;
  };

  return (
    <div className="flex flex-col gap-1.5 md:gap-2 p-4 bg-muted/30 rounded-2xl border border-border mx-auto w-fit select-none shadow-sm">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className={`flex gap-1.5 md:gap-2 ${rIdx === 4 ? 'justify-center' : ''}`}>
          {row.map((k) => {
            const isNext = nextKey?.toLowerCase() === k.toLowerCase() || (nextKey === ' ' && k === 'Space');
            const isPressed = pressedKey?.toLowerCase() === k.toLowerCase() || (pressedKey === ' ' && k === 'Space');
            
            const finger = FINGER_MAP[k.toLowerCase()] || 'default';
            const colorClass = isNext ? FINGER_COLORS[finger as keyof typeof FINGER_COLORS] : FINGER_COLORS['default'];
            
            return (
              <motion.div
                key={k}
                animate={isPressed ? { scale: 0.9, opacity: 0.8 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.1 }}
                className={`
                  ${getWidthClass(k)} h-[38px] md:h-[48px] rounded-lg border-b-[3px] border border-b-border/80
                  flex items-center justify-center text-xs md:text-sm font-mono font-medium transition-colors
                  ${colorClass}
                  ${isNext ? 'ring-2 ring-primary ring-offset-2 ring-offset-background/50 shadow-sm' : ''}
                `}
              >
                {getDisplayKey(k)}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
