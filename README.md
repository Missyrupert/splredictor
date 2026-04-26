# Top 6 Prediction League

Scottish Premiership Top 6 post-split prediction game for 5 friends.

**This is the fixed-fixture version.** No API calls. No live data fetching.
The 12 official fixtures are hardcoded exactly as announced. Nothing is invented.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

No environment variables required.

---

## How to use

### Selecting a player

1. Open the app at `/`
2. Tap your name: **Rog · Jase · Euan · Ebbsy · CJ**
3. You are taken to the Predict page automatically

### Making predictions

1. Go to `/predict`
2. You will see all 12 fixtures grouped by round
3. For each fixture, enter your predicted score (home – away)
4. Click **Save Prediction** for each fixture
5. Predictions are stored server-side in `data/predictions.json`
6. If kickoff has already passed, the fixture is locked — you can view but not change your prediction

### Entering actual results (Admin)

1. Go to `/admin`
2. After a match finishes, enter the actual final score
3. Click **Save Result**
4. The leaderboard updates immediately on next load
5. To correct a mistake, update the score and save again
6. To remove a result, click the **✕** button

### Leaderboard

- Go to `/leaderboard`
- Shows all 5 players ranked by points
- Only completed fixtures (with an admin-entered result) contribute to the score

---

## Scoring

| Scenario | Points |
|---|---|
| Exact scoreline correct | **3 pts** |
| Correct result (W/D/L) only | **1 pt** |
| Wrong result | **0 pts** |

**Examples:**
- You predict Celtic 2-1 Falkirk · Actual: Celtic 2-1 Falkirk → **3 pts**
- You predict Celtic 2-0 Falkirk · Actual: Celtic 3-1 Falkirk → **1 pt**
- You predict Celtic 1-1 Falkirk · Actual: Celtic 3-1 Falkirk → **0 pts**

---

## The 12 Fixtures

| # | Round | Date | Home | Away | Venue |
|---|---|---|---|---|---|
| 1 | 34 | Sat 25 Apr, 17:30 | Celtic | Falkirk | Celtic Park |
| 2 | 34 | Sun 26 Apr, 16:30 | Hibernian | Hearts | Easter Road |
| 3 | 35 | Sun 3 May, 12:00 | Hibernian | Celtic | Easter Road |
| 4 | 35 | Mon 4 May, 17:30 | Hearts | Rangers | Tynecastle |
| 5 | 36 | Sat 9 May, 20:00 | Motherwell | Hearts | Fir Park |
| 6 | 36 | Sun 10 May, 12:00 | Celtic | Rangers | Celtic Park |
| 7 | 37 | Wed 13 May, 20:00 | Hearts | Falkirk | Tynecastle |
| 8 | 37 | Wed 13 May, 20:00 | Motherwell | Celtic | Fir Park |
| 9 | 37 | Wed 13 May, 20:00 | Rangers | Hibernian | Ibrox |
| 10 | 38 | Sat 16 May, 12:30 | Celtic | Hearts | Celtic Park |
| 11 | 38 | Sat 16 May, 12:30 | Falkirk | Rangers | Falkirk Stadium |
| 12 | 38 | Sat 16 May, 12:30 | Hibernian | Motherwell | Easter Road |

All times are UK (BST, UTC+1).

---

## Data storage

Predictions and results are stored as JSON files in the `data/` directory:

- `data/predictions.json` — all 5 players' predictions
- `data/results.json` — admin-entered match results

These files are created automatically on first use. They are excluded from git by `.gitignore`.

---

## Confirmation: no fake data

- No API calls are made anywhere in this version
- No results are generated automatically
- No Aberdeen or non-Top 6 teams appear
- Fixtures are sourced from the official Scottish Premiership announcement
- Results only appear after manual admin entry

---

## Tech stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **JSON file persistence** (`data/` directory)
