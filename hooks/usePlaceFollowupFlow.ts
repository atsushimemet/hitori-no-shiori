"use client";

import { useMemo, useState } from "react";
import type { Place } from "@/lib/placeCategories";
import type { RecommendedPlace } from "@/lib/recommendations";

export type PlaceFollowupStep =
  | "ask_interest"
  | "select_place"
  | "ask_time"
  | "confirm_calendar"
  | "calendar_success"
  | "undecided";

export type RecommendationStatus = "idle" | "loading" | "ready";

export function usePlaceFollowupFlow(places: Place[]) {
  const [step, setStep] = useState<PlaceFollowupStep>("ask_interest");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [datetimeText, setDatetimeText] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendedPlace[]>([]);
  const [recommendationStatus, setRecommendationStatus] = useState<RecommendationStatus>("idle");

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

  async function loadRecommendations(station: string) {
    const trimmedStation = station.trim();
    if (!trimmedStation) {
      setRecommendationStatus("ready");
      return;
    }

    setRecommendationStatus("loading");

    try {
      const response = await fetch(
        `/api/recommendations?station=${encodeURIComponent(trimmedStation)}`,
      );
      const data = (await response.json()) as { recommendations?: RecommendedPlace[] };
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (error) {
      console.error("路線レコメンドの取得に失敗しました", error);
      setRecommendations([]);
    } finally {
      setRecommendationStatus("ready");
    }
  }

  function addToCalendar() {
    if (!selectedPlaceName || !datetimeText) return;

    const selectedPlace = places.find((place) => place.name === selectedPlaceName);

    setStep("calendar_success");

    if (selectedPlace?.station) {
      void loadRecommendations(selectedPlace.station);
    } else {
      setRecommendationStatus("ready");
    }
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
    recommendationStatus,
    recommendations,
    selectedPlaceName,
    setCustomTime,
    step,
  };
}
