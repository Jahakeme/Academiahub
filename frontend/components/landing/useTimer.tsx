"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const TARGET_DATE = new Date("2026-05-18T00:00:00Z").getTime();

const computeTimeLeft = (): { timeLeft: TimeLeft; isLaunched: boolean } => {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) {
    return {
      timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      isLaunched: true,
    };
  }
  return {
    timeLeft: {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    },
    isLaunched: false,
  };
};

const Timer = () => {
  const [state, setState] = useState(() => computeTimeLeft());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    const next = computeTimeLeft();
    setState(next);
    if (next.isLaunched && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  return state;
};

export default Timer;
