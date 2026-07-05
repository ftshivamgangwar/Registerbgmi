import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  writeBatch, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError } from '../firebase';
import { UserProfile, OperationType } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  registerUser: (details: Omit<UserProfile, 'uid' | 'email' | 'createdAt'>) => Promise<void>;
  checkBgmiIdExists: (bgmiId: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const adminEmail = "ftshivamgangwar@gmail.com";
  const isAdmin = user?.email === adminEmail;

  const fetchProfile = async (uid: string) => {
    setProfileLoading(true);
    const docPath = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Gracefully log and handle permission or network errors
      console.error("Error fetching user profile:", error);
      handleFirestoreError(error, OperationType.GET, docPath);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-Out Error:", error);
      throw error;
    }
  };

  const checkBgmiIdExists = async (bgmiId: string): Promise<boolean> => {
    const docPath = `bgmi_ids/${bgmiId}`;
    try {
      const docRef = doc(db, 'bgmi_ids', bgmiId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error("Error checking BGMI ID:", error);
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  };

  const registerUser = async (details: Omit<UserProfile, 'uid' | 'email' | 'createdAt'>) => {
    if (!user) throw new Error("Must be logged in to register.");
    if (!user.emailVerified) throw new Error("Email must be verified to register.");

    setProfileLoading(true);
    const batch = writeBatch(db);

    const userDocRef = doc(db, 'users', user.uid);
    const bgmiIdDocRef = doc(db, 'bgmi_ids', details.bgmiId);

    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      realName: details.realName,
      bgmiId: details.bgmiId,
      bgmiName: details.bgmiName,
      upiId: details.upiId,
      instagramId: details.instagramId,
      whatsappNumber: details.whatsappNumber,
      createdAt: serverTimestamp(),
    };

    batch.set(userDocRef, newUserProfile);
    batch.set(bgmiIdDocRef, { uid: user.uid });

    try {
      await batch.commit();
      // Fetch latest profile state from server
      await fetchProfile(user.uid);
    } catch (error) {
      console.error("Registration batch commit error:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid} and bgmi_ids/${details.bgmiId}`);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      profile,
      loading,
      profileLoading,
      isAdmin,
      signInWithGoogle,
      signOutUser,
      registerUser,
      checkBgmiIdExists,
      refreshProfile,
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
