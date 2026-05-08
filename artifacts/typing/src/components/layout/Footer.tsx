import { Link } from "wouter";
import { Keyboard } from "lucide-react";
import { LESSONS } from "@/lib/lessons";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/20 py-12 md:py-16 lg:py-20 mt-20">
      <div className="container max-w-screen-2xl px-4 md:px-8 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">

          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 font-bold mb-4 w-fit">
              <Keyboard className="h-5 w-5 text-primary" />
              <span className="text-lg tracking-tight">
                type<span className="text-primary mx-[1px]">|</span>flow
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Free online typing practice and typing tests with live WPM, accuracy tracking, and structured courses. Built for fast fingers.
            </p>
            <div className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} TypeFlow. All rights reserved.
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Practice & Test</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Typing Practice</Link></li>
              <li><Link href="/typing-speed-test" className="hover:text-primary transition-colors">Typing Speed Test</Link></li>
              <li><Link href="/1-minute-typing-test" className="hover:text-primary transition-colors">1 Minute Typing Test</Link></li>
              <li><Link href="/3-minute-typing-test" className="hover:text-primary transition-colors">3 Minute Typing Test</Link></li>
              <li><Link href="/5-minute-typing-test" className="hover:text-primary transition-colors">5 Minute Typing Test</Link></li>
              <li><Link href="/10-minute-typing-test" className="hover:text-primary transition-colors">10 Minute Typing Test</Link></li>
              <li><Link href="/20-minute-typing-test" className="hover:text-primary transition-colors">20 Minute Typing Test</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Learn</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/learn-typing" className="hover:text-primary transition-colors">Course Overview</Link></li>
              {LESSONS.slice(0, 4).map(lesson => (
                <li key={lesson.slug}>
                  <Link href={`/lessons/${lesson.slug}`} className="hover:text-primary transition-colors">
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About TypeFlow</Link></li>
              <li><Link href="/learn-typing" className="hover:text-primary transition-colors">Touch Typing Guide</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
