/**
 * Defines the shape of the query parameters for paginated API endpoints.
 * All properties are optional.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  filter?: string;
}
