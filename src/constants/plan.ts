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
