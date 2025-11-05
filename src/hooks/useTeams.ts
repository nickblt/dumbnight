import { useState, useEffect } from "preact/hooks";
import type { Team } from "../types/api";

/**
 * Cache for team data to avoid redundant fetches
 */
const teamCache = new Map<string, Team | null>();

/**
 * Load team data from cache file
 */
async function loadTeam(teamId: number): Promise<Team | null> {
  const teamIdStr = teamId.toString();

  // Check cache first
  if (teamCache.has(teamIdStr)) {
    return teamCache.get(teamIdStr) || null;
  }

  try {
    const response = await fetch(`/data/teams/${teamIdStr}.json`);
    if (!response.ok) {
      console.warn(`Team ${teamId} not found in cache`);
      teamCache.set(teamIdStr, null);
      return null;
    }

    const teamData: Team = await response.json();
    teamCache.set(teamIdStr, teamData);
    return teamData;
  } catch (error) {
    console.error(`Error loading team ${teamId}:`, error);
    teamCache.set(teamIdStr, null);
    return null;
  }
}

/**
 * Load multiple teams and return a map
 */
export async function loadTeams(
  teamIds: number[],
): Promise<Map<number, Team | null>> {
  const results = new Map<number, Team | null>();

  // Load all teams in parallel
  await Promise.all(
    teamIds.map(async (teamId) => {
      const team = await loadTeam(teamId);
      results.set(teamId, team);
    }),
  );

  return results;
}

/**
 * Hook to load teams for a set of team IDs
 */
export function useTeams(teamIds: number[]) {
  const [teams, setTeams] = useState<Map<number, Team | null>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamIds.length === 0) {
      setTeams(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    loadTeams(teamIds)
      .then((teamsMap) => {
        setTeams(teamsMap);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading teams:", error);
        setLoading(false);
      });
  }, [teamIds.join(",")]);

  return { teams, loading };
}

/**
 * Get team display name
 */
export function getTeamName(team: Team | null | undefined): string {
  if (!team) return "Unknown Team";

  const { attributes: attrs } = team;

  // Try different name fields in order of preference
  let name = attrs.name || attrs.short_name || `Team ${team.id}`;

  // Strip out "OIC - " prefix if it exists
  if (name.startsWith("OIC - ")) {
    name = name.substring(6);
  }

  return name;
}
