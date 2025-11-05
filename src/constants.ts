/**
 * Resource IDs for ice rinks at Sharks Ice
 */
export const RINK_IDS = {
  NHL: 24, // NHL-sized rink (200ft x 85ft)
  OLYMPIC: 25, // Olympic-sized rink (200ft x 100ft)
  UNKNOWN: 29, // Unknown resource
  TRAINING: 62, // Training/studio area with subdivisions
} as const;

export const BLACKLIST_TEAM_IDS = [8644, 9192] as const;

/**
 * Resource names mapped to IDs
 */
export const RINK_NAMES: Record<number, string> = {
  [RINK_IDS.NHL]: "NHL",
  [RINK_IDS.OLYMPIC]: "OLY",
  [RINK_IDS.UNKNOWN]: "Unknown",
  [RINK_IDS.TRAINING]: "Training Area",
};

/**
 * Event type codes from the API
 */
export const EVENT_TYPE_CODES = {
  GAME: "g", // Hockey games (home vs visiting team)
  SESSION: "k", // Practice/skating sessions
  LESSON: "L", // Lessons (typically filtered out)
  BLOCK: "b", // Lessons (typically filtered out)
} as const;

/**
 * Event type display names
 */
export const EVENT_TYPE_NAMES: Record<string, string> = {
  [EVENT_TYPE_CODES.GAME]: "Game",
  [EVENT_TYPE_CODES.SESSION]: "Session",
  [EVENT_TYPE_CODES.LESSON]: "Lesson",
};
