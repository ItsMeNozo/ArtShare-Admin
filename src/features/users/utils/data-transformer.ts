import { UserRoleType } from "../../../constants/roles";
import { UserStatus } from "../../../constants/user";
import { UserFormData } from "../../../types/user";

export interface CreateUserAdminPayload {
  username: string;
  email: string;
  full_name?: string;
  profile_picture_url?: string;
  bio?: string | null;
  birthday?: string | null;
  roles: UserRoleType[];
  status?: UserStatus;
}

export interface UpdateUserAdminPayload {
  username?: string;
  full_name?: string;
  profile_picture_url?: string;
  bio?: string | null;
  birthday?: string | null;
  roles?: UserRoleType[];
  status?: UserStatus;
  password?: string;
}

export const transformUserFormDataForCreate = (
  formData: UserFormData,
): CreateUserAdminPayload => {
  const { password, fullName, profilePictureUrl, ...rest } = formData;

  return {
    ...rest,
    full_name: fullName || undefined,
    profile_picture_url: profilePictureUrl || undefined,
  };
};

export const transformUserFormDataForUpdate = (
  formData: UserFormData,
): UpdateUserAdminPayload => {
  const { id, email, password, fullName, profilePictureUrl, ...rest } =
    formData;

  const payload: UpdateUserAdminPayload = {
    ...rest,
    full_name: fullName || undefined,
    profile_picture_url: profilePictureUrl || undefined,
  };

  if (password && password.length > 0) {
    payload.password = password;
  }

  return payload;
};
