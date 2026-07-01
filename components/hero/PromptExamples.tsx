import { promptExamples } from "@/lib/prompts";

export function PromptExamples() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <span className="eyebrow">10の入力例が巡ります</span>
      <div aria-hidden="true" className="flex gap-1.5">
        {promptExamples.slice(0, 10).map((prompt) => (
          <span className="h-1 w-1 rounded-full bg-seal/40" key={prompt} />
        ))}
      </div>
    </div>
  );
}
