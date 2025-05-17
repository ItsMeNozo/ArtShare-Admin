import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import axios from "axios";
import api from "../../../api/baseApi";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const signUp = async (
  email: string | "",
  password: string,
  username: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const response = await api.post(`/auth/register`, {
      userId: userCredential.user.uid,
      email,
      username,
    });
    return response.data;
  } catch (error) {
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
  // 1. Sign in via Firebase
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  // 2. Get a fresh Firebase ID token (includes custom claims)
  const firebaseToken = await userCredential.user.getIdToken(true);

  // 3. Send it to your backend for verification & token exchange
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
    // 1. Sign out locally
    await firebaseSignOut(auth);
    // 2. Tell your backend to revoke this user’s refresh token
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

  // 1. Get current token
  const firebaseToken = await user.getIdToken();

  // 2. Send to backend verify-token endpoint
  const { data } = await axios.post<{ valid: boolean }>("/auth/verify-token", {
    token: firebaseToken,
  });

  return data.valid;
}
