import axios, { AxiosError } from "axios";

/**
 * Configured axios instance with custom User-Agent
 */
export const httpClient = axios.create({
  headers: {
    "User-Agent":
      "BLTs Oakland Ice Calendar Bot hosted: https://dumbnight.blt.fi/ email: nick@blt.fi I only run once a day and I hope I am not spammy against your public endpoints.",
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Rate limiting: Track last request time and enforce minimum delay between requests
 */
let lastRequestTime = 0;
const MIN_DELAY_MS = 1000;

httpClient.interceptors.request.use(async (config) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  // Only delay if this isn't the first request and we're too soon after the last one
  if (lastRequestTime > 0 && timeSinceLastRequest < MIN_DELAY_MS) {
    const delayNeeded = MIN_DELAY_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delayNeeded));
  }

  lastRequestTime = Date.now();
  return config;
});

/**
 * Check if error is an HTTP error
 */
export function isHttpError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}
