import { addDays } from 'date-fns';
import { formatDate, fetchDayData } from './utils';

/**
 * Fetch data for:
 * - today + 1 (tomorrow) - refresh in case of updates
 * - today + 2 (day after tomorrow) - refresh in case of updates
 * - today + 14 days (2 weeks ahead)
 */
async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysToFetch = [1, 2, 14];
  const dates = daysToFetch.map((days) => ({
    date: addDays(today, days),
    label: `today + ${days} day${days === 1 ? '' : 's'}`,
  }));

  console.log('=== Nightly Data Fetch ===');
  console.log(`Today: ${formatDate(today)}`);
  console.log(`Fetching: ${dates.map((d) => formatDate(d.date)).join(', ')}\n`);

  const results: { date: Date; label: string; success: boolean }[] = [];

  for (const { date, label } of dates) {
    try {
      await fetchDayData(date);
      console.log(`✓ Successfully fetched ${formatDate(date)} (${label})`);
      results.push({ date, label, success: true });
    } catch (error) {
      console.error(`❌ Failed to fetch ${formatDate(date)} (${label})`);
      results.push({ date, label, success: false });
    }
  }

  console.log('\n=== Done ===');
  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.error(`Failed: ${failed.map((r) => formatDate(r.date)).join(', ')}`);
    process.exit(1);
  }
}

main();
