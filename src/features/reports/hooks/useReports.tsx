import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPendingReports,
  Report,
  resolveReport,
  ResolveReportDto,
  updateReportStatus,
  viewReports,
  ViewReportsDto,
} from '../reportAPI';

export function usePendingReports() {
  return useQuery<Report[], Error>({
    queryKey: ['reports', 'all'],
    queryFn: () => {
      return getPendingReports();
    },
  });
}

export function useGetAllReports(viewReportDTO: ViewReportsDto) {
  return useQuery<Report[], Error>({
    queryKey: ['reports', 'all', viewReportDTO],
    queryFn: ({ queryKey }) => {
      const [, , dto] = queryKey as [string, string, ViewReportsDto];
      return viewReports(dto);
    },
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      resolveReportDTO,
    }: {
      reportId: number;
      resolveReportDTO: ResolveReportDto;
    }) => resolveReport(reportId, resolveReportDTO),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'all'] });
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: number; status: string }) =>
      updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'all'] });
    },
  });
}
