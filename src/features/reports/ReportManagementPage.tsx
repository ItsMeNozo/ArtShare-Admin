import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react'; // Import useMemo
import { useLocation } from 'react-router-dom';
import ReportDetailDialog from './components/ReportDetailDialog';
import ResolveReportDialog from './components/ResolveReportDialog ';
import {
  useGetAllReports,
  useResolveReport,
  useUpdateReportStatus,
} from './hooks/useReports';
import { type Report, type ReportStatus } from './reportAPI'; // Assuming these are in reportAPI.ts

// Define styles for status chips (can be moved to a utils file)
export const statusDisplayInfo: Record<
  ReportStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'error' }
> = {
  RESOLVED: { label: 'Resolved', color: 'success' },
  PENDING: { label: 'Pending', color: 'warning' },
  DISMISSED: { label: 'Dismissed', color: 'default' }, // 'default' is often greyish
};

const ReportManagementPage: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const location = useLocation();

  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>(''); // '' for 'All'

  const {
    data: reports,
    isLoading,
    isError,
    error,
  } = useGetAllReports({
    // If your hook supports backend filtering by status, pass it here:
    // status: statusFilter || undefined,
  });
  const {
    mutate: resolveReport,
    isPending: isResolving,
    error: resolveError,
  } = useResolveReport();
  const { mutate: updateReportStatus, isPending: isUpdateReportLoading } =
    useUpdateReportStatus();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (location.state?.report_id) {
      const reportId = location.state.report_id;

      setActiveReport(
        reports?.find((report) => report.id === reportId) || null,
      );
      setActiveReportId(reportId);
      setDrawerOpen(true);
    }
  }, [location.state]);

  const handleView = (r: Report) => {
    setActiveReport(r);
    setDrawerOpen(true);
  };

  const handleStatusFilterChange = (
    event: SelectChangeEvent<ReportStatus | ''>,
  ) => {
    setStatusFilter(event.target.value as ReportStatus | '');
  };

  const filteredReports = useMemo(() => {
    let processedReports = reports ?? [];

    // Filter by search term
    if (search) {
      const term = search.toLowerCase();
      processedReports = processedReports.filter(
        (r) =>
          r.reporter.username.toLowerCase().includes(term) ||
          r.reason.toLowerCase().includes(term),
      );
    }

    // Filter by status
    if (statusFilter) {
      processedReports = processedReports.filter(
        (r) => r.status === statusFilter,
      );
    }

    // You could add sorting here if needed, e.g., by date
    // processedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return processedReports;
  }, [reports, search, statusFilter]);

  if (isResolving || isUpdateReportLoading || isLoading) {
    return (
      <Box /* ... loading spinner ... */>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        m: 2,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : '#ffffff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Report Management
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Filter by Status"
              onChange={handleStatusFilterChange}
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#1f2937' : '#f9fafb',
                borderRadius: 2,
              }}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {(Object.keys(statusDisplayInfo) as ReportStatus[]).map(
                (statusKey) => (
                  <MenuItem key={statusKey} value={statusKey}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor:
                            statusKey === 'RESOLVED'
                              ? theme.palette.success.main
                              : statusKey === 'PENDING'
                                ? theme.palette.warning.main
                                : statusKey === 'DISMISSED'
                                  ? theme.palette.grey[500]
                                  : theme.palette.grey[500],
                        }}
                      />
                      {statusDisplayInfo[statusKey].label}
                    </Box>
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <TextField
            size="small"
            variant="outlined"
            placeholder="Search Reporter/Reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: 300, // Increased from 180 to make it larger
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1f2937' : '#f9fafb',
              borderRadius: 2,
              '& input': { px: 1.5, py: 1 },
            }}
            slotProps={{
              input: { sx: { fontSize: 14 } },
            }}
          />
        </Box>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || 'An unknown error occurred'}
        </Alert>
      )}

      <TableContainer sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 700 }} aria-label="reports table">
          {' '}
          {/* Adjusted minWidth slightly */}
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark' ? '#333' : 'grey.200',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Reporter</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>
                Reason
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', width: '120px', textAlign: 'center' }}
              >
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  width: '1%', // For shrink-to-fit
                  whiteSpace: 'nowrap',
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.reporter.username}</TableCell>
                <TableCell>{r.targetType}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 250, // Or adjust based on your layout needs
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={r.reason} // Show full reason on hover
                  >
                    {r.reason}
                  </Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip
                    label={statusDisplayInfo[r.status]?.label || r.status}
                    color={statusDisplayInfo[r.status]?.color || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(r.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    padding: '8px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => handleView(r)}
                    >
                      View
                    </Button>
                    {r.status !== 'DISMISSED' && r.status !== 'RESOLVED' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setActiveReportId(r.id);
                          setActiveReport(r); // Also set activeReport for ResolveReportDialog
                          setDialogOpen(true);
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredReports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {' '}
                  {/* Adjusted colSpan */}
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ResolveReportDialog
        report={activeReport} // Pass the full report object
        open={dialogOpen}
        initialDate={new Date()}
        isSubmitting={isResolving}
        error={resolveError?.message}
        onCancel={() => setDialogOpen(false)}
        onConfirm={({ resolveDate, comment }) => {
          if (activeReportId == null) {
            alert('Error: Report ID is missing.'); // More user-friendly error
            return;
          }
          resolveReport(
            {
              reportId: activeReportId,
              resolveReportDTO: { resolveDate, resolutionComment: comment },
            },
            {
              onSuccess: () => {
                setDialogOpen(false);
                setDrawerOpen(false); // Close detail drawer if open
                queryClient.invalidateQueries({ queryKey: ['reports', 'all'] });
              },
            },
          );
        }}
      />
      <ReportDetailDialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        report={activeReport}
        onResolve={() => {
          // Ensure activeReport is set before opening resolve dialog
          if (activeReport) {
            setActiveReportId(activeReport.id);
            setDialogOpen(true);
          }
        }}
        onDismiss={(id) =>
          updateReportStatus(
            { reportId: id, status: 'DISMISSED' },
            {
              onSuccess: () => {
                setDrawerOpen(false);
                queryClient.invalidateQueries({ queryKey: ['reports', 'all'] });
              },
              onError: (err) => {
                alert(err.message);
              },
            },
          )
        }
        onViewContent={(r) => {
          window.open(r.targetUrl, '_blank', 'noopener,noreferrer');
        }}
      />
    </Paper>
  );
};

export default ReportManagementPage;
