"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, getIdToken } from "firebase/auth";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        // When user signs in, get their ID token and create a session
        try {
          const idToken = await getIdToken(user);
          await createSession(idToken);
        } catch (error) {
          console.error("Error creating session:", error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create a session using the Firebase ID token
  const createSession = async (idToken: string) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  // Clear the session when signing out
  const clearSession = async () => {
    try {
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // After successful sign-in, create a session
      if (result.user) {
        const idToken = await getIdToken(result.user);
        await createSession(idToken);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      // Clear the session before signing out
      await clearSession();
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
