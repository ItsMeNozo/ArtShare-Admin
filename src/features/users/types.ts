import { User } from '../../types/user';

export type SemanticSubscriptionStatus =
  | 'active'
  | 'active_free'
  | 'cancels_soon'
  | 'admin_na'
  | 'no_plan';

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

export interface DisplayUser extends User {
  currentPlan?: string;
}

export type Order = 'asc' | 'desc';

export type UserSortableKeys =
  | 'username'
  | 'email'
  | 'fullName'
  | 'createdAt'
  | 'currentPlan';

interface HeadCellBaseProps<T = any> {
  label: string;
  numeric?: boolean;
  minWidth?: number | string;
  align?: 'left' | 'right' | 'center';
  disablePadding?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
  isDate?: boolean;
}

export interface SortableHeadCell<T = any> extends HeadCellBaseProps<T> {
  id: UserSortableKeys;
  sortable: true;
}

export interface NonSortableHeadCell<T = any> extends HeadCellBaseProps<T> {
  id: string;
  sortable: false;
}

export type HeadCell<T = any> = SortableHeadCell<T> | NonSortableHeadCell<T>;
