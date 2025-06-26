import { ChipProps, Theme } from '@mui/material';

import {
  CustomChipStyling,
  Order,
  SubscriptionStatusInfo,
  UserSortableKeys,
} from '../types';
import {
  PaidAccessLevel,
  PLAN_DISPLAY_NAMES,
  PLAN_TIER_CUSTOM_COLORS,
} from '../../../constants/plan';
import { User } from '../../../types/user';
import { UserStatus } from '../../../constants/user';
import { UserRoleType } from '../../../constants/roles';

/**
 * Utility function to get the primary role from an array of roles.
 * Admin takes priority over user roles.
 */
export function getPrimaryRole(
  roles: UserRoleType[] | string[] | undefined,
): UserRoleType {
  if (!roles || roles.length === 0) return 'USER';

  // Admin takes priority over user
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('USER')) return 'USER';

  // Default to first role if none of the expected roles are found
  return roles[0] as UserRoleType;
}

export function getPlanDisplayName(
  planId: PaidAccessLevel | string | null | undefined,
): string {
  if (
    !planId ||
    !Object.values(PaidAccessLevel).includes(planId as PaidAccessLevel)
  ) {
    return 'N/A';
  }
  return PLAN_DISPLAY_NAMES[planId as PaidAccessLevel] || 'Unknown Plan';
}

export const getSubscriptionStatusInfo = (
  user: User | null,
): SubscriptionStatusInfo => {
  if (!user) {
    return { text: 'N/A', semantic: 'no_plan' };
  }
  if (user.roles && Array.isArray(user.roles) && user.roles.includes('ADMIN')) {
    return { text: 'N/A (Admin)', semantic: 'admin_na' };
  }
  if (!user.userAccess) {
    return {
      text: getPlanDisplayName(PaidAccessLevel.FREE),
      semantic: 'active_free',
    };
  }
  const { expiresAt, cancelAtPeriodEnd, planId } = user.userAccess;
  if (!expiresAt || planId === PaidAccessLevel.FREE) {
    return { text: getPlanDisplayName(planId), semantic: 'active_free' };
  }

  const now = new Date();
  if (planId !== PaidAccessLevel.FREE && new Date(expiresAt) < now) {
    return {
      text: `${getPlanDisplayName(PaidAccessLevel.FREE)} (Expired: ${getPlanDisplayName(planId)})`,
      semantic: 'active_free',
    };
  }

  if (cancelAtPeriodEnd) {
    return {
      text: `${getPlanDisplayName(planId)} (Cancels at period end)`,
      semantic: 'cancels_soon',
    };
  }
  return { text: getPlanDisplayName(planId), semantic: 'active' };
};

export const getCurrentEffectivePlanNameForTable = (
  user: User | null,
  statusInfo: SubscriptionStatusInfo,
): string => {
  if (!user || statusInfo.semantic === 'admin_na') {
    return 'N/A';
  }
  if (
    statusInfo.semantic === 'no_plan' ||
    statusInfo.semantic === 'active_free'
  ) {
    return getPlanDisplayName(PaidAccessLevel.FREE);
  }
  if (user.userAccess) {
    if (
      statusInfo.semantic === 'active' ||
      statusInfo.semantic === 'cancels_soon'
    ) {
      return getPlanDisplayName(user.userAccess.planId);
    }
  }
  return getPlanDisplayName(PaidAccessLevel.FREE);
};

export const getPlanTierStyling = (
  user: User | null,
  theme: Theme,
): { style: CustomChipStyling; variant: 'filled' | 'outlined' } => {
  if (!user) {
    const defaultColor = PLAN_TIER_CUSTOM_COLORS.NO_PLAN;
    return {
      style: {
        borderColor: defaultColor,
        color: theme.palette.getContrastText(defaultColor),
        borderWidth: 1,
        borderStyle: 'solid',
      },
      variant: 'outlined',
    };
  }
  const statusInfo = getSubscriptionStatusInfo(user);
  let baseColor: string;
  let determinedVariant: 'filled' | 'outlined';

  if (statusInfo.semantic === 'admin_na') {
    baseColor = PLAN_TIER_CUSTOM_COLORS.ADMIN_NA;
    determinedVariant = 'outlined';
  } else if (statusInfo.semantic === 'no_plan') {
    baseColor = PLAN_TIER_CUSTOM_COLORS.NO_PLAN;
    determinedVariant = 'outlined';
  } else {
    let effectivePlanId = user.userAccess?.planId;
    if (!user.userAccess) {
      effectivePlanId = PaidAccessLevel.FREE;
    } else if (
      user.userAccess.planId !== PaidAccessLevel.FREE &&
      (!user.userAccess.expiresAt ||
        new Date(user.userAccess.expiresAt) < new Date())
    ) {
      effectivePlanId = PaidAccessLevel.FREE;
    }
    baseColor =
      PLAN_TIER_CUSTOM_COLORS[effectivePlanId as string] ||
      PLAN_TIER_CUSTOM_COLORS.NO_PLAN;

    determinedVariant = 'filled';
  }

  if (determinedVariant === 'filled') {
    return {
      style: {
        backgroundColor: baseColor,
        color: theme.palette.getContrastText(baseColor),
      },
      variant: determinedVariant,
    };
  } else {
    return {
      style: {
        borderColor: baseColor,
        color: baseColor,
        borderWidth: 1,
        borderStyle: 'solid',
      },
      variant: determinedVariant,
    };
  }
};

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const valA = a[orderBy];
  const valB = b[orderBy];

  if (valB == null && valA != null) return -1;
  if (valA == null && valB != null) return 1;
  if (valB == null && valA == null) return 0;

  const strA = typeof valA === 'string' ? valA.toLowerCase() : valA;
  const strB = typeof valB === 'string' ? valB.toLowerCase() : valB;

  if (strB < strA) return -1;
  if (strB > strA) return 1;
  return 0;
}

export function getComparator<Key extends keyof UserSortableKeys>(
  order: Order,
  orderBy: Key,
): (a: UserSortableKeys, b: UserSortableKeys) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export const getStatusChipProps = (
  status: UserStatus,
): { color: ChipProps['color']; label: string } => {
  switch (status) {
    case UserStatus.ACTIVE:
      return { color: 'success', label: 'Active' };
    case UserStatus.SUSPENDED:
      return { color: 'error', label: 'Suspended' };
    case UserStatus.INACTIVE:
    default:
      return { color: 'default', label: 'Inactive' };
  }
};
