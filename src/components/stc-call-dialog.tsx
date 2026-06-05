"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhoneCall } from "lucide-react";

interface StcCallDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function StcCallDialog({ open, onComplete }: StcCallDialogProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!open) {
      setCountdown(10);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onComplete]);

  return (
    <>
      {open && (
        <div
          dir="rtl"
          className="min-h-screen bg-white flex flex-col items-center px-6 py-10"
        >
          {/* Logo / Header */}
          <div className="flex items-center gap-3 mb-10 mt-4">
            <div className="text-right">
              <p className="text-gray-800 font-semibold text-base">تاميني</p>
              <p className="text-gray-500 text-sm">Vehicles Safety Center</p>
            </div>
            {/* Logo Icon */}
            <div className="w-12 h-12 flex items-center justify-center">
              <svg
                viewBox="0 0 60 60"
                width="48"
                height="48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon
                  points="30,4 56,52 4,52"
                  fill="#2a7a4b"
                  opacity="0.85"
                />
                <polygon
                  points="30,14 50,48 10,48"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle cx="30" cy="38" r="5" fill="white" />
                <rect x="27" y="22" width="6" height="10" rx="2" fill="white" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-purple-700 mb-8">
            My
            <img src="/STC-01.svg" />
          </h1>

          {/* Illustration */}
          <div className="w-full max-w-xs mb-8">
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
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
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
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.5"
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

          {/* Main Arabic Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            سوف تتلقى مكالمة قريباً.
          </h2>

          {/* Sub Text */}
          <p className="text-gray-600 text-center text-base leading-relaxed mb-10 max-w-sm">
            يرجى الموافقة عليها وإدخال الرقم{" "}
            <span className="text-pink-500 font-bold">5</span> في المكالمة و
            المتابعة
          </p>

          {/* Button */}
          <button className="w-full max-w-sm bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-lg font-semibold py-4 rounded-2xl transition-colors">
            تم تلقي المكالة
          </button>

          {/* Floating Chat Button */}
          <div className="fixed bottom-8 left-6">
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
      )}
    </>
  );
}
