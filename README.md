# Santa’s Gift Rush

A dependency-free, mobile-browser Christmas game for a private family competition. The frontend is designed for GitHub Pages; Google Apps Script is the only backend and writes to a private Google Sheet.

> Important: the three photos under `assets/kids/` become publicly accessible when this repository is published with GitHub Pages. Use a private/trusted family context and obtain the appropriate consent. Player identification is name-only and is convenient, not fully cheat-proof.

## What is included

- 45-second touch game with presents (+10), stars (+30), three-tap snowmen (+20), coal bombs (−20), and rare photo stars (+50).
- One deterministic KST challenge per date and rules version, including positions, timing, lifetimes, and photo selection.
- Three backend-enforced attempts per player/day, idempotent starts and submissions, one active session, server-side event replay, and KST dates.
- Best round per day; overall score is the best ten daily scores.
- Live compact rankings, competition countdown, practice mode, final standings, accessibility and reduced-motion support.
- A clearly marked browser-only mock mode for setup and UI testing.

Rules version `2026.1`: targets spawn roughly every 0.49–1.11 seconds, becoming faster through the round. Lifetimes are 1.2s (star), 1.5s (present/bomb/photo), and 2.2s (snowman). The logical board is always 9:14.

## 1. Run locally in VS Code

1. Open this folder in VS Code.
2. Do not double-click `index.html`; camera assets and browser policies work more reliably over HTTP.
3. Run any static server. With Node installed, use `npx serve .`, then open its local URL.
4. `js/config.js` initially has `mockMode: true`. Use the roster Jason, Mina, Alex, or Sam. Mock scores exist only in that browser’s local storage.
5. Run `npm test` (no install is required).

Mock mode never activates automatically after a live backend failure.

## 2. Create and initialize Google Sheets

1. Create a blank private Google Sheet.
2. Copy the ID between `/d/` and `/edit` in its URL.
3. Open **Extensions → Apps Script**.
4. Replace `Code.gs` with [apps-script/Code.gs](apps-script/Code.gs). In Project Settings, enable the manifest and copy [apps-script/appsscript.json](apps-script/appsscript.json).
5. In **Project Settings → Script properties**, add `SHEET_ID` with the copied Sheet ID. Do not put this ID or administrative controls in frontend code.
6. Run `initializeSheets` once, review its permissions, and authorize it. It creates missing tabs/headers without deleting existing data.
7. In the **Settings** tab, set `START_KST` to the desired first date in `YYYY-MM-DD` format. The close is fixed at **2026-12-19 19:00 KST** (`2026-12-19T10:00:00Z`). The current code records this setting; before launch, ensure the chosen start date is correct.

## 3. Add family members

In **Players**, add rows:

| PlayerId | DisplayName | NormalizedName | Active |
|---|---|---|---|
| p-001 | Jason | jason | TRUE |

Use permanent, non-secret IDs. Trim and lowercase `NormalizedName`; no two active or inactive rows may have the same normalized name. The backend also normalizes lookups and rejects ambiguous duplicates. Values beginning with formula characters are stored as literal text in finalized output.

## 4. Deploy Apps Script

1. Select **Deploy → New deployment → Web app**.
2. Execute as **Me**.
3. Select **Anyone** for access (wording varies by account), authorize, and deploy.
4. Copy the URL ending in `/exec`.
5. In [js/config.js](js/config.js), paste it into `apiUrl` and set `mockMode:false`.
6. Each backend change requires **Deploy → Manage deployments → Edit → New version → Deploy**. Merely saving code does not update the live web app.

Some Workspace administrators block anonymous web apps. If “Anyone” is unavailable, ask the Google Workspace administrator or deploy from an account that permits it. Do not use a CORS proxy. This project uses a simple GET request and reads a JSON acknowledgement; an unreadable `no-cors` response is never treated as saved.

## 5. Replace the photos

The supplied photos are already copied to:

- `assets/kids/kid-1.png`
- `assets/kids/kid-2.png`
- `assets/kids/kid-3.png`

To replace one, overwrite that file, or change the three paths in [js/config.js](js/config.js). Keep all three available. They are preloaded and decoded before an official session is requested, so a broken photo cannot consume an attempt. CSS uses `object-fit: cover` for undistorted circular cropping. Do not add children’s names to filenames or image metadata.

## 6. Publish on GitHub Pages

1. Create a GitHub repository and push this folder.
2. In **Settings → Pages**, choose **Deploy from a branch**, then the main branch and root folder.
3. Open the provided project URL on iPhone Safari, Android Chrome, and desktop.
4. Confirm the page says it is connected—not mock mode—then test with a temporary roster player before launch.

All paths are relative and work from a GitHub Pages project URL.

## Scoring, attempts, and deadlines

An attempt is consumed when Apps Script successfully creates its start session. Refreshing, leaving, or abandoning it does not restore it; an expired/abandoned session scores nothing. Start retries with the same key return the same session, and duplicate submissions return the recorded result. The backend uses a lock so multiple tabs cannot exceed the limit.

Daily attempts reset at midnight in Asia/Seoul. A round crossing midnight remains assigned to its start date. Results have a 15-second network grace period after the scheduled round end, but never past 19:00 KST on December 19. New rounds stop early enough for the 3-second countdown and full 45-second round.

Each daily score is the best valid score from up to three rounds. Overall is the sum of the best ten daily scores. Ranking uses overall, best single round, the recorded reach timestamp, then player ID. Only players with a valid positive completed round qualify for final standings.

The backend reconstructs the official sequence and recomputes scores from taps, rejecting invalid targets, time windows, duplicate awards, excess snowman taps, and malformed sessions. A trusted family member can still manipulate browser-recorded events with enough effort; name-only access also lets someone enter another name.

## Testing and troubleshooting

- **Local rule tests:** `npm test`.
- **Mock integration:** keep `mockMode:true`; test login, three attempts, practice, photo loading, results, and refresh/abandon behavior.
- **Live integration:** use a temporary player and the deployed URL; verify rows in Attempts/Results and reload on another phone.
- **Deployment verification:** only complete after the actual GitHub Pages URL and live Sheet have been tested. This repository cannot perform that account-level step for you.

If lookup fails, check deployment access, the `/exec` URL, roster spelling, and duplicate normalized names. If saving remains unconfirmed, keep the page open, check the browser network log and Sheet, then use the session status operation before retrying. Never promise a last-second offline result will count.

Before the real competition, test KST midnight, three simultaneous starts, abandoned sessions, December deadline boundaries, fewer than three winners, and finalization using a separate copy of the project with test dates. Do not add a production clock override. Final standings are created once under a lock on the first request after closing; no precisely timed trigger is required.
