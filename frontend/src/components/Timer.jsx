import React, { useState, useEffect } from 'react';
import '../styles/timer.css';

function Timer({ duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;

  return (
    <div className={`timer ${isLow ? 'low' : ''}`}>
      <div className="timer-display">
        <span className="time">{Math.max(0, timeLeft)}</span>
        <span className="label">sec</span>
      </div>
      <div className="timer-bar">
        <div
          className={`timer-fill ${isLow ? 'low' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default Timer;
