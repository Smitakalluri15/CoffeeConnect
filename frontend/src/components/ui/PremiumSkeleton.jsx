import "./premium-ui.css";

export default function PremiumSkeleton({ height = 120, className = "" }) {
  return (
    <div
      className={`premium-skeleton ${className}`}
      style={{ height }}
      aria-hidden
    />
  );
}
