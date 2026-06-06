import { clsx, type ClassValue } from "clsx"
import { onDisconnect, onValue, ref, serverTimestamp, set } from "firebase/database";
import { twMerge } from "tailwind-merge"
import { database, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const onlyNumbers = (value: string) => {
  return value.replace(/[^\d٠-٩]/g, '');
};



export const setupOnlineStatus = (userId: string) => {
  if (!userId) return;

  // Create a reference to this user's specific status node in Realtime Database
  const userStatusRef = ref(database, `/status/${userId}`);

  // Create a reference to the user's document in Firestore
  const userDocRef = doc(db, "pays", userId);

  // Set up the Realtime Database onDisconnect hook
  onDisconnect(userStatusRef)
    .set({
      state: "offline",
      lastChanged: serverTimestamp(),
    })
    .then(() => {
      // Update the Realtime Database when this client connects
      set(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp(),
      });

      // Update the Firestore document
      setDoc(userDocRef, {
        online: true,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    })
    .catch((error) => console.error("Error setting onDisconnect:", error));

  // Listen for changes to the user's online status
  onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    if (status?.state === "offline") {
      // Update the Firestore document when user goes offline
      setDoc(userDocRef, {
        online: false,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch((error) =>
        console.error("Error updating Firestore document:", error)
      );
    }
  });
};

export const setUserOffline = async (userId: string) => {
  if (!userId) return;

  try {
    // Update the Firestore document
    await setDoc(doc(db, "pays", userId), {
      online: false,
      lastSeen: new Date().toISOString(),
    }, { merge: true });

    // Update the Realtime Database
    await set(ref(database, `/status/${userId}`), {
      state: "offline",
      lastChanged: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};