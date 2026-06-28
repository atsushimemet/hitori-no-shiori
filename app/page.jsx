"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const chips = [
  "疲れをほどきたい",
  "考えを整えたい",
  "作業に集中したい",
  "本屋で発想を得たい",
  "夢を進めたい",
  "雰囲気のいいお店で食事を楽しみたい",
  "静かに飲みたい",
];

const examples = [
  { title: "夕方の栞", body: "喫茶店で、本を読む。", time: "90分" },
  { title: "休日の栞", body: "作業して、本屋へ行く。", time: "半日" },
  { title: "夜の栞", body: "静かに飲んで、考える。", time: "夜" },
];

const dialogueGroups = [
  { title: "今の気分", values: ["疲れている", "焦っている", "何か始めたい", "整えたい"] },
  { title: "時間", values: ["30分", "1時間", "2時間", "半日"] },
  { title: "したいこと", values: ["読む", "書く", "考える", "作業する", "食べる", "飲む"] },
];

const places = [
  ["純喫茶", "読む"],
  ["本屋", "出会う"],
  ["食事処", "満たす"],
  ["バー", "ほどく"],
  ["作業場所", "進める"],
  ["散歩", "戻る"],
];

function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`${className} reveal ${visible ? "is-visible" : ""}`}
      style={{ "--delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [mood, setMood] = useState("");
  const [selectedChip, setSelectedChip] = useState("");
  const [note, setNote] = useState("");
  const [awake, setAwake] = useState(false);
  const [choices, setChoices] = useState({});
  const [exampleRef, examplesVisible] = useInView();
  const planRef = useRef(null);

  const planTheme = useMemo(() => {
    if (selectedChip.includes("夢")) return "小さく休んで、少し進む。";
    if (selectedChip.includes("飲み")) return "静かにほどいて、考える。";
    if (selectedChip.includes("作業")) return "集中して、軽く歩く。";
    return "少し休んで、少し進む。";
  }, [selectedChip]);

  const selectChip = (chip) => {
    setMood(chip);
    setSelectedChip(chip);
    setNote("この気分から、栞を編みます。");
  };

  const submitMood = (event) => {
    event.preventDefault();

    if (!mood.trim()) {
      setNote("ひとことだけ、入れてみる。");
      return;
    }

    setNote("今日の栞を置きました。");
    setAwake(true);
    planRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setAwake(false), 1700);
  };

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ひとりの栞">
          <span className="brand-mark" />
          <span>ひとりの栞</span>
        </a>
        <nav className="header-nav" aria-label="メイン">
          <a href="#how">使い方</a>
          <a href="#examples">提案例</a>
          <a href="#login">ログイン</a>
        </nav>
        <a className="header-cta" href="#create">栞を作る</a>
      </header>

      <main id="top">
        <section className="hero section" id="create">
          <Reveal className="hero-copy">
            <p className="eyebrow">ひとり時間の案内</p>
            <h1>
              <span>あなたの栞を</span>
              <span>作りましょう</span>
            </h1>
            <p>今の気分から、ひとり時間を提案します。</p>
          </Reveal>

          <Reveal className="hero-panel" delay={120}>
            <form className="mood-form" onSubmit={submitMood}>
              <label htmlFor="moodInput">今日は、どんな時間にしますか？</label>
              <div className="input-row">
                <input
                  id="moodInput"
                  name="mood"
                  type="text"
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  placeholder="例：静かな喫茶店で本を読みたい"
                  autoComplete="off"
                />
                <button type="submit">提案してもらう</button>
              </div>
              <p className="form-note" aria-live="polite">{note}</p>
            </form>

            <div className="chips" aria-label="気分の候補">
              {chips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={selectedChip === chip ? "is-selected" : ""}
                  aria-pressed={selectedChip === chip}
                  onClick={() => selectChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal className="hero-visual" delay={220}>
            <Image
              src="/hero-stillness.png"
              alt="窓辺の本とノートとコーヒー"
              width={1536}
              height={1024}
              priority
            />
            <span className="quiet-orbit" />
          </Reveal>
        </section>

        <section className="section examples" id="examples" ref={exampleRef}>
          <div className="section-heading">
            <p className="eyebrow">sample</p>
            <h2>たとえば、こんな栞。</h2>
          </div>
          <div className="example-grid" aria-label="提案例">
            {examples.map((example, index) => (
              <article
                className={`example-card ${examplesVisible ? "is-visible" : ""}`}
                style={{ "--card-delay": `${index * 120}ms` }}
                key={example.title}
              >
                <span>{example.title}</span>
                <p>{example.body}</p>
                <small>{example.time}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="section dialogue" id="how">
          <Reveal className="section-heading">
            <p className="eyebrow">dialogue</p>
            <h2>言葉にできなくても、大丈夫。</h2>
            <p>対話しながら、あなたのひとり時間を設計します。</p>
          </Reveal>
          <Reveal className="dialogue-board" delay={100}>
            {dialogueGroups.map((group) => (
              <fieldset className="choice-group" key={group.title}>
                <legend>{group.title}</legend>
                {group.values.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={choices[group.title] === value ? "is-selected" : ""}
                    aria-pressed={choices[group.title] === value}
                    onClick={() => setChoices((current) => ({ ...current, [group.title]: value }))}
                  >
                    {value}
                  </button>
                ))}
              </fieldset>
            ))}
          </Reveal>
          <a className="section-cta" href="#create">対話をはじめる</a>
        </section>

        <section className="section places">
          <Reveal className="section-heading">
            <p className="eyebrow">places</p>
            <h2>場所ではなく、過ごし方。</h2>
          </Reveal>
          <div className="place-grid">
            {places.map(([name, verb], index) => (
              <Reveal key={name} delay={index * 45}>
                <article>
                  <strong>{name}</strong>
                  <span>{verb}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section value">
          <Reveal className="section-heading">
            <p className="eyebrow">value</p>
            <h2>探すより、作る。</h2>
            <p>ひとりの栞は、店ではなく時間を提案します。</p>
          </Reveal>
          <Reveal className="compare" delay={120}>
            <div>
              <span>通常の検索</span>
              <p>店を探す</p>
              <p>比べる</p>
              <p>決める</p>
            </div>
            <div>
              <span>ひとりの栞</span>
              <p>気分を入れる</p>
              <p>時間が届く</p>
              <p>自分に戻る</p>
            </div>
          </Reveal>
        </section>

        <section className="section preview" ref={planRef}>
          <Reveal className="section-heading">
            <p className="eyebrow">preview</p>
            <h2>こんな栞が届きます。</h2>
          </Reveal>
          <article className={`plan-card ${awake ? "is-awake" : ""}`}>
            <div className="plan-title">
              <span>今日の栞</span>
              <strong>{planTheme}</strong>
            </div>
            <ol className="timeline">
              <li><time>17:30</time><span>喫茶店で読む</span></li>
              <li><time>18:30</time><span>本屋を歩く</span></li>
              <li><time>19:00</time><span>食事をしながら書く</span></li>
            </ol>
            <p className="belongings">本 / ノート / 小さな予定</p>
          </article>
        </section>

        <section className="section final-cta">
          <Reveal>
            <h2>今日の栞を作りましょう。</h2>
            <p>今の気分から、はじめられます。</p>
            <a className="section-cta" href="#create">栞を作る</a>
          </Reveal>
        </section>
      </main>

      <footer className="site-footer" id="login">
        <span>ひとりの栞</span>
        <a href="#top">上へ</a>
      </footer>
    </>
  );
}
