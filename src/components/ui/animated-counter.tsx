"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ target, duration = 2000, suffix = "", prefix = "", className = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  const animateCount = useCallback(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [duration, target]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          animateCount();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animateCount]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{count}{suffix}
    </span>
  );
}
