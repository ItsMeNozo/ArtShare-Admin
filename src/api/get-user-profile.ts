import api from './baseApi';
import type { User } from '../types/user';
/**
 * GET /users/profile
 *
 * Fetches the currently logged-in user's profile data
 *
 * @returns A promise resolving to the User object
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<any>('/users/profile');
    const userData = response.data;

    // Transform snake_case fields to camelCase to match User interface
    const transformedUser: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.full_name || userData.fullName || null,
      profilePictureUrl:
        userData.profile_picture_url || userData.profilePictureUrl || null,
      bio: userData.bio || null,
      createdAt: userData.created_at || userData.createdAt,
      updatedAt: userData.updated_at || userData.updatedAt || null,
      birthday: userData.birthday || null,
      followersCount: userData.followers_count ?? userData.followersCount ?? 0,
      followingsCount:
        userData.followings_count ?? userData.followingsCount ?? 0,
      stripeCustomerId:
        userData.stripe_customer_id || userData.stripeCustomerId || null,
      roles: userData.roles || [],
      userAccess: userData.userAccess || userData.user_access || null,
    };

    return transformedUser;
  } catch (error) {
    console.error('getUserProfile error:', error);
    throw error;
  }
};
