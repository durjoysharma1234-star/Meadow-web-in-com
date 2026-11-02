import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { AUTHORIZED_ADMIN_EMAILS } from './defaultData';

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation connection on boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'site', 'content'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
    return false;
  }
}

/**
 * Check if a given email is in the authorized admin list
 */
export function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(e => e.toLowerCase() === normalized);
}

/**
 * Google Sign-In strictly restricted to the authorized admin Gmails:
 * shekhor.mmc@gmail.com and durjoysharma1234@gmail.com
 */
export async function signInAdminWithGoogle(forceRedirect = false): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  if (forceRedirect) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;

    if (!user || !user.email || !isAuthorizedAdmin(user.email)) {
      await signOut(auth);
      throw new Error(
        'অননুমোদিত অ্যাক্সেস: শুধুমাত্র নির্দিষ্ট ২টি অনুমোদিত অ্যাডমিন জিমেইল দিয়ে লগইন করা সম্ভব। অন্য কোনো অ্যাকাউন্ট লগইন করার অনুমতি নেই।'
      );
    }

    return user;
  } catch (err: any) {
    if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user')) {
      // If popup is blocked by browser, attempt redirect fallback
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
        return null;
      }
    }
    throw err;
  }
}

export async function checkRedirectResult(): Promise<User | null> {
  try {
    const res = await getRedirectResult(auth);
    if (res && res.user) {
      if (!res.user.email || !isAuthorizedAdmin(res.user.email)) {
        await signOut(auth);
        throw new Error('অননুমোদিত অ্যাকাউন্ট! শুধুমাত্র নির্দিষ্ট ২টি অনুমোদিত অ্যাডমিন জিমেইল আইডি দিয়ে লগইন করা যাবে।');
      }
      return res.user;
    }
    return null;
  } catch (err) {
    console.warn('Redirect result check error:', err);
    throw err;
  }
}

export async function logOutAdmin(): Promise<void> {
  await signOut(auth).catch(() => {});
}

export { onAuthStateChanged, getRedirectResult };
