import { cn } from '@/lib/utils'

/**
 * ART'hur's sula mark.
 *
 * It is intentionally a single authored interruption, not a repeatable texture.
 * Keep it to one use per bounded visual region, per docs/BRAND-AND-EXPERIENCE-SPEC.md.
 */
export function LivingTag({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-center font-heading font-black tracking-[-0.08em] text-current',
        compact ? 'text-lg leading-none' : 'text-[clamp(3.5rem,12vw,11rem)] leading-[0.78]',
        className
      )}
      aria-label="ART'hur"
    >
      <span>ART</span>
      <svg
        viewBox="0 0 38 92"
        className={cn('mx-[0.02em] h-[0.78em] w-[0.22em] shrink-0', compact && 'h-[0.82em]')}
        aria-hidden="true"
      >
        <path
          d="M25 5C12 24 35 38 17 56C9 64 12 76 30 87"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="10"
        />
        <path
          d="M9 19C17 16 24 16 31 20"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="6"
          opacity="0.45"
        />
      </svg>
      <span>hur</span>
    </span>
  )
}
