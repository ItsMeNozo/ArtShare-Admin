export enum PaidAccessLevel {
  FREE = "free",
  ARTIST_PRO = "artist_pro",
  STUDIO = "studio",
  ENTERPRISE = "enterprise",
}

export const PLAN_DISPLAY_NAMES: Record<PaidAccessLevel, string> = {
  [PaidAccessLevel.FREE]: "Individual",
  [PaidAccessLevel.ARTIST_PRO]: "Artist Pro",
  [PaidAccessLevel.STUDIO]: "Studio",
  [PaidAccessLevel.ENTERPRISE]: "Enterprise",
};

export const PLAN_TIER_CUSTOM_COLORS: Record<string, string> = {
  [PaidAccessLevel.FREE]: "#6ecadc",
  [PaidAccessLevel.ARTIST_PRO]: "#3eb991",
  [PaidAccessLevel.STUDIO]: "#e9a820",
  [PaidAccessLevel.ENTERPRISE]: "#e01563",
  ADMIN_NA: "#bdbdbd",
  NO_PLAN: "#e0e0e0",
};
