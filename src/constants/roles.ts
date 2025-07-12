export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

// Type for a single role
export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES]; // 'admin' | 'user'
