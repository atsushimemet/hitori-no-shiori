"use client";

import { motion, useReducedMotion } from "motion/react";
import { placeCategories, type PlaceCategoryConfig } from "@/lib/placeCategories";

const categories = Object.values(placeCategories);

type CategoryChoicesProps = {
  disabled?: boolean;
  onSelect: (category: PlaceCategoryConfig) => void;
};

// 聞き返しの上限に達してもカテゴリを絞れなかったとき、推測で遷移せず
// ユーザー自身に選んでもらうための選択肢。
export function CategoryChoices({ disabled = false, onSelect }: CategoryChoicesProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-3xl flex-wrap gap-2"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.42, ease: [0.4, 0, 0.2, 1] }}
      role="group"
      aria-label="カテゴリを選ぶ"
    >
      {categories.map((category) => (
        <button
          className="rounded-control border border-line bg-cream px-4 py-2 text-sm text-ink shadow-plate transition-colors hover:border-coffee/40 hover:bg-paper disabled:cursor-default disabled:opacity-50"
          disabled={disabled}
          key={category.id}
          onClick={() => onSelect(category)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </motion.div>
  );
}
