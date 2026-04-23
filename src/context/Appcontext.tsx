import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import axios from "axios";

// 1. Define the User type
export type User = {
  _id: string;
  userID: string;
  name: string;
  email: string;
  role: "user" | "admin";
  photoURL?: string;
  phoneNumber?: string;
  address?: any;
  receiveTexts?: boolean;
  receiveEmails?: boolean;
};

// 2. Define the Context interface
export interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  authReady: boolean;
  isAdmin: boolean;
  loading: boolean;
  isActionInProgress: boolean;
  setIsActionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true); // Tracks the DB fetch process

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          // 1. Force a check against Firebase Auth servers
          // If the admin deleted them from Firebase, this throws an error immediately
          await firebaseUser.reload();

          const token = await firebaseUser.getIdToken();

          // 2. Fetch the full profile from MongoDB
          const res = await axios.get(`http://localhost:3000/api/users/me/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setCurrentUser(res.data.user);
        } catch (error: any) {
          console.error("Auth Validation Error:", error);

          // 3. THE KICK OUT LOGIC
          // 'auth/user-not-found' happens if deleted from Firebase Auth
          // 404 happens if deleted from your MongoDB
          if (error.code === 'auth/user-not-found' || error.response?.status === 404) {
            console.warn("Account no longer exists. Logging out...");
            await signOut(auth);
            setCurrentUser(null);
          } else {
            // Fallback for network issues, etc.
            setCurrentUser({
              _id: firebaseUser.uid,
              userID: firebaseUser.uid,
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              role: "user",
            });
          }
        }
      } else {
        setCurrentUser(null);
      }

      setAuthReady(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Derived state: true if user exists and has admin role
  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout,
      authReady,
      isAdmin,
      loading,
      isActionInProgress,
      setIsActionInProgress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};