
import firebase from 'firebase/app';
import 'firebase/auth';
import axios from 'axios';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

/**
 * Sign in with Firebase email/password, then exchange the Firebase ID token
 * at your NestJS backend (/auth/login) to receive your app’s access & refresh tokens.
 */
export async function signIn(email: string, password: string): Promise<AuthTokens> {
  // 1. Sign in via Firebase
  const userCred = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password);

  // 2. Get a fresh Firebase ID token (includes custom claims)
  const firebaseToken = await userCred.user!.getIdToken(true);

  // 3. Send it to your backend for verification & token exchange
  const { data } = await axios.post<AuthTokens>('/auth/login', {
    token: firebaseToken,
  });

  return data;
}

/**
 * Sign the user out of Firebase, then notify your backend to invalidate
 * the server-side refresh token.
 */
export async function signOut(): Promise<void> {
  const user = firebase.auth().currentUser;
  if (user) {
    // 1. Sign out locally
    await firebase.auth().signOut();
    // 2. Tell your backend to revoke this user’s refresh token
    await axios.post('/auth/signout', { uid: user.uid });
  }
}

/**
 * Verify the current Firebase ID token with your backend.
 * Useful for checking session validity.
 */
export async function verifyToken(): Promise<boolean> {
  const user = firebase.auth().currentUser;
  if (!user) return false;

  // 1. Get current token
  const firebaseToken = await user.getIdToken();

  // 2. Send to backend verify-token endpoint
  const { data } = await axios.post<{ valid: boolean }>('/auth/verify-token', {
    token: firebaseToken,
  });

  return data.valid;
}
