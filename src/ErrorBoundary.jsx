import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, err };
  }
  componentDidCatch(err, info) {
    // Optional: console log so we see it in GH Pages
    console.error("App crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: "#fff" }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ opacity: 0.8, marginBottom: 16 }}>
            Try refreshing the page. If you’re on a phone, fully close the tab and re-open.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 12,
              borderRadius: 12,
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {String(this.state.err)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
