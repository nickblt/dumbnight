/**
 * API Response Types for DaySmart Recreation API
 */

export interface EventAttributes {
  repeat_id: number;
  resource_id: number;
  resource_area_id: number;
  desc: string;
  event_type_id: string; // "g" (game), "k" (session/practice), "L" (lesson)
  sub_type: string;
  start: string; // ISO datetime string (local time)
  start_gmt: string; // ISO datetime string (GMT)
  end: string; // ISO datetime string (local time)
  end_gmt: string; // ISO datetime string (GMT)
  customer_id: number;
  hteam_id: number | null; // Home team ID
  vteam_id: number | null; // Visiting team ID
  league_id: number | null;
  home_score: number | null;
  visiting_score: number | null;
  publish: boolean;
  outcome: string;
  register_capacity: number;
  create_u: string;
  created_user_type: string;
  create_d: string;
  mod_u: string;
  last_modified_user_type: string;
  mod_d: string;
  is_overtime: boolean;
  booking_id: number | null;
  description: string | null;
  notice: string | null;
  last_resource_id: number | null;
  parent_event_id: number | null;
  has_gender_locker_rooms: number;
  locker_room_type: string | null;
  includes_setup_time: boolean;
  includes_takedown_time: boolean;
  start_date: string;
  event_start_time: string;
  best_description: string | null;
}

export interface Event {
  type: "events";
  id: string;
  attributes: EventAttributes;
  relationships?: Record<string, any>; // Optional: removed in optimized files
  links?: {
    self: string;
  }; // Optional: removed in optimized files
}

export interface TeamAttributes {
  name: string;
  short_name?: string;
  level?: string;
  gender?: string;
  age_group?: string;
  [key: string]: any; // Allow other fields we might not know about
}

export interface Team {
  type: "teams";
  id: string;
  attributes: TeamAttributes;
  relationships?: Record<string, any>;
  links?: {
    self: string;
  };
}

/**
 * Calendar-specific event type
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: number;
  resourceName: string;
  eventType: "game" | "session" | "lesson" | "other";
  homeTeamId?: number;
  visitingTeamId?: number;
  description?: string;
  raw: Event; // Keep reference to original event
  variants: CalendarEvent[]; // For deduplicated events - array of all variant events
  isDeduplicated?: boolean; // True if this event represents multiple events
  category?: string; // Event category for filtering (adult-league-game, bears, etc.)
}
