"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionReveal({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string | undefined;
  delay?: number | undefined;
}) {
  const reducedMotion = useReducedMotion();
  const motionProps = reducedMotion
    ? { initial: false }
    : {
        initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(6px)" },
        whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const }
      };
  return (
    <motion.div
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
