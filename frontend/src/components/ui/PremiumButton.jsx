import { motion } from "framer-motion";
import "./premium-ui.css";

export default function PremiumButton({
  children,
  variant = "primary",
  className = "",
  iconOnly = false,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`premium-button ${variant} ${iconOnly ? "icon" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
