"use client";

import React from "react";
import { motion, useInView, type Variants } from "motion/react";

interface TimelineContentProps {
  children?: React.ReactNode;
  animationNum: number;
  // Section ref whose visibility triggers the animations.
  timelineRef: any;
  customVariants: Variants;
  className?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}

/**
 * Animates its children in when `timelineRef` scrolls into view, using
 * `customVariants` and `animationNum` as the stagger index.
 */
export const TimelineContent = ({
  children,
  animationNum,
  timelineRef,
  customVariants,
  className,
  as = "div",
  ...props
}: TimelineContentProps) => {
  const inView = useInView(timelineRef, { once: true, margin: "0px 0px -8% 0px" });
  const motionMap = motion as unknown as Record<string, React.ElementType>;
  const MotionComp: React.ElementType =
    (typeof as === "string" && motionMap[as]) || motion.div;

  return (
    <MotionComp
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={customVariants}
      className={className}
      {...props}
    >
      {children}
    </MotionComp>
  );
};
