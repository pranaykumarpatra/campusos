# Branching, releases & deployment

## Branch model

- **`master`** — always deployable. Protected: no direct pushes, no force-push,
  no deletion. Every change lands via a pull request that must pass CI.
- **User / feature branches** — where all actual development happens.
  Branch off `master`, do the work, open a PR back into `master`.

  Naming convention:
  - `dev/<your-name>` — your ongoing personal working branch (e.g. `dev/pranay`)
  - `feature/<short-description>` — a specific, scoped piece of work
    (e.g. `feature/attendance-marking`, `feature/fee-payment-webhook`)

## Day-to-day workflow

```bash
git checkout master
git pull
git checkout -b feature/my-change
# ... work, commit ...
git push -u origin feature/my-change
gh pr create --base master --fill
```

CI (`.github/workflows/ci.yml`) runs automatically on the PR — type-check and
build for both `apps/api` and `apps/web`. `master` is configured so the PR
cannot be merged until that check passes. Merge with **Squash and merge**
(keeps `master`'s history one clean commit per feature).

## Deploying

Deployment is manual and explicit — nothing auto-deploys on merge.

- **Deploy master:** Actions tab → **Deploy** → Run workflow → leave `ref` as
  `master`. Or: `gh workflow run deploy.yml -f ref=master -f environment=production`
- **Re-deploy (or roll back to) any earlier feature:** run the same workflow
  with `ref` set to that commit's tag or SHA instead. This is why every
  deploy should be tagged (below) — it gives you a stable name to redeploy
  later instead of hunting for a commit SHA.

The actual cloud deploy steps in `deploy.yml` are placeholders until AWS or
Azure is connected — right now the workflow proves the build is good for
whatever `ref` you give it; the cloud-specific steps get filled in when
that's ready.

## Tagging releases (what makes "deploy back any feature" possible)

Every time something is deployed from `master`, tag the commit that was
deployed:

```bash
git checkout master && git pull
git tag -a v0.2.0 -m "Short description of what this release adds"
git push origin v0.2.0
```

Use plain semantic versioning (`v0.1.0`, `v0.1.1`, `v0.2.0`, ...). To redeploy
that exact state later — even after `master` has moved on — run the deploy
workflow with `ref: v0.2.0`. `git tag` (or the repo's **Tags** page on GitHub)
lists everything that's ever been deployed.
