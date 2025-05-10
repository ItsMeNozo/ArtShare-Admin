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
    const response = await api.get<User>("/users/profile");
    return response.data;
  } catch (error) {
    console.error("getUserProfile error:", error);
    throw error;
  }
};
