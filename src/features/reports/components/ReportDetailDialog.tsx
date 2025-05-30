import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
  Link,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { type Report } from "../reportAPI";

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
  onViewContent,
}) => {
  const theme = useTheme(); // Optional: if you need theme for specific colors

  if (!report) {
    return null;
  }

  const isActionable =
    report.status !== "RESOLVED" && report.status !== "DISMISSED";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Reporter:
          </Typography>
          <Typography variant="body2">{report.reporter.username}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Report Type:
          </Typography>
          <Typography variant="body2">{report.target_type}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Reason:
          </Typography>
          <Typography variant="body2">{report.reason}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Target URL:
          </Typography>
          {/* THIS IS THE MODIFIED PART */}
          <Typography variant="body2">
            <Link
              href={report.target_url}
              target="_blank"
              rel="noopener noreferrer"
              // sx={{ color: theme.palette.primary.main }} // Default link color, or specify another
            >
              {report.target_url}
            </Link>
          </Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Status:
          </Typography>
          <Typography variant="body2">{report.status}</Typography>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Reported At:
          </Typography>
          <Typography variant="body2">
            {new Date(report.created_at).toLocaleString()}
          </Typography>
        </Box>
        {report.resolution_comment && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Resolution Comment:
            </Typography>
            <Typography variant="body2">{report.resolution_comment}</Typography>
          </Box>
        )}
        {report.resolved_at && (
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Resolved At:
            </Typography>
            <Typography variant="body2">
              {new Date(report.resolved_at).toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => onViewContent(report)} color="info">
          View Content
        </Button>
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
