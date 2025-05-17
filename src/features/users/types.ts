import { User } from "../../types/user"; // Adjusted path

export type SemanticSubscriptionStatus =
  | "active"
  | "active_free"
  | "cancels_soon"
  | "admin_na"
  | "no_plan";

export interface SubscriptionStatusInfo {
  text: string;
  semantic: SemanticSubscriptionStatus;
}

export interface CustomChipStyling {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
}

export type Order = "asc" | "desc";

export type SortableUser = User & {
  currentPlan?: string;
  created_at_sortable?: string;
};

export type UserSortableKeys =
  | "username"
  | "fullName"
  | "email"
  | "currentPlan"
  | "created_at_sortable";

export interface HeadCell {
  id: UserSortableKeys | "avatar" | "roles" | "actions";
  label: string;
  numeric: boolean;
  sortable: boolean;
  minWidth?: number | string;
  align?: "left" | "right" | "center";
  disablePadding?: boolean;
  className?: string;
}
