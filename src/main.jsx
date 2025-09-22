import "./modern.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import ErrorBoundary from "./ErrorBoundary.jsx"; // ⬅️ NEW

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>      {/* ⬅️ NEW */}
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
);
