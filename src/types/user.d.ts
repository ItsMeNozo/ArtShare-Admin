import type UserRoleType from '../constants/roles';

export interface UserAccess {
  userId: string;
  planId: PaidAccessLevel;
  expiresAt: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  cancelAtPeriodEnd: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt?: string | null;
  birthday?: string | null;
  followersCount: number;
  followingsCount: number;
  stripeCustomerId: string | null;
  roles: UserRoleType[];
  userAccess: UserAccess | null;
  status: UserStatus;
}

export interface UserFormData {
  id?: string;
  username: string;
  email: string;
  password?: string;
  fullName?: string | null;
  profilePictureUrl?: string | null;
  bio?: string | null;
  birthday?: string | null;
  roles: UserRoleType[];
  status: UserStatus;
}
