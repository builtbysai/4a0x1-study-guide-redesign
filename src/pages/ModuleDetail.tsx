import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '../components/icons';
import { useAppStore, confirmSessionReplacement } from '../store/useAppStore';
import { calcGroupProgress, getMissedQuestions, pct } from '../utils/dataHelpers';
import { InkButton, Button, ProgressBar, StatCard, LevelBadge } from '../components/ui';
import type { CDCLevel } from '../types';

export const ModuleDetail: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const { questions, userData, startSession } = useAppStore();
  const navigate = useNavigate();

  const parsed = useMemo((): { level: CDCLevel; groupNumber: number } | null => {
    if (!routeId) return null;
    const dashIdx     = routeId.indexOf('-');
    if (dashIdx === -1) return null;
    const levelPrefix = routeId.slice(0, dashIdx);
    const numStr      = routeId.slice(dashIdx + 1);
    const groupNumber = parseInt(numStr, 10);
    if (isNaN(groupNumber) || groupNumber <= 0) return null;
    if (levelPrefix !== '5' && levelPrefix !== '7') return null;
    const level: CDCLevel = levelPrefix === '7' ? '7-level' : '5-level';
    return { level, groupNumber };
  }, [routeId]);

  const groupQuestions = useMemo(() =>
    parsed
      ? questions.filter(q => q.level === parsed.level && q.groupNumber === parsed.groupNumber)
      : [],
  [questions, parsed]);

  const progress = useMemo(() =>
    parsed ? calcGroupProgress(parsed.level, parsed.groupNumber, questions, userData) : null,
  [parsed, questions, userData]);

  const startQuiz = (mode: 'quiz' | 'study' | 'missed') => {
    if (!parsed || groupQuestions.length === 0) return;
    if (!confirmSessionReplacement()) return;
    let ok: boolean;
    if (mode === 'missed') {
      const missedIds = getMissedQuestions(groupQuestions, userData).map(q => q.id);
      if (missedIds.length === 0) return;
      ok = startSession('missed', missedIds);
    } else {
      ok = startSession(mode, groupQuestions.map(q => q.id));
    }
    if (ok) navigate('/session');
  };

  if (!parsed || !progress || groupQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-10">
        <button
          onClick={() => navigate('/modules')}
          className="flex items-center gap-2 text-muted mb-4 hover:text-app transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-muted">Group not found.</p>
      </div>
    );
  }

  const sample        = groupQuestions[0];
  const missedCount   = getMissedQuestions(groupQuestions, userData).length;
  const accuracyPct   = pct(progress.correctCount, progress.seenCount);
  const completionPct = pct(progress.seenCount, progress.totalQuestions);
  const masteryPct    = pct(progress.masteredCount, progress.totalQuestions);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <button
        onClick={() => navigate('/modules')}
        className="flex items-center gap-1.5 text-muted text-sm mb-6 hover:text-app transition-colors"
      >
        <ArrowLeft size={15} /> Modules
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-xs w-10 h-10 rounded-ctl border border-app bg-raised text-muted flex items-center justify-center">
          {String(parsed.groupNumber).padStart(2, '0')}
        </span>
        <LevelBadge level={parsed.level} />
      </div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide">
        {sample.groupLabel} {parsed.groupNumber}
      </h1>
      <p className="text-muted text-sm mt-2 font-mono">{progress.totalQuestions} questions</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 mb-6">
        <StatCard label="Seen" value={`${progress.seenCount}/${progress.totalQuestions}`} />
        <StatCard label="Mastered" value={progress.masteredCount} />
        <StatCard label="Missed" value={missedCount} />
        <StatCard label="Accuracy" value={`${accuracyPct}%`} sub={progress.seenCount === 0 ? 'No attempts yet' : undefined} />
      </div>

      <div className="bg-surface border border-app rounded-card p-5 mb-6">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="kicker">Completion</span>
          <span className="font-mono text-xs text-muted">{completionPct}%</span>
        </div>
        <ProgressBar value={completionPct} size="md" />
        <div className="flex justify-between items-baseline mb-1.5 mt-4">
          <span className="kicker">Mastery</span>
          <span className="font-mono text-xs text-muted">{masteryPct}%</span>
        </div>
        <ProgressBar value={masteryPct} variant="success" size="md" />
      </div>

      <div className="flex flex-col gap-3">
        <InkButton fullWidth onClick={() => startQuiz('study')}>
          Study this module
        </InkButton>
        <Button fullWidth variant="secondary" size="lg" onClick={() => startQuiz('quiz')}>
          Test mode
        </Button>
        {missedCount > 0 && (
          <Button fullWidth variant="secondary" size="lg" onClick={() => startQuiz('missed')}>
            Review missed ({missedCount})
          </Button>
        )}
      </div>
    </div>
  );
};
