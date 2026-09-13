# 🚀 Public Application Status Database & Live Client Tracking Portal

A privacy-compliant, sanitized version of the filing and workflow database designed for public sharing on **GitHub** and **GitHub Pages**.

This repository allows clients and stakeholders to track real-time application stages, filing progress, and milestone updates while strictly safeguarding Personally Identifiable Information (PII).

---

## 🛡️ Privacy & Masking Standard (Zero PII Leaks)

Before any data is written to this repository, the sanitization engine automatically scrubs and masks sensitive information:

| Data Field | Master Internal Database | Public GitHub Database (`tasks_status_db.json`) | Public Safety Purpose |
| :--- | :--- | :--- | :--- |
| **Mobile Number** | `9990526901` | `XXXXXX6901` | Client can verify last 4 digits; crawler-proof |
| **Email Address** | `ankit.mavi4@gmail.com` | `an********4@gmail.com` | Client can verify domain; spam-protected |
| **Payment & Fees** | `4000`, `UTR-991823` | `PENDING` / `PAID` | Internal fees and bank references removed |
| **Passwords / PINs** | `Token_Pin: 1234` | `[CONFIDENTIAL]` | All private secrets redacted |
| **Application ID** | `1789066445` | `1789066445` | Retained for instant lookup |
| **Stage & Progress** | `20%`, `Stage 1` | `20%`, `Stage 1` | Retained for real-time tracking |

---

## 📁 Repository Structure

```text
├── index.html                  # Live Client Status Tracking Web Portal
├── style.css                   # Glassmorphic UI Design System (Dark/Light mode)
├── app.js                      # Instant search, filter, and milestone stepper logic
├── tasks_status_db.json        # Sanitized public JSON database
├── Application_Status_Export.csv # Sanitized public CSV spreadsheet
├── export_public_database.py   # Automated PII masking & export engine
├── UPDATE_PUBLIC_DB.bat        # 1-Click batch script to refresh public DB
└── README.md                   # Documentation and deployment guide
```

---

## ⚡ How to Refresh the Public Database

Whenever you add or update tasks in your master Task Manager:

1. Double-click **`UPDATE_PUBLIC_DB.bat`** (or run `python export_public_database.py`).
2. The script will automatically read your latest `tasks_db.json`, mask all client mobile numbers and emails, and regenerate `tasks_status_db.json` & `Application_Status_Export.csv`.
3. Commit and push the changes to GitHub.

---

## 🌐 Deploy to GitHub Pages (Free 24/7 Live Status Tracker)

You can host the interactive client status portal for free on GitHub Pages:

1. Push this repository to your GitHub account (e.g. `https://github.com/<your-username>/status-portal`).
2. Go to **Settings** $\rightarrow$ **Pages** in your GitHub repository.
3. Under **Branch**, select `main` (or `master`) and `/ (root)`, then click **Save**.
4. In a few seconds, GitHub will give you a live URL like:  
   `https://<your-username>.github.io/status-portal/`
5. Share direct tracking links with clients:  
   `https://<your-username>.github.io/status-portal/#id=1789066445`

---

## 💻 First-Time Git Setup Commands

To push this repository to GitHub for the first time:

```bash
cd "d:\MY APPS\GIT HUB"
git init
git add .
git commit -m "Initial commit: Sanitized Application Status Database and Live Tracking Portal"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPOSITORY-NAME>.git
git push -u origin main
```

---

## 📄 License & Compliance
Designed for Chartered Accountants, Tax Practitioners, and Compliance Teams.
Compliant with standard data privacy guidelines.
