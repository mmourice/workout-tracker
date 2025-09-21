import React, { useEffect, useRef, useState } from "react";

/**
 * <RestTimer seconds={90} kick={kickCount} />
 * - When `kick` changes, timer restarts from `seconds`
 * - Shows mm:ss; tap to pause/resume; long-press Reset (or click Reset button)
 */
export default function RestTimer({ seconds = 90, kick = 0 }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = (fresh = true) => {
    if (fresh) setRemaining(seconds);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => { setRunning(false); setRemaining(seconds); };

  useEffect(() => {
    // kick = external trigger to auto-start fresh
    if (kick) start(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kick]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="timer-chip">
      <button
        className="chip-btn"
        onClick={() => (remaining === 0 ? reset() : setRunning(r => !r))}
        onContextMenu={(e) => { e.preventDefault(); reset(); }}
        title={running ? "Pause" : remaining === 0 ? "Reset" : "Start"}
      >
        ⏱ {mm}:{ss}
      </button>
      <button className="chip-btn subtle" onClick={reset} title="Reset">Reset</button>
    </div>
  );
}
