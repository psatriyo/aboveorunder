# Above or Under

A lightweight, single-page web tool to help Claude subscribers check whether their weekly usage is pacing **under** or **over** their plan limit.

## What this project does

Given:
- your **current usage %** (from Claude settings)
- your **next weekly reset date/time**

it estimates how much of the current 7-day cycle has elapsed, compares that against usage, and tells you if you are:
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

- `index.html` — current polished UI with:
  - improved visual design
  - reset-day badge
  - quick +/- usage controls
  - localStorage persistence for last inputs
  - progress bars for time vs usage
- `claude-usage-monitor.html` — earlier/simpler version of the calculator
- `CNAME` — custom domain config for GitHub Pages

---

## How the calculation works

1. Treat one cycle as **7 days**.
2. Infer the previous reset by subtracting 7 days from the provided next reset.
3. Compute:
   - `timeElapsed% = (now - previousReset) / 7 days * 100`
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
- Custom domain is controlled via `CNAME`

---

## Notes

This tool is for pacing guidance only and depends on manual entry of your current Claude usage percentage.