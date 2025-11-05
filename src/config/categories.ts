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
    color: "#3b82f6", // blue
  },
  {
    id: "bears",
    name: "Bears (Youth Hockey)",
    canRegister: false,
    color: "#ef4444", // red
  },
  {
    id: "gretzky-hour",
    name: "Gretzky Hour",
    canRegister: true,
    sportsId: 32,
    color: "#f59e0b", // amber
  },
  {
    id: "public-skate",
    name: "Public Skate",
    canRegister: true,
    sportsId: 31,
    color: "#10b981", // green
  },
  {
    id: "drop-in",
    name: "Drop-In Sessions",
    canRegister: true,
    sportsId: 20,
    color: "#8b5cf6", // purple
  },
  {
    id: "figure-skating",
    name: "Figure Skating",
    canRegister: true,
    sportsId: 27,
    color: "#ec4899", // pink
  },
  {
    id: "other",
    name: "Other",
    canRegister: true,
    color: "#6b7280", // gray
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
