import { getWpmPercentile, getWpmLevel } from '@/lib/wpm-data';

interface WpmPercentileProps {
  wpm: number;
}

export function WpmPercentile({ wpm }: WpmPercentileProps) {
  const percentile = getWpmPercentile(wpm);
  const level = getWpmLevel(wpm);

  const barWidth = Math.min(100, Math.max(2, percentile));

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 py-6 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            Global ranking
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold leading-none">
            Faster than{' '}
            <span className={level.color}>{percentile}%</span>
            {' '}of typists worldwide
          </div>
        </div>
        <div className={`text-sm font-bold px-3 py-1.5 rounded-full bg-muted shrink-0 ${level.color}`}>
          {level.label}
        </div>
      </div>

      {/* Distribution bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${barWidth}%` }}
        />
        {/* Avg marker */}
        <div
          className="absolute inset-y-0 w-0.5 bg-muted-foreground/60"
          style={{ left: '49%' }}
          title="Global average (41.6 WPM)"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>Slower</span>
        <span className="absolute left-1/2 -translate-x-1/2 relative">avg 41.6 WPM</span>
        <span>Faster</span>
      </div>

      <p className="text-sm text-muted-foreground">{level.description}</p>

      {/* Benchmark row */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { label: 'Global avg', value: '41.6 WPM', highlight: false },
          { label: 'Professional', value: '65–75 WPM', highlight: false },
          { label: 'Your score', value: `${wpm} WPM`, highlight: true },
          { label: 'Nordic avg', value: '48 WPM', highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-xl p-2.5 text-center ${highlight ? 'bg-primary/10 border border-primary/20' : 'bg-muted'}`}>
            <div className={`font-bold text-sm ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
            <div className="text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
