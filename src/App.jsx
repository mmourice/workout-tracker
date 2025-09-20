import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import Session from './pages/Session.jsx'
import Plan from './pages/Plan.jsx'
import Exercises from './pages/Exercises.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'
import { StoreProvider } from './store.jsx'

const Tab = ({ to, children }) => (
  <NavLink to={to} className={({isActive}) =>
    'px-3 py-1 rounded-chip border transition shadow-sm mr-2 ' +
    (isActive ? 'bg-brand-primary text-black border-brand-primary' : 'bg-transparent text-white border-brand-border hover:bg-[#181818]')
  }>
    <span className="text-label font-mont">{children}</span>
  </NavLink>
)

export default function App(){
  return (
    <StoreProvider>
      <div className="min-h-dvh bg-gradient-to-b from-brand-bgTop to-brand-bgBottom">
        <header className="px-5 py-3 flex items-center justify-between">
          <h1 className="text-h1 font-mont font-bold">Workout Tracker</h1>
          <nav className="flex">
            <Tab to="/">Session</Tab>
            <Tab to="/plan">Plan</Tab>
            <Tab to="/exercises">Exercises</Tab>
            <Tab to="/history">History</Tab>
            <Tab to="/settings">Settings</Tab>
          </nav>
        </header>

        <main className="p-5">
          <Routes>
            <Route path="/" element={<Session />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </StoreProvider>
  )
}
