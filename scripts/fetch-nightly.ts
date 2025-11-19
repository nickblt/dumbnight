import { addDays } from 'date-fns';
import { formatDate, fetchDayData } from './utils';

/**
 * Fetch data for today + 14 days (single day, 2 weeks ahead)
 */
async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = addDays(today, 14);

  console.log('=== Nightly Data Fetch ===');
  console.log(`Today: ${formatDate(today)}`);
  console.log(`Fetching: ${formatDate(targetDate)} (today + 14 days)\n`);

  try {
    await fetchDayData(targetDate);
    console.log('\n=== Done ===');
    console.log(`✓ Successfully fetched ${formatDate(targetDate)}`);
  } catch (error) {
    console.error(`\n❌ Failed to fetch ${formatDate(targetDate)}`);
    process.exit(1);
  }
}

main();
