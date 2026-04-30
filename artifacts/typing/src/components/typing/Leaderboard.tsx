import { useEffect, useState } from "react";
import { Trophy, User, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  fetchLeaderboard,
  claimUsername,
  getStoredUsername,
  clearStoredUser,
  type LeaderboardEntry,
} from "@/lib/leaderboard-api";
import { toast } from "sonner";

interface LeaderboardProps {
  refreshKey?: number;
}

export function Leaderboard({ refreshKey = 0 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(getStoredUsername());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch {
      // ignore — empty list is fine
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      toast.error("Username must be at least 2 characters");
      return;
    }
    setSubmitting(true);
    try {
      await claimUsername(trimmed);
      setMe(trimmed);
      setDialogOpen(false);
      setUsername("");
      toast.success(`Welcome, ${trimmed}!`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to claim");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = () => {
    clearStoredUser();
    setMe(null);
    toast.success("Signed out");
  };

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
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Leaderboard</h2>
            <span className="text-xs text-muted-foreground hidden sm:inline">· Top 20 by WPM</span>
          </div>
          {me ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold">
                <User className="w-3.5 h-3.5" />
                {me}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setDialogOpen(true)} className="font-semibold">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Sign up
            </Button>
          )}
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground px-4">
              No scores yet. {me ? "Run a test to claim the #1 spot!" : "Sign up and run a test to be the first!"}
            </div>
          ) : (
            entries.map((entry, i) => {
              const isMe = entry.username === me;
              return (
                <div
                  key={entry.username}
                  className={`flex items-center px-5 py-3 transition-colors ${
                    isMe ? "bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <div className={`w-8 font-bold text-sm tabular-nums ${medal(i)}`}>
                    {i < 3 ? "★" : ""} {i + 1}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim a username</DialogTitle>
            <DialogDescription>
              Pick a name to appear on the leaderboard. Saved to this browser — no password needed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaim} className="space-y-3">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={20}
              autoFocus
              disabled={submitting}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              2–20 characters. Letters, numbers, underscores and dashes.
            </p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || username.trim().length < 2}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Claim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
