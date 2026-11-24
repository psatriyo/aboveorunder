# Above or Under

A lightweight, single-page web tool to help anyone track whether their weekly AI usage is pacing **under** or **over** their plan limit.

## What this project does

Given:
- your **weekly reset**, either as a **weekday and time** or as the **"resets in" countdown** many providers show
- your usage as either **used so far %** or **remaining %**

it works out how much of the current 7-day cycle has elapsed, compares that against your usage, and tells you if you are:
- **UNDER** pace (you still have buffer),
- **ON PACE** (within 1% of even pace), or
- **OVER** pace (you are consuming faster than time elapsed).

### Features

- **Live results:** the pace updates as you change inputs and refreshes on every clock minute.
- **Set it once:** a weekly reset repeats, so any weekday and time maps onto the current cycle automatically.
- **Remembers your inputs:** reset, input modes and usage are saved in your browser (localStorage). When everything is filled in, the results show first on your next visit.
- **One pace bar:** usage drawn over the elapsed part of the week, with a tick at even pace and the cycle's weekdays below.
- **Actionable stats:**
  - **Resets in:** countdown to the next reset and its date.
  - **Daily budget left:** remaining % ÷ days left, compared with the even pace of 14.3%/day.
  - **Projected at reset:** where you'll end the week at your current rate, and when you'd hit 100% if you're on track to go over.
- Whole-percent stepper and slider (tap the number to type it), English / Bahasa Indonesia / Español, light and dark mode following your system, and a mobile layout.

---

## Tech stack

- Plain **HTML + CSS + JavaScript** in one file
- No frameworks, no dependencies, no build step
- Runs directly in the browser, including from `file://`

---

## Project structure

- `index.html`: the whole app. Its `<script id="core">` holds constants, translations and the pure pace maths (no DOM), and the second script handles the UI.
- `test/core.test.js`: tests for the core script, run with Node's built-in test runner.
- `og.jpg`: link preview image.
- `.github/workflows/test.yml`: runs the tests on every push and pull request.

---

## How the calculation works

1. Treat one cycle as **7 days**.
2. Take the saved reset moment and roll it forward or back by whole weeks to the cycle containing now. That gives `cycleStart`.
3. Compute:
   - `timeElapsed% = (now - cycleStart) / 7 days * 100`
4. If the visitor enters remaining usage, convert it to used usage:
   - `used% = 100 - remaining%`
5. Compare:
   - `difference = used% - timeElapsed%`
6. Result:
   - `used% >= 100` → **OVER**
   - `|difference| < 1` → **ON PACE**
   - `difference < 0` → **UNDER**, otherwise **OVER**

The reset is stored as a timestamp, so it stays put if you travel or the clocks change.

---

## Run locally

Option 1: open directly
- Double-click `index.html` in your file explorer.

Option 2: serve locally
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## Test

Requires Node 18 or newer; there is nothing to install.
```bash
npm test
```

---

## Deploy

This repo is GitHub Pages friendly (static files only).

- Push to the publishing branch (commonly `main`)
- Ensure Pages is enabled in repository settings
- `CNAME` sets the custom domain; the link preview tags in `index.html` point at it too

---

## Notes

This tool is provider-agnostic and for pacing guidance only. It depends on manually entering your usage percentage from whichever AI service you use.
