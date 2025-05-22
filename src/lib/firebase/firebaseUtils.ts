import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Firestore functions
export const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log('Document written with ID: ', docRef.id);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document: ', error);
    throw error;
  }
};

export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: any
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
    console.log('Document successfully updated!');
    return { id: documentId, ...data };
  } catch (error) {
    console.error('Error updating document: ', error);
    throw error;
  }
};

export const deleteDocument = async (
  collectionName: string,
  documentId: string
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    console.log('Document successfully deleted!');
    return true;
  } catch (error) {
    console.error('Error deleting document: ', error);
    throw error;
  }
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  try {
    // Use data URL approach for all environments to avoid CORS issues
    try {
      const dataUrl = await fileToDataUrl(file);
      console.log('Successfully created data URL');
      return dataUrl;
    } catch (e) {
      console.log('Failed to convert to data URL, using placeholder');
      return `https://via.placeholder.com/500x300?text=${encodeURIComponent(file.name || 'Image')}`;
    }
    
    // The following code is disabled to avoid CORS issues
    /* 
    // For production - proceed with normal Firebase upload
    // Add timestamp to prevent caching issues
    const timestamp = Date.now();
    const uniquePath = `${path.split('.')[0]}_${timestamp}.${path.split('.').pop()}`;
    
    // Set metadata with correct content type
    const metadata = {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
    };
    
    console.log(`Uploading file to path: ${uniquePath}`);
    const storageRef = ref(storage, uniquePath);
    
    // Try to upload with metadata
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('Upload successful:', snapshot);
    
    // Get download URL 
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File uploaded successfully. Download URL: ', downloadURL);
    
    return downloadURL;
    */
  } catch (error) {
    console.error('Error uploading file: ', error);
    
    // Fallback for errors
    try {
      return await fileToDataUrl(file);
    } catch (e) {
      console.log('Failed to convert to data URL, using placeholder');
      return `https://via.placeholder.com/500x300?text=${encodeURIComponent(file.name || 'Image')}`;
    }
  }
};

// Helper function to convert file to data URL for development
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
