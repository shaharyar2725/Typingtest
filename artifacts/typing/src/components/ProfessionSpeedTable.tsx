import { useState } from 'react';
import { PROFESSION_SPEEDS, PROFESSION_CATEGORIES, ProfessionCategory } from '@/lib/wpm-data';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ProfessionSpeedTableProps {
  userWpm?: number;
}

export function ProfessionSpeedTable({ userWpm }: ProfessionSpeedTableProps) {
  const [activeCategory, setActiveCategory] = useState<ProfessionCategory>('All');

  const filtered = activeCategory === 'All'
    ? PROFESSION_SPEEDS
    : PROFESSION_SPEEDS.filter(p => p.category === activeCategory);

  return (
    <div className="w-full">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PROFESSION_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Min WPM</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Typical WPM</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Accuracy</th>
              {userWpm !== undefined && (
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">Your score</th>
              )}
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((prof) => {
              const qualifies = userWpm !== undefined && userWpm >= prof.minWpm;
              const almostQualifies = userWpm !== undefined && userWpm >= prof.minWpm - 10 && userWpm < prof.minWpm;
              return (
                <tr
                  key={prof.role}
                  className={`transition-colors hover:bg-muted/40 ${
                    userWpm !== undefined
                      ? qualifies
                        ? 'bg-emerald-500/5'
                        : almostQualifies
                        ? 'bg-amber-500/5'
                        : ''
                      : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    <div>{prof.role}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{prof.category}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold tabular-nums">
                    {prof.minWpm > 0 ? `${prof.minWpm}+` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums text-muted-foreground">
                    {prof.typicalWpm}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                    {prof.accuracy}%
                  </td>
                  {userWpm !== undefined && (
                    <td className="px-4 py-3 text-center">
                      {qualifies ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Qualifies
                        </span>
                      ) : almostQualifies ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-xs">
                          <span className="w-4 h-4 text-center font-bold">~</span> Close
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <XCircle className="w-4 h-4" /> Need {prof.minWpm - (userWpm ?? 0)} more
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell max-w-[220px]">
                    {prof.note}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Sources: industry job postings and employer benchmarks. Requirements vary by employer and location.
        Stenographers use specialized steno machines — not comparable to standard keyboard WPM.
      </p>
    </div>
  );
}
