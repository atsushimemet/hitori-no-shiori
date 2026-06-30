"use client";

import type { FormEvent, ReactNode } from "react";
import { Bookmark } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useBarFollowupFlow } from "@/hooks/useBarFollowupFlow";
import { cn } from "@/lib/cn";
import type { MockBar } from "@/lib/mockBars";

type BarFollowupFlowProps = {
  bars: MockBar[];
  onReviewCandidates: () => void;
  onRestartConversation: () => void;
};

type FollowupChipProps = {
  children: ReactNode;
  disabled?: boolean;
  isSelected?: boolean;
  onClick: () => void;
};

const timeOptions = ["今日 19:00", "今日 20:00", "明日 19:00"] as const;

function FollowupQuestion({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="rounded-lg border border-coffee/10 bg-white/72 p-4 shadow-[0_18px_55px_rgb(61_47_37_/_0.08)] backdrop-blur sm:p-5"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
      transition={{ duration: shouldReduceMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FollowupChip({ children, disabled, isSelected, onClick }: FollowupChipProps) {
  return (
    <motion.button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-coffee/25 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55",
        isSelected
          ? "border-coffee bg-coffee text-paper shadow-soft"
          : "border-coffee/14 bg-paper/70 text-ink/76 hover:border-coffee/28 hover:text-ink",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

export function BarFollowupFlow({
  bars,
  onRestartConversation,
  onReviewCandidates,
}: BarFollowupFlowProps) {
  const shouldReduceMotion = useReducedMotion();
  const {
    addToCalendar,
    canConfirmTime,
    chooseBar,
    chooseInterest,
    chooseTime,
    confirmCustomTime,
    customTime,
    datetimeText,
    deferCalendar,
    selectedBarName,
    setCustomTime,
    step,
  } = useBarFollowupFlow();

  const selectedBar = bars.find((bar) => bar.name === selectedBarName);
  const isLoading = step === "calendar_loading";
  const hasInterest = step !== "ask_interest" && step !== "undecided";

  function handleCustomTimeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    confirmCustomTime();
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      aria-live="polite"
      className="mt-10 max-w-3xl"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.52, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="space-y-4">
        <FollowupQuestion>
          <p className="text-sm font-medium text-bark/72">予定の栞</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-ink">
            行ってみたいお店はありましたか？
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <FollowupChip isSelected={hasInterest} onClick={() => chooseInterest(true)}>
              あった
            </FollowupChip>
            <FollowupChip
              isSelected={step === "undecided"}
              onClick={() => chooseInterest(false)}
            >
              まだ迷っている
            </FollowupChip>
          </div>
        </FollowupQuestion>

        <AnimatePresence mode="popLayout">
          {step !== "ask_interest" && step !== "undecided" ? (
            <FollowupQuestion key="select-bar">
              <p className="text-sm font-medium text-bark/72">どのお店に行ってみたいですか？</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {bars.map((bar) => (
                  <FollowupChip
                    isSelected={bar.name === selectedBarName}
                    key={bar.name}
                    onClick={() => chooseBar(bar.name)}
                  >
                    {bar.name}
                  </FollowupChip>
                ))}
              </div>
            </FollowupQuestion>
          ) : null}

          {selectedBarName && step !== "select_bar" ? (
            <FollowupQuestion key="ask-time">
              <p className="text-sm font-medium text-bark/72">何時に行きますか？</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {timeOptions.map((timeOption) => (
                  <FollowupChip
                    isSelected={timeOption === datetimeText}
                    key={timeOption}
                    onClick={() => chooseTime(timeOption)}
                  >
                    {timeOption}
                  </FollowupChip>
                ))}
              </div>
              <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleCustomTimeSubmit}>
                <label className="sr-only" htmlFor="bar-followup-time">
                  行く時間を自由入力
                </label>
                <input
                  className="min-h-11 flex-1 rounded-md border border-coffee/14 bg-paper/72 px-4 text-sm text-ink outline-none transition placeholder:text-ink/36 focus:border-coffee/36 focus:ring-2 focus:ring-coffee/15"
                  id="bar-followup-time"
                  onChange={(event) => setCustomTime(event.target.value)}
                  placeholder="例：今日の20時"
                  value={customTime}
                />
                <button
                  className="min-h-11 rounded-md bg-coffee px-5 text-sm font-medium text-paper transition hover:bg-bark focus:outline-none focus:ring-2 focus:ring-coffee/25 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canConfirmTime}
                  type="submit"
                >
                  この時間で進む
                </button>
              </form>
            </FollowupQuestion>
          ) : null}

          {(step === "confirm_calendar" || step === "calendar_loading") && selectedBar ? (
            <FollowupQuestion key="confirm-calendar">
              <p className="text-sm font-medium text-bark/72">
                Google Calendarに予定を登録しますか？
              </p>
              <div className="mt-4 grid gap-2 text-sm leading-7 text-ink/74">
                <p>
                  <span className="font-medium text-ink">お店：</span>
                  {selectedBar.name}
                </p>
                <p>
                  <span className="font-medium text-ink">時間：</span>
                  {datetimeText}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-coffee px-5 text-sm font-medium text-paper transition hover:bg-bark focus:outline-none focus:ring-2 focus:ring-coffee/25 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                  onClick={addToCalendar}
                  type="button"
                >
                  {isLoading ? "栞をはさんでいます" : "Google Calendarに登録する"}
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-coffee/14 px-5 text-sm font-medium text-ink/70 transition hover:border-coffee/28 hover:text-ink focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                  onClick={deferCalendar}
                  type="button"
                >
                  あとで決める
                </button>
              </div>
            </FollowupQuestion>
          ) : null}

          {step === "calendar_success" ? (
            <FollowupQuestion key="calendar-success">
              <div className="flex items-start gap-4">
                <div className="relative mt-1 flex h-12 w-8 justify-center text-coffee">
                  <motion.span
                    aria-hidden="true"
                    className="absolute top-0 h-10 w-1.5 rounded-b-full bg-coffee/72"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.18 : 0.46, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <Bookmark className="mt-7 h-4 w-4" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="font-serif text-2xl font-semibold text-ink">
                    予定の栞をはさみました。
                  </p>
                  <p className="mt-2 text-sm leading-7 text-ink/66">
                    当日は、少し早めに出発できるようにしておきましょう。
                  </p>
                </div>
              </div>
            </FollowupQuestion>
          ) : null}

          {step === "undecided" ? (
            <FollowupQuestion key="undecided">
              <p className="font-serif text-2xl font-semibold text-ink">
                もう少し考えてみましょう。
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/66">
                候補を見返すことも、今の気分からもう一度探すこともできます。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-coffee px-5 text-sm font-medium text-paper transition hover:bg-bark focus:outline-none focus:ring-2 focus:ring-coffee/25 focus:ring-offset-2 focus:ring-offset-paper"
                  onClick={onReviewCandidates}
                  type="button"
                >
                  候補を見返す
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-coffee/14 px-5 text-sm font-medium text-ink/70 transition hover:border-coffee/28 hover:text-ink focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:ring-offset-2 focus:ring-offset-paper"
                  onClick={onRestartConversation}
                  type="button"
                >
                  もう一度AIと話す
                </button>
              </div>
            </FollowupQuestion>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
