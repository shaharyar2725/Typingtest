import { useSEO } from '@/hooks/useSEO';

export default function AboutPage() {
  useSEO({
    title: "About TypeFlow | Built for fast fingers",
    description: "Learn about TypeFlow, the minimalist typing test and course platform designed to help you improve your typing speed and accuracy.",
  });

  return (
    <div className="container max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-8">About TypeFlow</h1>
      
      <div className="prose dark:prose-invert prose-lg max-w-none">
        <p>
          TypeFlow was built with a single goal: to provide the most fluid, distraction-free environment for improving your typing speed and accuracy.
        </p>

        <p>
          Unlike other typing platforms cluttered with ads, unnecessary social features, and overly gamified mechanics, TypeFlow focuses purely on the typing experience. The interface is designed to get out of your way so you can focus on what matters—your fingers and the keyboard.
        </p>

        <h3>Why Touch Typing Matters</h3>
        <p>
          In today's digital world, your typing speed is the bottleneck between your thoughts and your output. Whether you're a developer writing code, a writer drafting an article, or an executive sending emails, learning to touch type is the highest-leverage skill you can acquire.
        </p>
        <p>
          We believe that speed comes from accuracy. That's why our courses emphasize perfect finger placement and strict error checking before focusing on raw words-per-minute.
        </p>

        <h3>Features</h3>
        <ul>
          <li><strong>No Signup Required:</strong> Your progress is automatically saved securely in your browser.</li>
          <li><strong>Multiple Modes:</strong> Test yourself on common words, quotes, code snippets, or tricky punctuation.</li>
          <li><strong>Structured Learning:</strong> A 10-lesson curriculum designed to build muscle memory from the home row up.</li>
          <li><strong>Detailed Analytics:</strong> Error heatmaps and per-second sparklines help you identify your weak spots.</li>
        </ul>

        <p>
          Built for fast fingers. Keep practicing.
        </p>
      </div>
    </div>
  );
}
