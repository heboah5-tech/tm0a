interface UnifiedSpinnerProps {
  message?: string
  submessage?: string
}

function LogoSpinner({ size = 96 }: { size?: number }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Spinning gradient ring */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, #0a4a68 90deg, #1c7396 180deg, transparent 270deg)",
          WebkitMask:
            "radial-gradient(circle, transparent 56%, black 58%)",
          mask: "radial-gradient(circle, transparent 56%, black 58%)",
        }}
      />
      {/* Pulsing logo */}
      <div className="absolute inset-2 rounded-full bg-white shadow-md flex items-center justify-center">
        <img
          src="/Bcare-logo.svg"
          alt="BeCare"
          className="w-3/4 h-auto animate-pulse"
        />
      </div>
    </div>
  )
}

export function UnifiedSpinner({
  message = "جاري المعالجة",
  submessage = "الرجاء الانتظار....",
}: UnifiedSpinnerProps) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-6">
          <LogoSpinner size={112} />
        </div>
        <p className="text-[#0a4a68] text-xl font-bold mb-2">{message}</p>
        <p className="text-slate-500 text-lg">{submessage}</p>
      </div>
    </div>
  )
}

// For simple loading states (without overlay)
export function SimpleSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LogoSpinner size={96} />
    </div>
  )
}
