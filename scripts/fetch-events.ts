import { parseDate, saveEventsToFile } from './utils';
import { fetchEventsForDay } from './lib/events';

/**
 * CLI wrapper for fetching events
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx fetch-events.ts <date> [date2] [date3] ...');
    console.error('Date format: YYYY-MM-DD');
    console.error('Example: tsx fetch-events.ts 2025-11-04');
    console.error('Example: tsx fetch-events.ts 2025-11-04 2025-11-05 2025-11-06');
    process.exit(1);
  }

  console.log('=== Fetching Events ===\n');

  for (const dateStr of args) {
    try {
      // Parse and validate date
      const date = parseDate(dateStr);

      // Fetch events
      const events = await fetchEventsForDay(date);

      // Save to file
      saveEventsToFile(date, events);

      console.log('');
    } catch (error) {
      console.error(`\n❌ Failed to process ${dateStr}\n`);
      process.exit(1);
    }
  }

  console.log('=== Done ===');
}

main();
