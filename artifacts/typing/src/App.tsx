import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import React, { Suspense } from "react";

const queryClient = new QueryClient();

// Lazy load pages
const Home = React.lazy(() => import("@/pages/Home"));
const TypingTestPage = React.lazy(() => import("@/pages/TypingTestPage"));
const TypingSpeedTestPage = React.lazy(() => import("@/pages/TypingSpeedTestPage"));
const OneMinuteTestPage = React.lazy(() => import("@/pages/OneMinuteTestPage"));
const FiveMinuteTestPage = React.lazy(() => import("@/pages/FiveMinuteTestPage"));
const TypingPracticePage = React.lazy(() => import("@/pages/TypingPracticePage"));
const LearnTypingPage = React.lazy(() => import("@/pages/LearnTypingPage"));
const LessonPage = React.lazy(() => import("@/pages/LessonPage"));
const ResultsPage = React.lazy(() => import("@/pages/ResultsPage"));
const AboutPage = React.lazy(() => import("@/pages/AboutPage"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

function PageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="h-32 w-full max-w-2xl bg-muted rounded"></div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppShell>
      <Suspense fallback={<PageSkeleton />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/typing-test" component={TypingTestPage} />
          <Route path="/typing-speed-test" component={TypingSpeedTestPage} />
          <Route path="/1-minute-typing-test" component={OneMinuteTestPage} />
          <Route path="/5-minute-typing-test" component={FiveMinuteTestPage} />
          <Route path="/typing-practice" component={TypingPracticePage} />
          <Route path="/learn-typing" component={LearnTypingPage} />
          <Route path="/lessons/:slug" component={LessonPage} />
          <Route path="/results/:id" component={ResultsPage} />
          <Route path="/about" component={AboutPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
