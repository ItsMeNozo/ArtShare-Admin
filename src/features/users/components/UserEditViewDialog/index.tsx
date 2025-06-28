import React, { useState, useEffect } from "react";
import { User } from "../../../../types/user";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Snackbar,
  Grid,
} from "@mui/material";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useUserForm } from "../../hooks/useUserForm";
import { UserProfileSummary } from "./UserProfileSummary";
import { UserForm } from "./UserForm";
import { getSubscriptionStatusInfo } from "../../utils/userTable.utils";
import { useUserInterface } from "../../context/UserInterfaceContext";

// SnackbarAlert can be moved to a shared UI components folder if used elsewhere
const SnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  function SnackbarAlert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

interface UserEditViewDialogProps {
  open: boolean;
  user: User | null;
  isCreatingNewUser: boolean;
}

export const UserEditViewDialog: React.FC<UserEditViewDialogProps> = ({
  open,
  user: initialUser,
  isCreatingNewUser,
}) => {
  const { handleCloseUserDetailDialog } = useUserInterface();
  const [isEditing, setIsEditing] = useState(isCreatingNewUser);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "info" });
  const [closeDialogOnSnackbarHide, setCloseDialogOnSnackbarHide] =
    useState(false);

  const showNotification = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSuccess = (message: string) => {
    showNotification(message, "success");
    setCloseDialogOnSnackbarHide(true);
    if (!isCreatingNewUser) {
      setIsEditing(false);
    }
  };

  const handleError = (message: string) => {
    showNotification(message, "error");
  };

  const formik = useUserForm({
    initialUser,
    isCreatingNewUser,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  useEffect(() => {
    setIsEditing(isCreatingNewUser);
    if (open) {
      setCloseDialogOnSnackbarHide(false);
    }
  }, [initialUser, isCreatingNewUser, open]);

  const handleSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
    if (closeDialogOnSnackbarHide) {
      handleCloseUserDetailDialog();
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      formik.resetForm();
    }
    setIsEditing(!isEditing);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCloseUserDetailDialog}
        maxWidth="lg"
        fullWidth
        scroll="body"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            pb: 1.5,
          }}
        >
          {isCreatingNewUser ? "Create New User" : "User Details"}
          <Box>
            {!isCreatingNewUser && (
              <Button
                onClick={handleEditToggle}
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                variant={isEditing ? "outlined" : "contained"}
                color={isEditing ? "inherit" : "primary"}
                sx={{ mr: 1 }}
              >
                {isEditing ? "Cancel Edit" : "Edit User"}
              </Button>
            )}
            {isEditing && (
              <Button
                onClick={() => formik.handleSubmit()}
                startIcon={
                  formik.isSubmitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting
                  ? "Saving..."
                  : isCreatingNewUser
                    ? "Create User"
                    : "Save Changes"}
              </Button>
            )}
            <IconButton onClick={handleCloseUserDetailDialog} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {open && !isCreatingNewUser && !initialUser?.id ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={0}>
              <UserProfileSummary
                formik={formik}
                isEditing={isEditing}
                isCreatingNewUser={isCreatingNewUser}
                user={initialUser}
                getSubscriptionStatusInfo={getSubscriptionStatusInfo}
              />
              <UserForm
                formik={formik}
                isEditing={isEditing}
                isCreatingNewUser={isCreatingNewUser}
              />
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarAlert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </SnackbarAlert>
      </Snackbar>
    </>
  );
};
