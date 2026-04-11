import { motion } from "framer-motion";
import "./premium-ui.css";

export default function PremiumCard({ className = "", hover = true, children, ...props }) {
  return (
    <motion.section
      className={`premium-card ${className}`}
      whileHover={hover ? { y: -4, scale: 1.006 } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
