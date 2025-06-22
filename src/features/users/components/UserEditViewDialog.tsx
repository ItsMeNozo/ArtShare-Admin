import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  ChipProps,
  Snackbar,
} from "@mui/material";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CameraAlt as CameraAltIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  AssignmentInd as AssignmentIndIcon,
  VpnKey as VpnKeyIcon,
  Description as DescriptionIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  Cancel as CancelIcon,
  PowerSettingsNew as StatusIcon,
} from "@mui/icons-material";
import { User, UserFormData } from "../../../types/user";
import { PaidAccessLevel } from "../../../constants/plan";
import { SemanticSubscriptionStatus, SubscriptionStatusInfo } from "../types";
import { USER_ROLES, UserRoleType } from "../../../constants/roles";
import { useUserOperations } from "../hooks/useUserOperations";
import { signUp } from "../../auth/api/auth-api";
import api from "../../../api/baseApi";
import { UserStatus } from "../../../constants/user";
import { getPrimaryRole } from "../utils/userTable.utils";

interface UserEditViewDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  isCreatingNewUser: boolean;
  onSave: (
    dataForBackend: UserFormData & { id?: string },
    userIdToUpdate?: string,
  ) => Promise<User>;
  getSubscriptionStatusInfo: (user: User | null) => SubscriptionStatusInfo;
  getChipColorFromSemanticStatus: (
    status: SemanticSubscriptionStatus,
  ) => ChipProps["color"];
}

const AVAILABLE_ROLES_FOR_SELECT: UserRoleType[] = Object.values(USER_ROLES);
const AVAILABLE_STATUSES: UserStatus[] = Object.values(UserStatus);

const SnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  function SnackbarAlert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

const getInitialDialogFormData = (
  user: User | null,
  isCreating: boolean,
): UserFormData => {
  if (isCreating || !user) {
    return {
      username: "",
      email: "",
      fullName: "",
      profilePictureUrl: "",
      bio: "",
      birthday: undefined,
      roles: ["USER"],
      password: "",
      status: UserStatus.ACTIVE,
    };
  }
  return {
    username: user.username,
    email: user.email,
    fullName: user.fullName || "",
    profilePictureUrl: user.profilePictureUrl || "",
    bio: user.bio || "",
    birthday: user.birthday
      ? (new Date(user.birthday).toISOString().split("T")[0] as any)
      : undefined,
    roles: [getPrimaryRole(user.roles)],
    password: "",
    status: user.status || UserStatus.ACTIVE,
  };
};

export const UserEditViewDialog: React.FC<UserEditViewDialogProps> = ({
  open,
  onClose,
  user: initialUser,
  isCreatingNewUser,
  onSave,
  getSubscriptionStatusInfo: getStatusInfoProp,
}) => {
  const { loadUsers } = useUserOperations();
  const [isEditing, setIsEditing] = useState(isCreatingNewUser);
  const [formData, setFormData] = useState<UserFormData>(
    getInitialDialogFormData(initialUser, isCreatingNewUser),
  );
  const [userForDisplay, setUserForDisplay] = useState<User | null>(
    initialUser,
  );
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  const [closeDialogAfterSnackbar, setCloseDialogAfterSnackbar] =
    useState(false);

  useEffect(() => {
    setUserForDisplay(initialUser);
    setFormData(getInitialDialogFormData(initialUser, isCreatingNewUser));
    setIsEditing(isCreatingNewUser);

    if (open) {
      setCloseDialogAfterSnackbar(false);
    }
  }, [initialUser, isCreatingNewUser, open]);

  const showNotification = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);

    if (closeDialogAfterSnackbar) {
      onClose();
      setCloseDialogAfterSnackbar(false);
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      roles: [value as UserRoleType], // Store as single-item array
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(getInitialDialogFormData(userForDisplay, false));
    }
    setIsEditing(!isEditing);
  };

  const handleStatusChange = (event: SelectChangeEvent<UserStatus>) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      status: value as UserStatus,
    }));
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      showNotification("Username and Email are required.", "error");
      return;
    }
    if (isCreatingNewUser && !formData.password) {
      showNotification("Password is required for new users.", "error");
      return;
    }

    setSaving(true);
    let createdFirebaseAuthUser = null;
    let createdBackendUserResponse = null;

    try {
      if (isCreatingNewUser) {
        if (!formData.email || !formData.password) {
          setSaving(false);
          throw new Error(
            "Email and password are required to create a new user.",
          );
        }

        const firebaseResponse = await signUp(
          formData.email,
          formData.password,
          formData.username,
        );
        createdFirebaseAuthUser = firebaseResponse.newUser;
        const userIdForBackend =
          createdFirebaseAuthUser.id || (createdFirebaseAuthUser as any).uid;
        if (!userIdForBackend) {
          throw new Error(
            "Failed to initialize the new user account properly. Please try again or contact support.",
          );
        }

        try {
          createdBackendUserResponse = await onSave(formData, userIdForBackend);
        } catch (onSaveError) {
          console.error(
            `Backend 'onSave' failed for new Firebase user ${userIdForBackend} (${formData.email}). Attempting rollback.`,
            onSaveError,
          );
          try {
            await api.delete(`/admin/users/${userIdForBackend}`);
          } catch (rollbackError) {
            console.error(
              `CRITICAL: Failed to rollback backend user record ${userIdForBackend}. Manual cleanup needed for backend. Firebase user ${formData.email} likely still exists.`,
              rollbackError,
            );
          }

          throw onSaveError;
        }
      } else {
        if (!userForDisplay?.id) {
          setSaving(false);
          throw new Error(
            "Cannot update user: essential identifying information is missing. Please refresh and try again, or contact support.",
          );
        }
        createdBackendUserResponse = await onSave(formData, userForDisplay.id);
      }

      const successMessage = `User ${isCreatingNewUser ? "created" : "updated"} successfully.`;

      await loadUsers();

      if (createdBackendUserResponse) {
        setUserForDisplay(createdBackendUserResponse);
      }
      if (!isCreatingNewUser) {
        setIsEditing(false);
      }

      showNotification(successMessage, "success");
      setCloseDialogAfterSnackbar(true);
    } catch (error) {
      let messageToShow: string;

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof error.code === "string"
      ) {
        const errorCode = error.code as string;

        switch (errorCode) {
          case "auth/email-already-in-use":
            messageToShow =
              "This email address is already registered. Please use a different email or try logging in.";
            break;
          case "auth/invalid-email":
            messageToShow =
              "The email address provided is not valid. Please check and try again.";
            break;
          case "auth/weak-password":
            messageToShow =
              "The password is too weak. Please choose a stronger password (e.g., at least 6 characters).";
            break;
          case "auth/operation-not-allowed":
            messageToShow =
              "User creation with email and password is not currently enabled. Please contact support.";
            break;

          default:
            if ("message" in error && typeof error.message === "string") {
              messageToShow = error.message;
            } else {
              messageToShow = `An authentication error occurred (Code: ${errorCode}). Please try again or contact support.`;
            }
            break;
        }
      } else if (error instanceof Error) {
        messageToShow = error.message;
      } else {
        messageToShow =
          "An unexpected error occurred. Please try again. If the problem persists, contact support.";
      }

      showNotification(messageToShow, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePictureUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => fileInputRef.current?.click();
  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, profilePictureUrl: "" }));
  };

  const currentData = isEditing
    ? formData
    : getInitialDialogFormData(userForDisplay, false);
  const displayUser = userForDisplay || ({} as User);
  const statusInfo = getStatusInfoProp(displayUser.id ? displayUser : null);

  const renderField = (
    label: string,
    id: keyof UserFormData,
    type: string = "text",
    icon?: React.ReactElement,
    multiline: boolean = false,
    readOnlyOverride?: boolean,
  ) => {
    const value = (currentData[id] as string) || "";

    if (!isEditing || readOnlyOverride) {
      const capitalizeFirstLetter = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      let displayValue: string;

      if (id === "roles") {
        const primaryRole = getPrimaryRole(currentData.roles as UserRoleType[]);
        displayValue = capitalizeFirstLetter(primaryRole);
      } else if (id === "status") {
        displayValue = capitalizeFirstLetter(currentData.status);
      } else {
        displayValue = value || "-";
      }

      return (
        <Grid size={{ xs: 12 }} key={id + "_view"}>
          <Typography
            variant="caption"
            component="div"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            className="break-words min-h-[24px]"
          >
            {displayValue}
          </Typography>
        </Grid>
      );
    }
    return (
      <Grid
        container
        direction="column"
        spacing={0.5}
        key={id + "_custom_field"}
        size={{ xs: 12 }}
      >
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="caption"
            component="label"
            htmlFor={id}
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            variant="outlined"
            type={type}
            name={id}
            id={id}
            value={value}
            onChange={handleInputChange}
            multiline={multiline}
            rows={multiline ? 3 : 1}
            InputProps={{
              startAdornment: icon ? (
                <Box
                  sx={{
                    mr: 1,
                    color: "action.active",
                    alignSelf: multiline ? "flex-start" : "",
                  }}
                >
                  {icon}
                </Box>
              ) : null,
            }}
            required={
              id === "username" ||
              id === "email" ||
              (isCreatingNewUser && id === "password")
            }
          />
        </Grid>
      </Grid>
    );
  };

  const handleDirectClose = () => {
    setCloseDialogAfterSnackbar(false);
    onClose();
  };

  return (
    <>
      {/* Use handleDirectClose for the Dialog's native close actions */}
      <Dialog
        open={open}
        onClose={handleDirectClose}
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
          {isCreatingNewUser ? "Create new user" : "User details"}
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
                onClick={handleSave}
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                variant="contained"
                color="primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isCreatingNewUser
                    ? "Create User"
                    : "Save Changes"}
              </Button>
            )}
            {/* IconButton close should also use handleDirectClose */}
            <IconButton onClick={handleDirectClose} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {open &&
          !isCreatingNewUser &&
          !userForDisplay?.id &&
          !initialUser?.id ? (
            <Box className="flex justify-center items-center h-[300px]">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={0}>
              {/* Left Panel */}
              <Grid
                size={{ xs: 12, lg: 4 }}
                sx={{
                  p: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "grey.800" : "grey.100",
                  borderRight: { md: "1px solid" },
                  borderColor: "divider",
                  borderBottom: { xs: "1px solid", md: "none" },
                }}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                >
                  <Box position="relative" mb={2}>
                    <Avatar
                      src={
                        (currentData.profilePictureUrl as string) || undefined
                      }
                      alt={(currentData.username as string) || "User"}
                      sx={{
                        width: 150,
                        height: 150,
                        fontSize: "4rem",
                        border: "3px solid white",
                        boxShadow: 3,
                      }}
                    >
                      {(
                        currentData.username?.[0] ||
                        displayUser.username?.[0] ||
                        ""
                      )?.toUpperCase()}
                    </Avatar>
                    {isEditing && (
                      <IconButton
                        size="small"
                        onClick={triggerAvatarUpload}
                        sx={{
                          position: "absolute",
                          bottom: 5,
                          right: 5,
                          bgcolor: "background.paper",
                          "&:hover": {
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "grey.700"
                                : "grey.200",
                          },
                        }}
                      >
                        <CameraAltIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    style={{ display: "none" }}
                  />
                  {isEditing && currentData.profilePictureUrl && (
                    <Button
                      size="small"
                      onClick={removeAvatar}
                      color="error"
                      sx={{ textTransform: "none", mb: 1 }}
                    >
                      Remove Avatar
                    </Button>
                  )}

                  <Typography variant="body1" fontStyle={"italic"}>
                    {isEditing || isCreatingNewUser
                      ? currentData.email
                      : displayUser.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                {!isCreatingNewUser && displayUser.id && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 12 }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ color: "text.secondary" }}
                      >
                        ACCOUNT INFO
                      </Typography>
                      <div className="flex flex-col gap-1">
                        <Typography variant="body2">
                          <strong>User ID: </strong> {displayUser.id}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Joined: </strong>
                          {new Date(
                            displayUser.createdAt || Date.now(),
                          ).toLocaleDateString()}
                        </Typography>
                        {displayUser.updatedAt && (
                          <Typography variant="body2">
                            <strong>Last Updated: </strong>
                            {new Date(
                              displayUser.updatedAt,
                            ).toLocaleDateString()}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Followers: </strong>
                          {displayUser.followersCount ?? "0"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Following: </strong>
                          {displayUser.followingsCount ?? "0"}
                        </Typography>
                      </div>
                    </Grid>

                    {displayUser.roles &&
                      getPrimaryRole(displayUser.roles) !== "ADMIN" && (
                        <Grid size={{ xs: 6, md: 12 }}>
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{
                              color: "text.secondary",
                              mt: { xs: 0, md: 1 },
                            }}
                          >
                            SUBSCRIPTION
                          </Typography>
                          <div className="flex flex-col gap-1">
                            <Typography variant="body2">
                              <strong>Plan: </strong> {statusInfo.text}
                            </Typography>
                            {displayUser.userAccess && (
                              <>
                                <Typography variant="body2">
                                  <strong>Expires: </strong>
                                  {displayUser.userAccess.planId ===
                                  PaidAccessLevel.FREE
                                    ? "N/A"
                                    : displayUser.userAccess.expiresAt
                                      ? new Date(
                                          displayUser.userAccess.expiresAt,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Will cancel at period end: </strong>
                                  {displayUser.userAccess.cancelAtPeriodEnd
                                    ? "Yes"
                                    : "No"}
                                </Typography>
                                {getPrimaryRole(initialUser?.roles) ===
                                  "ADMIN" && (
                                  <>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mt: 0.5,
                                        fontSize: "0.8rem",
                                        color: "text.secondary",
                                      }}
                                    >
                                      Stripe Customer ID:
                                      {displayUser.stripeCustomerId ||
                                        displayUser.userAccess
                                          ?.stripeCustomerId ||
                                        "N/A"}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mt: 0.5,
                                        fontSize: "0.8rem",
                                        color: "text.secondary",
                                      }}
                                    >
                                      Stripe Subscription ID:
                                      {displayUser.userAccess
                                        ?.stripeSubscriptionId || "N/A"}
                                    </Typography>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </Grid>
                      )}
                  </Grid>
                )}
              </Grid>
              {/* Right Panel (Form) */}
              <Grid size={{ xs: 12, md: 8 }} sx={{ p: 3, minHeight: "720px" }}>
                {!isCreatingNewUser && (
                  <Typography
                    variant="h6"
                    gutterBottom={isEditing ? true : false}
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                      pb: 1,
                      mb: 2,
                    }}
                  >
                    User Profile
                  </Typography>
                )}

                <Grid container spacing={isEditing ? 2 : 3}>
                  {renderField("Username", "username", "text", <PersonIcon />)}
                  {isCreatingNewUser &&
                    renderField("Email", "email", "email", <EmailIcon />)}
                  {isCreatingNewUser &&
                    renderField(
                      "Password",
                      "password",
                      "password",
                      <VpnKeyIcon />,
                    )}
                  {renderField(
                    "Full Name",
                    "fullName",
                    "text",
                    <AssignmentIndIcon />,
                  )}
                  {renderField("Birthday", "birthday", "date", <CakeIcon />)}
                  {renderField("Bio", "bio", "text", <DescriptionIcon />, true)}
                  {isEditing && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        component="label"
                        htmlFor={"roles-select-input"}
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {"Role"}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          name="roles"
                          value={formData.roles[0] || "USER"}
                          onChange={handleRolesChange}
                          displayEmpty
                          startAdornment={
                            <SupervisedUserCircleIcon
                              color="action"
                              sx={{ ml: 1, mr: 1, pointerEvents: "none" }}
                            />
                          }
                        >
                          {AVAILABLE_ROLES_FOR_SELECT.map((roleName) => (
                            <MenuItem key={roleName} value={roleName}>
                              <ListItemText primary={roleName} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {isEditing && (
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="caption"
                        component="label"
                        htmlFor="status-select-input"
                        sx={{
                          display: "block",
                          color: "text.secondary",
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {"Status"}
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleStatusChange}
                          input={<OutlinedInput id="status-select-input" />}
                          startAdornment={
                            <StatusIcon
                              color="action"
                              sx={{ ml: 1, mr: 1, pointerEvents: "none" }}
                            />
                          }
                        >
                          {AVAILABLE_STATUSES.map((statusName) => (
                            <MenuItem key={statusName} value={statusName}>
                              <ListItemText primary={statusName} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {!isEditing && (
                    <>
                      {renderField(
                        "Roles",
                        "roles",
                        "text",
                        <SupervisedUserCircleIcon />,
                        false,
                        true,
                      )}
                      {renderField(
                        "Status",
                        "status",
                        "text",
                        <StatusIcon />,
                        false,
                        true,
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </SnackbarAlert>
      </Snackbar>
    </>
  );
};
