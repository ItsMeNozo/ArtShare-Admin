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
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  ChipProps,
  Chip,
} from "@mui/material";
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
  AdminPanelSettings as AdminPanelSettingsIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import { SemanticSubscriptionStatus, SubscriptionStatusInfo } from "..";
import { User, UserFormData, Role as AppRole } from "../../../types/user";
import { MOCK_AVAILABLE_ROLES } from "../mocks/user.api";
import { PaidAccessLevel } from "../../../constants/plan";

interface UserEditViewDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  isCreatingNewUser: boolean;
  onSave: (userData: UserFormData, userId?: String) => Promise<void>;

  getSubscriptionStatusInfo: (user: User | null) => SubscriptionStatusInfo;
  getChipColorFromSemanticStatus: (
    status: SemanticSubscriptionStatus,
  ) => ChipProps["color"];
}

const getInitialDialogFormData = (
  user: User | null,
  isCreating: boolean,
): UserFormData => {
  if (isCreating || !user) {
    return {
      username: "",
      email: "",
      full_name: "",
      profile_picture_url: "",
      bio: "",
      birthday: undefined,
      roles: ["USER"],
      password: "",
    };
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name || "",
    profile_picture_url: user.profile_picture_url || "",
    bio: user.bio || "",
    birthday: user.birthday
      ? (new Date(user.birthday).toISOString().split("T")[0] as any)
      : undefined,
    roles: user.roles.map((ur) => ur.role.role_name),
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
  const [isEditing, setIsEditing] = useState(isCreatingNewUser);
  const [formData, setFormData] = useState<UserFormData>(
    getInitialDialogFormData(initialUser, isCreatingNewUser),
  );
  const [userForDisplay, setUserForDisplay] = useState<User | null>(
    initialUser,
  );
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserForDisplay(initialUser);
    setFormData(getInitialDialogFormData(initialUser, isCreatingNewUser));
    setIsEditing(isCreatingNewUser);
  }, [initialUser, isCreatingNewUser, open]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (
    event: SelectChangeEvent<typeof formData.roles>,
  ) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      roles:
        typeof value === "string"
          ? (value.split(",") as Array<"ADMIN" | "USER">)
          : (value as Array<"ADMIN" | "USER">),
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData(getInitialDialogFormData(userForDisplay, false));
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.email) {
      alert("Username and Email are required.");
      return;
    }
    if (isCreatingNewUser && !formData.password) {
      alert("Password is required for new users.");
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, userForDisplay?.id);
      alert(`User ${isCreatingNewUser ? "created" : "updated"} successfully.`);
      if (!isCreatingNewUser) {
        const updatedUserForDisplay = {
          ...(userForDisplay || {}),
          ...initialUser,
          ...formData,
          id: userForDisplay?.id || formData.id,
          roles: formData.roles.map((roleName) => ({
            role: MOCK_AVAILABLE_ROLES.find(
              (r) => r.role_name === roleName,
            ) || { role_id: roleName, role_name: roleName, description: "" },
          })),
        } as User;
        setUserForDisplay(updatedUserForDisplay);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user.");
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
          profile_picture_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => fileInputRef.current?.click();

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, profile_picture_url: "" }));
  };

  const currentData = isEditing
    ? formData
    : getInitialDialogFormData(userForDisplay, false);
  const displayUser = userForDisplay || ({} as User);
  const statusInfo = getStatusInfoProp(displayUser);

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
      return (
        // Reverted to size prop
        <Grid size={{ xs: 12 }} key={id + "_view"}>
          <Typography
            variant="caption"
            color="textSecondary"
            component="div"
            className="uppercase"
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            component="div"
            className="break-words min-h-[24px]"
          >
            {id === "roles"
              ? (currentData.roles as string[]).join(", ")
              : value || "-"}
          </Typography>
        </Grid>
      );
    }
    return (
      // Reverted to size prop on the container Grid
      <Grid
        container
        direction="column"
        spacing={0.5}
        key={id + "_custom_field"}
        size={{ xs: 12 }}
      >
        <Grid size={{ xs: 12 }}>
          {/* Keep item for direct children of a container */}
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
          {/* Keep item for direct children of a container */}
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
                <Box sx={{ mr: 1, color: "action.active" }}>{icon}</Box>
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="body">
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
        <Typography variant="h6">
          {isCreatingNewUser
            ? "Create New User"
            : isEditing
              ? `Editing: ${userForDisplay?.username || formData.username}`
              : `User Details: ${userForDisplay?.username}`}
        </Typography>
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
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {!initialUser && !isCreatingNewUser && !formData.username ? (
          <Box className="flex justify-center items-center h-[300px]">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={0}>
            {/* This is the main layout container */}
            {/* Avatar and Basic Info Column (Left) - Reverted to size prop */}
            <Grid
              size={{ xs: 12, md: 4 }} // Reverted
              sx={{
                p: 3,
                bgcolor: "grey.100",
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
                      (currentData.profile_picture_url as string) || undefined
                    }
                    alt={currentData.username as string}
                    sx={{
                      width: 150,
                      height: 150,
                      fontSize: "4rem",
                      border: "3px solid white",
                      boxShadow: 3,
                    }}
                  >
                    {(
                      currentData.username?.[0] || displayUser.username?.[0]
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
                        "&:hover": { bgcolor: "grey.200" },
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
                {isEditing && currentData.profile_picture_url && (
                  <Button
                    size="small"
                    onClick={removeAvatar}
                    color="error"
                    sx={{ textTransform: "none", mb: 1 }}
                  >
                    Remove Avatar
                  </Button>
                )}

                <Typography variant="h5" gutterBottom>
                  {currentData.full_name || currentData.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {currentData.email}
                </Typography>
                {displayUser.roles && (
                  <Box className="flex flex-wrap gap-1 justify-center my-1">
                    {displayUser.roles.map((userRole) => (
                      <Chip
                        key={userRole.role.role_id}
                        icon={
                          userRole.role.role_name === "ADMIN" ? (
                            <AdminPanelSettingsIcon />
                          ) : (
                            <PersonIcon />
                          )
                        }
                        label={userRole.role.role_name}
                        size="small"
                        color={
                          userRole.role.role_name === "ADMIN"
                            ? "secondary"
                            : "default"
                        }
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <>
                <Divider sx={{ my: 2 }} />
                {/* This Grid is a standard MUI container for the Account/Subscription sections */}
                <Grid container spacing={2}>
                  {/* Account Info Section - Adjusted for row on xs, stack on md */}
                  <Grid size={{ xs: 6, md: 12 }}>
                    {/* CHANGED HERE */}
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ color: "text.secondary" }}
                    >
                      ACCOUNT INFO
                    </Typography>
                    <Typography variant="body2">
                      <strong>User ID:</strong> {displayUser.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Joined:</strong>
                      {new Date(
                        displayUser.created_at || Date.now(),
                      ).toLocaleDateString()}
                    </Typography>
                    {displayUser.updated_at && (
                      <Typography variant="body2">
                        <strong>Last Updated:</strong>
                        {new Date(displayUser.updated_at).toLocaleDateString()}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      <strong>Followers:</strong>
                      {displayUser.followers_count ?? "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Following:</strong>
                      {displayUser.followings_count ?? "N/A"}
                    </Typography>
                  </Grid>

                  {displayUser.roles &&
                    !displayUser.roles.some(
                      (r) => r.role.role_name === "ADMIN",
                    ) && (
                      // Subscription Info Section - Adjusted for row on xs, stack on md
                      <Grid size={{ xs: 6, md: 12 }}>
                        {/* CHANGED HERE */}
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ color: "text.secondary", mt: { xs: 0, md: 1 } }} // Adjusted margin top for xs
                        >
                          SUBSCRIPTION
                        </Typography>
                        <Typography variant="body2">
                          <strong>Plan:</strong> {statusInfo.text}
                        </Typography>
                        {displayUser.userAccess && (
                          <>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Expires:</strong>
                              {displayUser.userAccess.planId ===
                              PaidAccessLevel.FREE
                                ? "N/A"
                                : new Date(
                                    displayUser.userAccess.expiresAt,
                                  ).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>Will Cancel at Period End:</strong>
                              {displayUser.userAccess.cancelAtPeriodEnd
                                ? "Yes"
                                : "No"}
                            </Typography>
                            {initialUser?.roles.some(
                              (r) => r.role.role_name === "ADMIN",
                            ) && (
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
                                  {displayUser.stripe_customer_id ||
                                    displayUser.userAccess?.stripeCustomerId ||
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
                      </Grid>
                    )}
                </Grid>
              </>
            </Grid>
            {/* Details Form Column (Right) - Reverted to size prop */}
            <Grid
              size={{ xs: 12, md: 8 }} // Reverted
              sx={{ p: 3, minHeight: "620px" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: 1, borderColor: "divider", pb: 1, mb: 2 }}
              >
                {isEditing ? "Edit Information" : "User Profile"}
              </Typography>
              {/* This Grid is a standard MUI container for the fields */}
              <Grid container spacing={isEditing ? 2 : 3}>
                {/* renderField now returns a Grid that might have 'size' prop if it's a container,
                                     or a Grid with 'size' if it's an item, as per reverted logic */}
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
                  "full_name",
                  "text",
                  <AssignmentIndIcon />,
                )}
                {renderField("Birthday", "birthday", "date", <CakeIcon />)}
                {renderField("Bio", "bio", "text", <DescriptionIcon />, true)}
                {isEditing && (
                  // Reverted to size prop for the roles section wrapper
                  <Grid size={{ xs: 12 }}>
                    {/* Reverted */}
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
                      {"Roles"}
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        multiple
                        name="roles"
                        value={formData.roles}
                        onChange={handleRolesChange}
                        input={<OutlinedInput id={"roles-select-input"} />}
                        renderValue={(selected) =>
                          Array.isArray(selected) ? selected.join(", ") : ""
                        }
                        startAdornment={
                          <SupervisedUserCircleIcon
                            color="action"
                            sx={{ mr: 1, ml: 1.5, pointerEvents: "none" }}
                          />
                        }
                      >
                        {MOCK_AVAILABLE_ROLES.map((role) => (
                          <MenuItem key={role.role_id} value={role.role_name}>
                            <Checkbox
                              checked={
                                formData.roles.indexOf(role.role_name) > -1
                              }
                            />
                            <ListItemText primary={role.role_name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {!isEditing &&
                  renderField(
                    "Roles",
                    "roles",
                    "text",
                    <SupervisedUserCircleIcon />,
                    false,
                    true,
                  )}
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};
