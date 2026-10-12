import React, { useState } from 'react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { getMissedQuestions, getReviewQuestions } from '../../utils/dataHelpers';
import { MissedList } from './MissedList';
import { BookmarkList } from './BookmarkList';

export type ReviewTab = 'missed' | 'bookmarks';

export const ReviewHub: React.FC<{ initialTab?: ReviewTab }> = ({ initialTab = 'missed' }) => {
  const [tab, setTab] = useState<ReviewTab>(initialTab);
  const activeQuestions = useAppStore(s => s.activeQuestions);
  const userData        = useAppStore(s => s.userData);
  const missedCount     = getMissedQuestions(activeQuestions, userData).length;
  const bookmarkCount   = getReviewQuestions(activeQuestions, userData).length;

  const tabs: { key: ReviewTab; label: string; count: number }[] = [
    { key: 'missed',    label: 'Missed',    count: missedCount },
    { key: 'bookmarks', label: 'Bookmarks', count: bookmarkCount },
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="kicker mb-2">Revisit</div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide mb-6">Review</h1>

      <div
        role="tablist"
        aria-label="Review queues"
        className="grid grid-cols-2 gap-1 p-1 mb-6 bg-raised rounded-ctl border border-app"
      >
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={clsx(
              'h-10 rounded-[8px] text-sm font-medium transition-colors flex items-center justify-center gap-2',
              tab === key
                ? 'bg-surface text-app shadow-sm border border-app'
                : 'text-muted hover:text-app'
            )}
          >
            {label}
            {count > 0 && (
              <span className={clsx(
                'font-mono text-[11px] px-1.5 py-0.5 rounded-full leading-none',
                tab === key ? 'bg-appbg text-muted' : 'bg-surface text-subtle border border-app'
              )}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'missed' ? <MissedList /> : <BookmarkList />}
      </div>
    </div>
  );
};
