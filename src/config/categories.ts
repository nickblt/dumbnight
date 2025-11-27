/**
 * Event categorization for filtering
 *
 * Categories are determined by team name patterns and event types.
 */

import type { Event, Team } from "../types/api";

export type EventCategory =
  | "adult-league-game"
  | "bears"
  | "gretzky-hour"
  | "public-skate"
  | "drop-in"
  | "figure-skating"
  | "private-hockey-lessons"
  | "other";

export interface CategoryConfig {
  id: EventCategory;
  name: string;
  canRegister: boolean;
  color?: string;
  sportsId?: number;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "adult-league-game",
    name: "Adult League Games",
    canRegister: false,
    color: "#f8cc1b",
  },
  {
    id: "bears",
    name: "Bears (Youth Hockey)",
    canRegister: false,
    color: "#fa7a48",
  },
  {
    id: "gretzky-hour",
    name: "Gretzky Hour",
    canRegister: true,
    sportsId: 32,
    color: "#442276",
  },
  {
    id: "public-skate",
    name: "Public Skate",
    canRegister: true,
    sportsId: 31,
    color: "#84a2cd",
  },
  {
    id: "drop-in",
    name: "Drop-In Sessions",
    canRegister: true,
    sportsId: 20,
    color: "#bed057",
  },
  {
    id: "figure-skating",
    name: "Figure Skating",
    canRegister: true,
    sportsId: 27,
    color: "#4777cd",
  },
  {
    id: "private-hockey-lessons",
    name: "Private Hockey Lessons",
    canRegister: false,
    color: "#ffa5c8",
  },
  {
    id: "other",
    name: "Other",
    canRegister: true,
    color: "#ab0a58",
  },
];

/**
 * Categorize an event based on team name and event type
 */
export function categorizeEvent(
  event: Event,
  homeTeam: Team | null | undefined,
): EventCategory {
  const { attributes } = event;
  const homeTeamName = homeTeam?.attributes.name;
  const hasVisitingTeam = !!attributes.vteam_id;

  // No team name
  if (!homeTeamName) {
    return "other";
  }

  // Adult League Games - type "g" with visiting team
  if (attributes.event_type_id === "g" && hasVisitingTeam) {
    return "adult-league-game";
  }

  // Team name pattern matching
  if (homeTeamName.includes("Bears") && !hasVisitingTeam) {
    return "bears";
  }

  if (homeTeamName.includes("OIC - PHL")) {
    return "private-hockey-lessons";
  }

  if (homeTeamName.includes("Gretzky Hour")) {
    return "gretzky-hour";
  }

  if (homeTeamName.includes("Public Skate")) {
    return "public-skate";
  }

  if (homeTeamName.includes("Drop-In") || homeTeamName.includes("Drop In")) {
    return "drop-in";
  }

  if (
    homeTeamName.includes("Freestyle") ||
    homeTeamName.includes("Figure Skating")
  ) {
    return "figure-skating";
  }

  return "other";
}

/**
 * Get category config by ID
 */
export function getCategoryConfig(categoryId: EventCategory): CategoryConfig {
  return (
    CATEGORIES.find((c) => c.id === categoryId) ||
    CATEGORIES[CATEGORIES.length - 1]
  );
}
