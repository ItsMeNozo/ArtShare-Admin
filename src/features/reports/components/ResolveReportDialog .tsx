// src/components/ResolveReportDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Report } from "../reportAPI";

const toDatetimeLocal = (dt: Date) => {
  return (
    dt.getFullYear() +
    "-" +
    String(dt.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dt.getDate()).padStart(2, "0") +
    "T" +
    String(dt.getHours()).padStart(2, "0") +
    ":" +
    String(dt.getMinutes()).padStart(2, "0")
  );
};

interface ResolveReportDialogProps {
  report: Report | null;
  open: boolean;
  initialDate?: Date;
  isSubmitting?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: (data: {
    resolveDate: string; // ISO string
    comment?: string;
  }) => void;
}

const ResolveReportDialog: React.FC<ResolveReportDialogProps> = ({
  report,
  open,
  initialDate,
  isSubmitting = false,
  error,
  onCancel,
  onConfirm,
}) => {
  const [dateTime, setDateTime] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // when opened (or initialDate changes), reset form
  useEffect(() => {
    if (open) {
      const now = initialDate ?? new Date();
      setDateTime(toDatetimeLocal(now));
      setComment("");
    }
  }, [open, initialDate]);

  const handleConfirm = () => {
    onConfirm({ resolveDate: new Date(dateTime).toISOString(), comment });
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>Resolve Report</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            required
            label="Resolve Date &amp; Time"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isSubmitting}
          />
          <TextField
            label="Admin Comment (optional)"
            multiline
            rows={3}
            placeholder="Add any notes for this resolution"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={isSubmitting || !dateTime}
          style={{
            visibility:
              report?.status === "DISMISSED" || report?.status === "RESOLVED"
                ? "hidden"
                : undefined,
          }}
        >
          {isSubmitting ? "Saving…" : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResolveReportDialog;
