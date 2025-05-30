// src/pages/ReportManagementPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Alert,
  useTheme,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  useGetAllReports,
  useResolveReport,
  useUpdateReportStatus,
} from './hooks/useReports';
import ResolveReportDialog from './components/ResolveReportDialog ';
import { type Report } from './reportAPI';
import ReportDetailDialog from './components/ReportDetailDialog';
import { useQueryClient } from '@tanstack/react-query';

const ReportManagementPage: React.FC = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: reports, isLoading, isError, error } = useGetAllReports({});
  const {
    mutate: resolveReport,
    isPending: isResolving,
    error: resolveError,
  } = useResolveReport();
  const { mutate: updateReportStatus, isPending: isUpdateReportLoading } =
    useUpdateReportStatus();

  // Dialog section
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleView = (r: Report) => {
    setActiveReport(r);
    setDrawerOpen(true);
  };

  // ② Filter by reporter username or reason
  const filtered = React.useMemo(
    () =>
      reports?.filter((r) => {
        const term = search.toLowerCase();
        return (
          r.reporter.username.toLowerCase().includes(term) ||
          r.reason.toLowerCase().includes(term)
        );
      }) ?? [],
    [reports, search],
  );

  if (isResolving || isUpdateReportLoading || isLoading) {
    return (
      <Box
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          inset: 0,
          backgroundColor: 'transparent',
        }}
      >
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

        <TextField
          size="small"
          variant="outlined"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 180,
            backgroundColor:
              theme.palette.mode === 'dark' ? '#1f2937' : '#f9fafb',
            borderRadius: 2,
            '& input': {
              px: 1.5,
              py: 1,
            },
          }}
          InputProps={{
            sx: { fontSize: 14 },
          }}
        />
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <TableContainer sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 650 }} aria-label="reports table">
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark' ? '#333' : 'grey.200',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Reporter</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.reporter.username}</TableCell>
                <TableCell>{r.target_type}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  {new Date(r.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell align="left" className="px-0">
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleView(r)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    style={{
                      visibility:
                        r.status === 'DISMISSED' || r.status === 'RESOLVED'
                          ? 'hidden'
                          : undefined,
                    }}
                    onClick={() => {
                      setActiveReportId(r.id);
                      setDialogOpen(true);
                    }}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ResolveReportDialog
        report={activeReport}
        open={dialogOpen}
        initialDate={new Date()}
        isSubmitting={isResolving}
        error={resolveError?.message}
        onCancel={() => setDialogOpen(false)}
        onConfirm={({ resolve_date, comment }) => {
          if (activeReportId != null) {
            resolveReport(
              {
                reportId: activeReportId,
                resolveReportDTO: { resolve_date, resolution_comment: comment },
              },
              {
                onSuccess: () => setDialogOpen(false),
              },
            );
          }
        }}
      />
      <ReportDetailDialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        report={activeReport}
        onResolve={() => {
          setActiveReportId(activeReport?.id || null);
          setDialogOpen(true);
        }}
        onDismiss={(id) =>
          updateReportStatus(
            { reportId: id, status: 'DISMISSED' },
            {
              onSuccess: () => {
                setDrawerOpen(false);
                setDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['reports', 'all'] });
                // showSnackBar('Report dismissed');
              },
              onError: (err) => {
                alert(err.message);
              },
            },
          )
        }
        onViewContent={(r) => {
          window.open(r.target_url, '_blank', 'noopener,noreferrer');
        }}
      />
    </Paper>
  );
};

export default ReportManagementPage;
