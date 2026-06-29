"use client";

import { forwardRef, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

type ChatComposerProps = {
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  value: string;
};

export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(function ChatComposer(
  { disabled = false, onChange, onSubmit, value },
  ref,
) {
  const canSubmit = value.trim().length > 0 && !disabled;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canSubmit) {
      onSubmit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canSubmit) {
        onSubmit();
      }
    }
  }

  return (
    <form
      className="mx-auto flex w-full max-w-3xl items-end gap-3 rounded-2xl border border-coffee/15 bg-white/80 p-3 shadow-soft backdrop-blur focus-within:ring-2 focus-within:ring-coffee/20"
      onSubmit={handleSubmit}
    >
      <textarea
        aria-label="追加の希望"
        className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 text-ink outline-none disabled:cursor-default"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        ref={ref}
        rows={1}
        value={value}
      />
      <button
        aria-label="送信"
        className="flex h-10 w-10 items-center justify-center rounded-md bg-coffee text-paper transition-colors disabled:cursor-default disabled:bg-coffee/35"
        disabled={!canSubmit}
        type="submit"
      >
        <Send aria-hidden="true" size={16} strokeWidth={1.8} />
      </button>
    </form>
  );
});
