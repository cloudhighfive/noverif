// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp,
  deleteDoc // Add this import
} from "firebase/firestore";
import { Notification, Invoice } from "@/types";

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
      wallets: [],
      suspended: false // Initial suspension status
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

export const getTransactions = async (userId: string, limitCount: number = 10) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount) // Use a different parameter name to avoid confusion
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: any[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({ 
        id: doc.id, 
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      });
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

// New Notification Functions
export const addNotification = async (
  notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
): Promise<string> => {
  try {
    const notificationRef = doc(collection(db, "notifications"));
    await setDoc(notificationRef, {
      ...notification,
      read: false,
      createdAt: new Date()
    });
    return notificationRef.id;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() as Date
      } as Notification);
    });
    
    return notifications;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Create an array of promises instead of using 'batch'
    const updatePromises: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
      const notificationRef = doc(db, "notifications", document.id);
      updatePromises.push(updateDoc(notificationRef, { read: true }));
    });
    
    // Execute all update operations in parallel
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Create a new invoice
export const createInvoice = async (userId: string, invoiceData: Omit<Invoice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const invoiceRef = doc(collection(db, "invoices"));
    const timestamp = new Date();
    
    // Create a clean data object without undefined values
    const cleanedData = { ...invoiceData };
    
    if (cleanedData.recurringFrequency === undefined) {
      delete cleanedData.recurringFrequency;
    }
    
    await setDoc(invoiceRef, {
      ...cleanedData,
      id: invoiceRef.id,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    return invoiceRef.id;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Get all invoices for a user
export const getUserInvoices = async (userId: string): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, "invoices"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        ...data,
        id: doc.id,
        issueDate: data.issueDate instanceof Timestamp ? data.issueDate.toDate() : data.issueDate,
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Invoice);
    });
    
    return invoices;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
};

// Get a single invoice by ID
export const getInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
  try {
    const invoiceDoc = await getDoc(doc(db, "invoices", invoiceId));
    
    if (!invoiceDoc.exists()) {
      return null;
    }
    
    const data = invoiceDoc.data();
    return {
      ...data,
      id: invoiceDoc.id,
      issueDate: data.issueDate instanceof Timestamp ? data.issueDate.toDate() : data.issueDate,
      dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
    } as Invoice;
  } catch (error) {
    console.error("Error getting invoice:", error);
    throw error;
  }
};

// Update an invoice
export const updateInvoice = async (invoiceId: string, invoiceData: Partial<Invoice>): Promise<void> => {
  try {
    const invoiceRef = doc(db, "invoices", invoiceId);
    await updateDoc(invoiceRef, {
      ...invoiceData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "invoices", invoiceId));
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
};

// Get all invoices (admin function)
export const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const q = query(
      collection(db, "invoices"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      invoices.push({
        id: doc.id,
        ...data,
        issueDate: data.issueDate instanceof Timestamp ? data.issueDate.toDate() : data.issueDate,
        dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate() : data.dueDate,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      } as Invoice);
    });
    
    return invoices;
  } catch (error) {
    console.error("Error getting all invoices:", error);
    throw error;
  }
};

// Update invoice status (admin function)
export const updateInvoiceStatus = async (invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue'): Promise<void> => {
  try {
    const invoiceRef = doc(db, "invoices", invoiceId);
    await updateDoc(invoiceRef, {
      status,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
};

export { auth, db };