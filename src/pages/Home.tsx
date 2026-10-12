import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '../components/icons';
import { useAppStore } from '../store/useAppStore';
import { calcGroupProgress, getMissedQuestions, getGroupNumbers, pct } from '../utils/dataHelpers';
import { ProgressBar, LevelBadge, InkButton } from '../components/ui';
import type { CDCLevel } from '../types';

export const Home: React.FC = () => {
  const { questions, activeQuestions, userData, session, setActiveLevel } = useAppStore();
  const navigate = useNavigate();
  const { activeLevel } = userData;

  const stats = useMemo(() => {
    const levels: CDCLevel[] = activeLevel === 'both' ? ['5-level', '7-level'] : [activeLevel];
    let totalSeen = 0, totalMastered = 0, modulesCompleted = 0;

    for (const level of levels) {
      for (const g of getGroupNumbers(questions, level)) {
        const mp = calcGroupProgress(level, g, questions, userData);
        totalSeen     += mp.seenCount;
        totalMastered += mp.masteredCount;
        if (mp.seenCount === mp.totalQuestions && mp.totalQuestions > 0) modulesCompleted++;
      }
    }

    const missed = getMissedQuestions(activeQuestions, userData);
    const groupsTotal = levels.reduce(
      (sum, lvl) => sum + getGroupNumbers(questions, lvl).length, 0
    );

    const scopedAttempts = activeQuestions.reduce((sum, q) => {
      const p = userData.questions[q.id];
      return p ? sum + p.correctCount + p.incorrectCount : sum;
    }, 0);
    const scopedCorrect = activeQuestions.reduce(
      (sum, q) => sum + (userData.questions[q.id]?.correctCount ?? 0), 0
    );

    return {
      totalSeen, totalMastered,
      totalMissed:     missed.length,
      modulesCompleted, groupsTotal,
      total:    activeQuestions.length,
      accuracy: pct(scopedCorrect, scopedAttempts),
      attempts: scopedAttempts,
      streak:   userData.stats.studyStreakDays,
    };
  }, [questions, activeQuestions, userData, activeLevel]);

  const weakest = useMemo(() => {
    const levels: CDCLevel[] = activeLevel === 'both' ? ['5-level', '7-level'] : [activeLevel];
    let worst: { level: CDCLevel; label: string; missed: number } | null = null;
    for (const level of levels) {
      for (const g of getGroupNumbers(questions, level)) {
        const mp = calcGroupProgress(level, g, questions, userData);
        if (mp.incorrectCount > 0 && (!worst || mp.incorrectCount > worst.missed)) {
          worst = { level, label: `${mp.groupLabel} ${g}`, missed: mp.incorrectCount };
        }
      }
    }
    return worst;
  }, [questions, userData, activeLevel]);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const hasActiveSession = session !== null && session.completedAt === null;
  const sessionProgress = hasActiveSession
    ? {
        answered: session.questions.filter(q => q.selectedAnswer !== null || q.timedOut).length,
        total:    session.questions.length,
      }
    : null;

  const coverage = pct(stats.totalSeen, stats.total);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6 animate-fade-in">
      <div className="kicker mb-3">{today} · <LevelBadge level={activeLevel} /></div>
      <h1 className="font-display text-[44px] leading-[1.05] text-app">
        {stats.totalSeen === 0 ? 'Start at the beginning.' : 'Pick up where you left off.'}
      </h1>
      <p className="text-muted mt-3 max-w-md">
        {stats.total} questions in the bank
        {stats.streak > 0 ? ` · ${stats.streak}-day streak` : ''}.
      </p>

      {/* Resume session */}
      {hasActiveSession && sessionProgress && (
        <button
          onClick={() => navigate('/session')}
          className="w-full mt-6 flex items-center gap-4 bg-surface border-2 border-accent rounded-card px-5 py-4 text-left hover:bg-subtle transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl tracking-wide text-app">Resume session</div>
            <div className="font-mono text-xs text-muted mt-1">
              {sessionProgress.answered}/{sessionProgress.total} answered · {pct(sessionProgress.answered, sessionProgress.total)}% complete
            </div>
          </div>
          <ChevronRight size={18} className="text-accent-deep flex-shrink-0" />
        </button>
      )}

      {/* Readiness */}
      <div className="mt-8 bg-surface border border-app rounded-card p-5">
        <div className="flex items-baseline justify-between mb-1">
          <span className="kicker">Readiness</span>
          <span className="font-display text-4xl text-app leading-none">{coverage}<span className="text-xl text-muted">%</span></span>
        </div>
        <ProgressBar value={coverage} size="md" animated label="Overall readiness" />
        <div className="flex items-center justify-between mt-3 font-mono text-xs text-muted">
          <span>{stats.modulesCompleted}/{stats.groupsTotal} modules done</span>
          <span>{stats.total - stats.totalSeen} questions unseen</span>
        </div>
      </div>

      {/* Stat strip — tappable, opens the full stats screen */}
      <div className="mt-8">
        <button
          onClick={() => navigate('/stats')}
          aria-label="View detailed stats"
          className="w-full text-left group"
        >
          <span className="flex items-center justify-between mb-2">
            <span className="kicker">Stats</span>
            <ChevronRight size={14} className="text-subtle group-hover:text-app transition-colors" />
          </span>
          <span className="grid grid-cols-4 gap-px bg-app border border-app rounded-card overflow-hidden group-hover:border-muted transition-colors">
            {[
              { label: 'Seen',     value: `${stats.totalSeen}` },
              { label: 'Mastered', value: `${stats.totalMastered}` },
              { label: 'Missed',   value: `${stats.totalMissed}` },
              { label: 'Accuracy', value: `${stats.accuracy}%` },
            ].map(s => (
              <span key={s.label} className="bg-surface px-3 py-4 text-center block">
                <span className="font-display text-[26px] leading-none text-app block">{s.value}</span>
                <span className="kicker mt-1.5 block">{s.label}</span>
              </span>
            ))}
          </span>
        </button>
      </div>

      {/* Weakest area */}
      {weakest && (
        <button
          onClick={() => navigate('/missed')}
          className="w-full mt-4 flex items-center gap-4 bg-surface border border-app rounded-card px-5 py-4 text-left hover:border-muted transition-colors"
          aria-label={`Review missed questions in ${weakest.label}`}
        >
          <div className="flex-1 min-w-0">
            <div className="kicker mb-1">Weakest area</div>
            <div className="font-display text-xl tracking-wide text-app">{weakest.label}</div>
            <div className="text-sm text-muted mt-0.5">
              {weakest.missed} missed {weakest.missed === 1 ? 'question' : 'questions'} waiting for review
            </div>
          </div>
          <ChevronRight size={18} className="text-muted flex-shrink-0" />
        </button>
      )}

      {/* Level selector */}
      <div className="mt-8">
        <div className="kicker mb-2">Studying</div>
        <div className="inline-flex bg-raised rounded-ctl p-1 gap-1">
          {(['both', '5-level', '7-level'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-3 sm:px-4 h-9 rounded-[4px] text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                activeLevel === lvl ? 'bg-surface text-app shadow-sm' : 'text-muted hover:text-app'
              }`}
            >
              {lvl === 'both' ? 'All levels' : lvl === '5-level' ? <>5-Level<span className="hidden sm:inline text-subtle"> · 4A051</span></> : <>7-Level<span className="hidden sm:inline text-subtle"> · 4A071</span></>}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <div className="kicker mb-2">Start</div>
        <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
          <ActionRow title="Start studying" sub="Pick a mode and begin" onClick={() => navigate('/quiz')} primary />
          <ActionRow title="Missed questions" sub={stats.totalMissed > 0 ? `${stats.totalMissed} to revisit` : 'Nothing missed yet'} onClick={() => navigate('/missed')} count={stats.totalMissed} />
          <ActionRow title="Browse modules" sub={`${stats.groupsTotal} groups available`} onClick={() => navigate('/modules')} />
          <ActionRow title="Random quiz" sub="Mix questions from all modules" onClick={() => navigate('/quiz?mode=random')} />
        </div>
      </div>

      <div className="mt-8">
        <InkButton fullWidth onClick={() => navigate('/quiz')}>
          Start studying
        </InkButton>
      </div>

      <a
        href="https://lms-jets.cce.af.mil/moodle/course/section.php?id=99658"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center justify-between px-1 py-3 text-sm text-muted hover:text-app transition-colors"
      >
        <span>Official CDC modules <span className="text-subtle">· JET-S LMS</span></span>
        <ChevronRight size={16} />
      </a>
    </div>
  );
};

const ActionRow: React.FC<{ title: string; sub: string; onClick: () => void; count?: number; primary?: boolean }> =
  ({ title, sub, onClick, count, primary }) => (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-subtle transition-colors">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-app text-[15px]">{title}</div>
        <div className="text-sm text-muted">{sub}</div>
      </div>
      {typeof count === 'number' && count > 0 && (
        <span className="font-mono text-xs bg-wrong text-white px-2 py-0.5 rounded-ctl">{count}</span>
      )}
      <ChevronRight size={17} className={primary ? 'text-accent-deep' : 'text-subtle'} />
    </button>
  );
