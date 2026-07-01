import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-control bg-coffee px-6 text-sm font-medium tracking-[0.08em] text-cream shadow-plate transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/35 focus:ring-offset-2 focus:ring-offset-paper",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
