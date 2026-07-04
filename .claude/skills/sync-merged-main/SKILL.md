---
name: sync-merged-main
description: Rebase the current worktree's branch onto the latest origin/main so that PRs merged remotely (from other worktrees) are reflected here. Use when the user runs /sync-merged-main, or asks to "pull in merged main", "リモートでマージされたPRを取り込む", "他のworktreeでマージされた変更を反映", or otherwise wants the current worktree updated with the newest main.
---

# sync-merged-main

複数の worktree で並行開発していると、ある worktree の PR が GitHub 上で `main` に
マージされても、他の worktree は古い `main` を土台にしたまま取り残される。
このスキルは **今いる worktree のブランチだけ** を最新の `origin/main` の上に
リベースして、マージ済み PR の内容を取り込む。

- 方法: **rebase**（マージコミットを作らず履歴を一直線に保つ）
- 対象: **カレント worktree のみ**（他の worktree には一切触れない）

## 前提の確認（必ず最初に行う）

1. カレントディレクトリが git worktree の中か確認する。

   ```bash
   git rev-parse --is-inside-work-tree
   ```

2. 現在のブランチを取得する。

   ```bash
   git rev-parse --abbrev-ref HEAD
   ```

   - ブランチが `main` の場合は **中止**。このスキルは feature ブランチ用。
     「main では実行しません。feature worktree で実行してください」と伝えて終了する。

3. 作業ツリーが clean か確認する。

   ```bash
   git status --porcelain
   ```

   - 出力があれば未コミットの変更あり。**勝手に rebase しない**。
     ユーザーに次のいずれかを提案して指示を待つ:
     - 変更をコミットしてから再実行
     - `git stash` で退避 → rebase → `git stash pop`（このスキルが代行してよいのは
       ユーザーが明示的に希望した場合のみ）
     - 中止

## 同期の手順

4. リモートの最新を取得する。

   ```bash
   git fetch origin
   ```

5. 取り込む差分（＝リモートでマージされた PR）を提示する。

   ```bash
   git log --oneline --no-merges HEAD..origin/main
   ```

   - 出力が空なら「`origin/main` に新しい変更はありません。取り込むものはありません」
     と伝えて終了する（rebase は不要）。
   - 出力があれば、どの PR / コミットが入ってくるかを日本語で要約して見せる。

6. リベースを実行する。

   ```bash
   git rebase origin/main
   ```

## コンフリクト時の対応

7. rebase が競合で停止した場合:

   - 競合ファイルを提示する。

     ```bash
     git status --short
     git diff --name-only --diff-filter=U
     ```

   - 各ファイルの競合内容を確認し、解決案を提示する。**内容の判断が曖昧なときは
     勝手に解決せず**、どちらを採用するかユーザーに確認する。
   - 解決したら次へ進む。

     ```bash
     git add <解決したファイル>
     git rebase --continue
     ```

   - ユーザーが中断を望む、または安全に解決できない場合は元に戻す案内をする。

     ```bash
     git rebase --abort
     ```

## 完了時の報告

8. 成功したら以下を報告する。

   ```bash
   git log --oneline -n 5
   ```

   - 取り込んだコミット数（手順 5 の件数）
   - リベース後の HEAD 状態
   - ブランチが既に push 済みだった場合、rebase で履歴が書き換わっているため
     次回 push は `git push --force-with-lease` が必要になる旨を **注意として伝える**
     （勝手に force push はしない）。

## やらないこと

- 他の worktree のブランチには触れない（カレントのみ）。
- merge は使わない（rebase 固定）。
- ユーザーの確認なしに stash / conflict の自動解決 / force push を行わない。
