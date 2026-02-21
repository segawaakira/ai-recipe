"use client";

import { useState } from "react";

function LogoSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 256 256"
      className={className}
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(28, 29)">
          <path
            d="M179,132 C179,132 179,129.556106 179,124.668319 L179,85.4438264 C179,83.2101076 179,80.6660144 179,77.8115466 C198.378751,71.6669292 203.473801,57.1421014 197.661699,43.4036637 C191.849597,29.6652259 172.002403,20.7023183 150.645656,22.1714204 C141.937838,8.71760946 122.017812,0 99.9832254,0 C77.9486391,0 58.0286126,8.71760946 49.320795,22.1714204 C27.974268,20.7126487 8.14425558,29.6739347 2.33462771,43.4047144 C-3.47500015,57.1354941 1.63870667,71.6534376 21,77.8042149 C21,80.6635705 21,83.2076637 21,85.4364947 L21,124.222711 C21,129.110498 21,131.581948 21,131.637059 L179,132 Z"
            stroke="currentColor"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M165.833333,198.912196 C179,198.912196 179,198.912196 179,188.205221 L179,130.922903 L21,130.912196 L21,188.205221 C21,198.912196 21,198.912196 34.1666667,198.912196 L165.833333,198.912196 Z"
            stroke="currentColor"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="139" cy="165" r="16" fill="currentColor" />
          <circle cx="61" cy="165" r="16" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}

function BounceGlow() {
  return (
    <div className="relative flex items-center justify-center h-16 w-16">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-16 w-16 animate-ping rounded-full bg-muted-foreground/10" />
      </div>
      <LogoSvg className="animate-logo-bounce text-muted-foreground" />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
        <div className="flex gap-1">
          <span className="animate-steam-1 inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
          <span className="animate-steam-2 inline-block h-1 w-1 rounded-full bg-muted-foreground/20" />
          <span className="animate-steam-3 inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
    </div>
  );
}

function CookingWobble() {
  return (
    <div className="relative flex items-center justify-center h-16 w-16">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-logo-glow h-16 w-16 rounded-full bg-orange-300/20" />
      </div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2">
        <div className="relative h-10 w-12">
          <span className="animate-steam-rise-1 absolute bottom-0 left-2 h-2.5 w-2.5 rounded-full bg-orange-300/40" />
          <span className="animate-steam-rise-2 absolute bottom-0 left-5 h-2 w-2 rounded-full bg-amber-300/30" />
          <span className="animate-steam-rise-3 absolute bottom-0 left-8 h-2.5 w-2.5 rounded-full bg-orange-300/35" />
        </div>
      </div>
      <LogoSvg className="animate-logo-cooking text-orange-500" />
      <span className="animate-food-1 absolute -left-3 top-4 h-1.5 w-1.5 rounded-sm bg-green-400/60" />
      <span className="animate-food-2 absolute -right-3 top-2 h-1.5 w-1.5 rounded-full bg-red-400/50" />
      <span className="animate-food-3 absolute -right-1 bottom-2 h-1 w-1 rounded-sm bg-yellow-500/50" />
    </div>
  );
}

function Flip3D() {
  return (
    <div className="relative flex items-center justify-center h-16 w-16" style={{ perspective: "300px" }}>
      <LogoSvg className="animate-logo-flip text-sky-500" />
      <div className="absolute -bottom-5 flex gap-2">
        <span className="animate-dot-1 inline-block h-2 w-2 rounded-full bg-sky-400/60" />
        <span className="animate-dot-2 inline-block h-2 w-2 rounded-full bg-sky-500/60" />
        <span className="animate-dot-3 inline-block h-2 w-2 rounded-full bg-sky-400/60" />
      </div>
      <div className="absolute -bottom-2 h-2 w-10 animate-logo-pulse rounded-full bg-sky-400/10" />
    </div>
  );
}

function PulseRipple() {
  return (
    <div className="relative flex items-center justify-center h-16 w-16">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-ripple-1 absolute h-12 w-12 rounded-full bg-rose-400/20" />
        <div className="animate-ripple-2 absolute h-12 w-12 rounded-full bg-pink-400/15" />
        <div className="animate-ripple-3 absolute h-12 w-12 rounded-full bg-rose-300/10" />
      </div>
      <LogoSvg className="animate-logo-pulse text-rose-500" />
    </div>
  );
}

function SpinSparkle() {
  return (
    <div className="relative flex items-center justify-center h-16 w-16">
      <div className="absolute h-20 w-20 animate-[spin_3s_linear_infinite]">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400/80" />
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-orange-400/60" />
        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-yellow-400/70" />
      </div>
      <div className="absolute h-16 w-16 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-dashed border-muted-foreground/20" />
      <LogoSvg className="animate-logo-spin text-amber-600" />
      <span className="animate-sparkle-1 absolute -right-2 -top-1 text-sm text-amber-400">{"*"}</span>
      <span className="animate-sparkle-2 absolute -left-2 top-2 text-xs text-yellow-400">{"*"}</span>
      <span className="animate-sparkle-3 absolute -top-2 right-1 text-[10px] text-orange-400">{"*"}</span>
    </div>
  );
}

const ANIMATIONS = [BounceGlow, CookingWobble, Flip3D, PulseRipple, SpinSparkle];

export function LoadingAnimation() {
  const [AnimationComponent] = useState(() => {
    const index = Math.floor(Math.random() * ANIMATIONS.length);
    return ANIMATIONS[index]!;
  });

  return <AnimationComponent />;
}
