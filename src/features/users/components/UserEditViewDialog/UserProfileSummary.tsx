// src/features/users/components/UserProfileSummary.tsx

import React, { ChangeEvent, useRef } from "react";
import { User } from "../../../../types/user";
import { FormikProps } from "formik";
import { UserFormData } from "../../../../types/user";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { CameraAlt as CameraAltIcon } from "@mui/icons-material";
import { SubscriptionStatusInfo } from "../../types";
import { PaidAccessLevel } from "../../../../constants/plan";

interface UserProfileSummaryProps {
  formik: FormikProps<UserFormData>;
  isEditing: boolean;
  isCreatingNewUser: boolean;
  user: User | null;
  getSubscriptionStatusInfo: (user: User | null) => SubscriptionStatusInfo;
}

export const UserProfileSummary: React.FC<UserProfileSummaryProps> = ({
  formik,
  isEditing,
  isCreatingNewUser,
  user,
  getSubscriptionStatusInfo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("profilePictureUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => fileInputRef.current?.click();
  const removeAvatar = () => formik.setFieldValue("profilePictureUrl", "");

  const displayUser = user || ({} as User);
  const statusInfo = getSubscriptionStatusInfo(
    displayUser.id ? displayUser : null,
  );

  return (
    <Grid
      size={{ xs: 12, lg: 4 }}
      sx={{
        p: 3,
        bgcolor: "grey.100",
        borderRight: { md: "1px solid" },
        borderColor: "divider",
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
            src={formik.values.profilePictureUrl || undefined}
            alt={formik.values.username || "User"}
            sx={{
              width: 150,
              height: 150,
              fontSize: "4rem",
              boxShadow: 3,
            }}
          >
            {(formik.values.username?.[0] || "")?.toUpperCase()}
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
        {isEditing && formik.values.profilePictureUrl && (
          <Button
            size="small"
            onClick={removeAvatar}
            color="error"
            sx={{ textTransform: "none", mb: 1 }}
          >
            Remove Avatar
          </Button>
        )}
        <Typography variant="h6">
          {formik.values.fullName || formik.values.username}
        </Typography>
        <Typography variant="body1" fontStyle={"italic"} color="text.secondary">
          {formik.values.email}
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      {!isCreatingNewUser && displayUser.id && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 12 }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              ACCOUNT INFO
            </Typography>
            <Typography variant="body2">
              <strong>User ID:</strong> {displayUser.id}
            </Typography>
            <Typography variant="body2">
              <strong>Joined:</strong>{" "}
              {new Date(
                displayUser.createdAt || Date.now(),
              ).toLocaleDateString()}
            </Typography>
            {displayUser.updatedAt && (
              <Typography variant="body2">
                <strong>Last Updated:</strong>{" "}
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
          </Grid>
          {displayUser.roles && !displayUser.roles.includes("ADMIN") && (
            <Grid size={{ xs: 6, md: 12 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
                mt={1}
              >
                SUBSCRIPTION
              </Typography>
              <div className="flex flex-col gap-1">
                <Typography variant="body2" className="capitalize">
                  <strong>Plan: </strong> {statusInfo.text}
                </Typography>
                {displayUser.userAccess && (
                  <>
                    <Typography variant="body2">
                      <strong>Expires: </strong>
                      {displayUser.userAccess.planId === PaidAccessLevel.FREE
                        ? "N/A"
                        : displayUser.userAccess.expiresAt
                          ? new Date(
                              displayUser.userAccess.expiresAt,
                            ).toLocaleDateString()
                          : "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Will cancel at period end: </strong>
                      {displayUser.userAccess.cancelAtPeriodEnd ? "Yes" : "No"}
                    </Typography>
                    {user?.roles.some((r) => r === "ADMIN") && (
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
                          {displayUser.userAccess?.stripeSubscriptionId ||
                            "N/A"}
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
  );
};
