import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import "./premium-ui.css";

export default function AnimatedCounter({ value = 0, prefix = "", suffix = "", decimals = 0 }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => latest.toFixed(decimals));

  useEffect(() => {
    const controls = animate(motionValue, Number(value) || 0, {
      duration: 1,
      ease: "easeOut"
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="premium-counter">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </div>
  );
}
