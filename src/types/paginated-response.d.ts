// src/types/paginated-response.ts

/**
 * Defines the shape of a paginated API response.
 * It is a generic type, allowing it to wrap any kind of data array.
 * @template T The type of the items in the `data` array.
 */
export interface PaginatedResponse<T> {
  /** The array of data items for the current page. */
  data: T[];

  /** The total number of items available across all pages. */
  total: number;

  /** The current page number (1-indexed). */
  page: number;

  /** The number of items requested per page. */
  limit: number;

  /** The total number of pages, calculated from total and limit. */
  readonly totalPages: number;

  /** A boolean indicating if there is a next page available. */
  readonly hasNextPage: boolean;
}
