import React, { useEffect, useRef, useState } from "react";

export default function RestTimer({ seconds = 90, kick = 0 }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const t = useRef(null);

  const startFresh = () => { clear(); setRemaining(seconds); setRunning(true); };
  const pause = () => setRunning(false);
  const reset = () => { clear(); setRunning(false); setRemaining(seconds); };
  const clear = () => { if (t.current) { clearInterval(t.current); t.current = null; } };

  useEffect(() => { if (kick) startFresh(); /* eslint-disable-next-line */ }, [kick]);

  useEffect(() => {
    clear();
    if (!running) return;
    t.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clear(); return 0; }
        return r - 1;
      });
    }, 1000);
    return clear;
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const label = `${mm}:${ss}`;

  return (
    <div className="timer-chip">
      <button className="chip-btn" onClick={() => (remaining === 0 ? startFresh() : setRunning(v => !v))}>
        ⏱ {label}
      </button>
      <button className="chip-btn" onClick={reset}>Reset</button>
    </div>
  );
}
