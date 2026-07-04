import { promptExamples } from "@/lib/prompts";

type PromptExamplesProps = {
  activeIndex: number;
  onSelect: (example: string) => void;
};

export function PromptExamples({ activeIndex, onSelect }: PromptExamplesProps) {
  return (
    <div className="mt-5 flex items-center justify-center">
      <div className="flex gap-1.5" role="list" aria-label="入力例">
        {promptExamples.map((prompt, index) => (
          <button
            aria-label={`入力例${index + 1}をテキストボックスに入れる`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={`h-2.5 w-2.5 rounded-full border border-transparent transition focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-cream ${
              index === activeIndex ? "bg-seal" : "bg-seal/35 hover:bg-seal/55"
            }`}
            key={prompt}
            onClick={() => onSelect(prompt)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
