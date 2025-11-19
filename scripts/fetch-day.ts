import { parseDate, fetchDayData } from './utils';

/**
 * CLI wrapper for fetching a single day's data (events + teams)
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

    // Fetch all data for the day
    await fetchDayData(date);

    console.log('\n=== Done ===');
  } catch (error) {
    console.error(`\n❌ Failed to process ${dateStr}\n`);
    process.exit(1);
  }
}

main();
