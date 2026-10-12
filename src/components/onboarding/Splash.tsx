import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

const SHOW_MS = 1200;
const FADE_MS = 280;

export const Splash: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const finish = () => {
      setLeaving(true);
      window.setTimeout(() => doneRef.current(), FADE_MS);
    };
    const t = window.setTimeout(finish, SHOW_MS);
    return () => window.clearTimeout(t);
  }, []);

  const skip = () => {
    setLeaving(true);
    window.setTimeout(() => doneRef.current(), FADE_MS);
  };

  return (
    <div
      role="status"
      aria-label="Loading 4A0X1 study guide"
      onClick={skip}
      className={clsx(
        'fixed inset-0 z-[100] bg-appbg flex flex-col items-center justify-center cursor-pointer select-none',
        'transition-opacity duration-[280ms] ease-out',
        leaving ? 'opacity-0' : 'opacity-100 animate-fade-in'
      )}
    >
      <div className="kicker text-muted mb-4">CDC Study Guide</div>
      <h1 className="font-display text-[64px] leading-none tracking-wide text-app">4A0X1</h1>
      <div className="w-16 h-px bg-accent my-5" aria-hidden="true" />
      <div className="font-mono text-xs tracking-[0.2em] text-subtle">4A051 · 4A071</div>
    </div>
  );
};
