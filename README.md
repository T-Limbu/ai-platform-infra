# ai-platform-infra (being retired)

This repository is being retired. Do not add new configuration or secrets here.

| What | Where it lives now |
|---|---|
| Infrastructure as code (Render services) | [`T-Limbu/infra`](https://github.com/T-Limbu/infra) (Pulumi) |
| Secrets | Doppler, being introduced app by app through `T-Limbu/infra` |

## Still in use
- `fleet.json`: the app list. `ai-platform-oplox` reads it locally and fetches it from this repository's `main` branch while running. Keep this repository public and the file at this path until oplox has its own copy.
- `scripts/oplox-deploy.js`: kept for now; not yet reviewed.

The old `environments/`, `deployments/` and `scripts/sync-secrets.ps1` were removed. They remain in git history.
