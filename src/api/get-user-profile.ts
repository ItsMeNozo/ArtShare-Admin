import api from "./baseApi";
import type { User } from "../types/user";
/**
 * GET /users/profile
 *
 * Fetches the currently logged-in user's profile data
 *
 * @returns A promise resolving to the User object
 */
export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<any>("/users/profile");
    const userData = response.data;

    // Transform snake_case fields to camelCase to match User interface
    const transformedUser: User = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName || null,
      profilePictureUrl: userData.profilePictureUrl || null,
      bio: userData.bio || null,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt || null,
      birthday: userData.birthday || null,
      followersCount: userData.followersCount ?? 0,
      followingsCount: userData.followingsCount ?? 0,
      stripeCustomerId: userData.stripeCustomerId || null,
      roles: userData.roles || [],
      userAccess: userData.userAccess || null,
      status: userData.status || null,
    };

    return transformedUser;
  } catch (error) {
    console.error("getUserProfile error:", error);
    throw error;
  }
};
