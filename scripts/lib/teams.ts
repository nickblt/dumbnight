import { API_BASE_URL, COMPANY } from '../constants';
import { httpClient, isHttpError } from './http';

interface TeamResponse {
  data: any;
}

/**
 * Fetch a single team by ID from the API
 */
export async function fetchTeam(teamId: string): Promise<any | null> {
  try {
    const params = new URLSearchParams({
      company: COMPANY,
    });

    const url = `${API_BASE_URL}/teams/${teamId}?${params.toString()}`;

    const response = await httpClient.get<TeamResponse>(url);
    return response.data.data;
  } catch (error) {
    if (isHttpError(error)) {
      if (error.response?.status === 404) {
        return null;
      }
    }
    throw error;
  }
}

/**
 * Fetch multiple teams from the API
 * Returns map of teamId -> team data (or null if not found)
 */
export async function fetchMultipleTeams(
  teamIds: string[]
): Promise<Map<string, any | null>> {
  const results = new Map<string, any | null>();

  for (const teamId of teamIds) {
    try {
      const teamData = await fetchTeam(teamId);
      results.set(teamId, teamData);
    } catch (error) {
      // Re-throw for unexpected errors (not 404)
      throw error;
    }
  }

  return results;
}
