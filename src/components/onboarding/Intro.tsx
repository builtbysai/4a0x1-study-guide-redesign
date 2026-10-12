import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ArrowRight } from '../icons';

const PANELS = [
  {
    index: '01',
    kicker: 'The question bank',
    title: 'Every question, grouped like the course.',
    body: '200 CDC questions across 5-level and 7-level modules, organized the way the course organizes them.',
  },
  {
    index: '02',
    kicker: 'How you study',
    title: 'Study, test, or mix it up.',
    body: 'Study mode answers as you go. Test mode holds your results until the end. Random pulls from everything.',
  },
  {
    index: '03',
    kicker: 'What sticks',
    title: 'Missed questions wait for you.',
    body: 'Anything you miss collects in Review until it sticks. Your readiness score shows how close you are.',
  },
];

export const Intro: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [page, setPage] = useState(0);
  const last = page === PANELS.length - 1;
  const panel = PANELS[page];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the 4A0X1 study guide"
      className="fixed inset-0 z-[100] bg-appbg flex flex-col h-[100dvh] animate-fade-in"
    >
      <div className="flex justify-end px-5 pt-5 safe-top">
        <button
          onClick={onDone}
          className="text-sm font-medium text-muted hover:text-app transition-colors px-3 py-2 -mr-3"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-md w-full mx-auto min-h-0">
        <div key={page} className="animate-fade-in">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-display text-[15px] text-accent-deep">{panel.index}</span>
            <span className="kicker text-muted">{panel.kicker}</span>
          </div>
          <h2 className="font-display text-[38px] leading-[1.08] text-app">{panel.title}</h2>
          <p className="text-muted mt-4 text-[16px] leading-relaxed max-w-xs">{panel.body}</p>
        </div>
      </div>

      <div className="px-8 pb-10 max-w-md w-full mx-auto safe-bottom">
        <div className="flex items-center gap-2 mb-6" aria-hidden="true">
          {PANELS.map((_, i) => (
            <span
              key={i}
              className={clsx(
                'h-1 rounded-full transition-all duration-200',
                i === page ? 'w-8 bg-accent' : 'w-4 bg-[rgb(var(--border))]'
              )}
            />
          ))}
        </div>
        <button
          onClick={() => (last ? onDone() : setPage(page + 1))}
          className="w-full h-[52px] bg-accent text-white dark:text-[#171512] font-semibold text-[16px] rounded-ctl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {last ? 'Get started' : 'Next'}
          {!last && <ArrowRight size={17} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
};
