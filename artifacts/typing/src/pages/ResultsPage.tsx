import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ResultCard } from '@/components/typing/ResultCard';
import { getResult, TypingResult } from '@/lib/storage';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState<TypingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: result ? `Typing Result: ${result.wpm} WPM | TypeFlow` : "Typing Result | TypeFlow",
    description: result ? `I just typed ${result.wpm} WPM with ${result.accuracy}% accuracy on TypeFlow. Can you beat my score?` : "Check out my typing speed on TypeFlow.",
  });

  useEffect(() => {
    if (id) {
      const res = getResult(id);
      setResult(res || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="container py-20 text-center text-muted-foreground">Loading result...</div>;
  }

  if (!result) {
    return (
      <div className="container max-w-screen-md mx-auto px-5 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Result Not Found</h1>
        <p className="text-muted-foreground mb-8">This typing result doesn't exist or was saved in a different browser.</p>
        <Link href="/">
          <Button><ArrowLeft className="w-4 h-4 mr-2" /> Take a typing test</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-lg mx-auto px-5 md:px-8 py-10 md:py-14">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Typing Result</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResultCard result={result} />
      </motion.div>
    </div>
  );
}
