// src/components/ReportDetailDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { Report } from '../reportAPI';

interface ReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  onResolve: (reportId: number) => void;
  onDismiss: (reportId: number) => void;
  onViewContent: (report: Report) => void;
}

/**
 * A modal dialog showing full details of a report,
 * with actions to view content, dismiss, or resolve.
 */
const ReportDetailDialog: React.FC<ReportDetailDialogProps> = ({
  open,
  onClose,
  report,
  onResolve,
  onDismiss,
  onViewContent,
}) => {
  if (!report) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Report Details</DialogTitle>
      <Divider />
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography variant="subtitle2">Reporter</Typography>
            <Typography variant="body1">{report.reporter.username}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Target</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1">
                {report.target_type} #{report.target_id}
              </Typography>
              <Button size="small" onClick={() => onViewContent(report)}>
                View
              </Button>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2">Reason</Typography>
            <Typography variant="body2">{report.reason}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Status</Typography>
            <Typography variant="body2">{report.status}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Created At</Typography>
            <Typography variant="body2">
              {new Date(report.created_at).toLocaleString()}
            </Typography>
          </Box>

          {report.resolved_at && (
            <>
              <Box>
                <Typography variant="subtitle2">Resolved At</Typography>
                <Typography variant="body2">
                  {new Date(report.resolved_at).toLocaleString()}
                </Typography>
              </Box>
              {report.resolution_comment && (
                <Box>
                  <Typography variant="subtitle2">Comment</Typography>
                  <Typography variant="body2">
                    {report.resolution_comment}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onDismiss(report.id)}
        >
          Dismiss
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => onResolve(report.id)}
        >
          Resolve
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;
