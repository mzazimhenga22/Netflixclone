'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const { auth, firestore, firebaseApp } = initializeFirebase();

// Returns Firebase SDKs in a safe way for client and build
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  if (typeof window === 'undefined') {
    // On server-side / build, always initialize with explicit config
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } else {
    // On client-side, try auto-init (Firebase Hosting) first
    if (!getApps().length) {
      try {
        firebaseApp = initializeApp(); // auto-init via hosting env
      } catch (e) {
        console.warn('Auto init failed, falling back to config', e);
        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      firebaseApp = getApp();
    }
  }

  return getSdks(firebaseApp);
}

// Utility to return all used SDKs
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

export { auth, firestore, firebaseApp };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
