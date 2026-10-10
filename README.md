# 🛡️ ai-platform-infra

> **Centralized GitOps Infrastructure, SOPS + Age Secrets Monovault, and Deployment Blueprint Fleet**
> Orchestrates environment secrets, configurations, Docker, and Render deployment specifications across all `ai-app-*` and `ai-platform-*` repositories.

---

## 🏛️ Repository Architecture

```
ai-platform-infra/
├── .sops.yaml                   # Encryption rules & Age recipient keys
├── keys/
│   └── squad-age.pub            # Public Age recipient key (safe in git)
├── environments/                # Centralized environment definitions
│   ├── dev/
│   │   ├── oplox.env            # Decrypted/template env for Oplox (dev)
│   │   ├── audio-gym.env        # Decrypted/template env for Audio Gym (dev)
│   │   ├── off-grid-audio.env   # Decrypted/template env for Off-Grid Audio (dev)
│   │   ├── off-grid-video.env   # Decrypted/template env for Off-Grid Video (dev)
│   │   ├── mail-triage.env      # Decrypted/template env for Mail Triage (dev)
│   │   └── design-vault.env     # Decrypted/template env for Design Vault (dev)
│   └── prod/
│       ├── oplox.env.enc        # Encrypted production secrets (SOPS)
│       └── render.env.enc       # Render API deploy keys (SOPS)
├── deployments/                 # Infrastructure as Code (IaC)
│   ├── render/
│   │   ├── oplox-render.yaml    # Render Blueprint for Oplox Control Plane
│   │   └── fleet-render.yaml    # Unified ecosystem Render Blueprint
│   └── docker/
│       └── docker-compose.yml   # Multi-service local container runner
├── scripts/
│   ├── bootstrap.ps1            # 1-Click machine setup & secret injection
│   └── sync-secrets.ps1         # Pushes .env to all local project folders
└── README.md                    # Disaster recovery & onboarding playbook
```

---

## 🔒 Secrets Management Standard (SOPS + Age)

- **100% Free & Offline**: Uses Mozilla SOPS with Age key encryption.
- **Selective Value Encryption**: In `*.env.enc`, keys remain readable for clear Git diffs, while values are encrypted with AES-256 GCM.
- **Zero Accidental Leaks**: Guarded by Gitleaks pre-commit hooks.

### Injecting Secrets to Local Projects
```powershell
.\scripts\sync-secrets.ps1
```
This distributes the appropriate `.env` file to each project directory in `anti_gravity_projects/`.
