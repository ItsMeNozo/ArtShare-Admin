import api from "../../api/baseApi";

export enum ReportTargetType {
  POST = "POST",
  BLOG = "BLOG",
  COMMENT = "COMMENT",
  USER = "USER",
}

export interface CreateReportDto {
  targetId: number;
  targetType: ReportTargetType;
  reason: string;
}

export enum ViewTab {
  ALL = "all",
  USER = "user",
  POST = "post",
  BLOG = "blog",
  COMMENT = "comment",
}

/**
 * Payload for fetching reports by tab.
 */
export interface ViewReportsDto {
  tab?: ViewTab;
  skip?: number;
  take?: number;
}

/**
 * A user summary included on each report.
 */
interface UserSnippet {
  // Helper type for user info
  id: string;
  username: string;
}

export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";

/**
 * Representation of a report returned by the API.
 */
export interface Report {
  id: number;
  reporterId: string;
  moderatorId?: string;
  moderator?: UserSnippet | null;
  targetId: number;
  targetType: ReportTargetType;
  reason: string;
  status: ReportStatus;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  resolutionComment?: string;
  reporter: UserSnippet;
  targetUrl?: string;
}

/**
 * Submit a new report.
 */
export async function submitReport(
  dto: CreateReportDto,
): Promise<{ message: string; reportId: number }> {
  const response = await api.post<{ message: string; reportId: number }>(
    "/reports",
    dto,
  );
  return response.data;
}

export async function getPendingReports(
  skip?: number,
  take?: number,
): Promise<Report[]> {
  const response = await api.get<Report[]>("/reports/pending", {
    params: { skip, take },
  });
  return response.data;
}

/**
 * Fetch reports filtered by tab (all, user, post, blog, comment).
 */
export async function viewReports(dto: ViewReportsDto): Promise<Report[]> {
  const response = await api.post<Report[]>("/reports/view", dto);
  return response.data;
}

export async function updateReportStatus(
  reportId: number,
  status: string,
): Promise<Report> {
  const resp = await api.patch<Report>(`/reports/${reportId}/status`, {
    status,
  });
  return resp.data;
}

export interface ResolveReportDto {
  resolveDate: string;
  resolutionComment?: string;
}

export async function resolveReport(
  reportId: number,
  dto: ResolveReportDto,
): Promise<Report> {
  const response = await api.patch<Report>(`/reports/${reportId}/resolve`, dto);
  return response.data;
}
