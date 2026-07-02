"use client";

import { useMemo, useState } from "react";
import { createCalendarEvent } from "@/lib/calendar";

export type PlaceFollowupStep =
  | "ask_interest"
  | "select_place"
  | "ask_time"
  | "confirm_calendar"
  | "calendar_loading"
  | "calendar_success"
  | "undecided";

export function usePlaceFollowupFlow() {
  const [step, setStep] = useState<PlaceFollowupStep>("ask_interest");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [datetimeText, setDatetimeText] = useState("");
  const [customTime, setCustomTime] = useState("");

  const canConfirmTime = useMemo(() => customTime.trim().length > 0, [customTime]);

  function chooseInterest(hasInterest: boolean) {
    setStep(hasInterest ? "select_place" : "undecided");
  }

  function choosePlace(placeName: string) {
    setSelectedPlaceName(placeName);
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
    if (!selectedPlaceName || !datetimeText) return;

    setStep("calendar_loading");
    await createCalendarEvent({ datetimeText, placeName: selectedPlaceName });
    setStep("calendar_success");
  }

  function deferCalendar() {
    setStep("undecided");
  }

  return {
    addToCalendar,
    canConfirmTime,
    chooseInterest,
    choosePlace,
    chooseTime,
    confirmCustomTime,
    customTime,
    datetimeText,
    deferCalendar,
    selectedPlaceName,
    setCustomTime,
    step,
  };
}
