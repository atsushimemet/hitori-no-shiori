"use client";

import { useMemo, useState } from "react";
import { createCalendarEvent } from "@/lib/calendar";

export type KissaFollowupStep =
  | "ask_interest"
  | "select_kissa"
  | "ask_time"
  | "confirm_calendar"
  | "calendar_loading"
  | "calendar_success"
  | "undecided";

export function useKissaFollowupFlow() {
  const [step, setStep] = useState<KissaFollowupStep>("ask_interest");
  const [selectedKissaName, setSelectedKissaName] = useState("");
  const [datetimeText, setDatetimeText] = useState("");
  const [customTime, setCustomTime] = useState("");

  const canConfirmTime = useMemo(() => customTime.trim().length > 0, [customTime]);

  function chooseInterest(hasInterest: boolean) {
    setStep(hasInterest ? "select_kissa" : "undecided");
  }

  function chooseKissa(kissaName: string) {
    setSelectedKissaName(kissaName);
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
    if (!selectedKissaName || !datetimeText) return;

    setStep("calendar_loading");
    await createCalendarEvent({ datetimeText, placeName: selectedKissaName });
    setStep("calendar_success");
  }

  function deferCalendar() {
    setStep("undecided");
  }

  return {
    addToCalendar,
    canConfirmTime,
    chooseInterest,
    chooseKissa,
    chooseTime,
    confirmCustomTime,
    customTime,
    datetimeText,
    deferCalendar,
    selectedKissaName,
    setCustomTime,
    step,
  };
}
