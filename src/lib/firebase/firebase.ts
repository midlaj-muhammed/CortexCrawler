// src/lib/firebase/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in a build environment and provide fallbacks
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnvVars.apiKey || (isBuilding ? 'build-placeholder' : ''),
  authDomain: requiredEnvVars.authDomain || (isBuilding ? 'build-placeholder.firebaseapp.com' : ''),
  projectId: requiredEnvVars.projectId || (isBuilding ? 'build-placeholder' : ''),
  storageBucket: requiredEnvVars.storageBucket || (isBuilding ? 'build-placeholder.appspot.com' : ''),
  messagingSenderId: requiredEnvVars.messagingSenderId || (isBuilding ? '123456789' : ''),
  appId: requiredEnvVars.appId || (isBuilding ? '1:123456789:web:build-placeholder' : ''),
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Only validate in runtime, not during build
if (typeof window !== 'undefined' && !isBuilding) {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn('Missing Firebase environment variables:', missingVars);
  }
}

// Initialize Firebase
let app: any;
let auth: any;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create a mock auth object for build time
  if (isBuilding) {
    auth = {} as any;
    app = {} as any;
  } else {
    throw error;
  }
}

export { app, auth };
