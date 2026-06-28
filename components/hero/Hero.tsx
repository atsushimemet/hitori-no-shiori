import { BookmarkIntro } from "@/components/hero/BookmarkIntro";
import { HeroCTA } from "@/components/hero/HeroCTA";
import { PromptBox } from "@/components/hero/PromptBox";
import { PromptExamples } from "@/components/hero/PromptExamples";
import { TypewriterText } from "@/components/hero/TypewriterText";

export function Hero() {
  return (
    <main className="flex min-h-screen items-center justify-center px-[var(--space-page-x)] py-[var(--space-page-y)]">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <BookmarkIntro />
        <h1 className="mt-8 font-serif text-4xl font-semibold tracking-normal text-ink sm:text-6xl">
          ひとりの栞
        </h1>
        <p className="mt-5 text-base leading-8 text-ink/75 sm:text-lg">
          今の気分からひとり時間を提案します
        </p>
        <div className="mt-10 w-full max-w-xl">
          <PromptBox>
            <TypewriterText />
          </PromptBox>
          <PromptExamples />
        </div>
        <HeroCTA />
      </section>
    </main>
  );
}
