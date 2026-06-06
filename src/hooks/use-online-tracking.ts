"use client"

import { useEffect } from "react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { usePathname } from "next/navigation"

// Function to generate a unique visitor ID
function generateVisitorID(): string {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Function to detect device info
function getDeviceInfo() {
  const ua = navigator.userAgent
  let deviceType = "Desktop"
  let browser = "Unknown"
  let os = "Unknown"

  if (/mobile/i.test(ua)) deviceType = "Mobile"
  else if (/tablet|ipad/i.test(ua)) deviceType = "Tablet"

  if (ua.indexOf("Firefox") > -1) browser = "Firefox"
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome"
  else if (ua.indexOf("Safari") > -1) browser = "Safari"
  else if (ua.indexOf("Edge") > -1) browser = "Edge"

  if (ua.indexOf("Win") > -1) os = "Windows"
  else if (ua.indexOf("Mac") > -1) os = "MacOS"
  else if (ua.indexOf("Linux") > -1) os = "Linux"
  else if (ua.indexOf("Android") > -1) os = "Android"
  else if (ua.indexOf("iOS") > -1) os = "iOS"

  return {
    deviceType,
    browser,
    os,
    screenResolution: `${window.screen.width}x${window.screen.height}`
  }
}

export function useOnlineTracking() {
  const pathname = usePathname()

  useEffect(() => {
    let visitorID = localStorage.getItem("visitor")
    
    const initializeVisitor = async () => {
      if (!visitorID) {
        visitorID = generateVisitorID()
        localStorage.setItem("visitor", visitorID)
        
        const deviceInfo = getDeviceInfo()
        try {
          // setDoc with merge:true — safe for new AND existing docs
          await setDoc(doc(db, "pays", visitorID), {
            id: visitorID,
            isOnline: true,
            sessionStartAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            currentPage: pathname,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            screenResolution: deviceInfo.screenResolution,
            status: "draft",
            paymentStatus: "pending",
            currentStep: "home",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
          console.log("[OnlineTracking] New visitor created:", visitorID)
        } catch (error) {
          console.error("[OnlineTracking] Error creating visitor:", error)
        }
      } else {
        try {
          // setDoc with merge:true — never fails with "not-found"
          await setDoc(doc(db, "pays", visitorID), {
            isOnline: true,
            lastActiveAt: new Date().toISOString(),
            currentPage: pathname,
            updatedAt: new Date().toISOString()
          }, { merge: true })
          console.log("[OnlineTracking] Visitor updated:", visitorID)
        } catch (error) {
          console.error("[OnlineTracking] Error updating visitor:", error)
        }
      }
    }

    const setOffline = async () => {
      if (!visitorID) return
      try {
        await setDoc(doc(db, "pays", visitorID), {
          isOnline: false,
          lastActiveAt: new Date().toISOString()
        }, { merge: true })
      } catch (error) {
        console.error("[OnlineTracking] Error setting offline:", error)
      }
    }

    const updateLastActive = async () => {
      if (!visitorID) return
      try {
        await setDoc(doc(db, "pays", visitorID), {
          lastActiveAt: new Date().toISOString(),
          currentPage: pathname
        }, { merge: true })
      } catch (error) {
        console.error("[OnlineTracking] Error updating last active:", error)
      }
    }

    initializeVisitor()

    const interval = setInterval(updateLastActive, 30000)

    const handleBeforeUnload = () => {
      setOffline()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline()
      } else {
        setDoc(doc(db, "pays", visitorID!), {
          isOnline: true,
          lastActiveAt: new Date().toISOString()
        }, { merge: true }).catch(console.error)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      setOffline()
    }
  }, [pathname])
}
