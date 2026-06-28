import type { ReactNode } from "react";

type PromptBoxProps = {
  children?: ReactNode;
};

export function PromptBox({ children }: PromptBoxProps) {
  return (
    <div className="min-h-28 rounded-lg border border-coffee/15 bg-white/80 px-5 py-4 text-left shadow-soft backdrop-blur">
      <div className="min-h-16 text-sm leading-7 text-ink/60">{children}</div>
    </div>
  );
}
