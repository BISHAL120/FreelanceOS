import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "radial-gradient(circle at top, #ffffff 0%, #f6f7fb 55%, #eef1f7 100%)",
        color: "#0f172a",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          borderRadius: "16px",
          padding: "28px",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div style={{ display: "grid", gap: "12px" }}>
          <p style={{ margin: 0, letterSpacing: "0.18em", fontSize: "12px", opacity: 0.7 }}>
            404
          </p>
          <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.2 }}>
            Page not found
          </h1>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, opacity: 0.8 }}>
            No match for <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {location.pathname}
            </span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "18px", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: "12px",
              textDecoration: "none",
              background: "#0f172a",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 14px",
              borderRadius: "12px",
              background: "transparent",
              color: "#0f172a",
              border: "1px solid rgba(15, 23, 42, 0.16)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
