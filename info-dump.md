# Recreation Calendar - Complete Info Dump

## Project Context

User is rebuilding the frontend for a recreation booking management system. The existing system (DaySmart Recreation) has an awful UI. The goal is to create a simple, clean calendar view that shows ice rink schedules and links out to the existing registration system for bookings.

## The Facility

**Sharks Ice** - Ice skating/hockey facility with multiple ice sheets

- Company identifier: `sharks`
- Facility ID: `3`
- Located in California (PST/PDT timezone likely)

## Ice Rinks (Resources)

The facility has at least 2 main ice sheets:

- **Resource ID 24**: NHL-sized rink (200ft x 85ft)
- **Resource ID 25**: Olympic-sized rink (200ft x 100ft)

Additional resources seen in data:

- **Resource ID 29**: Unknown (possibly locker room or auxiliary space)
- **Resource ID 62**: Training/studio area with subdivisions
  - Has `resource_area_id` values like 72, 73 (sub-areas within resource 62)

## API Structure

### Base URL

```
https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/
```

### Events Endpoint

```
GET /events?page[size]=25&sort=start&company=sharks&filter[start__gte]=2025-11-02%2000%3A00%3A00&filter[start__lte]=2025-11-02%2023%3A59%3A59&filter[resource.facility.my_sam_visible]=true&filter[eventType.code__not]=L&filter[resource.facility.id]=3
```

**Query Parameters:**

- `page[size]`: Number of results per page (default 25)
- `sort`: Sort field (use `start` for chronological)
- `company`: Organization identifier (`sharks`)
- `filter[start__gte]`: Start date/time filter (greater than or equal)
- `filter[start__lte]`: End date/time filter (less than or equal)
- `filter[resource.facility.my_sam_visible]`: Only show publicly visible events (`true`)
- `filter[eventType.code__not]`: Exclude event type (`L` = lessons)
- `filter[resource.facility.id]`: Facility identifier (`3`)

**Pagination:**

- Returns 25 events per page by default
- Response includes `meta.page` with pagination info
- Response includes `links` with `first`, `next`, `last` URLs
- Must fetch all pages to get complete day data

**Sample pagination response:**

```json
{
  "meta": {
    "page": {
      "current-page": 1,
      "per-page": 25,
      "from": 1,
      "to": 25,
      "total": 67,
      "last-page": 3
    }
  },
  "links": {
    "first": "...",
    "next": "...",
    "last": "..."
  }
}
```

### Teams Endpoint

```
GET /teams/{team_id}?company=sharks
```

Returns team information for displaying team names in game events.

### Resources Endpoint

```
GET /resources/{resource_id}?company=sharks
```

Returns resource/rink information (name, capacity, amenities, etc.)

## Data Format (JSON:API)

All responses follow the JSON:API specification:

```json
{
  "meta": {
    /* pagination, counts */
  },
  "links": {
    /* navigation URLs */
  },
  "data": [
    /* array of resource objects */
  ]
}
```

### Event Object Structure

Each event in `data` array has:

```json
{
  "type": "events",
  "id": "253557",
  "attributes": {
    // Identification
    "repeat_id": 253556,
    "event_type_id": "k",
    "sub_type": "regular",

    // Timing (local time)
    "start": "2025-11-02T06:00:00",
    "end": "2025-11-02T07:00:00",
    "start_date": "2025-11-02T00:00:00",
    "event_start_time": "06:00:00",

    // Timing (GMT)
    "start_gmt": "2025-11-02T14:00:00",
    "end_gmt": "2025-11-02T15:00:00",

    // Resources
    "resource_id": 25,
    "resource_area_id": 0,

    // Teams (for games)
    "hteam_id": 9189,
    "vteam_id": null,
    "league_id": 3959,
    "home_score": null,
    "visiting_score": null,

    // Descriptions
    "desc": "",
    "description": null,
    "best_description": "<p>HTML description...</p>",

    // Metadata
    "publish": true,
    "customer_id": 0,
    "register_capacity": 0,
    "is_overtime": false,
    "outcome": "",

    // Audit fields
    "create_u": "ssimon",
    "created_user_type": "SIT_Employee",
    "create_d": "2025-10-09T16:16:24",
    "mod_u": "ssimon",
    "last_modified_user_type": "SIT_Employee",
    "mod_d": "2025-10-24T15:09:23",

    // Flags
    "has_gender_locker_rooms": 0,
    "locker_room_type": null,
    "includes_setup_time": false,
    "includes_takedown_time": false,
    "booking_id": null,
    "parent_event_id": null,
    "last_resource_id": null,
    "notice": null
  },
  "relationships": {
    "customer": [],
    "registrants": [],
    "registrations": [],
    "eventType": [],
    "subType": [],
    "homeTeam": {
      "data": {
        "type": "teams",
        "id": "9189"
      }
    },
    "visitingTeam": {
      "data": null
    },
    "summary": [],
    "league": [],
    "booking": [],
    "parentEvent": [],
    "lockers": [],
    "lastResource": [],
    "resource": [],
    "resourceArea": [],
    "tasks": [],
    "teamGroups": [],
    "eventSeries": [],
    "statEvents": [],
    "fees": [],
    "invoices": [],
    "seriesInvoices": [],
    "invoiceItems": [],
    "employees": [],
    "eventEmployees": [],
    "additionalResources": [],
    "setupEvents": [],
    "takedownEvents": [],
    "comments": [],
    "rsvpStates": []
  },
  "links": {
    "self": "https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/events/253557"
  }
}
```

### Key Fields for Our Use

**Essential:**

- `id`: Unique event identifier
- `attributes.event_type_id`: "g" (game) or "k" (practice/session)
- `attributes.start` / `attributes.end`: Local time
- `attributes.resource_id`: Which rink (24 or 25)
- `attributes.hteam_id`: Home team ID (for games)
- `attributes.vteam_id`: Visiting team ID (for games)
- `attributes.best_description`: HTML description (for sessions)

**Nice to have:**

- `attributes.league_id`: League identifier
- `attributes.sub_type`: "regular", etc.
- `attributes.publish`: Is it publicly visible?

## Event Types

Based on data analysis:

### Type "g" - Games

- Hockey games (home team vs visiting team)
- Has both `hteam_id` and `vteam_id` (can be null for practice)
- Usually 75 minutes (1:15)
- Examples from data:
  - "B: intermediate - Over40 Hockey, limited to players aged 40+ years"
  - "A: competetive - Over40 Hockey, limited to players aged 40+ years"

### Type "k" - Sessions/Practice

- Figure skating sessions
- Hockey practice/skills sessions
- Open ice time
- Usually has only `hteam_id` (team/group using ice)
- `vteam_id` is null
- Examples from data:
  - "Figure Skaters FS1 or higher"
  - "Sharks Ice Hockey 101!"
  - Various freestyle skating sessions

### Type "L" - Lessons (EXCLUDED)

- Not visible in our filtered data
- Explicitly excluded via `filter[eventType.code__not]=L`

## Sample Events from Data

### Event 1: Figure Skating Session

- **ID**: 253557
- **Time**: 6:00 AM - 7:00 AM
- **Rink**: Olympic (25)
- **Type**: Practice (k)
- **Description**: "The session is for Figure Skaters FS1 or higher..."

### Event 2: Over40 Hockey Game

- **ID**: 251603
- **Time**: 6:15 AM - 7:30 AM
- **Rink**: NHL (24)
- **Type**: Game (g)
- **Teams**: 8654 vs 8880
- **League**: 3657
- **Description**: "B: intermediate - Over40 Hockey, limited to players aged 40+ years"

### Event 3: Hockey 101 Session

- **ID**: 258782
- **Time**: 10:30 AM - 11:30 AM
- **Rink**: Olympic (25)
- **Type**: Practice (k)
- **Description**: "Sharks Ice Hockey 101! Whether you are new to the game..."
- **Capacity**: 0 (unlimited? or uses resource_area for capacity)

## Data Files in Repository

### Current Files

- `data.json` - Full API response with relationship data populated
- `simple.formatted.json` - Same structure but relationships are empty arrays

Both files contain:

- 67 total events
- 3 pages of data (25, 25, 17 events)
- Events for November 2, 2025
- Time range: 6:00 AM - 11:45 PM

## URL Breakdown Example

Original URL from user:

```
https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/events?cache[save]=false&page[size]=25&sort=start&company=sharks&filter[start__gte]=2025-11-04%2000%3A00%3A00&filter[start__lte]=2025-11-04%2023%3A59%3A59&filter[resource.facility.my_sam_visible]=true&filter[eventType.code__not]=L&filter[resource.facility.id]=3&filterRelations[comments.comment_type]=public&include=homeTeam.league.programType,visitingTeam.league.programType,summary,resource.facility,resourceArea,comments,eventType
```

Simplified version (for our use):

```
https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/events?company=sharks&filter[start__gte]=2025-11-04%2000%3A00%3A00&filter[start__lte]=2025-11-04%2023%3A59%3A59&filter[resource.facility.id]=3
```

**Removed (not needed):**

- `cache[save]=false` - Client-side caching preference
- `filter[resource.facility.my_sam_visible]=true` - We want all events
- `filter[eventType.code__not]=L` - We can filter client-side if needed
- `filterRelations[comments.comment_type]=public` - Don't need comments
- `include=homeTeam.league...` - Relationships not populated anyway

## Caching Strategy (Finalized)

### Daily Fetch (Every day EXCEPT 1st)

1. Calculate date for T+14 (14 days from today)
2. Fetch events for that single day
3. Handle pagination (merge all pages)
4. Save to `data/events/YYYY-MM-DD.json`
5. Extract team IDs from events
6. Check if teams exist in `data/teams/`
7. Fetch missing teams
8. Commit and push

### Monthly Fetch (1st of every month)

1. Calculate dates for T+1 through T+14
2. Fetch events for all 14 days
3. Handle pagination for each day
4. Save 14 files to `data/events/`
5. Extract all team IDs from all events
6. Fetch missing teams
7. Commit and push

### Result

- Always have 14 days of future event data
- Team cache grows organically (never shrinks)
- Resources fetched once manually
- Total rebuild triggers deploy

## Tech Stack Decisions

### Why Vite + React?

- Fast dev server with HMR
- Minimal config
- Great for calendar UIs with lots of dynamic rendering
- Large ecosystem for calendar libraries

### Why TanStack Query?

- Perfect for managing cached JSON responses
- Can serve from cache indefinitely (no API calls)
- Built-in stale-time management
- Easy to update cache when new data arrives

### Calendar Library Options

1. **FullCalendar** - Most feature-rich, great for complex scheduling
2. **React Big Calendar** - Google Calendar-like, lighter weight
3. **DayPilot Lite** - Good for sports/recreation scheduling

### Why GitHub Actions?

- Free compute (2000 minutes/month for free tier)
- Built-in cron scheduling
- Easy git integration
- Can trigger deploys automatically

### Why Static Site?

- No backend needed
- Fast load times (everything cached)
- Free hosting (GitHub Pages / Cloudflare Pages)
- Simple deployment
- No server costs

## Display Requirements

### Two-Rink View

- Side-by-side display of NHL rink (24) and Olympic rink (25)
- Synchronized time axis (6am - midnight)
- Filter events by `resource_id` on client side

### Event Cards

- **For Games (type "g"):**
  - Time range
  - Home Team vs Visiting Team
  - League name (if available)
  - Click to register link

- **For Sessions (type "k"):**
  - Time range
  - Session name/description
  - Team/group name
  - Click to register link

### Color Coding

- Different colors for games vs practice
- Maybe league-specific colors?
- Highlight current time

### Date Navigation

- Previous/Next day buttons
- Date picker
- Show which days have cached data available

## Registration Links

Need to determine URL pattern for linking back to existing system:

- Do we link to the event detail page?
- Do we link directly to registration?
- What parameters are needed?

**Example possibilities:**

```
https://apps.daysmartrecreation.com/dash/register/event/{event_id}?company=sharks
https://apps.daysmartrecreation.com/dash/events/{event_id}?company=sharks
```

## Implementation Phases

### Phase 1: Data Fetching

- [ ] Create Node.js fetch scripts
- [ ] Handle pagination
- [ ] Extract team IDs
- [ ] Fetch missing teams
- [ ] Test with sample data

### Phase 2: GitHub Actions

- [ ] Create daily workflow
- [ ] Create monthly workflow
- [ ] Test cron schedules
- [ ] Handle errors/retries
- [ ] Add commit messages

### Phase 3: Frontend Setup

- [ ] Initialize Vite + React project
- [ ] Install TanStack Query
- [ ] Choose calendar library
- [ ] Set up TailwindCSS
- [ ] Create basic layout

### Phase 4: Calendar UI

- [ ] Two-rink side-by-side view
- [ ] Event cards with team lookups
- [ ] Date navigation
- [ ] Time grid display
- [ ] Responsive design

### Phase 5: Polish

- [ ] Loading states
- [ ] Error handling
- [ ] No data states
- [ ] Registration links
- [ ] Color coding
- [ ] Accessibility

### Phase 6: Deploy

- [ ] GitHub Pages setup
- [ ] Custom domain (optional)
- [ ] Test deployment
- [ ] Monitor data quality
- [ ] Set up alerts

## Open Questions

1. **Timezone handling**: All times in PST/PDT?
2. **Old event files**: Keep or delete after the day passes?
3. **Team cache size**: How many teams total? 100s? 1000s?
4. **Rate limiting**: Does API have rate limits? Need delays?
5. **Error handling**: What if API is down during fetch?
6. **Registration URLs**: What's the actual pattern?
7. **Authentication**: Does the API require auth tokens?
8. **CORS**: Will browser be able to make requests? (Not needed if fully cached)
9. **Resource names**: Fetch once or hardcode "NHL Rink" / "Olympic Rink"?
10. **League info**: Display league names or just team names?

## Observed Patterns in Data

### Time Patterns

- Ice time starts as early as 6:00 AM
- Events run until midnight
- Most events are 60-75 minutes
- Some short sessions (30 minutes) on resource 62

### Resource Usage

- Resource 24 and 25 (main rinks) have most activity
- Resource 62 has many short overlapping sessions (training areas?)
- Resource 29 appears occasionally (locker room booking?)

### Team IDs

- Team IDs are 4-5 digits (8654, 9189, etc.)
- Some events have no visiting team (practice)
- Some events have no teams at all (open skate?)

### Descriptions

- Often contain HTML markup
- Include rules, requirements, age restrictions
- Some are null (need fallback display)

### Scheduling

- Events can overlap on different resource_area_id
- No overlapping events on same resource without area subdivision
- Repeating events have `repeat_id` linking them

## Performance Considerations

### Bundle Size

- Calendar libraries can be large (200-500kb)
- Consider code splitting
- Lazy load team data?

### Build Time

- 14 event files + N team files
- Should be fast (<30 seconds)
- No server-side rendering needed

### Runtime Performance

- All data loaded at build time
- No API calls from browser
- Filter/search happens client-side
- Should be very fast

## Cost Analysis

- **GitHub Actions**: Free (2000 min/month, we need ~5 min/day)
- **GitHub Pages**: Free (1GB storage, we need <10MB)
- **Cloudflare Pages**: Free alternative
- **Domain**: $10-15/year (optional)
- **Total**: $0-15/year

## Success Criteria

1. Calendar loads in <2 seconds
2. Shows accurate data for next 14 days
3. Updates automatically every day
4. Team names display correctly
5. Links to registration work
6. Mobile responsive
7. No manual intervention needed
8. Data quality monitoring/alerts

## Future Enhancements

- Filter by event type (games only, practice only)
- Filter by league
- Search for teams
- Subscribe to calendar (iCal feed)
- Email notifications for favorite teams
- Historical data view
- Analytics (most popular times, etc.)
- Multi-facility support (expand beyond Sharks Ice)
