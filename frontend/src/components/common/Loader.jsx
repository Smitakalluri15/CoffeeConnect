export default function Loader({ label = "Loading..." }) {
  return (
    <div style={styles.wrapper} aria-live="polite" aria-busy="true">
      <div style={styles.spinner} />
      <div style={styles.text}>{label}</div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#3b2a1a",
  },
  spinner: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "4px solid #ead8c5",
    borderTopColor: "#6f4e37",
    animation: "loader-spin 0.9s linear infinite",
  },
  text: {
    fontSize: "0.95rem",
    fontWeight: 600,
  },
};
