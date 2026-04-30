import { ReactNode } from "react";

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 my-12">
      <div className="flex-1 h-px bg-border" />
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground px-2">
        {children}
      </h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
