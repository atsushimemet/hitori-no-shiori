"use client";

import { useMemo, useState } from "react";
import { createCalendarEvent } from "@/lib/calendar";

export type BarFollowupStep =
  | "ask_interest"
  | "select_bar"
  | "ask_time"
  | "confirm_calendar"
  | "calendar_loading"
  | "calendar_success"
  | "undecided";

export function useBarFollowupFlow() {
  const [step, setStep] = useState<BarFollowupStep>("ask_interest");
  const [selectedBarName, setSelectedBarName] = useState("");
  const [datetimeText, setDatetimeText] = useState("");
  const [customTime, setCustomTime] = useState("");

  const canConfirmTime = useMemo(() => customTime.trim().length > 0, [customTime]);

  function chooseInterest(hasInterest: boolean) {
    setStep(hasInterest ? "select_bar" : "undecided");
  }

  function chooseBar(barName: string) {
    setSelectedBarName(barName);
    setStep("ask_time");
  }

  function chooseTime(timeText: string) {
    setDatetimeText(timeText);
    setCustomTime("");
    setStep("confirm_calendar");
  }

  function confirmCustomTime() {
    const nextTime = customTime.trim();
    if (!nextTime) return;
    setDatetimeText(nextTime);
    setStep("confirm_calendar");
  }

  async function addToCalendar() {
    if (!selectedBarName || !datetimeText) return;

    setStep("calendar_loading");
    await createCalendarEvent({ barName: selectedBarName, datetimeText });
    setStep("calendar_success");
  }

  function deferCalendar() {
    setStep("undecided");
  }

  return {
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
  };
}
