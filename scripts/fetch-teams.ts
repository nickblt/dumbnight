import { existsSync } from 'fs';
import { fetchTeam } from './lib/teams';
import { getDataPath, saveJsonToFile } from './utils';

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
 * CLI wrapper for fetching teams
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx fetch-teams.ts <team_id> [team_id2] [team_id3] ...');
    console.error('Example: tsx fetch-teams.ts 9187 9188 9189');
    console.error('Example: tsx fetch-teams.ts --force 9187  (re-fetch even if exists)');
    process.exit(1);
  }

  // Check for --force flag
  const forceRefetch = args.includes('--force');
  const teamIds = args.filter(arg => arg !== '--force');

  if (teamIds.length === 0) {
    console.error('Error: No team IDs provided');
    process.exit(1);
  }

  console.log('=== Fetching Teams ===');
  if (forceRefetch) {
    console.log('(Force refetch enabled - will overwrite existing files)\n');
  } else {
    console.log('(Skipping teams that already exist - use --force to override)\n');
  }

  // Filter out teams that already exist (unless force flag is set)
  const missingTeamIds = forceRefetch
    ? teamIds
    : teamIds.filter(id => !teamFileExists(id));

  const skipped = teamIds.length - missingTeamIds.length;

  if (missingTeamIds.length === 0) {
    console.log('All teams already cached');
    console.log('\n=== Summary ===');
    console.log(`Fetched: 0`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: 0`);
    console.log('\n✓ Done');
    return;
  }

  console.log(`Fetching ${missingTeamIds.length} ${forceRefetch ? '' : 'missing '}teams...\n`);

  let fetched = 0;
  let failed = 0;

  for (const teamId of missingTeamIds) {
    try {
      console.log(`Team ${teamId}:`);
      console.log(`  Fetching team ${teamId}...`);

      const teamData = await fetchTeam(teamId);

      if (teamData === null) {
        console.warn(`  Team ${teamId} not found (404) - may be deleted or invalid`);
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

  console.log('=== Summary ===');
  console.log(`Fetched: ${fetched}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);

  // Exit with error if any failures
  if (failed > 0) {
    console.error('\n⚠️  Some teams failed to fetch');
    process.exit(1);
  }

  console.log('\n✓ Done');
}

main();
