import { useState, useEffect } from "preact/hooks";
import { format } from "date-fns";
import type { View } from "react-big-calendar";
import type { Event, CalendarEvent, Team } from "../types/api";
import {
  RINK_IDS,
  RINK_NAMES,
  EVENT_TYPE_CODES,
  BLACKLIST_TEAM_IDS,
} from "../constants";
import { loadTeams, getTeamName } from "./useTeams";
import { categorizeEvent } from "../config/categories";

/**
 * Transform API event to calendar event with team names
 */
function transformEvent(
  event: Event,
  teams: Map<number, Team | null>,
): CalendarEvent {
  const { attributes } = event;

  // Parse dates (API returns local time strings)
  const start = new Date(attributes.start);
  let end = new Date(attributes.end);

  // Fix midnight edge case: calendar treats midnight as all-day event
  // If event ends at exactly midnight, move it back 1 millisecond
  if (
    end.getHours() === 0 &&
    end.getMinutes() === 0 &&
    end.getSeconds() === 0
  ) {
    end = new Date(end.getTime() - 1); // Subtract 1 millisecond
  }

  // Determine event type
  let eventType: CalendarEvent["eventType"] = "other";
  if (attributes.event_type_id === EVENT_TYPE_CODES.GAME) eventType = "game";
  else if (attributes.event_type_id === EVENT_TYPE_CODES.SESSION)
    eventType = "session";
  else if (attributes.event_type_id === EVENT_TYPE_CODES.LESSON)
    eventType = "lesson";

  // Generate title based on event type - always start with rink name
  const rinkName =
    RINK_NAMES[attributes.resource_id] || `Resource ${attributes.resource_id}`;
  let title = "";

  if (eventType === "game") {
    if (attributes.hteam_id && attributes.vteam_id) {
      const homeTeam = teams.get(attributes.hteam_id);
      const visitingTeam = teams.get(attributes.vteam_id);
      title += `(${rinkName}) ${getTeamName(visitingTeam)} @ ${getTeamName(homeTeam)}`;
    } else if (attributes.hteam_id) {
      const homeTeam = teams.get(attributes.hteam_id);
      title += `${getTeamName(homeTeam)} - Game`;
    } else {
      title += "Game";
    }
  } else if (eventType === "session") {
    // Always use team name for sessions
    if (attributes.hteam_id) {
      const homeTeam = teams.get(attributes.hteam_id);
      title += getTeamName(homeTeam);
    } else {
      title += "Session";
    }
  } else {
    if (attributes.hteam_id) {
      const homeTeam = teams.get(attributes.hteam_id);
      title += getTeamName(homeTeam);
    } else {
      title += "Event";
    }
  }

  // Categorize the event
  const homeTeam = attributes.hteam_id
    ? teams.get(attributes.hteam_id)
    : undefined;
  const category = categorizeEvent(event, homeTeam);

  return {
    id: event.id,
    title,
    start,
    end,
    resourceId: attributes.resource_id,
    resourceName:
      RINK_NAMES[attributes.resource_id] ||
      `Resource ${attributes.resource_id}`,
    eventType,
    homeTeamId: attributes.hteam_id || undefined,
    visitingTeamId: attributes.vteam_id || undefined,
    description: attributes.best_description || undefined,
    category,
    raw: event,
    variants: [],
  };
}

/**
 * Deduplicate events that occur at the same time/rink
 * Automatically groups any events with matching start/end/rink
 */
function deduplicateEvents(
  events: CalendarEvent[],
  teams: Map<number, Team | null>,
): CalendarEvent[] {
  // Group events by: start time + end time + resource
  const groupKey = (event: CalendarEvent) => {
    return `${event.start.getTime()}-${event.end.getTime()}-${event.resourceId}`;
  };

  const eventGroups = new Map<string, CalendarEvent[]>();

  // Group all events by time/rink
  for (const event of events) {
    const key = groupKey(event);
    if (!eventGroups.has(key)) eventGroups.set(key, []);
    eventGroups.get(key)!.push(event);
  }

  // Process groups - deduplicate if multiple events at same time/rink
  const result: CalendarEvent[] = [];

  for (const [key, groupEvents] of eventGroups) {
    if (groupEvents.length === 0) continue;

    if (groupEvents.length > 1) {
      // Multiple events at same time/rink - deduplicate them
      const variants: CalendarEvent[] = groupEvents;

      // Use the first event as the base
      const firstEvent = groupEvents[0];

      // Get all team names for finding common prefix
      const teamNames = groupEvents
        .map((e) => {
          const team = teams.get(e.homeTeamId!);
          return getTeamName(team);
        })
        .filter(Boolean);

      // Find longest common prefix of all team names
      const findCommonPrefix = (names: string[]): string => {
        if (names.length === 0) return "Event";
        if (names.length === 1) return names[0];

        let prefix = names[0];
        for (let i = 1; i < names.length; i++) {
          while (names[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1);
            if (prefix === "") return names[0];
          }
        }

        // Trim trailing separators like " - ", " – ", etc.
        return prefix.replace(/\s*[-–—]\s*$/, "").trim();
      };

      const baseName = findCommonPrefix(teamNames);

      // Add count if multiple variants
      const title =
        variants.length > 1
          ? `${baseName} (+${variants.length - 1} other${variants.length > 2 ? "s" : ""})`
          : baseName;

      const dedupedEvent: CalendarEvent = {
        ...firstEvent,
        id: `dedup-${key}`,
        title,
        variants,
        isDeduplicated: true,
      };

      result.push(dedupedEvent);
    } else {
      // Single event - add as-is
      result.push(groupEvents[0]);
    }
  }

  return result;
}

/**
 * Get date range based on view
 */
function getDateRange(date: Date, view: View): Date[] {
  if (view === "day" || view === "agenda") {
    return [date];
  }

  if (view === "week" || view === "work_week") {
    // Get the week containing this date (Sun-Sat)
    const day = date.getDay(); // 0 = Sunday
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() - day + i);
      dates.push(d);
    }
    return dates;
  }

  // For month view, get entire month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: Date[] = [];

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

/**
 * Cache for event data to avoid redundant fetches
 */
const eventsCache = new Map<string, Event[]>();

/**
 * Load events for a single date file
 */
async function loadEventsForDate(date: Date): Promise<Event[]> {
  const dateStr = format(date, "yyyy-MM-dd");

  // Check cache first
  if (eventsCache.has(dateStr)) {
    return eventsCache.get(dateStr)!;
  }

  const filePath = `/data/events/${dateStr}.json`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      // File doesn't exist, cache empty array
      eventsCache.set(dateStr, []);
      return [];
    }
    const events = await response.json();
    eventsCache.set(dateStr, events);
    return events;
  } catch (err) {
    console.warn(`No data available for ${dateStr}`);
    eventsCache.set(dateStr, []);
    return [];
  }
}

/**
 * Prefetch adjacent days in the background
 */
function prefetchAdjacentDays(date: Date, view: View) {
  if (view === "day") {
    // Prefetch yesterday and tomorrow
    const yesterday = new Date(date);
    yesterday.setDate(date.getDate() - 1);
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);

    loadEventsForDate(yesterday);
    loadEventsForDate(tomorrow);
  } else if (view === "week" || view === "work_week") {
    // Prefetch adjacent weeks
    const day = date.getDay();
    const prevWeekDate = new Date(date);
    prevWeekDate.setDate(date.getDate() - day - 7);
    const nextWeekDate = new Date(date);
    nextWeekDate.setDate(date.getDate() - day + 7);

    // Prefetch all days in previous and next weeks
    for (let i = 0; i < 7; i++) {
      const prevDay = new Date(prevWeekDate);
      prevDay.setDate(prevWeekDate.getDate() + i);
      const nextDay = new Date(nextWeekDate);
      nextDay.setDate(nextWeekDate.getDate() + i);

      loadEventsForDate(prevDay);
      loadEventsForDate(nextDay);
    }
  }
}

/**
 * Load events for a date range with team data
 */
export function useEvents(date: Date, view: View = "day") {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // Get all dates we need to load
        const dates = getDateRange(date, view);

        // Load all date files in parallel
        const allEventsArrays = await Promise.all(dates.map(loadEventsForDate));
        const allEvents = allEventsArrays.flat();

        // Prefetch adjacent days in the background (don't await)
        prefetchAdjacentDays(date, view);

        // Filter to only NHL and Olympic rinks, exclude BLOCK events, and require home team
        const filteredData = allEvents.filter((event) => {
          const { resource_id, event_type_id, hteam_id } = event.attributes;

          // Filter by rink
          const isCorrectRink =
            resource_id === RINK_IDS.NHL || resource_id === RINK_IDS.OLYMPIC;

          // Filter out BLOCK events
          const isNotBlock = event_type_id !== EVENT_TYPE_CODES.BLOCK;

          // filter out blacklist
          const isNotBlacklist = !BLACKLIST_TEAM_IDS.some(
            (id) => id === hteam_id,
          );

          // Require home team ID
          const hasHomeTeam = hteam_id !== null && hteam_id !== 0;

          return isCorrectRink && isNotBlock && isNotBlacklist && hasHomeTeam;
        });

        // Extract all team IDs from events
        const teamIds = new Set<number>();
        for (const event of filteredData) {
          if (event.attributes.hteam_id) teamIds.add(event.attributes.hteam_id);
          if (event.attributes.vteam_id) teamIds.add(event.attributes.vteam_id);
        }

        // Load all teams
        const teams = await loadTeams(Array.from(teamIds));

        // Transform events with team data
        const calendarEvents = filteredData.map((event) =>
          transformEvent(event, teams),
        );

        // Deduplicate events
        const dedupedEvents = deduplicateEvents(calendarEvents, teams);

        setEvents(dedupedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err as Error);
        setEvents([]);
        setLoading(false);
      }
    })();
  }, [date, view]);

  return { events, loading, error };
}
