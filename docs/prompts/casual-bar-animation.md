# `/casual-bar` モーション実装プロンプト（改訂版）

あなたは、世界トップクラスのモーションデザイナー兼フロントエンドエンジニアです。
「動きそのものは語らず、空気をつくる」ことを信条にしています。
派手さではなく、間（ま）・呼吸・重さの設計で人を静かに驚かせてください。

---

## 0. 北極星（このアニメーションが目指す一文）

> **「恵比寿の夜、誰かが私のためにそっと栞を挟んでくれた本が、静かに開かれる。」**

すべての動きはこの一文に従属します。判断に迷ったら必ずここへ戻ってください。
「気づかれないほど自然だが、無くなると寂しい」——それが成功の基準です。

### 体験のリズム（タイムラインの設計意図）
ページは「一気に出る」のではなく、**3拍の呼吸**で立ち上がります。

1. **吸う**：暗がりから紙面がにじみ出る（ページ全体）
2. **置く**：見出しが先に、静かに着地する（語りはじめ）
3. **めくる**：候補が1枚ずつ、栞のページのように開かれる（本文）

この「吸う→置く→めくる」の間（ま）こそが世界観です。間を詰めないでください。

---

## 1. 前提・対象

- 対象ページ：Next.js（App Router）`/casual-bar`
- AIとの対話で見つかった「今日のひとり時間の候補」を最大3件表示する
- ライブラリ：**Motion（推奨／旧 framer-motion）** を必須採用。
  Anime.js は §6 の線描き演出に限り併用可（任意）。
- 既存のデザイントーンを壊さないこと。新規の色・影は最小限。

---

## 2. モーショントークン（最重要・必ず最初に定義）

ばらつきを防ぐため、**マジックナンバーを直接書かず**、以下のトークンを一箇所に定義して全コンポーネントで共有してください（例：`components/motion/tokens.ts`）。

```ts
// イージング：自然な減速。立ち上がりは速く、着地はゆっくり。
export const ease = {
  // 標準。紙が机に置かれる時の「すっ」とした減速
  soft: [0.22, 1, 0.36, 1] as const,      // easeOutQuint 系
  // hover など、戻りも自然に見せたい往復用
  gentle: [0.4, 0, 0.2, 1] as const,
} as const

// 時間（秒）。文学的＝ゆっくりめ。ただし重くなりすぎない。
export const duration = {
  page: 0.65,   // ページ全体
  head: 0.5,    // 見出し
  card: 0.55,   // カード1枚
  micro: 0.2,   // hover・タグ・矢印などの微動
} as const

// 振り付け（stagger）
export const choreo = {
  delayChildren: 0.15,   // 見出しの後、本文が始まるまでの間
  stagger: 0.12,         // カード間の遅延（120ms）
} as const
```

> **原則**：時間とイージングはこのトークンからのみ参照する。レビュー時、生の数値が散らばっていたら不合格とみなす。

---

## 3. 動きの仕様（1つずつ厳密に）

### 3.1 ページ全体の登場
- `opacity: 0 → 1`, `y: 12 → 0`, `filter: blur(8px) → blur(0)`
- `duration.page` / `ease.soft`
- 印象：夜の候補が**にじみ出る**。決して「スライドイン」に見せない。

### 3.2 見出しの登場（本文より先に）
- 見出し：`恵比寿の夜に、静かな一杯を。`
- 補足：`今日のひとり時間に合いそうなバーを選びました。`
- `opacity: 0 → 1`, `y: 8 → 0` / `duration.head` / `ease.soft`
- 見出し → 補足の順に **約80ms** だけずらすと「語りはじめ」の呼吸が出る。
- 文字量は増やさない。余白で語る。

### 3.3 バーカードの stagger 表示（栞が開く中核）
- 各カード：`opacity: 0 → 1`, `y: 18 → 0`, `scale: 0.98 → 1`, `filter: blur(6px) → blur(0)`
- `duration.card` / `ease.soft`
- 親に `staggerChildren: choreo.stagger`, `delayChildren: choreo.delayChildren`
  - 1枚目 0ms / 2枚目 120ms / 3枚目 240ms
- Motion の `variants` + `staggerChildren` を使用（下記コード参照）。
- **トリガー**：ファーストビューに収まる想定なら `animate` でマウント時発火。
  折り返す可能性があるなら `whileInView` + `viewport={{ once: true, margin: "-10% 0px" }}` を使い、**一度だけ**再生。スクロールで再発火させない。

### 3.4 カード hover
- `y: -4`, `scale: 1.01`, 影をわずかに強く、border をわずかに濃く
- `duration.micro` / `ease.gentle`
- 「押せる／詳細が見られる」と分かる最小限の持ち上げ。浮かせすぎ厳禁。
- マウスが離れたら**同じ速度で静かに戻る**（往復の対称性を守る）。

### 3.5 Google Map リンクの矢印
- `Google Mapで開く ↗` の **矢印のみ** を動かす。
- `x: +2`, `y: -2`, `opacity: 0.75 → 1` / `duration.micro`
- 矢印は独立要素（`<span>`）に切り出す。リンク全体は動かさない。
- 「↗ が紙からふっと浮く」程度の気配にとどめる。

### 3.6 カード内の罫線・区切り（“ページが整う”）
- カード登場 **後** に線が伸びる：`scaleX: 0 → 1`（`transform-origin: left`）, `opacity: 0 → 1`
  - ※ `width` ではなく `scaleX` を使う（リフロー回避・滑らか）。
- 各カードの登場完了後に **+120ms** ほど遅らせて発火。
- Motion で実装。難しければ CSS transition 可。Anime.js を使うならこの線描きに限定。

### 3.7 「賑やかか静かか」タグ
- 値：`静か / ほどよい賑わい / 賑やか`
- カード本体の後、線の後に **ふわっと**：`opacity: 0 → 1`, `y: 4 → 0` / `duration.micro`
- 控えめなタグ表現（薄い生成り背景＋淡い border）。目立たせない。

---

## 4. 振り付けの原則（“驚嘆”はここで決まる）

1. **重なりで生命感を出す**：要素は順番待ちで「カチッ」と切り替えず、前の動きが終わる前に次が始まる（overlap）。stagger とトークンで自然に重なるよう調整。
2. **同じ言語で動かす**：登場も hover も戻りも、`ease.soft`/`ease.gentle` の2種だけ。動きの方言を増やさない。
3. **重さを一定に**：すべて「軽い紙一枚」の質量感。要素ごとに速度感がバラつくと安っぽくなる。
4. **対称性**：hover で出した動きは、離脱時に同じ曲線・同じ時間で戻す。
5. **無音の演出**：光らせない・跳ねさせない・回さない。動きで「静けさ」を表現する。

---

## 5. Motion 実装の骨子（参考・調整可）

```ts
import { ease, duration, choreo } from "@/components/motion/tokens"

export const pageVariants = {
  hidden:  { opacity: 0, y: 12, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: duration.page, ease: ease.soft } },
}

export const listVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: choreo.stagger, delayChildren: choreo.delayChildren } },
}

export const cardVariants = {
  hidden:  { opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: duration.card, ease: ease.soft } },
}

export const cardHover = { y: -4, scale: 1.01, transition: { duration: duration.micro, ease: ease.gentle } }
```

- ルートは `motion.main variants={pageVariants}`、リストは `motion.ul variants={listVariants}`、各カードは `motion.li variants={cardVariants} whileHover={cardHover}`。
- 共通ラッパが必要なら `components/motion/MotionContainer.tsx` を作成し、`prefers-reduced-motion` 分岐をここに集約。

---

## 6. Anime.js を使う場合（任意・限定）

次のいずれかに **限定**。使いすぎ厳禁。React の状態・遷移は Motion 中心。
- カード内の罫線が伸びる演出
- ページ上部の小さな**栞マーク（細い線で描かれる）**演出（SVG `stroke-dashoffset`）
- カード表示時の軽い stagger

---

## 7. パフォーマンスと品質（プロの最低条件）

- アニメーションは **`transform` / `opacity` / `filter` のみ**。`width`/`top`/`margin` 等のレイアウト変化は禁止。
- **blur の扱いに注意**：`filter: blur` は重い。**同時に blur するのは「ページ全体」と「カード本体」程度に抑える**。罫線・タグ・矢印には blur をかけない。低スペック端末で 60fps を割るなら blur 値を下げるか省く判断をする。
- `will-change` はアニメーション中のみ付与し、完了後は外す（Motion は概ね自動だが多用しない）。
- 画像があれば `next/image` を使い、レイアウトシフト（CLS）を出さない。

---

## 8. reduced motion 対応（必須）

`prefers-reduced-motion: reduce` のとき：
- `blur` と `y`/`scale` の移動を**使わない**。
- 残すのは **短い opacity フェードのみ**（例：`duration.micro`〜`0.25s`）。
- stagger は最小（または無効）。
- hover の移動は無効化し、**影の変化だけ**許可。
- 実装は `useReducedMotion()`（Motion）で variants を出し分けるか、CSS の `@media (prefers-reduced-motion: reduce)` で上書き。両方の経路で破綻しないこと。

---

## 9. ビジュアル・トーン

- 背景：生成り／白／淡いベージュ
- 文字：深いグレー
- カード：白 or 薄い生成り、border は淡く、影はごく薄く
- 余白を広く取り、情報を詰め込まない
- 「賑やかか静かか」タグは目立たせない

---

## 10. 更新・追加するファイル

```txt
app/casual-bar/page.tsx
components/bar/BarList.tsx
components/bar/BarCard.tsx
components/motion/tokens.ts          # 追加：モーショントークン
components/motion/MotionContainer.tsx # 任意：共通ラッパ／reduced motion 集約
```

---

## 11. 完了条件（受け入れ基準）

- [ ] `/casual-bar` 遷移時、ページ全体が blur から静かに浮かび上がる
- [ ] 見出し → 補足 → カードの順に、間を置いて立ち上がる
- [ ] 最大3件のカードが 0 / 120 / 240ms で1枚ずつ開く（`variants`＋`staggerChildren` 使用）
- [ ] スクロールで再生する場合も再発火せず一度きり（`once: true`）
- [ ] カード hover で y:-4 / scale:1.01、離脱時は同曲線・同時間で戻る
- [ ] Google Map の矢印のみが hover で右上へ微動（リンク全体は動かない）
- [ ] 罫線が `scaleX` で伸び、タグがその後ふわっと出る
- [ ] アニメーションは transform/opacity/filter のみ。レイアウト変化なし
- [ ] blur の同時適用は最小限で、低スペックでも破綻しない
- [ ] `prefers-reduced-motion` で opacity フェードのみ・移動と blur 無効
- [ ] 時間・イージングはトークン経由で、生のマジックナンバーが散らばっていない
- [ ] TypeScript / lint エラーなし
- [ ] 全体として「栞がそっと開かれる」北極星に合致している

---

## 12. やってはいけないこと（アンチパターン）

- 強いバウンド／弾むスプリング、派手な回転、大きなパララックス、強い発光
- 「スライドイン」に見える直線的な横移動
- hover で大きく浮く・速すぎる戻り・往復の非対称
- 動きの種類（イージング）を増やしすぎる
- 罫線・タグ・矢印への blur 適用、レイアウトプロパティのアニメーション
- 文言を増やして余白を埋めること
