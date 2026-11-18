# Above or Under

A lightweight, single-page web tool to help anyone track whether their weekly AI usage is pacing **under** or **over** their plan limit.

## What this project does

Given:
- your usage as either **current usage %** (used so far) or **remaining usage %** (available balance)
- your **current weekly cycle start date/time**

it estimates how much of the current 7-day cycle has elapsed, compares that against your usage, and tells you if you are:
- **UNDER** pace (you still have buffer), or
- **OVER** pace (you are consuming faster than time elapsed).

### Features

- **Live results:** the pace updates as you type and refreshes every minute.
- **Remembers your inputs:** cycle start, input mode and usage are saved in your browser (localStorage), so you can check again later without retyping.
- **Rolls the weekly cycle forward:** if the start date you saved is more than 7 days old, the tool uses the current cycle automatically and offers to update the date.
- **Visual pace comparison:** a "week elapsed" bar next to a "usage used" bar, with a tick for where even pace would be.
- **Actionable stats:**
  - **Difference:** usage % minus time %, also shown as time (e.g. "≈ 16h over pace").
  - **Resets in:** countdown to the next reset and its date.
  - **Daily budget left:** remaining % ÷ days left, compared with the even pace of 14.3%/day.
  - **Projected at reset:** where you'll end the week if you keep your current rate, and when you'd hit 100% if you're on track to go over.
- Slider, ± stepper or typed input for the percentage, light/dark mode, and mobile layout.

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
2. Use the provided cycle start time as the beginning of the current 7-day usage window. If it is more than 7 days ago, roll it forward by whole weeks to the current window.
3. Compute:
   - `timeElapsed% = (now - cycleStart) / 7 days * 100`
4. If the visitor enters remaining usage, convert it to current usage:
   - `currentUsage% = 100 - remainingUsage%`
5. Compare with `currentUsage%`:
   - `difference = currentUsage% - timeElapsed%`
6. Result:
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

This tool is provider-agnostic and for pacing guidance only. It depends on manually entering either your current usage percentage or your remaining usage percentage from whichever AI service you use.