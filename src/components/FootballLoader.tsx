import { cn } from "@/lib/utils";

/**
 * Animated football being kicked — CSS only, no deps.
 * Use as a full-page loader or inline by passing `size`.
 */
export function FootballLoader({
  label = "Loading the pitch...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      <div className="relative h-32 w-64">
        {/* Pitch line */}
        <div className="absolute bottom-4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        {/* Boot */}
        <div className="boot-kick absolute bottom-4 left-2 origin-bottom-right text-4xl">
          🦵
        </div>
        {/* Ball */}
        <div className="ball-arc absolute bottom-4 left-12">
          <div className="ball-spin h-10 w-10">
            <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
              <circle cx="32" cy="32" r="30" fill="#fafafa" stroke="#0a0a0a" strokeWidth="2" />
              <polygon points="32,16 42,24 38,36 26,36 22,24" fill="#0a0a0a" />
              <line x1="32" y1="16" x2="32" y2="6" stroke="#0a0a0a" strokeWidth="2" />
              <line x1="42" y1="24" x2="52" y2="20" stroke="#0a0a0a" strokeWidth="2" />
              <line x1="22" y1="24" x2="12" y2="20" stroke="#0a0a0a" strokeWidth="2" />
              <line x1="38" y1="36" x2="44" y2="48" stroke="#0a0a0a" strokeWidth="2" />
              <line x1="26" y1="36" x2="20" y2="48" stroke="#0a0a0a" strokeWidth="2" />
            </svg>
          </div>
        </div>
        {/* Shadow */}
        <div className="shadow-pulse absolute bottom-2 left-16 h-1.5 w-10 rounded-full bg-black/40 blur-sm" />
      </div>
      {label && (
        <p className="font-display text-sm uppercase tracking-[0.3em] text-gold/80">{label}</p>
      )}
    </div>
  );
}