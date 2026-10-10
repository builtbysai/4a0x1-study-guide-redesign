import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore, confirmSessionReplacement } from '../store/useAppStore';
import { getMissedQuestions } from '../utils/dataHelpers';
import { Button, Badge, EmptyState, LevelBadge, InkButton } from '../components/ui';
import type { CDCLevel } from '../types';

type FilterType = 'all' | 'by-group' | 'favorites' | 'high-miss';

export const Missed: React.FC = () => {
  const { questions, activeQuestions, userData, startSession, resetQuestionProgress } = useAppStore();
  const navigate = useNavigate();
  const [filter, setFilter]               = useState<FilterType>('all');
  const [selectedGroup, setSelectedGroup] = useState<{ level: CDCLevel; num: number } | null>(null);

  const allMissed = getMissedQuestions(activeQuestions, userData);

  const missedGroups = useMemo(() => {
    const seen = new Set<string>();
    const result: { level: CDCLevel; num: number; label: string }[] = [];
    for (const q of allMissed) {
      const key = `${q.level}-${q.groupNumber}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ level: q.level, num: q.groupNumber, label: `${q.groupLabel} ${q.groupNumber}` });
      }
    }
    return result.sort((a, b) => a.level < b.level ? -1 : a.level > b.level ? 1 : a.num - b.num);
  }, [allMissed]);

  const filteredMissed = useMemo(() => {
    switch (filter) {
      case 'by-group':
        return selectedGroup
          ? allMissed.filter(q => q.level === selectedGroup.level && q.groupNumber === selectedGroup.num)
          : allMissed;
      case 'favorites':
        return allMissed.filter(q => userData.questions[q.id]?.isFavorite);
      case 'high-miss':
        return allMissed
          .filter(q => (userData.questions[q.id]?.incorrectCount ?? 0) >= 2)
          .sort((a, b) => (userData.questions[b.id]?.incorrectCount ?? 0) - (userData.questions[a.id]?.incorrectCount ?? 0));
      default:
        return allMissed;
    }
  }, [filter, allMissed, selectedGroup, userData]);

  const startMissedSession = (mode: 'study' | 'quiz') => {
    if (!confirmSessionReplacement()) return;
    const ids = filteredMissed.map(q => q.id);
    if (startSession(mode, ids)) navigate('/session');
  };

  if (allMissed.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <div className="kicker mb-2">Review</div>
        <h1 className="font-display text-[44px] leading-none text-app tracking-wide mb-6">Missed questions</h1>
        <EmptyState
          title="Nothing missed"
          description="You haven't missed any questions yet, or you've mastered everything in your current set."
          action={<InkButton onClick={() => navigate('/quiz')}>Start a session</InkButton>}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="kicker mb-2">{allMissed.length} need attention</div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide mb-6">Missed questions</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
        {([
          { key: 'all',      label: `All · ${allMissed.length}` },
          { key: 'by-group', label: 'By group' },
          { key: 'high-miss',label: 'Most troublesome' },
          { key: 'favorites',label: 'Favorites' },
        ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              'flex-shrink-0 px-3.5 h-9 rounded-ctl text-sm font-medium transition-colors',
              filter === key ? 'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]' : 'bg-surface border border-app text-muted hover:text-app'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filter === 'by-group' && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setSelectedGroup(null)}
            className={clsx(
              'px-3 h-8 rounded-ctl text-xs font-mono uppercase tracking-wider border transition-colors',
              !selectedGroup ? 'bg-[#1A2332] text-[#F6F3EA] border-transparent dark:bg-[#E8E4D4] dark:text-[#1A2332]' : 'bg-surface border-app text-muted hover:text-app'
            )}
          >All</button>
          {missedGroups.map(g => (
            <button
              key={`${g.level}-${g.num}`}
              onClick={() => setSelectedGroup({ level: g.level, num: g.num })}
              className={clsx(
                'px-3 h-8 rounded-ctl text-xs font-mono uppercase tracking-wider border transition-colors',
                selectedGroup?.level === g.level && selectedGroup?.num === g.num
                  ? 'bg-[#1A2332] text-[#F6F3EA] border-transparent dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                  : 'bg-surface border-app text-muted hover:text-app'
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Button onClick={() => startMissedSession('study')} variant="secondary" fullWidth>
          Study mode
        </Button>
        <InkButton onClick={() => startMissedSession('quiz')}>
          Test mode
        </InkButton>
      </div>

      <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
        {filteredMissed.map(q => {
          const p         = userData.questions[q.id];
          const missCount = p?.incorrectCount ?? 0;
          return (
            <div key={q.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <LevelBadge level={q.level} />
                  <span className="font-mono text-[11px] text-subtle uppercase tracking-wider">{q.groupLabel} {q.groupNumber} · Q{q.questionNumber}</span>
                  {missCount >= 3 && <Badge variant="error">Missed {missCount}×</Badge>}
                </div>
                <p className="text-[15px] text-app line-clamp-2">{q.text}</p>
                {p?.lastAnswer && (
                  <p className="font-mono text-xs text-muted mt-1.5">
                    You answered <span className="text-brick font-semibold uppercase">{p.lastAnswer}</span>
                    {q.correctAnswer && <> · Correct <span className="text-pine font-semibold uppercase">{q.correctAnswer}</span></>}
                  </p>
                )}
              </div>
              <button
                onClick={() => resetQuestionProgress(q.id)}
                aria-label="Reset progress for this question"
                title="Reset mastery"
                className="flex-shrink-0 p-2 rounded-ctl text-subtle hover:text-brick hover:bg-brick/10 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          );
        })}
        {filteredMissed.length === 0 && (
          <p className="text-center text-muted py-8 text-sm">No questions match this filter.</p>
        )}
      </div>
    </div>
  );
};
