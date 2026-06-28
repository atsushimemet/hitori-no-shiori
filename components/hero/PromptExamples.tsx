import { promptExamples } from "@/lib/prompts";

export function PromptExamples() {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {promptExamples.map((prompt) => (
        <span
          className="rounded-full border border-coffee/10 bg-white/45 px-3 py-1 text-xs text-ink/55"
          key={prompt}
        >
          {prompt}
        </span>
      ))}
    </div>
  );
}
