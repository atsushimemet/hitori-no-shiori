#!/usr/bin/env bash
#
# Detect (and optionally remove) git worktrees / branches whose PR has been
# merged on the remote, and fast-forward the local `main` worktree.
#
# Usage:
#   cleanup.sh            # dry-run: fetch/prune, ff main, print merge-clean candidates
#   cleanup.sh --apply    # actually remove the merged worktrees and delete their branches
#
# Safe by design:
#   - Never touches the `main` worktree or the worktree you invoke it from.
#   - Skips (and reports) any worktree with uncommitted changes instead of forcing.
#   - A branch is a candidate only if its PR is merged (via `gh`) OR its upstream
#     tracking branch is gone after `git fetch --prune`.

set -euo pipefail

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

# --- locate the main worktree and the current one -------------------------
main_wt="$(git worktree list --porcelain | awk '
  /^worktree /{wt=$2}
  /^branch refs\/heads\/main$/{print wt; exit}
')"

if [[ -z "${main_wt:-}" ]]; then
  echo "error: no worktree is checked out on 'main'." >&2
  exit 1
fi

current_wt="$(git rev-parse --show-toplevel)"

# --- refresh remote state and fast-forward main ---------------------------
echo "==> git fetch --prune (origin)"
git -C "$main_wt" fetch --prune origin

echo "==> fast-forwarding main"
git -C "$main_wt" merge --ff-only origin/main || {
  echo "warning: main could not be fast-forwarded (local commits ahead?). Leaving as-is." >&2
}

# --- build the set of merged branch names (newline-delimited; bash 3.2 safe) --
merged=""

# 1) PRs GitHub reports as merged (covers squash/rebase merges).
if command -v gh >/dev/null 2>&1; then
  gh_merged="$(gh pr list --state merged --limit 100 --json headRefName -q '.[].headRefName' 2>/dev/null || true)"
  [[ -n "$gh_merged" ]] && merged="$gh_merged"
fi

# 2) Local branches whose upstream tracking branch is gone (deleted on remote
#    after the PR merged). This is the fallback when gh is unavailable.
gone_merged="$(git -C "$main_wt" for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
                 | awk '$2=="[gone]"{print $1}')"
[[ -n "$gone_merged" ]] && merged="$(printf '%s\n%s' "$merged" "$gone_merged")"

is_merged() {  # is_merged <branch>
  printf '%s\n' "$merged" | grep -Fxq -- "$1"
}

# --- collect candidate worktrees ------------------------------------------
candidates=()  # each: "branch<TAB>worktree_path"
while IFS= read -r line; do
  wt="${line%%$'\t'*}"
  br="${line#*$'\t'}"
  [[ "$wt" == "$main_wt" ]] && continue      # never the main worktree
  [[ "$wt" == "$current_wt" ]] && continue    # never the worktree we run from
  [[ "$br" == "main" || -z "$br" ]] && continue
  is_merged "$br" && candidates+=("$br"$'\t'"$wt")
done < <(git worktree list --porcelain | awk '
  /^worktree /{wt=$2; br=""}
  /^branch /{sub("refs/heads/","",$2); br=$2}
  /^$/{ if (wt!="") print wt"\t"br; wt="" }
  END{ if (wt!="") print wt"\t"br }
')

if [[ ${#candidates[@]} -eq 0 ]]; then
  echo "==> No merged worktrees to clean up."
  exit 0
fi

echo
echo "==> Merged worktrees eligible for removal:"
for c in "${candidates[@]}"; do
  br="${c%%$'\t'*}"; wt="${c#*$'\t'}"
  dirty=""
  if [[ -n "$(git -C "$wt" status --porcelain 2>/dev/null)" ]]; then
    dirty="  (DIRTY — will be skipped)"
  fi
  printf '    %-45s %s%s\n' "$br" "$wt" "$dirty"
done

if [[ $APPLY -eq 0 ]]; then
  echo
  echo "Dry run. Re-run with --apply to remove the clean worktrees above and delete their branches."
  exit 0
fi

# --- apply ----------------------------------------------------------------
echo
for c in "${candidates[@]}"; do
  br="${c%%$'\t'*}"; wt="${c#*$'\t'}"
  if [[ -n "$(git -C "$wt" status --porcelain 2>/dev/null)" ]]; then
    echo "-- skip $br: worktree has uncommitted changes ($wt)"
    continue
  fi
  echo "-- removing worktree $wt"
  git -C "$main_wt" worktree remove "$wt"
  echo "-- deleting branch $br"
  git -C "$main_wt" branch -D "$br"
done

echo "==> Pruning stale worktree metadata"
git -C "$main_wt" worktree prune
echo "==> Done."
