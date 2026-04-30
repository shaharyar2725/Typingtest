import { useEffect, useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/auth-api";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardProps {
  refreshKey?: number;
}

export function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const medal = (rank: number) => {
    if (rank === 0) return "text-yellow-500";
    if (rank === 1) return "text-slate-400";
    if (rank === 2) return "text-amber-700";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <Trophy className="w-5 h-5 text-primary shrink-0" />
            <h2 className="font-bold text-lg">Leaderboard</h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">Top 20 by WPM</span>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground px-4">
              No scores yet.{" "}
              {user
                ? "Run a test to claim the #1 spot!"
                : "Sign up and run a test to be first!"}
            </div>
          ) : (
            entries.map((entry, i) => {
              const isMe = user?.username === entry.username;
              return (
                <div
                  key={`${entry.username}-${i}`}
                  className={`flex items-center px-5 py-3 transition-colors ${
                    isMe ? "bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <div className={`w-8 font-bold text-sm tabular-nums ${medal(i)}`}>
                    {i < 3 ? "★" : ""} {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2.5">
                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt=""
                        className="w-7 h-7 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                    )}
                    <span className="font-semibold truncate">{entry.username}</span>
                    {isMe && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-5 text-sm">
                    <div className="text-right">
                      <div className="font-bold text-primary tabular-nums text-base leading-none">
                        {entry.wpm}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">wpm</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold tabular-nums leading-none">{entry.accuracy}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">acc</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold tabular-nums text-muted-foreground leading-none">{entry.runs}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">runs</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
