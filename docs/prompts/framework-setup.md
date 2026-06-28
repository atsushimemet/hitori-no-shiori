oまず、「ひとりの栞」のトップページを実装するための Next.js プロジェクトをセットアップしてください。

目的

このプロジェクトでは、後続プロンプトで以下のような動きのあるファーストビューを実装します。

* 栞アイコンが線一つ一つから組み立てられる
* 完成した栞アイコンがぼやけて消える
* その後、Claude Desktop のような対話テキストボックスが表示される
* テキストボックス内に、今日の気分を示す文章がタイプライター表示される
* CTA「ひとり時間をAIと探す」が表示される

そのため、アニメーションとUI実装に適した構成にしてください。

技術スタック

以下でセットアップしてください。

* Next.js
* TypeScript
* App Router
* Tailwind CSS
* Motion / Framer Motion
* Anime.js
* ESLint
* Prettier

可能であれば、以下も導入してください。

* lucide-react
* clsx
* tailwind-merge

ディレクトリ構成

以下のような構成にしてください。

app/
  layout.tsx
  page.tsx
  globals.css
components/
  hero/
    Hero.tsx
    BookmarkIntro.tsx
    PromptBox.tsx
    TypewriterText.tsx
    PromptExamples.tsx
    HeroCTA.tsx
components/
  ui/
    Button.tsx
lib/
  cn.ts
  prompts.ts
styles/
  tokens.css

セットアップ内容

1. Next.js + TypeScript + App Router + Tailwind CSS のプロジェクトとして整える
2. Motion / Framer Motion と Anime.js をインストールする
3. Tailwind CSS の基本設定を行う
4. globals.css に、サイト全体の背景色、文字色、フォント、余白の基本方針を設定する
5. 「ひとりの栞」に合うデザイントークンを用意する
6. 後続のアニメーション実装に備えて、コンポーネントだけ空で作成する
7. app/page.tsx から Hero コンポーネントを表示する
8. 開発サーバーが起動できる状態にする
9. npm run lint が通る状態にする

デザインの基本方針

「ひとりの栞」は、気分から今日のひとり時間の栞を提案するWebサービスです。

世界観は以下です。

* 静か
* 余白がある
* 文学的
* 上質
* 温かい
* ひとり時間を肯定する
* 派手すぎない
* でも少しワクワクする

色は以下を基調にしてください。

* 生成り
* 白
* 深いグレー
* 珈琲色
* くすんだブラウン
* 淡いネイビー

重要

このプロンプトでは、まだ本格的なアニメーション実装はしなくてよいです。

目的は、後続プロンプトで栞アイコンのSVGアニメーション、タイプライター、対話テキストボックスを実装しやすいように、Next.jsプロジェクトの土台を整えることです。

ただし、最小限の画面として、中央に以下が表示される状態にしてください。

* 「ひとりの栞」
* 「今の気分からひとり時間を提案します」
* 空のテキストボックス
* 「ひとり時間をAIと探す」ボタン

完了条件

* Next.jsプロジェクトとして起動できる
* TypeScriptでエラーがない
* Tailwind CSSが有効
* Motion / Framer Motion と Anime.js がインストール済み
* 指定したコンポーネント構成が作成されている
* app/page.tsx でHeroが表示される
* 画面中央に最小限のファーストビューが表示される
* npm run lint が通る
