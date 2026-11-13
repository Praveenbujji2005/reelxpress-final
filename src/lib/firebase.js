import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  getPersistentCacheIndexManager,
  disablePersistentCacheIndexAutoCreation,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Silence internal Firestore multi-tab lease election and index backfill notices
try {
  setLogLevel('silent');
} catch {
  // Ignore in environments where setLogLevel is not permitted
}

// Suppress benign Firestore multi-tab internal lease election errors in the browser console
// so that Next.js / Turbopack dev error overlays are not triggered when non-primary tabs retry
if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
  const originalConsoleError = console.error.bind(console);
  console.error = (...args) => {
    const raw = args
      .map((arg) => (typeof arg === 'string' ? arg : arg?.message || ''))
      .join(' ');
    if (
      raw.includes("Failed to obtain primary lease for action 'Backfill Indexes'") ||
      raw.includes('Failed to obtain primary lease')
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

/**
 * Firebase Configuration for ReelXpress
 * Values are securely read from NEXT_PUBLIC_FIREBASE_* environment variables.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
};

/**
 * Determines whether valid Firebase credentials have been configured in environment variables.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 10 &&
  !firebaseConfig.apiKey.includes('YourFirebase') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.length > 3
);

let app = null;
let auth = null;
let db = null;
let storage = null;

if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
  try {
    if (isFirebaseConfigured) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);

      // Initialize Firestore with client-side IndexedDB persistence if supported in browser
      if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
        try {
          db = initializeFirestore(app, {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
          });
        } catch {
          // If initializeFirestore was already called or persistence not available
          db = getFirestore(app);
        }

        // Disable automatic persistent cache index creation to prevent background lease contention
        try {
          const indexManager = getPersistentCacheIndexManager(db);
          if (indexManager) {
            disablePersistentCacheIndexAutoCreation(indexManager);
          }
        } catch {
          // Ignore if indexManager is unsupported
        }
      } else {
        db = getFirestore(app);
      }

      storage = getStorage(app);
    }
  } catch (err) {
    console.warn('Firebase initialization notice:', err?.message || err);
  }
}

export { app, auth, db, storage, firebaseConfig };
