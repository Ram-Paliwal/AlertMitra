import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { INITIAL_HAZARDS } from '../data/initialHazards';

// Firebase configuration — supports .env variables with flexible fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyAlertMitraPublic2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alertmitra-safety.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alertmitra-safety",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alertmitra-safety.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475612:web:9876543210abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6JFJEP3P0G"
};

// Check if valid Firebase project is configured
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// Initialize Firebase App singleton
let app;
let auth;
let db;
let analytics;
let googleProvider;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (err) {
  console.warn('Firebase initialization warning:', err.message);
}

export { app, auth, db, analytics };

// ==========================================
// AUTHENTICATION: GOOGLE SIGN-IN & SIGNOUT
// ==========================================

/**
 * Sign in with Google Popup.
 * Falls back to instant simulated Google login if custom Firebase API key is not yet configured.
 */
export async function signInWithGoogle() {
  if (isFirebaseConfigured && auth) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        displayName: user.displayName || 'AlertMitra Citizen',
        email: user.email,
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        isDemoUser: false
      };
    } catch (error) {
      console.error('Firebase Google Sign-In error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed.');
      }
      // If Firebase project setup error (e.g. auth domain not authorized), fallback to local session
      console.warn('Falling back to local Google user profile session.');
    }
  }

  // Fallback demo Google user session when Firebase keys aren't in .env yet
  const mockUser = {
    uid: 'google-user-' + Math.random().toString(36).substring(2, 9),
    displayName: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    isDemoUser: true
  };
  localStorage.setItem('alertmitra_current_user', JSON.stringify(mockUser));
  return mockUser;
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
  localStorage.removeItem('alertmitra_current_user');
}

/**
 * Listen for Auth state changes
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'AlertMitra User',
          email: user.email,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
          isDemoUser: false
        });
      } else {
        const cached = localStorage.getItem('alertmitra_current_user');
        callback(cached ? JSON.parse(cached) : null);
      }
    });
  } else {
    // Local storage subscription
    const cached = localStorage.getItem('alertmitra_current_user');
    callback(cached ? JSON.parse(cached) : null);
    return () => {};
  }
}

// ==========================================
// FIRESTORE: LIVE HAZARDS SYNC & SEEDING
// ==========================================

const HAZARDS_COLLECTION = 'hazards';

/**
 * Listen to real-time hazards collection from Firestore.
 * Automatically seeds the database with initial 6 iRASTE hazards if empty!
 */
export function subscribeToHazards(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const hazardsRef = collection(db, HAZARDS_COLLECTION);
      
      const unsubscribe = onSnapshot(hazardsRef, (snapshot) => {
        if (snapshot.empty) {
          // Collection empty — seed with initial hazards
          seedInitialHazards();
          callback(INITIAL_HAZARDS);
        } else {
          const list = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() });
          });
          callback(list);
        }
      }, (err) => {
        console.warn('Firestore subscription fallback:', err.message);
        // Fallback to local storage if Firestore rules/connection fails
        loadLocalHazards(callback);
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore failed to initialize, using local persistent storage:', err);
      return loadLocalHazards(callback);
    }
  } else {
    return loadLocalHazards(callback);
  }
}

/**
 * Seed initial hazards to Firestore
 */
async function seedInitialHazards() {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const h of INITIAL_HAZARDS) {
      const docRef = doc(db, HAZARDS_COLLECTION, h.id);
      await setDoc(docRef, { ...h, createdAt: new Date().toISOString() });
    }
    console.log('[Firestore] Seeded initial hazards successfully.');
  } catch (err) {
    console.warn('Error seeding initial hazards:', err);
  }
}

/**
 * Local storage persistent hazards fallback
 */
function loadLocalHazards(callback) {
  const cached = localStorage.getItem('alertmitra_hazards_store');
  if (cached) {
    try {
      callback(JSON.parse(cached));
    } catch {
      callback(INITIAL_HAZARDS);
    }
  } else {
    localStorage.setItem('alertmitra_hazards_store', JSON.stringify(INITIAL_HAZARDS));
    callback(INITIAL_HAZARDS);
  }

  // Listen to window storage events across tabs
  const listener = () => {
    const fresh = localStorage.getItem('alertmitra_hazards_store');
    if (fresh) callback(JSON.parse(fresh));
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

/**
 * Create / Report a new hazard to Firestore
 */
export async function addHazardToDatabase(newHazard) {
  const hazardPayload = {
    ...newHazard,
    id: newHazard.id || `HAZ-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString(),
    verificationStatus: 'UNVERIFIED',
    confirmationsCount: 1,
    confidence: newHazard.hasPhoto ? 40 : 25
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, HAZARDS_COLLECTION, hazardPayload.id);
      await setDoc(docRef, hazardPayload);
      return hazardPayload;
    } catch (err) {
      console.warn('Firestore write failed, saving to local store:', err);
    }
  }

  // Update local store
  const cached = localStorage.getItem('alertmitra_hazards_store');
  const currentList = cached ? JSON.parse(cached) : INITIAL_HAZARDS;
  const updatedList = [hazardPayload, ...currentList.filter(h => h.id !== hazardPayload.id)];
  localStorage.setItem('alertmitra_hazards_store', JSON.stringify(updatedList));
  return hazardPayload;
}

/**
 * Confirm an existing hazard report (community corroboration)
 */
export async function confirmHazardInDatabase(hazardId, currentHazard) {
  const updatedConfirmations = (currentHazard.confirmationsCount || 1) + 1;
  const updatedConfidence = Math.min(85, (currentHazard.confidence || 30) + 12);
  const newStatus = updatedConfirmations >= 3 && currentHazard.verificationStatus === 'UNVERIFIED'
    ? 'COMMUNITY CORROBORATED'
    : currentHazard.verificationStatus;

  const updates = {
    confirmationsCount: updatedConfirmations,
    confidence: updatedConfidence,
    verificationStatus: newStatus,
    lastConfirmedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, HAZARDS_COLLECTION, hazardId);
      await updateDoc(docRef, updates);
      return { ...currentHazard, ...updates };
    } catch (err) {
      console.warn('Firestore update failed, saving locally:', err);
    }
  }

  // Update local store
  const cached = localStorage.getItem('alertmitra_hazards_store');
  const currentList = cached ? JSON.parse(cached) : INITIAL_HAZARDS;
  const updatedList = currentList.map(h => (h.id === hazardId ? { ...h, ...updates } : h));
  localStorage.setItem('alertmitra_hazards_store', JSON.stringify(updatedList));
  return { ...currentHazard, ...updates };
}

/**
 * Admin: Verify, Reject, or mark Under Investigation in Firestore
 */
export async function updateHazardStatusInDatabase(hazardId, newStatus, adminNote, confidence = 99) {
  const updates = {
    verificationStatus: newStatus,
    confidence: newStatus === 'VERIFIED' ? confidence : newStatus === 'REJECTED' ? 0 : 50,
    adminRemarks: adminNote,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, HAZARDS_COLLECTION, hazardId);
      await updateDoc(docRef, updates);
      return updates;
    } catch (err) {
      console.warn('Firestore admin update failed, saving locally:', err);
    }
  }

  // Update local store
  const cached = localStorage.getItem('alertmitra_hazards_store');
  const currentList = cached ? JSON.parse(cached) : INITIAL_HAZARDS;
  const updatedList = currentList.map(h => (h.id === hazardId ? { ...h, ...updates } : h));
  localStorage.setItem('alertmitra_hazards_store', JSON.stringify(updatedList));
  return updates;
}
