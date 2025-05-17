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
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  ChipProps,
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
} from "@mui/icons-material";
import { User, UserFormData } from "../../../types/user";
import { PaidAccessLevel } from "../../../constants/plan";
import { SemanticSubscriptionStatus, SubscriptionStatusInfo } from "../types";
import { USER_ROLES, UserRoleType } from "../../../constants/roles";
import { useUserOperations } from "../hooks/useUserOperations";
import { signUp } from "../../auth/api/auth-api";

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
    roles: user.roles.map((ur) => ur),
    password: "",
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
      let userId = userForDisplay?.id;

      if (isCreatingNewUser) {
        if (!formData.email || !formData.password) {
          setSaving(false);
          throw new Error("Email and password for Firebase are missing");
        }
        const response = await signUp(
          formData.email,
          formData.password,
          formData.username,
        );

        userId = response.newUser.id;
      }

      const updatedUser = await onSave(formData, userId);

      alert(`User ${isCreatingNewUser ? "created" : "updated"} successfully.`);
      onClose();
      await loadUsers();

      if (!isCreatingNewUser && userForDisplay) {
        setUserForDisplay(updatedUser);
        setIsEditing(false);
      } else if (isCreatingNewUser) {
      }
    } catch (error) {
      console.error("Error saving user:", error);

      alert(`Failed to save user: ${(error as Error).message}`);
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
            {id === "roles"
              ? (currentData.roles as string[]).join(", ")
              : value || "-"}
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
              size={{ xs: 12, md: 4 }}
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
                    src={(currentData.profilePictureUrl as string) || undefined}
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
                  {currentData.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* This Grid is a standard MUI container for the Account/Subscription sections */}
              {!isCreatingNewUser && (
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
                          {new Date(displayUser.updatedAt).toLocaleDateString()}
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
                    !displayUser.roles.some((r) => r === "ADMIN") && (
                      <Grid size={{ xs: 6, md: 12 }}>
                        {/* CHANGED HERE */}
                        <Typography
                          variant="subtitle2"
                          gutterBottom
                          sx={{ color: "text.secondary", mt: { xs: 0, md: 1 } }}
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
                                  : displayUser.userAccess.expiresAt}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Will cancel at period end: </strong>
                                {displayUser.userAccess.cancelAtPeriodEnd
                                  ? "Yes"
                                  : "No"}
                              </Typography>
                              {initialUser?.roles.some(
                                (r) => r === "ADMIN",
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
            {/* Details Form Column (Right) - Reverted to size prop */}
            <Grid size={{ xs: 12, md: 8 }} sx={{ p: 3, minHeight: "620px" }}>
              {!isCreatingNewUser && (
                <Typography
                  variant="h6"
                  gutterBottom={isEditing ? true : false}
                  sx={{ borderBottom: 1, borderColor: "divider", pb: 1, mb: 2 }}
                >
                  User Profile
                </Typography>
              )}

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
                  "fullName",
                  "text",
                  <AssignmentIndIcon />,
                )}
                {renderField("Birthday", "birthday", "date", <CakeIcon />)}
                {renderField("Bio", "bio", "text", <DescriptionIcon />, true)}
                {isEditing && (
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
                        input={
                          <OutlinedInput
                            id="roles-select-input"
                            label="Roles"
                          />
                        }
                        renderValue={(selected: UserRoleType[]) =>
                          selected.join(", ")
                        }
                        displayEmpty
                        startAdornment={
                          <SupervisedUserCircleIcon
                            color="action"
                            sx={{ ml: 1, mr: 1, pointerEvents: "none" }}
                          />
                        }
                      >
                        {/* Optional: Placeholder if needed, though displayEmpty and InputLabel are better */}
                        {/* <MenuItem disabled value="">
        <em>Select roles...</em>
    </MenuItem> */}

                        {AVAILABLE_ROLES_FOR_SELECT.map((roleName) => (
                          <MenuItem key={roleName} value={roleName}>
                            {/* value is the roleName string */}
                            <Checkbox
                              checked={formData.roles.indexOf(roleName) > -1}
                            />
                            <ListItemText primary={roleName} />
                            {/* Displays "ADMIN" or "USER" */}
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
