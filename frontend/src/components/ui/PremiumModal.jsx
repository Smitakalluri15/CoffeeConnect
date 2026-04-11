import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import PremiumButton from "./PremiumButton";
import "./premium-ui.css";

export default function PremiumModal({
  open,
  title,
  subtitle,
  onClose,
  children
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="premium-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="premium-modal"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="premium-modal-header">
              <div>
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
              </div>
              <PremiumButton
                type="button"
                variant="secondary"
                className="premium-close"
                iconOnly
                onClick={onClose}
              >
                <X size={16} />
              </PremiumButton>
            </header>
            <div className="premium-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
