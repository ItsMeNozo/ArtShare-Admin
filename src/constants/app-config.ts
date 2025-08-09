/**
 * Application configuration constants
 */

// Cache configuration
export const CACHE_DURATION_MS =
  typeof import.meta.env.VITE_CACHE_DURATION_MS !== 'undefined'
    ? Number(import.meta.env.VITE_CACHE_DURATION_MS)
    : 5 * 60 * 1000; // 5 minutes default

// Image optimization configuration
export const INTERSECTION_OBSERVER_THRESHOLD = 0.1;
