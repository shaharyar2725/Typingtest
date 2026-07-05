import { ReactNode } from "react";

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground mt-16 mb-6">
      {children}
    </h2>
  );
}
