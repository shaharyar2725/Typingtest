import { useSEO } from '@/hooks/useSEO';
import { Link } from 'wouter';

const SITE_ORIGIN = 'https://typeflow.app';
const PAGE_URL = `${SITE_ORIGIN}/about`;

export default function AboutPage() {
  useSEO({
    title: 'About TypeFlow — Free Typing Test & Touch Typing Course',
    description:
      'TypeFlow is a free, minimalist typing practice platform with a live WPM typing test, a 10-lesson touch-typing course, and no ads. No signup required.',
    keywords:
      'about typeflow, typing test platform, free typing test, touch typing course, typing practice app',
    canonical: PAGE_URL,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: 'About', item: PAGE_URL },
        ],
      },
    ],
  });

  return (
    <div className="container max-w-3xl mx-auto px-5 md:px-8 py-12 md:py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-8">About TypeFlow</h1>

      <div className="prose dark:prose-invert prose-lg max-w-none">
        <p>
          TypeFlow is a free online typing practice and typing test platform built around a
          single goal: the most fluid, distraction-free environment for improving your typing
          speed and accuracy.
        </p>

        <p>
          Unlike other typing platforms cluttered with ads, unnecessary social features, and
          overly gamified mechanics, TypeFlow focuses purely on the typing experience. The
          interface is designed to get out of your way so you can focus on what matters —
          your fingers and the keyboard.
        </p>

        <h2>Why Touch Typing Matters</h2>
        <p>
          In today's digital world, your typing speed is the bottleneck between your thoughts
          and your output. Whether you're a developer writing code, a writer drafting an
          article, or an executive sending emails, learning to touch type is among the
          highest-leverage skills you can acquire.
        </p>
        <p>
          Speed comes from accuracy. That's why TypeFlow's{' '}
          <Link href="/learn-typing" className="text-primary font-semibold">
            touch-typing course
          </Link>{' '}
          emphasizes correct finger placement and error discipline before focusing on raw
          words-per-minute.
        </p>

        <h2>What TypeFlow Offers</h2>
        <ul>
          <li>
            <strong>Free typing practice</strong> in time, words, and quote modes — with live
            WPM, accuracy, and error tracking.
          </li>
          <li>
            <strong>Free typing speed test</strong> — measure your WPM and accuracy instantly,
            no account needed.
          </li>
          <li>
            <strong>Structured 10-lesson course</strong> — a curriculum designed to build
            muscle memory from the home row up through symbols and speed drills.
          </li>
          <li>
            <strong>No signup required</strong> — your progress and personal best are saved
            automatically in your browser.
          </li>
          <li>
            <strong>Multiple word sources</strong> — common words, classic quotes, code
            snippets, and punctuation-heavy text.
          </li>
          <li>
            <strong>No ads</strong> — ever.
          </li>
        </ul>

        <p>
          Built for fast fingers. Keep practicing.
        </p>
      </div>
    </div>
  );
}
