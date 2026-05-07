"use client";

import { useEffect, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const TARGET_DATE = new Date("2026-05-18T00:00:00Z").getTime();

const ZERO: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const computeTimeLeft = (): { timeLeft: TimeLeft; isLaunched: boolean } => {
  const diff = TARGET_DATE - Date.now();
  if (diff <= 0) {
    return { timeLeft: ZERO, isLaunched: true };
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
  const [state, setState] = useState<{
    timeLeft: TimeLeft;
    isLaunched: boolean;
    mounted: boolean;
  }>({ timeLeft: ZERO, isLaunched: false, mounted: false });

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const next = computeTimeLeft();
      setState({ ...next, mounted: true });
      if (next.isLaunched && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    tick();
    intervalId = setInterval(tick, 1000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return state;
};

export default Timer;
