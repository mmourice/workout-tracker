import React, { useEffect, useRef, useState } from "react";

/** Tiny, reliable rest timer */
export default function RestTimer({ seconds = 90, kick = 0 }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const t = useRef(null);

  const clear = () => { if (t.current) { clearInterval(t.current); t.current = null; } };
  const startFresh = () => { clear(); setRemaining(seconds); setRunning(true); };
  const reset = () => { clear(); setRunning(false); setRemaining(seconds); };

  // When weights/reps change, auto-start a fresh timer
  useEffect(() => { if (kick) startFresh(); /* eslint-disable-next-line */ }, [kick]);

  useEffect(() => {
    clear();
    if (!running) return;
    t.current = setInterval(() => {
      setRemaining(r => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return clear;
  }, [running]);

  useEffect(() => { if (remaining === 0) setRunning(false); }, [remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="timer-chip">
      <button className="chip-btn" onClick={() => (remaining === 0 ? startFresh() : setRunning(v => !v))}>
        ⏱ {mm}:{ss}
      </button>
      <button className="chip-btn" onClick={reset}>Reset</button>
    </div>
  );
}
