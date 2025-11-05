/**
 * API Configuration Constants
 */

export const API_BASE_URL = 'https://apps.daysmartrecreation.com/dash/jsonapi/api/v1';
export const COMPANY = 'sharks';
export const FACILITY_ID = '3';

/**
 * Resource IDs (Ice Rinks)
 */
export const RESOURCES = {
  NHL_RINK: '24',      // NHL-sized rink (200ft x 85ft)
  OLYMPIC_RINK: '25',  // Olympic-sized rink (200ft x 100ft)
} as const;

/**
 * Event Type Codes
 */
export const EVENT_TYPES = {
  GAME: 'g',
  SESSION: 'k',
  LESSON: 'L',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  PAGE_SIZE: 25,
  MAX_PAGES: 100, // Safety limit
} as const;
