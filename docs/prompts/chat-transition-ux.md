現在の Next.js プロジェクトをベースに、ファーストビューの入力体験から、ChatGPTのような対話UIへ遷移する体験を実装してください。

目的

ユーザーがトップページで入力した
「仕事から離れて、静かな喫茶店で本を読みたい」
という気分を起点に、AIと一緒に“今日のひとり時間の栞”を作り始める体験を実装します。

この実装では、実際のLLM API連携はまだ不要です。
ただし、画面上はLLM APIを呼び出しているように見える状態にしてください。

実装する体験

1. ファーストビュー

既存のファーストビューを活かしてください。

ユーザーがテキストボックスに以下を入力します。

仕事から離れて、静かな喫茶店で本を読みたい

その後、CTAボタンを押します。

CTA文言：

ひとり時間をAIと探す

2. 送信後の画面遷移

CTAを押下したら、トップページのファーストビューから、ChatGPTのような対話UIに遷移してください。

ページ遷移でも、同一ページ内の状態遷移でも構いません。
ただし、ユーザーには明確に「対話が始まった」と感じられるようにしてください。

対話UIの仕様

レイアウト

画面全体を、対話UIに切り替えてください。

構成：

* 背景は引き続き生成り、白、淡いベージュ系
* 中央に会話エリア
* ユーザーの入力内容はページ右側に吹き出しとして表示
* AI側のローディングは左下、または左寄せの会話位置に表示
* 画面下部に次の入力欄を配置してもよい
* ただし、現段階では次の入力機能はモックでよい

ユーザーメッセージ

右側に以下を表示してください。

仕事から離れて、静かな喫茶店で本を読みたい

見た目：

* 右寄せ
* 角丸の吹き出し
* 背景は白、または淡い珈琲色
* 文字色は深いグレー
* 影はごく薄く
* ChatGPTのように、ユーザー発話として自然に見えること

AIローディング

左下、または左寄せの会話位置に、AIが考えているローディングを表示してください。

文言：

栞を作っています

または

今日のひとり時間を探しています

どちらか、世界観に合う方を使ってください。

見た目：

* 左寄せ
* 小さく静か
* 派手なスピナーは禁止
* 点が3つ、静かに呼吸するように動く表現が望ましい
* 「実際にはLLM APIを呼んでいる」ように感じられること

現状ではAPI連携は不要です。
setTimeout などを使って、モックのローディング状態を表現してください。

Motion / Anime.js の必須利用

この体験では、Motion または Anime.js のどちらか一つ以上を必ず使用してください。
最適なのは Motion です。

必須アニメーション案

Motionを使って、以下を実装してください。

送信時のトランジション

CTA押下後、ファーストビューのテキストボックスが、会話UIのユーザーメッセージへ変化するような動きを入れてください。

理想の動き：

1. テキストボックスが少し縮む
2. 画面右側へ移動する
3. 吹き出しの形に変わる
4. ユーザー発話として固定される
5. 左側にAIローディングがふわっと表示される

完全なmorphでなくても構いません。
Motionの layoutId、layout、AnimatePresence、motion.div を使い、自然な連続性を出してください。

Motionで使うもの

以下を優先的に使ってください。

* motion.div
* motion.form
* AnimatePresence
* layout
* layoutId
* variants
* useReducedMotion

Anime.jsを使う場合

Anime.jsを使う場合は、AIローディングの3点アニメーションに使ってください。

例：

* 3つの点が順番に opacity / scale する
* 小さな栞の点がふわっと揺れる
* 罫線が静かに伸びる

ただし、派手にしすぎないでください。

状態設計

以下の状態を実装してください。

type ViewState = "hero" | "transitioning" | "chat"

hero

* ファーストビュー表示中
* タイプライター、入力欄、CTAがある
* ユーザーが入力できる

transitioning

* CTA押下直後
* ファーストビューから対話UIへ切り替わる
* 入力内容を保持する
* Motionで連続的に変化させる

chat

* ChatGPT風の対話UI表示中
* 右側にユーザーの入力が表示される
* 左側にAIローディングが表示される
* 現状はモックでよい

コンポーネント構成

既存の構成を活かしつつ、以下を追加または更新してください。

components/
  hero/
    Hero.tsx
    PromptBox.tsx
    HeroCTA.tsx
components/
  chat/
    ChatView.tsx
    ChatMessage.tsx
    AssistantLoading.tsx
    ChatComposer.tsx
hooks/
  usePromptInteraction.ts
lib/
  mockChat.ts

ChatView.tsx

役割：

* 対話UI全体を表示する
* 送信されたユーザー入力を受け取る
* ユーザーメッセージを右側に表示する
* AIローディングを左側に表示する
* 画面下部に入力欄を配置する場合は、モックとして表示する

ChatMessage.tsx

役割：

* role が user の場合は右寄せ
* role が assistant の場合は左寄せ
* 今回は user message の表示が必須
* Motionで表示時にふわっと出す

AssistantLoading.tsx

役割：

* 左寄せに「栞を作っています」または「今日のひとり時間を探しています」を表示
* 3点ローディングを表示
* MotionまたはAnime.jsで点が静かに動く
* 派手なスピナーは使わない

mockChat.ts

以下のようなモックを用意してください。

export const mockInitialUserMessage =
  "仕事から離れて、静かな喫茶店で本を読みたい"
export const assistantLoadingText = "今日のひとり時間を探しています"

送信処理

PromptBox または Hero で送信時に以下を行ってください。

1. 入力値を取得
2. 入力が空の場合は、現在のタイプライター例を使う
3. ViewState を transitioning にする
4. 少し待ってから chat にする
5. ChatView に入力内容を渡す

実際のLLM APIコールは不要です。
ただし、将来API連携しやすいように、送信処理は関数として分けてください。

例：

async function startConversation(message: string) {
  setSubmittedMessage(message)
  setViewState("transitioning")
  await new Promise((resolve) => setTimeout(resolve, 500))
  setViewState("chat")
}

将来的にはこの関数内で LLM API を呼べるようにしてください。

画面遷移の演出

Motionで以下のような流れを作ってください。

1. Hero全体が少しだけ上に抜ける
2. 入力テキストが右側の吹き出しとして残る
3. 会話UIの余白が広がる
4. 左側にAIローディングが遅れて表示される

推奨タイミング：

* Hero fade out：300〜450ms
* User bubble appear：350〜600ms
* Assistant loading appear：600〜900ms

急に切り替わらず、
「入力した言葉がそのまま対話に渡された」
と感じられることを優先してください。

reduced motion対応

prefers-reduced-motion に対応してください。

reduced motion の場合：

* morphや移動アニメーションを省略
* Heroを短くフェードアウト
* ChatViewを短くフェードイン
* ローディング点は点滅ではなく静的表示、または非常に控えめにする

アクセシビリティ

* 送信ボタンは button として実装
* ローディングには aria-live="polite" を付ける
* 対話UIに遷移したら、必要に応じて会話領域へfocusを移す
* キーボード操作でも送信できる
* Enterで送信、Shift+Enterで改行
* 色だけに依存しない状態表現にする

禁止事項

* 画面全体を激しく揺らす
* 強いバウンドや派手な回転を入れる
* ローディングに大きなスピナーを使う
* ユーザー入力が消えたように見える遷移
* ファーストビューと対話UIが同時にごちゃごちゃ表示される
* 余計な説明文を増やす
* 実際のAPIキーや外部API呼び出しを実装する

完了条件

* 「仕事から離れて、静かな喫茶店で本を読みたい」を入力できる
* 「ひとり時間をAIと探す」を押すと対話UIへ遷移する
* 入力した文章が右側のユーザーメッセージとして表示される
* 左側にAIローディングが表示される
* 実際のLLM API呼び出しはなく、モックで動く
* MotionまたはAnime.jsを必ず使った自然なアニメーションがある
* reduced motionに対応している
* スマホでも自然に見える
* TypeScript / lint エラーがない
