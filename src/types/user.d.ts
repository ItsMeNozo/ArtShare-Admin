import { PaidAccessLevel } from "./plan";

export interface Role {
  role_id: number;
  role_name: "ADMIN" | "USER";
  createdAt: Date;
}

export interface UserRole {
  user_id: string;
  role_id: number;
  assignedAt: Date;
  role: Role;
}

export interface UserAccess {
  userId: string;
  planId: PaidAccessLevel;
  expiresAt: Date;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
  cancelAtPeriodEnd: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  birthday?: Date | null;
  followers_count: number;
  followings_count: number;
  stripe_customer_id?: string | null;
  roles: UserRole[];
  userAccess?: UserAccess | null;
}

export interface UserFormData
  extends Omit<
    User,
    | "id"
    | "created_at"
    | "updated_at"
    | "roles"
    | "userAccess"
    | "followers_count"
    | "followings_count"
  > {
  id?: string;
  password?: string;
  roles: Array<"ADMIN" | "USER">;
}
