"use client";

import type { FormEvent, ReactNode } from "react";
import { Bookmark } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePlaceFollowupFlow } from "@/hooks/usePlaceFollowupFlow";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import type { Place, PlaceCategoryConfig } from "@/lib/placeCategories";

type PlaceFollowupFlowProps = {
  category: PlaceCategoryConfig;
  onRestartConversation: () => void;
  onReviewCandidates: () => void;
  places: Place[];
};

type FollowupChipProps = {
  children: ReactNode;
  disabled?: boolean;
  isSelected?: boolean;
  onClick: () => void;
};

function FollowupQuestion({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="relative overflow-hidden rounded-card border border-line bg-cream/85 p-5 pl-6 shadow-plate backdrop-blur sm:p-6 sm:pl-7"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
      transition={{ duration: shouldReduceMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <span aria-hidden="true" className="ribbon absolute bottom-4 left-0 top-4 h-auto rounded-r-sm" />
      {children}
    </motion.div>
  );
}

function FollowupChip({ children, disabled, isSelected, onClick }: FollowupChipProps) {
  return (
    <motion.button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-control border px-4 py-2 text-sm font-medium tracking-[0.02em] transition focus:outline-none focus:ring-1 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-55",
        isSelected
          ? "border-coffee bg-coffee text-cream shadow-plate"
          : "border-line bg-paper text-ink/76 hover:border-bark/40 hover:text-ink",
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

export function PlaceFollowupFlow({
  category,
  onRestartConversation,
  onReviewCandidates,
  places,
}: PlaceFollowupFlowProps) {
  const shouldReduceMotion = useReducedMotion();
  const {
    addToCalendar,
    canConfirmTime,
    chooseInterest,
    choosePlace,
    chooseTime,
    confirmCustomTime,
    customTime,
    datetimeText,
    deferCalendar,
    recommendationStatus,
    recommendations,
    selectedPlaceName,
    setCustomTime,
    step,
  } = usePlaceFollowupFlow(places);

  const selectedPlace = places.find((place) => place.name === selectedPlaceName);
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
          <p className="eyebrow">予定の栞</p>
          <h2 className="mt-2 font-serif text-2xl font-medium text-coffee">
            行ってみたい{category.interestTarget}はありましたか？
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <FollowupChip isSelected={hasInterest} onClick={() => chooseInterest(true)}>
              あった
            </FollowupChip>
            <FollowupChip isSelected={step === "undecided"} onClick={() => chooseInterest(false)}>
              まだ迷っている
            </FollowupChip>
          </div>
        </FollowupQuestion>

        <AnimatePresence mode="popLayout">
          {step !== "ask_interest" && step !== "undecided" ? (
            <FollowupQuestion key="select-place">
              <p className="eyebrow">{category.selectPrompt}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {places.map((place) => (
                  <FollowupChip
                    isSelected={place.name === selectedPlaceName}
                    key={place.name}
                    onClick={() => choosePlace(place.name)}
                  >
                    {place.name}
                  </FollowupChip>
                ))}
              </div>
            </FollowupQuestion>
          ) : null}

          {selectedPlaceName && step !== "select_place" ? (
            <FollowupQuestion key="ask-time">
              <p className="eyebrow">何時に行きますか？</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {category.timeOptions.map((timeOption) => (
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
                <label className="sr-only" htmlFor={`${category.id}-followup-time`}>
                  行く時間を自由入力
                </label>
                <input
                  className="min-h-11 flex-1 rounded-control border border-line bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-ink/36 focus:border-coffee/45 focus:ring-2 focus:ring-seal/25"
                  id={`${category.id}-followup-time`}
                  onChange={(event) => setCustomTime(event.target.value)}
                  placeholder={category.timePlaceholder}
                  value={customTime}
                />
                <button
                  className="min-h-11 rounded-control bg-coffee px-5 text-sm font-medium text-cream transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canConfirmTime}
                  type="submit"
                >
                  この時間で進む
                </button>
              </form>
            </FollowupQuestion>
          ) : null}

          {(step === "confirm_calendar" || step === "calendar_loading") && selectedPlace ? (
            <FollowupQuestion key="confirm-calendar">
              <p className="eyebrow">Google Calendarに予定を登録しますか？</p>
              <div className="mt-4 grid gap-2 text-sm leading-7 text-ink/74">
                <p>
                  <span className="font-medium text-ink">{category.calendarPlaceLabel}：</span>
                  {selectedPlace.name}
                </p>
                <p>
                  <span className="font-medium text-ink">時間：</span>
                  {datetimeText}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-coffee px-5 text-sm font-medium text-cream transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading}
                  onClick={addToCalendar}
                  type="button"
                >
                  {isLoading ? "栞をはさんでいます" : "Google Calendarに登録する"}
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-control border border-line px-5 text-sm font-medium text-ink/70 transition hover:border-bark/40 hover:text-ink focus:outline-none focus:ring-2 focus:ring-seal/25 focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-60"
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
                    animate={{ opacity: 1, y: 0 }}
                    aria-hidden="true"
                    className="absolute top-0 h-10 w-1.5 rounded-b-full bg-seal/80"
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                    transition={{ duration: shouldReduceMotion ? 0.18 : 0.46, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <Bookmark className="mt-7 h-4 w-4" strokeWidth={1.6} />
                </div>
                <div>
                  <p className="font-serif text-2xl font-medium text-coffee">予定の栞をはさみました。</p>
                  <p className="mt-2 text-sm leading-7 text-ink/66">
                    当日は、少し早めに出発できるようにしておきましょう。
                  </p>
                  <button
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-coffee px-5 text-sm font-medium text-cream transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper"
                    onClick={onRestartConversation}
                    type="button"
                  >
                    他の予定を立てますか？
                  </button>
                </div>
              </div>

              {recommendationStatus === "loading" ? (
                <p className="mt-7 border-t border-line pt-6 text-sm leading-7 text-ink/55">
                  同じ路線沿いのお店を探しています…
                </p>
              ) : null}

              {recommendationStatus === "ready" && recommendations.length > 0 ? (
                <div className="mt-7 border-t border-line pt-6">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="ribbon h-4" />
                    <p className="eyebrow text-seal">同じ路線に、もう一軒</p>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink/66">
                    {selectedPlace?.station
                      ? `${selectedPlace.station}と同じ路線沿いに、こんなお店もあります。`
                      : "同じ路線沿いに、こんなお店もあります。"}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {recommendations.map((recommendation) => (
                      <li
                        className="rounded-card border border-line bg-paper/70 p-4"
                        key={`${recommendation.name}-${recommendation.station}`}
                      >
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="eyebrow text-seal">{recommendation.categoryLabel}</span>
                          <span className="text-xs text-ink/55">{recommendation.line}沿線</span>
                        </div>
                        <p className="mt-1.5 break-words font-serif text-lg font-medium text-coffee">
                          {recommendation.name}
                        </p>
                        <p className="mt-1 break-words text-sm text-bark">
                          {recommendation.station}｜徒歩{recommendation.walkMinutes}分
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <a
                            className="inline-flex min-h-9 items-center justify-center rounded-control bg-coffee px-4 text-sm font-medium text-cream transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper"
                            href={buildGoogleCalendarUrl({
                              details: `${recommendation.categoryLabel}｜${recommendation.line}沿線 ${recommendation.station}（徒歩${recommendation.walkMinutes}分）`,
                              location: recommendation.googleMapUrl || recommendation.station,
                              title: recommendation.name,
                            })}
                            rel="noreferrer"
                            target="_blank"
                          >
                            Google Calendarに登録する
                          </a>
                          {recommendation.googleMapUrl ? (
                            <a
                              className="inline-flex text-sm font-medium tracking-[0.02em] text-seal transition-colors hover:text-seal-deep"
                              href={recommendation.googleMapUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Google Map で開く
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </FollowupQuestion>
          ) : null}

          {step === "undecided" ? (
            <FollowupQuestion key="undecided">
              <p className="font-serif text-2xl font-medium text-coffee">もう少し考えてみましょう。</p>
              <p className="mt-2 text-sm leading-7 text-ink/66">
                候補を見返すことも、今の気分からもう一度探すこともできます。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-control bg-coffee px-5 text-sm font-medium text-cream transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-seal/30 focus:ring-offset-2 focus:ring-offset-paper"
                  onClick={onReviewCandidates}
                  type="button"
                >
                  候補を見返す
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-control border border-line px-5 text-sm font-medium text-ink/70 transition hover:border-bark/40 hover:text-ink focus:outline-none focus:ring-2 focus:ring-seal/25 focus:ring-offset-2 focus:ring-offset-paper"
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
