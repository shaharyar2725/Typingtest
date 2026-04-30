import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Copy, Share2 } from 'lucide-react';
import { TypingResult, addResult } from '@/lib/storage';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

interface ResultCardProps {
  result: TypingResult;
  onRestart?: () => void;
}

export function ResultCard({ result, onRestart }: ResultCardProps) {
  const [, setLocation] = useLocation();

  const handleShare = () => {
    addResult(result);
    setLocation(`/results/${result.id}`);
    navigator.clipboard.writeText(`${window.location.origin}/results/${result.id}`);
    toast.success('Link copied to clipboard!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`WPM: ${result.wpm} | Acc: ${result.accuracy}% | Errors: ${result.errors} — TypeFlow`);
    toast.success('Result copied to clipboard!');
  };

  // Top 6 missed keys
  const missedKeysEntries = Object.entries(result.missedKeys || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="bg-card text-card-foreground border-border overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Badge variant="secondary" className="text-sm font-mono tracking-wider">
              {result.mode}
            </Badge>
            <div className="text-sm text-muted-foreground font-mono">
              {result.durationSec}s
            </div>
            <div className="text-sm text-muted-foreground font-mono ml-auto">
              {new Date(result.timestamp).toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col">
              <span className="text-6xl font-bold text-primary mb-2 font-mono tracking-tight">{result.wpm}</span>
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">WPM</span>
            </div>
            <div className="flex flex-col">
              <span className="text-6xl font-bold text-foreground mb-2 font-mono tracking-tight">{result.accuracy}%</span>
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Accuracy</span>
            </div>
            <div className="flex flex-col justify-end pb-[0.4rem]">
              <span className="text-3xl font-semibold text-foreground mb-1 font-mono tracking-tight">{result.errors}</span>
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Errors</span>
            </div>
            <div className="flex flex-col justify-end pb-[0.4rem]">
              <span className="text-3xl font-semibold text-foreground mb-1 font-mono tracking-tight">{result.durationSec}s</span>
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Time</span>
            </div>
          </div>

          {result.history && result.history.length > 0 && (
            <div className="h-[120px] w-full mb-12 relative opacity-80 hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.history}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Line 
                    type="monotone" 
                    dataKey="wpm" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3} 
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="absolute top-0 left-0 text-xs text-primary font-mono opacity-50">WPM</div>
              <div className="absolute top-4 left-0 text-xs text-destructive font-mono opacity-50">Errors</div>
            </div>
          )}

          {missedKeysEntries.length > 0 && (
            <div className="mb-10">
              <h4 className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-4">Missed Keys</h4>
              <div className="flex flex-wrap gap-3">
                {missedKeysEntries.map(([key, count]) => (
                  <div key={key} className="flex items-center bg-muted/50 rounded-md overflow-hidden border border-border">
                    <span className="px-3 py-1.5 font-mono text-lg bg-muted text-foreground border-r border-border">{key === ' ' ? '␣' : key}</span>
                    <span className="px-3 py-1.5 text-sm font-mono text-destructive">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            {onRestart && (
              <Button onClick={onRestart} size="lg" className="font-semibold px-8 hover-elevate">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={handleCopy} variant="secondary" size="lg" className="hover-elevate">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleShare} variant="outline" size="lg" className="hover-elevate border-primary/20 hover:border-primary/50 hover:bg-primary/5">
              <Share2 className="w-4 h-4 mr-2 text-primary" />
              <span className="text-primary">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
