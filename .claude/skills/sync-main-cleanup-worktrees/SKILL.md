---
name: sync-main-cleanup-worktrees
description: リモートでPRがマージされた後に、ローカルの main を最新化し、マージ済みで不要になった worktree とブランチを安全に削除する。「PRをマージした」「mainを最新にして」「不要なworktree/ブランチを削除」「マージ後の掃除」などの依頼で使う。
---

# Sync main & clean up merged worktrees

PR がリモート（GitHub）でマージされた後のローカル後始末を行うスキル。

やること:

1. `main` の worktree で `git fetch --prune` してから `git merge --ff-only` で `main` を最新化
2. マージ済みのブランチを検出（GitHub 上でマージ済みの PR、または `prune` で upstream が消えたローカルブランチ）
3. 該当する worktree を削除し、そのブランチも削除

## 実行手順

このディレクトリの `cleanup.sh` を使う。

### 1. まずドライラン（必須）

```bash
bash .claude/skills/sync-main-cleanup-worktrees/cleanup.sh
```

- `main` を最新化し、**削除候補の一覧を表示するだけ**（この時点では何も消さない）。
- 出力された候補（ブランチ名 + worktree パス）をユーザーに提示する。
- `(DIRTY — will be skipped)` と付いた候補は未コミットの変更があるため削除対象外。必要ならユーザーに知らせる。

### 2. ユーザーに確認する

削除候補をそのまま見せて「これらを削除してよいか」を確認する。候補が 0 件なら掃除は不要なので、その旨を伝えて終了。

### 3. 承認されたら適用

```bash
bash .claude/skills/sync-main-cleanup-worktrees/cleanup.sh --apply
```

- マージ済みでクリーンな worktree を `git worktree remove`、ブランチを `git branch -D` で削除し、最後に `git worktree prune` する。

## 安全上の前提（スクリプトが保証）

- `main` の worktree は絶対に削除しない。
- スキルを実行した**今いる worktree** は削除しない（作業中の場所を消さないため）。
- 未コミットの変更がある worktree はスキップして報告する（`--force` はしない）。
- マージ判定は「GitHub で PR がマージ済み」または「`fetch --prune` 後に upstream が `[gone]`」のいずれか。squash merge でも検出できる。

## 補足

- 判定に GitHub 上のマージ状態を使うため、`gh` の認証（`gh auth status`）が済んでいると精度が上がる。未認証でも upstream-gone による検出は動く。
- どの worktree からでも実行できる（スクリプトが `main` の worktree を自動で見つける）。
