import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import { UserContext } from './UserContext';

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (firebaseUser) => {
    try {
      await firebaseUser.reload(); // 🔁 Refresh the user's status from Firebase
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const role = userSnap.exists() ? userSnap.data().role : 'client';

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified, // ✅ track verification
        role,
      });
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadUser(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Refresh user every 5 seconds to detect if email was verified
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        loadUser(auth.currentUser);
      }
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
