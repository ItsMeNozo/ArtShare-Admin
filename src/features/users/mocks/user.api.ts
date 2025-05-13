import { PaidAccessLevel } from "../../../constants/plan";
import {
  User,
  UserFormData,
  UserRole,
  Role,
  UserAccess,
} from "../../../types/user";

export const MOCK_AVAILABLE_ROLES: Role[] = [
  { role_id: 1, role_name: "ADMIN", createdAt: new Date() },
  { role_id: 2, role_name: "USER", createdAt: new Date() },
];

const ADMIN_ROLE = MOCK_AVAILABLE_ROLES.find((r) => r.role_name === "ADMIN")!;
const USER_ROLE = MOCK_AVAILABLE_ROLES.find((r) => r.role_name === "USER")!;

let mockUsers: User[] = [
  {
    id: "1",
    username: "admin_supreme",
    email: "supreme_admin@example.com",
    full_name: "Supreme Administrator",
    profile_picture_url: "https://i.pravatar.cc/150?img=7",
    bio: "I rule this digital realm.",
    created_at: new Date("2022-12-01T10:00:00Z"),
    birthday: new Date("1985-01-01"),
    followers_count: 500,
    followings_count: 10,
    stripe_customer_id: null,
    roles: [
      {
        user_id: "1",
        role_id: ADMIN_ROLE.role_id,
        assignedAt: new Date(),
        role: ADMIN_ROLE,
      },
    ],
    userAccess: null,
  },
  {
    id: "2",
    username: "artist_jane",
    email: "jane.artist@example.com",
    full_name: 'Jane "Artiste" Doe',
    profile_picture_url: "https://i.pravatar.cc/150?img=2",
    bio: "Creating masterpieces daily.",
    created_at: new Date("2023-03-20T14:30:00Z"),
    birthday: new Date("1995-08-10"),
    followers_count: 1200,
    followings_count: 300,
    stripe_customer_id: "cus_artistjane",
    roles: [
      {
        user_id: "2",
        role_id: USER_ROLE.role_id,
        assignedAt: new Date(),
        role: USER_ROLE,
      },
    ],
    userAccess: {
      userId: "2",
      planId: PaidAccessLevel.ARTIST_PRO,
      expiresAt: new Date(new Date().setDate(new Date().getDate() + 60)),
      stripeSubscriptionId: "sub_artistpro123",
      stripePriceId: "price_artistpro_monthly",
      stripeCustomerId: "cus_artistjane",
      createdAt: new Date("2023-03-20T14:30:00Z"),
      updatedAt: new Date("2023-03-20T14:30:00Z"),
      cancelAtPeriodEnd: false,
    },
  },
  {
    id: "3",
    username: "studio_owner_john",
    email: "john.studio@example.com",
    full_name: "John Smith (Studio)",
    profile_picture_url: "https://i.pravatar.cc/150?img=3",
    bio: "Running a busy studio.",
    created_at: new Date("2023-05-10T09:00:00Z"),
    birthday: null,
    followers_count: 50,
    followings_count: 120,
    stripe_customer_id: "cus_studiojohn",
    roles: [
      {
        user_id: "3",
        role_id: USER_ROLE.role_id,
        assignedAt: new Date(),
        role: USER_ROLE,
      },
    ],
    userAccess: {
      userId: "3",
      planId: PaidAccessLevel.STUDIO,
      expiresAt: new Date(new Date().setDate(new Date().getDate() - 5)),
      stripeSubscriptionId: "sub_studioxyz",
      stripePriceId: "price_studio_yearly",
      stripeCustomerId: "cus_studiojohn",
      createdAt: new Date("2023-01-10T09:00:00Z"),
      updatedAt: new Date("2023-01-10T09:00:00Z"),
      cancelAtPeriodEnd: false,
    },
  },
  {
    id: "4",
    username: "free_user_bob",
    email: "bob.free@example.com",
    full_name: "Bob The Free User",
    profile_picture_url: null,
    bio: "Just checking things out.",
    created_at: new Date("2023-08-15T11:00:00Z"),
    birthday: new Date("2000-02-20"),
    followers_count: 5,
    followings_count: 2,
    stripe_customer_id: "cus_freebob",
    roles: [
      {
        user_id: "4",
        role_id: USER_ROLE.role_id,
        assignedAt: new Date(),
        role: USER_ROLE,
      },
    ],
    userAccess: {
      userId: "4",
      planId: PaidAccessLevel.FREE,
      expiresAt: new Date(
        new Date().setFullYear(new Date().getFullYear() + 99),
      ),
      stripeSubscriptionId: "sub_free123",
      stripePriceId: "price_free_tier",
      stripeCustomerId: "cus_freebob",
      createdAt: new Date("2023-08-15T11:00:00Z"),
      updatedAt: new Date("2023-08-15T11:00:00Z"),
      cancelAtPeriodEnd: false,
    },
  },
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const fetchUsers = async (): Promise<User[]> => {
  await delay(500);
  return [...mockUsers];
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  await delay(500);
  const newUserId = String(Date.now());
  const newUser: User = {
    id: newUserId,
    username: userData.username,
    email: userData.email,
    full_name: userData.full_name || null,
    profile_picture_url: userData.profile_picture_url || null,
    bio: userData.bio || null,
    created_at: new Date(),
    birthday: userData.birthday
      ? new Date(userData.birthday as unknown as string)
      : null,
    followers_count: 0,
    followings_count: 0,
    stripe_customer_id: null,
    roles: userData.roles.map((roleName) => {
      const role = MOCK_AVAILABLE_ROLES.find((r) => r.role_name === roleName);
      if (!role) throw new Error(`Role ${roleName} not found`);
      return {
        user_id: newUserId,
        role_id: role.role_id,
        assignedAt: new Date(),
        role: role,
      };
    }),
    userAccess: null,
  };
  mockUsers.push(newUser);
  return newUser;
};

export const updateUser = async (
  id: String,
  userData: UserFormData,
): Promise<User | null> => {
  await delay(500);
  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) return null;

  const existingUser = mockUsers[userIndex];
  const updatedUser: User = {
    ...existingUser,
    username: userData.username,
    email: userData.email,
    full_name: userData.full_name || null,
    profile_picture_url: userData.profile_picture_url || null,
    bio: userData.bio || null,
    birthday: userData.birthday
      ? new Date(userData.birthday as unknown as string)
      : null,
    roles: userData.roles.map((roleName) => {
      const role = MOCK_AVAILABLE_ROLES.find((r) => r.role_name === roleName);
      if (!role) throw new Error(`Role ${roleName} not found`);
      const existingUserRole = existingUser.roles.find(
        (ur) => ur.role.role_name === roleName,
      );
      return {
        user_id: id,
        role_id: role.role_id,
        assignedAt: existingUserRole ? existingUserRole.assignedAt : new Date(),
        role: role,
      } as UserRole;
    }),

    userAccess:
      existingUser.roles.some((ur) => ur.role.role_name === "ADMIN") &&
      userData.roles.includes("ADMIN")
        ? null
        : existingUser.userAccess,
    updated_at: new Date(),
  };
  mockUsers[userIndex] = updatedUser;
  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  // Ensure ID is expected as string if that's what User.id is
  console.log(`Mock Service: deleteUser called for ID: ${id}`); // DEBUG in service
  await delay(500); // Simulate network latency
  const initialLength = mockUsers.length;
  mockUsers = mockUsers.filter((user) => user.id !== id);
  const successful = mockUsers.length < initialLength;
  console.log(
    `Mock Service: deleteUser for ID ${id}. Success: ${successful}. New mockUsers length: ${mockUsers.length}`,
  ); // DEBUG in service
  return successful; // Return true if an element was removed, false otherwise
};
