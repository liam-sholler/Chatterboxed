import type { CSSProperties, ReactNode } from 'react'

/**
 * Chat-bubble illustration for the auth pages. Violet and mint are the two
 * anchors; the pink "pop" bubble is the small, high-energy accent. Decorative
 * only, and built from semantic tokens so it follows the active theme. Bubbles
 * hug the edges so the centered card and wordmark stay clear.
 *
 * Each bubble drifts gently. Durations and delays differ so they never move in
 * lockstep, and `motion-safe:` turns the motion off for reduced-motion users.
 */
function Bubble({
  className,
  style,
  children,
}: {
  className: string
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      style={style}
      className={`absolute motion-safe:animate-float ${className}`}
    >
      {/* One outline (body + tail) so translucent fills never double up. */}
      <path d="M64 0H256A64 64 0 0 1 320 64V126A64 64 0 0 1 256 190H104L34 216 64 190A64 64 0 0 1 0 126V64A64 64 0 0 1 64 0Z" />
      {children}
    </svg>
  )
}

export function AuthBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Anchor 1: violet */}
      <Bubble
        style={{ animationDuration: '10s' }}
        className="-top-8 -left-24 w-72 -rotate-12 fill-primary/60 md:-top-12 md:-left-28 md:w-112 dark:fill-primary/40"
      >
        <rect x="52" y="56" width="176" height="18" rx="9" className="fill-background/50" />
        <rect x="52" y="92" width="120" height="18" rx="9" className="fill-background/50" />
      </Bubble>

      {/* Anchor 2: mint */}
      <Bubble
        style={{ animationDuration: '12s', animationDelay: '-4s' }}
        className="-right-24 -bottom-8 w-72 rotate-6 -scale-x-100 fill-success/60 md:-right-28 md:-bottom-12 md:w-112 dark:fill-success/40"
      >
        <rect x="52" y="56" width="196" height="18" rx="9" className="fill-background/50" />
        <rect x="52" y="92" width="140" height="18" rx="9" className="fill-background/50" />
      </Bubble>

      {/* Pop: pink typing bubble */}
      <Bubble
        style={{ animationDuration: '7s', animationDelay: '-2s' }}
        className="top-20 right-4 w-28 rotate-12 fill-pop/75 md:top-24 md:right-1/6 md:w-44 dark:fill-pop/55"
      >
        <circle cx="110" cy="95" r="15" className="fill-background" />
        <circle cx="160" cy="95" r="15" className="fill-background" />
        <circle cx="210" cy="95" r="15" className="fill-background" />
      </Bubble>
    </div>
  )
}
