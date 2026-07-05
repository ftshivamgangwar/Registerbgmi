import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { OperationType, FirestoreErrorInfo } from './types';

// Load configuration from local applet config if it exists, otherwise environment variables
import firebaseAppletConfig from '../firebase-applet-config.json';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig?.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig?.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig?.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig?.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig?.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig?.appId || "",
};

const app = initializeApp(config);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firestore
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseAppletConfig?.firestoreDatabaseId;
export const db = getFirestore(app, firestoreDatabaseId);

// Connection test as required by skill instructions
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Mandatory Firestore Error Handler matching the skill specifications
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
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
