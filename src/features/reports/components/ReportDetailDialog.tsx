import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import React from 'react';
// Ensure Report type and ReportStatus are imported or defined
import { type Report, type ReportStatus } from '../reportAPI'; // Assuming these are in reportAPI.ts
// Import or define statusDisplayInfo, or pass it as a prop
// For simplicity, let's redefine it here if it's not in a shared util
const statusDisplayInfo: Record<
  ReportStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'error' }
> = {
  RESOLVED: { label: 'Resolved', color: 'success' },
  PENDING: { label: 'Pending', color: 'warning' },
  DISMISSED: { label: 'Dismissed', color: 'default' },
};

interface ReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  onResolve: (reportId: number) => void;
  onDismiss: (reportId: number) => void;
  onViewContent: (report: Report) => void;
}

const ReportDetailDialog: React.FC<ReportDetailDialogProps> = ({
  open,
  onClose,
  report,
  onResolve,
  onDismiss,
  onViewContent, // Added onViewContent to props destructuring
}) => {
  if (!report) {
    return null;
  }

  const isActionable =
    report.status !== 'RESOLVED' && report.status !== 'DISMISSED';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        Report Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Reporter */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Reporter:
          </Typography>
          <Typography variant="body2">{report.reporter.username}</Typography>
        </Box>
        {/* Report Type */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Report Type:
          </Typography>
          <Typography variant="body2">{report.targetType}</Typography>
        </Box>
        {/* Reason */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Reason:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {report.reason}
          </Typography>
        </Box>
        {/* Target URL */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Target URL:
          </Typography>
          <Typography variant="body2">
            <Link
              component="button"
              variant="body2"
              onClick={() => onViewContent(report)}
            >
              View Reported Content
            </Link>
          </Typography>
        </Box>
        {/* Status */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Status:
          </Typography>
          <Chip
            label={statusDisplayInfo[report.status]?.label || report.status}
            color={statusDisplayInfo[report.status]?.color || 'default'}
            size="small"
          />
        </Box>
        {/* Reported At */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Reported At:
          </Typography>
          <Typography variant="body2">
            {new Date(report.createdAt).toLocaleString()}
          </Typography>
        </Box>

        {/* Resolution / Dismissal Info - Conditionally render this section */}
        {(report.status === 'RESOLVED' || report.status === 'DISMISSED') && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontSize: '1.1rem', fontWeight: 'medium' }}
            >
              Outcome Details
            </Typography>
            {report.status === 'RESOLVED' && report.moderator && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Resolved By:
                </Typography>
                {/* Now access username from the moderator object */}
                <Typography variant="body2">
                  {report.moderator.username}
                </Typography>
              </Box>
            )}
            {report.status === 'RESOLVED' && report.resolvedAt && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  Resolved At:
                </Typography>
                <Typography variant="body2">
                  {new Date(report.resolvedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            {/* Assuming resolutionComment is used for both resolve and dismiss comments */}
            {report.resolutionComment && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: 'bold' }}
                >
                  {report.status === 'RESOLVED'
                    ? 'Resolution Comment:'
                    : 'Admin Comment:'}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {report.resolutionComment}
                </Typography>
              </Box>
            )}
            {/* Add specific dismissal info if available (e.g., dismissedAt, dismissedBy) */}
            {report.status === 'DISMISSED' &&
              !report.resolutionComment && ( // If dismissed without a comment
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  This report was dismissed.
                </Typography>
              )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {isActionable && (
          <>
            <Button onClick={() => onDismiss(report.id)} color="warning">
              Dismiss
            </Button>
            <Button
              onClick={() => onResolve(report.id)}
              color="primary"
              variant="contained"
            >
              Resolve
            </Button>
          </>
        )}
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailDialog;
