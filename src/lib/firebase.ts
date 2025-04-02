// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      virtualBankStatus: "pending", // Initial status
      wallets: []
    });
    
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Database functions
export const getUserData = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

export const updateUserData = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const submitACHApplication = async (userId: string, applicationData: any) => {
  try {
    console.log("Starting ACH application submission for user:", userId);
    console.log("Application data:", applicationData);
    
    const applicationRef = doc(collection(db, "achApplications"));
    console.log("Created application reference:", applicationRef.id);
    
    await setDoc(applicationRef, {
      userId,
      ...applicationData,
      status: "pending",
      createdAt: new Date()
    });
    console.log("Document created successfully");
    
    // Update user's virtual bank status
    await updateUserData(userId, {
      virtualBankStatus: "in_progress",
      virtualBankCreatedAt: new Date()
    });
    console.log("User status updated successfully");
    
    return applicationRef.id;
  } catch (error) {
    console.error("Detailed error submitting ACH application:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};


export const getTransactions = async (userId: string, limit = 10) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: any[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

export const connectWallet = async (userId: string, wallet: any) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const wallets = userData.wallets || [];
      
      // Check if wallet already exists
      const walletExists = wallets.some((w: any) => w.address === wallet.address);
      
      if (!walletExists) {
        await updateDoc(userRef, {
          wallets: [...wallets, { ...wallet, connectedAt: new Date() }],
          updatedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
};

export { auth, db };