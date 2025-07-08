import { UserRoleType, USER_ROLES } from '../../../constants/roles';
import { UserStatus } from '../../../constants/user';

export const AVAILABLE_ROLES_FOR_SELECT: UserRoleType[] =
  Object.values(USER_ROLES);
export const AVAILABLE_STATUSES: UserStatus[] = Object.values(UserStatus);
