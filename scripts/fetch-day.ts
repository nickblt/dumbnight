import { existsSync } from 'fs';
import { parseDate, formatDate, getDataPath, saveJsonToFile } from './utils';
import { fetchEventsForDay, extractTeamIds } from './lib/events';
import { fetchTeam } from './lib/teams';

/**
 * Save events to file
 */
function saveEventsToFile(date: Date, events: any[]): void {
  const dateStr = formatDate(date);
  const outputPath = getDataPath('events', `${dateStr}.json`);

  saveJsonToFile(outputPath, events);
  console.log(`✓ Saved to ${outputPath}`);
}

/**
 * Check if team file already exists
 */
function teamFileExists(teamId: string): boolean {
  const filePath = getDataPath('teams', `${teamId}.json`);
  return existsSync(filePath);
}

/**
 * Save team to file
 */
function saveTeamToFile(teamId: string, teamData: any): void {
  const outputPath = getDataPath('teams', `${teamId}.json`);
  saveJsonToFile(outputPath, teamData);
  console.log(`  ✓ Saved to ${outputPath}`);
}

/**
 * Fetch all data (events + teams) for a single day
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx fetch-day.ts <date>');
    console.error('Date format: YYYY-MM-DD');
    console.error('Example: tsx fetch-day.ts 2025-11-04');
    process.exit(1);
  }

  const dateStr = args[0];

  try {
    console.log('=== Fetching Day Data ===\n');

    // Parse and validate date
    const date = parseDate(dateStr);

    // Fetch events
    const events = await fetchEventsForDay(date);

    // Save events to file
    saveEventsToFile(date, events);

    // Extract team IDs from events
    const teamIds = extractTeamIds(events);

    if (teamIds.length === 0) {
      console.log('\nNo teams found in events');
      console.log('\n=== Done ===');
      return;
    }

    console.log(`\nFound ${teamIds.length} unique teams in events`);

    // Filter out teams that already exist
    const missingTeamIds = teamIds.filter(id => !teamFileExists(id));

    if (missingTeamIds.length === 0) {
      console.log('All teams already cached');
      console.log('\n=== Team Summary ===');
      console.log(`Already cached: ${teamIds.length}`);
      console.log(`Newly fetched: 0`);
      console.log(`Failed: 0`);
      console.log('\n=== Done ===');
      return;
    }

    console.log(`Fetching ${missingTeamIds.length} missing teams...\n`);

    let fetched = 0;
    let failed = 0;

    for (const teamId of missingTeamIds) {
      try {
        console.log(`Team ${teamId}:`);
        console.log(`  Fetching team ${teamId}...`);

        const teamData = await fetchTeam(teamId);

        if (teamData === null) {
          console.warn(`  Team ${teamId} not found (404)`);
          failed++;
          continue;
        }

        console.log(`  ✓ Fetched team ${teamId}`);
        saveTeamToFile(teamId, teamData);
        fetched++;

        console.log('');
      } catch (error) {
        console.error(`  ❌ Failed to fetch team ${teamId}`);
        failed++;
      }
    }

    console.log('=== Team Summary ===');
    console.log(`Already cached: ${teamIds.length - missingTeamIds.length}`);
    console.log(`Newly fetched: ${fetched}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
      throw new Error(`Failed to fetch ${failed} team(s)`);
    }

    console.log('\n=== Done ===');
  } catch (error) {
    console.error(`\n❌ Failed to process ${dateStr}\n`);
    process.exit(1);
  }
}

main();
