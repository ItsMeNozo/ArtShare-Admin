// src/features/users/components/UserForm.tsx

import React from 'react';
import { FormikProps } from 'formik';
import { UserFormData } from '../../../../types/user';
import {
  Grid,
  TextField,
  Box,
  FormControl,
  Typography,
  Select,
  OutlinedInput,
  MenuItem,
  ListItemText,
  FormHelperText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  AssignmentInd as AssignmentIndIcon,
  VpnKey as VpnKeyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  AVAILABLE_ROLES_FOR_SELECT,
  AVAILABLE_STATUSES,
} from '../../constants/constant';

interface UserFormProps {
  formik: FormikProps<UserFormData>;
  isEditing: boolean;
  isCreatingNewUser: boolean;
}

const ReadOnlyField: React.FC<{
  label: string;
  value: string | React.ReactNode;
}> = ({ label, value }) => (
  <Grid size={{ xs: 12 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Typography variant="body1" className="break-words min-h-[24px]">
      {value || '-'}
    </Typography>
  </Grid>
);

const FormTextField: React.FC<{
  formik: FormikProps<UserFormData>;
  id: keyof UserFormData;
  label: string;
  type?: string;
  icon?: React.ReactElement;
  multiline?: boolean;
  required?: boolean;
}> = ({
  formik,
  id,
  label,
  type = 'text',
  icon,
  multiline = false,
  required = false,
}) => (
  <Grid
    container
    direction="column"
    spacing={0.5}
    key={id + '_custom_field'}
    size={{ xs: 12 }}
  >
    <Grid size={{ xs: 12 }}>
      <Typography
        variant="caption"
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          color: 'text.secondary',
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
        value={formik.values[id] || ''}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[id] && Boolean(formik.errors[id])}
        helperText={formik.touched[id] && formik.errors[id]}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        InputProps={{
          startAdornment: icon ? (
            <Box sx={{ mr: 1, color: 'action.active' }}>{icon}</Box>
          ) : null,
        }}
        required={required}
      />
    </Grid>
  </Grid>
);

export const UserForm: React.FC<UserFormProps> = ({
  formik,
  isEditing,
  isCreatingNewUser,
}) => {
  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  return (
    <Grid size={{ xs: 12, md: 8 }} sx={{ p: 3, minHeight: '720px' }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 3 }}
      >
        User Profile
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {isEditing ? (
            <FormTextField
              formik={formik}
              id="username"
              label="Username"
              icon={<PersonIcon />}
              required
            />
          ) : (
            <ReadOnlyField label="Username" value={formik.values.username} />
          )}
          {isEditing && isCreatingNewUser && (
            <FormTextField
              formik={formik}
              id="email"
              label="Email"
              type="email"
              icon={<EmailIcon />}
              required
            />
          )}
          {isEditing && (
            <FormTextField
              formik={formik}
              id="password"
              label="Password"
              type="password"
              icon={<VpnKeyIcon />}
              required
            />
          )}
          {isEditing ? (
            <FormTextField
              formik={formik}
              id="fullName"
              label="Full Name"
              icon={<AssignmentIndIcon />}
            />
          ) : (
            <ReadOnlyField label="Full Name" value={formik.values.fullName} />
          )}
          {isEditing ? (
            <FormTextField
              formik={formik}
              id="birthday"
              label="Birthday"
              type="date"
              icon={<CakeIcon />}
            />
          ) : (
            <ReadOnlyField
              label="Birthday"
              value={formik.values.birthday as string}
            />
          )}
          {isEditing ? (
            <FormTextField
              formik={formik}
              id="bio"
              label="Bio"
              icon={<DescriptionIcon />}
              multiline
            />
          ) : (
            <ReadOnlyField label="Bio" value={formik.values.bio} />
          )}

          {isEditing ? (
            <>
              <Grid size={{ xs: 12 }}>
                <FormControl
                  fullWidth
                  error={formik.touched.roles && Boolean(formik.errors.roles)}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    mb={0.5}
                  >
                    Role
                  </Typography>
                  <Select
                    value={formik.values.roles[0] || ''}
                    onChange={(e) => {
                      formik.setFieldValue('roles', [e.target.value]);
                    }}
                    onBlur={formik.handleBlur}
                    input={<OutlinedInput />}
                    name="roles"
                  >
                    {AVAILABLE_ROLES_FOR_SELECT.map((role) => (
                      <MenuItem key={role} value={role}>
                        <ListItemText primary={role} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formik.touched.roles && formik.errors.roles}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl
                  fullWidth
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                    mb={0.5}
                  >
                    Status
                  </Typography>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    input={<OutlinedInput />}
                  >
                    {AVAILABLE_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        <ListItemText primary={status} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formik.touched.status && formik.errors.status}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <ReadOnlyField
                label="Roles"
                value={(formik.values.roles as string[])
                  .map(capitalize)
                  .join(', ')}
              />
              <ReadOnlyField
                label="Status"
                value={capitalize(formik.values.status)}
              />
            </>
          )}
        </Grid>
      </form>
    </Grid>
  );
};
