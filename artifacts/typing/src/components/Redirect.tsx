import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * SPA "redirect" — calls setLocation on mount and renders nothing.
 * Used to consolidate legacy URLs onto canonical SEO targets.
 */
export function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to, { replace: true });
  }, [to, setLocation]);
  return null;
}
