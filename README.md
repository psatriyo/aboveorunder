# Above or Under

A lightweight, single-page web tool to help anyone track whether their weekly AI usage is pacing **under** or **over** their plan limit.

## What this project does

Given:
- your **current usage %** (from your AI provider dashboard)
- your **current weekly cycle start date/time**

it estimates how much of the current 7-day cycle has elapsed, compares that against your usage, and tells you if you are:
- **UNDER** pace (you still have buffer), or
- **OVER** pace (you are consuming faster than time elapsed).

---

## Tech stack

- Plain **HTML + CSS + JavaScript**
- No frameworks
- No build step
- Runs directly in the browser

---

## Project structure

- `index.html` — single-page usage pacing calculator

---

## How the calculation works

1. Treat one cycle as **7 days**.
2. Use the provided cycle start time as the beginning of the current 7-day usage window.
3. Compute:
   - `timeElapsed% = (now - cycleStart) / 7 days * 100`
4. Compare with `currentUsage%`:
   - `difference = currentUsage% - timeElapsed%`
5. Result:
   - `difference < 0` → **UNDER**
   - `difference >= 0` → **OVER**

---

## Run locally

Option 1: open directly
- Double-click `index.html` in your file explorer.

Option 2: serve locally
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

---

## Deploy

This repo is GitHub Pages friendly (static files only).

- Push to the publishing branch (commonly `main`)
- Ensure Pages is enabled in repository settings
- (Optional) Add a `CNAME` file only if you use a custom domain

---

## Notes

This tool is provider-agnostic and for pacing guidance only. It depends on manually entering your current usage percentage from whichever AI service you use.