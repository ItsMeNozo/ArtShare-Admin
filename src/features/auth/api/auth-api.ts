import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import axios from "axios";
import api from "../../../api/baseApi";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const signUp = async (
  email: string | "",
  password: string,
  username: string,
) => {
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUid = userCredential.user.uid;

    const response = await api.post(`/auth/register`, {
      userId: firebaseUid,
      email,
      username,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw error;
  }
};

/**
 * Sign in with Firebase email/password, then exchange the Firebase ID token
 * at your NestJS backend (/auth/admin-login) to receive your app’s access & refresh tokens.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const firebaseToken = await userCredential.user.getIdToken(true);

  const { data } = await api.post<AuthTokens>("/auth/admin-login", {
    token: firebaseToken,
  });

  return data;
}

/**
 * Sign the user out of Firebase, then notify your backend to invalidate
 * the server-side refresh token.
 */
export async function signOut(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await firebaseSignOut(auth);

    await axios.post("/auth/signout", { uid: user.uid });
  }
}

/**
 * Verify the current Firebase ID token with your backend.
 * Useful for checking session validity.
 */
export async function verifyToken(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const firebaseToken = await user.getIdToken();

  const { data } = await axios.post<{ valid: boolean }>("/auth/verify-token", {
    token: firebaseToken,
  });

  return data.valid;
}

export const updateUserPassword = async (password: string) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in to update the password.");
  }
  await updatePassword(user, password);
};
