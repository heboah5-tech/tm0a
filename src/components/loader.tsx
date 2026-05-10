export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-24 w-24">
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
          {/* Logo center */}
          <div className="absolute inset-2 rounded-full bg-white shadow-md flex items-center justify-center">
            <img
              src="/Bcare-logo.svg"
              alt="BeCare"
              className="w-3/4 h-auto animate-pulse"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-foreground tracking-wide">
            يرجى الأنتظار
          </p>
          <div className="flex gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#0a4a68] animate-pulse"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#0a4a68] animate-pulse"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  )
}
