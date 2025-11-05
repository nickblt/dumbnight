import { writeFileSync, mkdirSync } from 'fs';
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
