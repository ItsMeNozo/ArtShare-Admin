// src/components/ReportDetailDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Report } from '../reportAPI';
import { Link } from 'react-router-dom';

interface ReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  onResolve: () => void;
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
}) => {
  const [copied, setCopied] = useState(false);
  if (!report) return null;

  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(report?.target_url ? report.target_url : '')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

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
            <Typography variant="subtitle2">Target URL</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Link
                to={report.target_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {report.target_url}
              </Link>
              <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
                <IconButton onClick={handleCopyUrl} size="small"></IconButton>
              </Tooltip>
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
          style={{
            visibility: report.status === 'DISMISSED' ? 'hidden' : 'visible',
          }}
          onClick={() => onDismiss(report.id)}
        >
          Dismiss
        </Button>
        <Button variant="contained" color="success" onClick={onResolve}>
          Resolve
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;
