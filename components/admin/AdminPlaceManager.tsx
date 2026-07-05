"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Lock, LogOut, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import type { AdminCategory, AdminPlace } from "@/lib/adminPlaces";
import { Button } from "@/components/ui/Button";
import { duration, ease } from "@/components/motion/tokens";
import { cn } from "@/lib/cn";

type AdminPlaceForm = {
  attributesText: string;
  categoryId: string;
  googleMapUrl: string;
  instagramUrl: string;
  isPublished: boolean;
  name: string;
  paymentMethodsText: string;
  recommendedArticle: string;
  recommendedArticleUrl: string;
  seatInfo: string;
  station: string;
  walkMinutes: string;
};

type Toast = {
  id: number;
  text: string;
  tone: "success" | "error";
};

type AdminPlaceManagerProps = {
  initialCategories: AdminCategory[];
  initialIsAuthenticated: boolean;
  initialPlaces: AdminPlace[];
  isConfigured: boolean;
  setupError: string;
};

const blankForm: AdminPlaceForm = {
  attributesText: "",
  categoryId: "",
  googleMapUrl: "",
  instagramUrl: "",
  isPublished: false,
  name: "",
  paymentMethodsText: "",
  recommendedArticle: "",
  recommendedArticleUrl: "",
  seatInfo: "",
  station: "",
  walkMinutes: "",
};

function toForm(place: AdminPlace): AdminPlaceForm {
  return {
    attributesText: Object.entries(place.attributes)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
    categoryId: place.categoryId,
    googleMapUrl: place.googleMapUrl,
    instagramUrl: place.instagramUrl,
    isPublished: place.isPublished,
    name: place.name,
    paymentMethodsText: place.paymentMethods.join(", "),
    recommendedArticle: place.recommendedArticle,
    recommendedArticleUrl: place.recommendedArticleUrl,
    seatInfo: place.seatInfo,
    station: place.station,
    walkMinutes: String(place.walkMinutes),
  };
}

function parseAttributes(text: string) {
  return Object.fromEntries(
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split("=");
        return [key.trim(), rest.join("=").trim()];
      })
      .filter(([key]) => Boolean(key)),
  );
}

function toPayload(form: AdminPlaceForm) {
  return {
    attributes: parseAttributes(form.attributesText),
    categoryId: form.categoryId,
    googleMapUrl: form.googleMapUrl,
    instagramUrl: form.instagramUrl,
    isPublished: form.isPublished,
    name: form.name,
    paymentMethods: form.paymentMethodsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    recommendedArticle: form.recommendedArticle,
    recommendedArticleUrl: form.recommendedArticleUrl,
    seatInfo: form.seatInfo,
    station: form.station,
    walkMinutes: Number(form.walkMinutes),
  };
}

export function AdminPlaceManager({
  initialCategories,
  initialIsAuthenticated,
  initialPlaces,
  isConfigured,
  setupError,
}: AdminPlaceManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [places, setPlaces] = useState(initialPlaces);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [password, setPassword] = useState("");
  const [selectedId, setSelectedId] = useState(initialPlaces[0]?.id ?? "new");
  const [form, setForm] = useState<AdminPlaceForm>(() => {
    const first = initialPlaces[0];
    return first ? toForm(first) : blankForm;
  });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(setupError);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement>(null);
  const [formScrollRequest, setFormScrollRequest] = useState(0);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(text: string, tone: Toast["tone"] = "success") {
    setToast({ id: Date.now(), text, tone });
  }

  // メッセージ消去などの再レンダーで座標がずれないよう、描画後にスクロールする。
  useEffect(() => {
    // lg以上ではフォームがリストの横に見えているためスクロール不要。
    if (formScrollRequest === 0 || window.matchMedia("(min-width: 1024px)").matches) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [formScrollRequest]);

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId),
    [places, selectedId],
  );
  const filteredPlaces = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return places;
    }

    return places.filter((place) =>
      [place.name, place.station, place.categoryLabel]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [places, query]);

  function updateField<K extends keyof AdminPlaceForm>(key: K, value: AdminPlaceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refreshPlaces() {
    const response = await fetch("/api/admin/places", { cache: "no-store" });
    const data = (await response.json().catch(() => null)) as
      | { categories?: AdminCategory[]; error?: string; places?: AdminPlace[] }
      | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "店舗データを取得できませんでした。");
    }

    setCategories(data?.categories ?? []);
    setPlaces(data?.places ?? []);

    const next = data?.places?.find((place) => place.id === selectedId) ?? data?.places?.[0];
    if (next) {
      setSelectedId(next.id);
      setForm(toForm(next));
    } else {
      setSelectedId("new");
      setForm(blankForm);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        body: JSON.stringify({ password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "ログインできませんでした。");
      }

      setPassword("");
      setIsAuthenticated(true);
      await refreshPlaces();
      showToast("ログインしました。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ログインできませんでした。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRefresh() {
    setIsBusy(true);

    try {
      await refreshPlaces();
      showToast("再読み込みしました。");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "店舗データを取得できませんでした。",
        "error",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogout() {
    setIsBusy(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    setIsAuthenticated(false);
    setPlaces([]);
    setSelectedId("new");
    setForm(blankForm);
    setMessage("ログアウトしました。");
    setIsBusy(false);
  }

  function scrollFormIntoView() {
    setFormScrollRequest((current) => current + 1);
  }

  function startNewPlace() {
    setSelectedId("new");
    setForm({ ...blankForm, categoryId: categories[0]?.id ?? "" });
    setMessage("");
    scrollFormIntoView();
  }

  function selectPlace(place: AdminPlace) {
    setSelectedId(place.id);
    setForm(toForm(place));
    setMessage("");
    scrollFormIntoView();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);

    try {
      const isNew = selectedId === "new";
      const response = await fetch(isNew ? "/api/admin/places" : `/api/admin/places/${selectedId}`, {
        body: JSON.stringify(toPayload(form)),
        headers: { "Content-Type": "application/json" },
        method: isNew ? "POST" : "PUT",
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "保存できませんでした。");
      }

      await refreshPlaces();
      showToast("保存しました。");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "保存できませんでした。", "error");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (selectedId === "new" || !selectedPlace || !confirm(`${selectedPlace.name} を削除しますか？`)) {
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch(`/api/admin/places/${selectedId}`, { method: "DELETE" });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "削除できませんでした。");
      }

      await refreshPlaces();
      showToast("削除しました。");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "削除できませんでした。", "error");
    } finally {
      setIsBusy(false);
    }
  }

  if (!isConfigured) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-5">
        <p className="eyebrow">Admin</p>
        <h1 className="font-serif text-3xl leading-tight text-coffee">管理者認証が未設定です。</h1>
        <p className="text-base leading-7 text-bark">
          `ADMIN_PASSWORD` と `ADMIN_SESSION_SECRET` を環境変数に設定してください。
        </p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center gap-6">
        <div className="space-y-3">
          <p className="eyebrow">Admin</p>
          <h1 className="font-serif text-3xl leading-tight text-coffee">店舗リスト管理</h1>
          <p className="text-base leading-7 text-bark">管理者パスワードでログインしてください。</p>
        </div>
        <form className="plate space-y-4 p-4 sm:p-5" onSubmit={handleLogin}>
          <label className="block space-y-2 text-sm font-medium text-coffee">
            <span>パスワード</span>
            <input
              autoComplete="current-password"
              className={inputClassName}
              inputMode="text"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {message ? <p className="text-sm leading-6 text-seal-deep">{message}</p> : null}
          <Button className="h-14 w-full gap-2 text-base" disabled={isBusy} type="submit">
            <Lock size={18} />
            ログイン
          </Button>
        </form>
      </section>
    );
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <header className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 font-serif text-3xl leading-tight text-coffee">店舗リスト管理</h1>
          </div>
          <div className="flex gap-2">
            <button className={iconButtonClassName} disabled={isBusy} onClick={handleRefresh} type="button">
              <RefreshCw size={18} />
              <span className="sr-only">再読み込み</span>
            </button>
            <button className={iconButtonClassName} disabled={isBusy} onClick={handleLogout} type="button">
              <LogOut size={18} />
              <span className="sr-only">ログアウト</span>
            </button>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm leading-6 text-seal-deep">{message}</p> : null}
      </header>

      <aside className="min-w-0 space-y-3 lg:sticky lg:top-5 lg:self-start">
        <div className="flex min-w-0 gap-2">
          <input
            className={cn(inputClassName, "min-w-0 flex-1")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="店名・駅・カテゴリで検索"
            type="search"
            value={query}
          />
          <button className={iconButtonClassName} onClick={startNewPlace} type="button">
            <Plus size={18} />
            <span className="sr-only">新規作成</span>
          </button>
        </div>
        <div className="grid max-h-[34rem] min-w-0 gap-2 overflow-y-auto pr-1">
          {filteredPlaces.map((place) => (
            <button
              className={cn(
                "plate w-full min-w-0 max-w-full p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-seal/35",
                selectedId === place.id && "border-seal bg-white/70",
              )}
              key={place.id}
              onClick={() => selectPlace(place)}
              type="button"
            >
              <span className="flex min-w-0 items-start justify-between gap-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-ink">{place.name}</span>
                  <span className="mt-1 block break-words text-sm leading-6 text-bark">
                    {place.categoryLabel} / {place.station} 徒歩{place.walkMinutes}分
                  </span>
                </span>
                {place.isPublished ? (
                  <Eye className="shrink-0 text-navy" size={17} />
                ) : (
                  <EyeOff className="shrink-0 text-bark" size={17} />
                )}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <form className="plate min-w-0 overflow-hidden" onSubmit={handleSubmit} ref={formRef}>
        <div className="grid min-w-0 gap-5 p-4 sm:p-5 lg:grid-cols-2">
          <Field label="店名">
            <input className={inputClassName} onChange={(event) => updateField("name", event.target.value)} required value={form.name} />
          </Field>
          <Field label="カテゴリ">
            <select
              className={inputClassName}
              onChange={(event) => updateField("categoryId", event.target.value)}
              required
              value={form.categoryId}
            >
              <option value="">選択してください</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="最寄り駅">
            <input className={inputClassName} onChange={(event) => updateField("station", event.target.value)} required value={form.station} />
          </Field>
          <Field label="徒歩分数">
            <input
              className={inputClassName}
              inputMode="numeric"
              min={0}
              onChange={(event) => updateField("walkMinutes", event.target.value)}
              required
              type="number"
              value={form.walkMinutes}
            />
          </Field>
          <Field label="Google Map URL">
            <input className={inputClassName} onChange={(event) => updateField("googleMapUrl", event.target.value)} required type="url" value={form.googleMapUrl} />
          </Field>
          <Field label="Instagram URL">
            <input className={inputClassName} onChange={(event) => updateField("instagramUrl", event.target.value)} type="url" value={form.instagramUrl} />
          </Field>
          <Field label="おすすめ記事">
            <input className={inputClassName} onChange={(event) => updateField("recommendedArticle", event.target.value)} required value={form.recommendedArticle} />
          </Field>
          <Field label="おすすめ記事 URL">
            <input className={inputClassName} onChange={(event) => updateField("recommendedArticleUrl", event.target.value)} type="url" value={form.recommendedArticleUrl} />
          </Field>
          <Field className="lg:col-span-2" label="席情報">
            <textarea className={textareaClassName} onChange={(event) => updateField("seatInfo", event.target.value)} required rows={3} value={form.seatInfo} />
          </Field>
          <Field label="決済方法">
            <input
              className={inputClassName}
              onChange={(event) => updateField("paymentMethodsText", event.target.value)}
              placeholder="現金, クレジットカード, PayPay"
              value={form.paymentMethodsText}
            />
          </Field>
          <label className="flex min-h-14 items-center gap-3 border border-line bg-white/50 px-3 text-base text-coffee">
            <input
              checked={form.isPublished}
              className="h-5 w-5 accent-[rgb(var(--color-seal))]"
              onChange={(event) => updateField("isPublished", event.target.checked)}
              type="checkbox"
            />
            公開する
          </label>
          <Field className="lg:col-span-2" label="属性">
            <textarea
              className={textareaClassName}
              onChange={(event) => updateField("attributesText", event.target.value)}
              placeholder={"price_range=確認中\nspecialty=静かな席"}
              rows={4}
              value={form.attributesText}
            />
          </Field>
        </div>
        <div className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-cream/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
          <Button className="h-14 flex-1 gap-2 text-base" disabled={isBusy} type="submit">
            <Save size={18} />
            保存
          </Button>
          <button
            className={cn(iconButtonClassName, "h-14 w-14 border-seal/40 text-seal-deep")}
            disabled={isBusy || selectedId === "new"}
            onClick={handleDelete}
            type="button"
          >
            <Trash2 size={18} />
            <span className="sr-only">削除</span>
          </button>
        </div>
      </form>

      <AnimatePresence>
        {toast ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            key={toast.id}
            role="status"
            transition={{ duration: duration.micro * 1.5, ease: ease.soft }}
          >
            <p
              className={cn(
                "plate relative py-3 pl-6 pr-5 text-sm leading-6",
                toast.tone === "error" ? "text-seal-deep" : "text-ink",
              )}
            >
              <span aria-hidden="true" className="ribbon absolute left-2.5 top-0 h-4" />
              {toast.text}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn("block space-y-2 text-sm font-medium text-coffee", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full min-w-0 max-w-full border border-line bg-white/70 px-3 text-base text-ink outline-none transition placeholder:text-bark/70 focus:border-seal focus:ring-2 focus:ring-seal/20";
const textareaClassName =
  "w-full min-w-0 max-w-full border border-line bg-white/70 px-3 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-bark/70 focus:border-seal focus:ring-2 focus:ring-seal/20";
const iconButtonClassName =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-cream text-coffee shadow-plate transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-seal/35 disabled:cursor-not-allowed disabled:opacity-50";
