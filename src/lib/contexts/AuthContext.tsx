"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, getIdToken, onAuthStateChanged } from "firebase/auth";
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
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
      setUser(user);
      
      if (user) {
        try {
          // Skip session creation for now as it's causing issues
          console.log("User authenticated:", user.email);
        } catch (error) {
          console.error("Error handling auth state:", error);
        }
      } else {
        console.log("No user is signed in");
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  // Create a session using the Firebase ID token - skipping for now
  const createSession = async (idToken: string) => {
    try {
      console.log("Attempting to create session");
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
        console.error("Session creation failed:", response.status);
        return;
      }
      
      console.log("Session created successfully");
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  // Clear the session when signing out - skipping for now
  const clearSession = async () => {
    try {
      console.log("Attempting to clear session");
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.error("Session clearing failed:", response.status);
        return;
      }
      
      console.log("Session cleared successfully");
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Attempting to sign in with Google");
      const result = await signInWithPopup(auth, provider);
      
      // After successful sign-in, create a session
      if (result.user) {
        console.log("Google sign-in successful:", result.user.email);
        // Skip for now
        // const idToken = await getIdToken(result.user);
        // await createSession(idToken);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      console.log("Attempting to sign out");
      // Skip for now
      // await clearSession();
      await firebaseSignOut(auth);
      setUser(null);
      console.log("Sign out successful");
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
