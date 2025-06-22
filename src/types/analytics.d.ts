export interface OverallUserStats {
  totalUsers: number;
  newUsersLast30Days: number;
  onboardedUsers: number;
  onboardingCompletionRate: number;
}

export interface OverallPostStats {
  totalPosts: number;
  newPostsLast30Days: number;
  publishedPosts: number;
  draftPosts: number;
  privatePosts: number;
  publicPosts: number;
  aiCreatedPosts: number;
  matureContentPosts: number;
}

export interface CategoryPostCount {
  categoryName: string;
  postCount: number;
}

export interface PostsByCategory {
  data: CategoryPostCount[];
}

export interface PopularCategory {
  categoryName: string;
  postCount: number;
  totalEngagementScore: number;
}

export interface PopularCategories {
  data: PopularCategory[];
}

export interface ContentFunnel {
  usersWhoPostedCount: number;
  postsWithViewsCount: number;
  postsWithEngagementCount: number;
}

export interface FollowerEngagementTier {
  tierDescription: string;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  postsAnalyzed: number;
}

export interface PlanContentInsight {
  planName: string;
  averagePostsPerUserOnPlan: number;
  averageLikesPerPostByUsersOnPlan: number;
  averageCommentsPerPostByUsersOnPlan: number;
  postsAnalyzedForEngagement: number;
  usersAnalyzedForPostCount: number;
}

export interface AiContentEngagement {
  averageLikes_AiPosts: number;
  averageComments_AiPosts: number;
  averageViews_AiPosts: number;
  aiPostsAnalyzed: number;
  averageLikes_NonAiPosts: number;
  averageComments_NonAiPosts: number;
  averageViews_NonAiPosts: number;
  nonAiPostsAnalyzed: number;
}

export interface TimeToAction {
  avgHoursSignupToFirstPost: number | null;
  avgHoursPostToFirstInteraction: number | null;
}

export interface PlatformWideStats {
  contentFunnel: ContentFunnel;
  followerEngagementInsights: FollowerEngagementTier[];
  planContentInsights: PlanContentInsight[];
  aiContentEngagement: AiContentEngagement;
  timeToAction: TimeToAction;
}

export interface TimePoint {
  date: string;
  count: number;
}

export interface TimeSeriesData {
  data: TimePoint[];
}

export type PopularCategorySortBy = "postCount" | "engagement";
