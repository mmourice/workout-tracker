import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// pages
import Session from "./pages/Session.jsx";
import Plan from "./pages/Plan.jsx";
import Exercises from "./pages/Exercises.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";

// store provider
import { StoreProvider } from "./store.jsx";

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Session />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
