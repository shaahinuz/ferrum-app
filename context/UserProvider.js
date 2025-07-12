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
      await firebaseUser.reload(); // 🔁 Refresh email verification status
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const userData = userSnap.exists() ? userSnap.data() : {};

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        role: userData.role || 'client',
        name: userData.name || '',
        avatarUrl: userData.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png', // ✅ avatar fallback
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        loadUser(auth.currentUser);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
