import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from '../../components/icons';
import { clsx } from 'clsx';
import { useAppStore, confirmSessionReplacement } from '../../store/useAppStore';
import { getReviewQuestions } from '../../utils/dataHelpers';
import { Button, EmptyState, LevelBadge } from '../../components/ui';
import type { CDCLevel } from '../../types';

function reviewDueLabel(nextReviewAt: number | null): { label: string; urgent: boolean } {
  if (nextReviewAt === null) return { label: 'Due now', urgent: true };
  const diffMs   = nextReviewAt - Date.now();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0)  return { label: 'Due today', urgent: true };
  if (diffDays === 1) return { label: 'Due tomorrow', urgent: false };
  return { label: `Due in ${diffDays}d`, urgent: false };
}

type SortKey = 'due' | 'level' | 'status';

export const BookmarkList: React.FC = () => {
  const { activeQuestions, userData, startSession, updateQuestionProgress } = useAppStore();
  const navigate  = useNavigate();
  const [sort, setSort] = useState<SortKey>('due');
  const [levelFilter, setLevelFilter] = useState<CDCLevel | 'both'>('both');

  const allReview = useMemo(
    () => getReviewQuestions(activeQuestions, userData),
    [activeQuestions, userData]
  );

  const filtered = useMemo(() => {
    let list = levelFilter === 'both'
      ? allReview
      : allReview.filter(q => q.level === levelFilter);

    return [...list].sort((a, b) => {
      const pa = userData.questions[a.id];
      const pb = userData.questions[b.id];
      if (sort === 'due') {
        const da = pa?.nextReviewAt ?? 0;
        const db = pb?.nextReviewAt ?? 0;
        return da - db; // soonest first
      }
      if (sort === 'level') {
        if (a.level !== b.level) return a.level < b.level ? -1 : 1;
        return a.groupNumber - b.groupNumber;
      }
      // sort === 'status': incorrect first, then correct, then unseen
      const ORDER: Record<string, number> = { incorrect: 0, seen: 1, correct: 2, mastered: 3, unseen: 4 };
      return (ORDER[pa?.status ?? 'unseen'] ?? 4) - (ORDER[pb?.status ?? 'unseen'] ?? 4);
    });
  }, [allReview, levelFilter, sort, userData.questions]);

  const dueCount = useMemo(
    () => filtered.filter(q => (userData.questions[q.id]?.nextReviewAt ?? 0) <= Date.now()).length,
    [filtered, userData.questions]
  );

  const startStudy = (mode: 'study' | 'quiz') => {
    if (!confirmSessionReplacement()) return;
    const ids = filtered.map(q => q.id);
    if (startSession(mode, ids)) navigate('/session');
  };

  const startDueOnly = () => {
    if (!confirmSessionReplacement()) return;
    const ids = filtered
      .filter(q => (userData.questions[q.id]?.nextReviewAt ?? 0) <= Date.now())
      .map(q => q.id);
    if (!ids.length) return;
    if (startSession('review', ids)) navigate('/session');
  };

  const removeBookmark = (id: string) => {
    updateQuestionProgress(id, { isMarkedForReview: false });
  };

  if (allReview.length === 0) {
    return (
      <EmptyState
        title="No bookmarks yet"
        description="Tap the bookmark icon on any question during a session to add it here for focused review."
        action={<Button onClick={() => navigate('/quiz')}>Start a session</Button>}
      />
    );
  }

  return (
    <>
      <p className="font-mono text-[11px] text-subtle uppercase tracking-wider mb-4">
        {allReview.length} bookmarked · {dueCount > 0 ? `${dueCount} due now` : 'none due yet'}
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(['both', '5-level', '7-level'] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={clsx(
              'px-3.5 h-9 rounded-ctl text-xs font-mono uppercase tracking-wider border transition-colors',
              levelFilter === lvl
                ? 'bg-accent text-white dark:text-[#171512] border-transparent'
                : 'bg-surface border-app text-muted hover:text-app'
            )}
          >
            {lvl === 'both' ? 'All' : lvl === '5-level' ? '5-Level' : '7-Level'}
          </button>
        ))}

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="ml-auto h-9 px-2 bg-surface border border-app rounded-ctl text-xs text-app focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Sort bookmarks"
        >
          <option value="due">Due date</option>
          <option value="level">Level / group</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button onClick={() => startStudy('study')} variant="secondary" fullWidth>
          Study all
        </Button>
        <Button onClick={() => startStudy('quiz')} variant="primary" fullWidth>
          Test all
        </Button>
      </div>

      {dueCount > 0 && (
        <button
          onClick={startDueOnly}
          className="w-full mb-5 flex items-center justify-between bg-accent/10 border border-accent/40 rounded-card px-5 py-4 text-left hover:bg-accent/15 transition-colors"
        >
          <div>
            <div className="font-display text-xl tracking-wide text-app">
              {dueCount} due for review
            </div>
            <div className="text-xs text-muted mt-0.5">
              Spaced repetition · these are ready now
            </div>
          </div>
          <span className="font-mono text-xs text-accent-deep">Start →</span>
        </button>
      )}

      <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
        {filtered.map(q => {
          const p    = userData.questions[q.id];
          const due  = reviewDueLabel(p?.nextReviewAt ?? null);
          return (
            <div key={q.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <LevelBadge level={q.level} />
                  <span className="font-mono text-[11px] text-subtle uppercase tracking-wider">{q.groupLabel} {q.groupNumber} · Q{q.questionNumber}</span>
                  <span className={clsx(
                    'font-mono text-[10px] uppercase tracking-wider',
                    due.urgent ? 'text-accent-deep' : 'text-subtle'
                  )}>
                    {due.label}
                  </span>
                  {p?.status === 'mastered' && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-correct">Mastered</span>
                  )}
                  {p?.status === 'incorrect' && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-wrong">Needs work</span>
                  )}
                </div>
                <p className="text-[15px] text-app line-clamp-2">{q.text}</p>
                {p?.correctCount !== undefined && p.correctCount + p.incorrectCount > 0 && (
                  <p className="font-mono text-xs text-muted mt-1">
                    {p.correctCount} correct · {p.incorrectCount} incorrect
                  </p>
                )}
              </div>
              <button
                onClick={() => removeBookmark(q.id)}
                aria-label="Remove bookmark"
                title="Remove from review list"
                className="flex-shrink-0 p-2 rounded-ctl text-subtle hover:text-wrong hover:bg-wrong/10 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-muted py-8 text-sm">No bookmarks match this filter.</p>
        )}
      </div>
    </>
  );
};
