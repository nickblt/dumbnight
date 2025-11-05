import { API_BASE_URL, COMPANY, FACILITY_ID } from '../constants';
import {
  formatDate,
  formatDateTimeForAPI,
  handleAxiosError,
} from '../utils';
import { httpClient } from './http';

interface EventsResponse {
  data: any[];
  meta: {
    page: {
      'current-page': number;
      'per-page': number;
      from: number;
      to: number;
      total: number;
      'last-page': number;
    };
  };
  links: {
    first?: string;
    next?: string;
    last?: string;
  };
}

/**
 * Fetch all events for a single day with pagination
 */
export async function fetchEventsForDay(date: Date): Promise<any[]> {
  const dateStr = formatDate(date);
  const startDateTime = formatDateTimeForAPI(date, '00:00:00');
  const endDateTime = formatDateTimeForAPI(date, '23:59:59');

  console.log(`Fetching events for ${dateStr}...`);

  const allEvents: any[] = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const params = new URLSearchParams({
        'page[size]': '25',
        'page[number]': currentPage.toString(),
        'sort': 'start',
        'company': COMPANY,
        'filter[start__gte]': startDateTime,
        'filter[start__lte]': endDateTime,
        'filter[resource.facility.id]': FACILITY_ID,
      });

      const url = `${API_BASE_URL}/events?${params.toString()}`;

      console.log(`  Fetching page ${currentPage}...`);

      const response = await httpClient.get<EventsResponse>(url);
      const { data, meta, links } = response.data;

      allEvents.push(...data);

      console.log(`  Page ${currentPage}: ${data.length} events (${allEvents.length}/${meta.page.total} total)`);

      // Check if there's a next page
      if (links.next && currentPage < meta.page['last-page']) {
        currentPage++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      handleAxiosError(error, `Failed to fetch page ${currentPage} for ${dateStr}`);
    }
  }

  console.log(`✓ Fetched ${allEvents.length} total events for ${dateStr}`);
  return allEvents;
}

/**
 * Extract unique team IDs from events
 */
export function extractTeamIds(events: any[]): string[] {
  const teamIds = new Set<string>();

  for (const event of events) {
    const { hteam_id, vteam_id } = event.attributes;

    if (hteam_id && hteam_id !== 0) {
      teamIds.add(hteam_id.toString());
    }

    if (vteam_id && vteam_id !== 0) {
      teamIds.add(vteam_id.toString());
    }
  }

  return Array.from(teamIds).sort();
}
