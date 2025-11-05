# Recreation Calendar - Project Plan

## Overview

Create a simplified frontend calendar view for a recreation booking management system (Sharks Ice). The system will cache JSON data from the existing API and display events in a clean calendar interface with links to the existing registration system.

## API Endpoints

### Events

```
GET https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/events
  ?page[size]=25
  &sort=start
  &company=sharks
  &filter[start__gte]=2025-11-02%2000%3A00%3A00
  &filter[start__lte]=2025-11-02%2023%3A59%3A59
  &filter[resource.facility.my_sam_visible]=true
  &filter[eventType.code__not]=L
  &filter[resource.facility.id]=3
```

### Teams

```
GET https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/teams/{team_id}?company=sharks
```

### Resources

```
GET https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/resources/{resource_id}?company=sharks
```

## Key Resources

- **Resource ID 24**: NHL rink (200ft x 85ft)
- **Resource ID 25**: Olympic rink (200ft x 100ft)
- **Resource ID 29**: Support space (locker room?)
- **Resource ID 62**: Studio/training area (has subdivisions)

## Event Types

- **"g"**: Games (home team vs visiting team)
- **"k"**: Practice/skating sessions
- **"L"**: Lessons (excluded from our view via filter)

## Caching Strategy

### Daily Workflow (Every day EXCEPT 1st of month)

1. Fetch events for **day T+14 only** (e.g., today is Nov 4, fetch Nov 18)
2. Handle pagination (merge all pages from `links.next`)
3. Extract all unique team IDs from `hteam_id` and `vteam_id`
4. Check `data/teams/` directory for existing teams
5. Fetch **only new teams** not already cached
6. Commit updated JSON files to git
7. Trigger static site rebuild/deploy

### Monthly Workflow (1st of month)

1. Fetch events for **next 14 days** (T+1 through T+14)
2. Handle pagination for all 14 days
3. Extract all unique team IDs from all events
4. Fetch any new teams not in cache
5. Commit updated JSON files to git
6. Trigger static site rebuild/deploy

### One-time Setup

- Manually fetch resources (24, 25, etc.) and commit to `data/resources/`
- Can be refreshed manually as needed

## File Structure

```
dumbnight/
├── .github/
│   └── workflows/
│       ├── daily-fetch.yml      # Runs daily at midnight
│       └── monthly-fetch.yml    # Runs on 1st of month
├── data/
│   ├── events/
│   │   ├── 2025-11-05.json
│   │   ├── 2025-11-06.json
│   │   └── ... (14 days total)
│   ├── teams/
│   │   ├── 9187.json
│   │   ├── 9189.json
│   │   └── ... (grows organically)
│   └── resources/
│       ├── 24.json
│       ├── 25.json
│       └── ...
├── scripts/
│   ├── fetch-events.js          # Fetch event data for date range
│   ├── fetch-teams.js           # Fetch missing teams
│   └── utils.js                 # Shared helpers
├── src/
│   ├── components/
│   │   ├── Calendar.jsx
│   │   ├── EventCard.jsx
│   │   └── RinkView.jsx
│   ├── hooks/
│   │   └── useEvents.js
│   ├── data/
│   │   └── ... (symlink to ../data)
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Tech Stack

### Frontend

- **Framework**: Vite + React
- **State/Cache**: TanStack Query (React Query) for local JSON cache management
- **Calendar UI**: FullCalendar or React Big Calendar
- **Styling**: TailwindCSS
- **Deployment**: GitHub Pages or Cloudflare Pages

### Data Fetching

- **Runtime**: Node.js (in GitHub Actions)
- **HTTP Client**: node-fetch or axios
- **Schedule**: GitHub Actions cron

### Hosting & CI/CD

- **Repository**: GitHub
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages (free) or Cloudflare Pages (free)
- **Cost**: $0/month

## GitHub Actions Workflow

### Daily Fetch Workflow

```yaml
name: Daily Event Fetch
on:
  schedule:
    - cron: "0 8 * * *" # 8am UTC (midnight PST)
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - Checkout repo
      - Setup Node.js
      - Install dependencies
      - Run fetch-events.js for T+14
      - Run fetch-teams.js for new teams
      - Commit changes
      - Push to main (triggers deploy)
```

### Monthly Fetch Workflow

```yaml
name: Monthly Event Refresh
on:
  schedule:
    - cron: "0 8 1 * *" # 8am UTC on 1st of month
  workflow_dispatch:

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - Checkout repo
      - Setup Node.js
      - Install dependencies
      - Run fetch-events.js for 14 days
      - Run fetch-teams.js for new teams
      - Commit changes
      - Push to main (triggers deploy)
```

## Calendar UI Features

### Views

- **Default**: Side-by-side view of both rinks (NHL & Olympic)
- **Filter**: Toggle between rinks, event types (games vs practice)
- **Date navigation**: Previous/Next day buttons
- **Time range**: 6am - midnight (based on sample data)

### Event Display

- **Time**: Start - End time
- **Type**: Game (with teams) or Session (with description)
- **Teams**: Display team names (from cached team data)
- **Link**: Click event to go to registration page on existing system
- **Color coding**: Different colors for games vs practice

### Data Flow

1. User selects date
2. App loads `data/events/YYYY-MM-DD.json`
3. Filters events by `resource_id` in [24, 25]
4. Looks up team names from `data/teams/{id}.json`
5. Renders events in calendar grid
6. Clicking event opens registration URL

## Open Questions

1. **Timezone**: Pacific Time (PST/PDT) for date calculations?
2. **Old files**: Delete event files older than today, or keep for history?
3. **Error handling**: What if API is down during fetch? Keep stale data?
4. **Rate limiting**: Do we need delays between API requests?
5. **Team cache size**: How many teams total? (affects build time)
6. **Registration URLs**: What's the pattern for linking to existing system?

## Benefits of This Approach

- **No backend**: Pure static site, fast and cheap
- **No API load**: All data cached, no runtime API calls
- **Git history**: Track all data changes over time
- **Easy rollback**: Git revert if bad data
- **Free hosting**: GitHub/Cloudflare Pages
- **Incremental**: Team cache grows only as needed
- **Simple**: Just JSON files and React

## Next Steps

1. Initialize project with Vite + React
2. Create fetch scripts (Node.js)
3. Set up GitHub Actions workflows
4. Build calendar UI components
5. Test with sample data
6. Deploy to GitHub Pages
7. Monitor for data quality
