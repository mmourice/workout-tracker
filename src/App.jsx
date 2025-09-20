import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Session from "./pages/Session";
import Plan from "./pages/Plan";
import Exercises from "./pages/Exercises";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-around bg-bgDark2 p-4 text-sm">
        <Link to="/">Session</Link>
        <Link to="/plan">Plan</Link>
        <Link to="/exercises">Exercises</Link>
        <Link to="/history">History</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Session />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
