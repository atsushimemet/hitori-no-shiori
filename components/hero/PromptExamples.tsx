import { promptExamples } from "@/lib/prompts";

export function PromptExamples() {
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-xs text-ink/45">
      <span>10個の入力例が巡ります</span>
      <div aria-hidden="true" className="flex gap-1.5">
        {promptExamples.slice(0, 10).map((prompt) => (
          <span className="h-1.5 w-1.5 rounded-full bg-coffee/25" key={prompt} />
        ))}
      </div>
    </div>
  );
}
