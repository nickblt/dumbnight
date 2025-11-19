import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { isHttpError } from './lib/http';

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

/**
 * Save JSON data to a file with pretty formatting
 */
export function saveJsonToFile(filePath: string, data: any): void {
  try {
    // Ensure parent directory exists
    const dir = join(filePath, '..');
    ensureDirectoryExists(dir);

    // Write file with pretty formatting
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to save file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Handle HTTP errors with better logging
 */
export function handleAxiosError(error: unknown, context: string): never {
  if (isHttpError(error)) {
    console.error(`${context}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  } else {
    console.error(`Unexpected error ${context}:`, error);
  }
  throw error;
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date for API query (YYYY-MM-DD HH:MM:SS)
 */
export function formatDateTimeForAPI(date: Date, time: string): string {
  return `${formatDate(date)} ${time}`;
}

/**
 * Parse and validate a date string
 */
export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

/**
 * Get the path to the public data directory
 */
export function getDataPath(...segments: string[]): string {
  return join(process.cwd(), 'public', 'data', ...segments);
}

/**
 * Check if team file already exists
 */
export function teamFileExists(teamId: string): boolean {
  const filePath = getDataPath('teams', `${teamId}.json`);
  return existsSync(filePath);
}

/**
 * Save events to file
 */
export function saveEventsToFile(date: Date, events: any[]): void {
  const dateStr = formatDate(date);
  const outputPath = getDataPath('events', `${dateStr}.json`);

  saveJsonToFile(outputPath, events);
  console.log(`✓ Saved to ${outputPath}`);
}

/**
 * Save team to file
 */
export function saveTeamToFile(teamId: string, teamData: any): void {
  const outputPath = getDataPath('teams', `${teamId}.json`);
  saveJsonToFile(outputPath, teamData);
  console.log(`  ✓ Saved to ${outputPath}`);
}

/**
 * Fetch all data (events + teams) for a single day
 */
export async function fetchDayData(
  date: Date,
  options: { verbose?: boolean } = {}
): Promise<void> {
  const { fetchEventsForDay, extractTeamIds } = await import('./lib/events');
  const { fetchTeam } = await import('./lib/teams');
  const { verbose = true } = options;

  const dateStr = formatDate(date);
  if (verbose) {
    console.log(`\n=== Fetching ${dateStr} ===\n`);
  }

  // Fetch events
  const events = await fetchEventsForDay(date);

  // Save events to file
  saveEventsToFile(date, events);

  // Extract team IDs from events
  const teamIds = extractTeamIds(events);

  if (teamIds.length === 0) {
    if (verbose) {
      console.log('No teams found in events');
    }
    return;
  }

  if (verbose) {
    console.log(`\nFound ${teamIds.length} unique teams in events`);
  }

  // Filter out teams that already exist
  const missingTeamIds = teamIds.filter(id => !teamFileExists(id));

  if (missingTeamIds.length === 0) {
    if (verbose) {
      console.log('All teams already cached');
      console.log(`Already cached: ${teamIds.length}`);
    }
    return;
  }

  if (verbose) {
    console.log(`Fetching ${missingTeamIds.length} missing teams...\n`);
  }

  let fetched = 0;
  let failed = 0;

  for (const teamId of missingTeamIds) {
    try {
      if (verbose) {
        console.log(`Team ${teamId}:`);
        console.log(`  Fetching team ${teamId}...`);
      }

      const teamData = await fetchTeam(teamId);

      if (teamData === null) {
        console.warn(`  Team ${teamId} not found (404)`);
        failed++;
        continue;
      }

      if (verbose) {
        console.log(`  ✓ Fetched team ${teamId}`);
      }
      saveTeamToFile(teamId, teamData);
      fetched++;

      if (verbose) {
        console.log('');
      }
    } catch (error) {
      console.error(`  ❌ Failed to fetch team ${teamId}`);
      failed++;
    }
  }

  if (verbose) {
    console.log('=== Team Summary ===');
    console.log(`Already cached: ${teamIds.length - missingTeamIds.length}`);
    console.log(`Newly fetched: ${fetched}`);
    console.log(`Failed: ${failed}`);
  }

  if (failed > 0) {
    throw new Error(`Failed to fetch ${failed} team(s)`);
  }
}
