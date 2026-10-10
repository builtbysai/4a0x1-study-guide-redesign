import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '../components/icons';
import { clsx } from 'clsx';
import { useAppStore } from '../store/useAppStore';
import { calcGroupProgress, getGroupNumbers, pct, formatDate } from '../utils/dataHelpers';
import { ProgressBar, Badge, LevelBadge } from '../components/ui';
import type { CDCLevel } from '../types';

export const Modules: React.FC = () => {
  const { questions, userData } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState<'number' | 'progress' | 'missed'>('number');
  const { activeLevel }     = userData;

  const groups = useMemo(() => {
    const levels: CDCLevel[] = activeLevel === 'both' ? ['5-level', '7-level'] : [activeLevel];
    const result: { level: CDCLevel; groupNumber: number; groupLabel: string }[] = [];
    for (const lvl of levels) {
      for (const num of getGroupNumbers(questions, lvl)) {
        const groupLabel = questions.find(q => q.level === lvl && q.groupNumber === num)?.groupLabel ?? 'Module';
        result.push({ level: lvl, groupNumber: num, groupLabel });
      }
    }
    return result;
  }, [questions, activeLevel]);

  const groupStats = useMemo(() =>
    groups.map(g => ({
      ...g,
      progress: calcGroupProgress(g.level, g.groupNumber, questions, userData),
    })),
  [groups, questions, userData]);

  const filtered = useMemo(() => {
    let result = groupStats;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        `${g.groupLabel} ${g.groupNumber}`.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sort === 'progress') return pct(b.progress.seenCount, b.progress.totalQuestions) - pct(a.progress.seenCount, a.progress.totalQuestions);
      if (sort === 'missed')   return b.progress.incorrectCount - a.progress.incorrectCount;
      if (a.level !== b.level) return a.level < b.level ? -1 : 1;
      return a.groupNumber - b.groupNumber;
    });
  }, [groupStats, search, sort]);

  const totalGroups = groups.length;
  const totalQs     = questions.filter(q => activeLevel === 'both' || q.level === activeLevel).length;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="kicker mb-2">{totalGroups} groups · {totalQs} questions · <LevelBadge level={activeLevel} className="ml-1" /></div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide">Modules</h1>

      <div className="flex gap-2 mt-6 mb-5">
        <input
          type="search"
          placeholder="Search groups"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 h-11 px-4 bg-surface border border-app rounded-ctl text-[15px] text-app placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-brass"
          aria-label="Search groups"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as typeof sort)}
          className="h-11 px-3 bg-surface border border-app rounded-ctl text-sm text-app focus:outline-none focus:ring-2 focus:ring-brass"
          aria-label="Sort by"
        >
          <option value="number">Number</option>
          <option value="progress">Progress</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
        {filtered.map(({ level, groupNumber, groupLabel, progress }) => {
          const completionPct = pct(progress.seenCount,    progress.totalQuestions);
          const masteryPct    = pct(progress.masteredCount, progress.totalQuestions);
          const isComplete    = progress.seenCount === progress.totalQuestions && progress.totalQuestions > 0;
          const routeId       = `${level === '5-level' ? '5' : '7'}-${groupNumber}`;

          return (
            <button
              key={`${level}-${groupNumber}`}
              onClick={() => navigate(`/modules/${routeId}`)}
              className="w-full text-left px-5 py-4 hover:bg-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brass"
            >
              <div className="flex items-center gap-4">
                <span className={clsx(
                  'font-mono text-xs w-8 h-8 rounded-ctl border flex items-center justify-center flex-shrink-0',
                  isComplete ? 'bg-pine/10 text-pine border-pine/30' : 'bg-raised text-muted border-app'
                )}>
                  {String(groupNumber).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-xl tracking-wide text-app">{groupLabel} {groupNumber}</span>
                    <LevelBadge level={level} />
                    {isComplete && <Badge variant="success">Complete</Badge>}
                    {progress.incorrectCount > 0 && <Badge variant="error">{progress.incorrectCount} missed</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <ProgressBar value={completionPct} size="sm" className="flex-1 max-w-[220px]" />
                    <span className="font-mono text-xs text-muted">{completionPct}%</span>
                    {masteryPct > 0 && (
                      <span className="font-mono text-xs text-brass-deep">{masteryPct}% mastered</span>
                    )}
                    {progress.lastStudiedAt && (
                      <span className="font-mono text-[11px] text-subtle hidden sm:inline">{formatDate(progress.lastStudiedAt)}</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={17} className="text-subtle flex-shrink-0" />
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-muted py-12 text-sm">No groups match your search.</p>
        )}
      </div>
    </div>
  );
};
