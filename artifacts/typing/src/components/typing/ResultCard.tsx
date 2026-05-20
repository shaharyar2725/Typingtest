import { ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip, Scatter, ComposedChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import { RotateCcw, Share2 } from 'lucide-react';
import { TypingResult } from '@/lib/storage';
import { WpmPercentile } from '@/components/WpmPercentile';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ResultCardProps {
  result: TypingResult;
  onRestart?: () => void;
  showPercentile?: boolean;
}

export function ResultCard({ result, onRestart, showPercentile = true }: ResultCardProps) {
  const handleShare = async () => {
    const text = `I typed at ${result.wpm} WPM with ${result.accuracy}% accuracy on TakeTypingTest!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'TakeTypingTest result', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Result copied to clipboard');
      }
    } catch {
      // user cancelled
    }
  };

  const history = result.history ?? [];

  const chartData = history.map((h, i) => {
    const prev = i > 0 ? history[i - 1] : { errors: 0, wpm: 0 };
    const newErrors = h.errors - prev.errors;
    return {
      t: h.t,
      wpm: h.wpm,
      error: newErrors > 0 ? Math.max(20, h.wpm) : null,
    };
  });

  const modeLabel =
    result.mode === 'time'
      ? `Typing test · ${result.durationSec}s`
      : result.mode === 'lesson'
      ? 'Lesson drill'
      : `${result.mode} test`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Big stats row */}
      <div className="grid grid-cols-2 gap-6 sm:gap-12 mb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Words per minute
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-bold text-primary tabular-nums leading-none">
              {result.wpm}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-primary/80">wpm</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Accuracy
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-bold text-foreground tabular-nums leading-none">
              {result.accuracy}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-foreground/80">%</span>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6 capitalize">{modeLabel}</div>

      {/* WPM Percentile Widget */}
      {showPercentile && result.wpm > 0 && (
        <WpmPercentile wpm={result.wpm} />
      )}

      {/* Chart — only render when we have at least 2 data points */}
      {chartData.length > 1 && (
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-5 mb-3 text-xs font-semibold">
            <div className="text-muted-foreground uppercase tracking-wider">WPM over time</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" /> WPM
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive" /> Errors
            </div>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full bg-card border border-border rounded-2xl p-3 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelFormatter={(t) => `${t}s`}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#wpmFill)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Scatter
                  dataKey="error"
                  fill="hsl(var(--destructive))"
                  shape="circle"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3 justify-center mt-6">
        {onRestart && (
          <Button onClick={onRestart} size="lg" className="font-semibold px-8">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        )}
        <Button onClick={handleShare} variant="outline" size="lg" className="font-semibold">
          <Share2 className="w-4 h-4 mr-2" />
          Share result
        </Button>
      </div>
    </motion.div>
  );
}
