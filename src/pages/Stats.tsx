import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { calcGroupProgress, getGroupNumbers, pct, getMasteredQuestions } from '../utils/dataHelpers';
import { Card, StatCard, ProgressBar, Badge, LevelBadge } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import type { CDCLevel } from '../types';

function fmtTime(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export const Stats: React.FC = () => {
  const { questions, activeQuestions, userData } = useAppStore();
  const navigate = useNavigate();
  const { activeLevel } = userData;

  const groupData = useMemo(() => {
    const levels: CDCLevel[] = activeLevel === 'both' ? ['5-level', '7-level'] : [activeLevel];
    const result: {
      name: string; level: CDCLevel; groupNumber: number;
      completion: number; mastery: number; missed: number; total: number;
    }[] = [];

    for (const lvl of levels) {
      for (const num of getGroupNumbers(questions, lvl)) {
        const mp     = calcGroupProgress(lvl, num, questions, userData);
        const prefix = lvl === '5-level' ? 'M' : 'L';
        result.push({
          name:        `${prefix}${num}`,
          level:       lvl,
          groupNumber: num,
          completion:  pct(mp.seenCount,    mp.totalQuestions),
          mastery:     pct(mp.masteredCount, mp.totalQuestions),
          missed:      mp.incorrectCount,
          total:       mp.totalQuestions,
        });
      }
    }
    return result;
  }, [questions, userData, activeLevel]);

  const mastered  = getMasteredQuestions(activeQuestions, userData);
  const totalSeen = activeQuestions.filter(q => {
    const p = userData.questions[q.id];
    return p && p.status !== 'unseen';
  }).length;

  const { stats } = userData;

  const scopedAttempts = activeQuestions.reduce((sum, q) => {
    const p = userData.questions[q.id];
    return p ? sum + p.correctCount + p.incorrectCount : sum;
  }, 0);
  const scopedCorrect = activeQuestions.reduce(
    (sum, q) => sum + (userData.questions[q.id]?.correctCount ?? 0), 0
  );
  const accuracy = pct(scopedCorrect, scopedAttempts);

  const globalLabel = activeLevel !== 'both' ? ' (all levels)' : '';

  const strongest = [...groupData].filter(g => g.mastery > 0).sort((a, b) => b.mastery - a.mastery)[0];
  const weakest   = [...groupData].filter(g => g.missed > 0).sort((a, b) => b.missed - a.missed)[0];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="kicker mb-2">All modules</div>
          <h1 className="font-display text-[44px] leading-none text-app tracking-wide">Progress</h1>
        </div>
        <LevelBadge level={activeLevel} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard label="Accuracy" value={`${accuracy}%`} sub={`${scopedAttempts} attempts`} />
        <StatCard label={`Streak${globalLabel}`} value={`${stats.studyStreakDays}d`} sub={stats.lastStudyDate ?? 'Start today'} />
        <StatCard label="Mastered" value={mastered.length} sub={`of ${activeQuestions.length} questions`} />
        <StatCard label={`Time${globalLabel}`} value={fmtTime(stats.totalTimeMs)} sub={`${stats.sessionsCompleted} sessions`} />
      </div>

      <div className="bg-surface border border-app rounded-card p-5 mb-8">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="kicker">Coverage</span>
          <span className="font-mono text-xs text-muted">{totalSeen}/{activeQuestions.length}</span>
        </div>
        <ProgressBar value={pct(totalSeen, activeQuestions.length)} size="md" animated label="Overall coverage" />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-display text-2xl text-pine">{mastered.length}</div>
            <div className="kicker mt-1">Mastered</div>
          </div>
          <div>
            <div className="font-display text-2xl text-brass-deep">{totalSeen - mastered.length}</div>
            <div className="kicker mt-1">In progress</div>
          </div>
          <div>
            <div className="font-display text-2xl text-muted">{activeQuestions.length - totalSeen}</div>
            <div className="kicker mt-1">Unseen</div>
          </div>
        </div>
      </div>

      {(strongest || weakest) && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {strongest && (
            <div className="bg-surface border border-app rounded-card p-5">
              <div className="kicker mb-1">Strongest</div>
              <div className="font-display text-2xl tracking-wide text-app">{strongest.name}</div>
              <div className="font-mono text-xs text-pine mt-1">{strongest.mastery}% mastered</div>
            </div>
          )}
          {weakest && (
            <button onClick={() => navigate('/missed')} className="text-left bg-surface border border-app rounded-card p-5 hover:border-muted transition-colors">
              <div className="kicker mb-1">Needs work</div>
              <div className="font-display text-2xl tracking-wide text-app">{weakest.name}</div>
              <div className="font-mono text-xs text-brick mt-1">{weakest.missed} missed</div>
            </button>
          )}
        </div>
      )}

      <div className="bg-surface border border-app rounded-card p-5 mb-8">
        <div className="kicker mb-4">Completion by group</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'currentColor' }} className="text-subtle" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-subtle" domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val: number) => [`${val}%`, '']}
                contentStyle={{ background: '#1A2332', border: 'none', borderRadius: 6, fontSize: 12, color: '#F6F3EA' }}
              />
              <Bar dataKey="completion" radius={[2, 2, 0, 0]}>
                {groupData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.completion >= 80 ? '#2E7D4F' :
                      entry.completion >= 40 ? '#8C6D1B' : '#C9C2AE'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
        <div className="px-5 pt-4 pb-2">
          <span className="kicker">Group breakdown</span>
        </div>
        {groupData.map(g => (
          <div key={`${g.level}-${g.groupNumber}`} className="px-5 py-3 flex items-center gap-3">
            <span className="font-mono text-xs text-muted w-10 flex-shrink-0">{g.name}</span>
            <div className="flex-1 min-w-0">
              <ProgressBar value={g.completion} size="sm" label={`${g.name} completion`} />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono text-xs text-muted">{g.completion}%</span>
              {g.missed > 0 && <Badge variant="error">{g.missed}</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
