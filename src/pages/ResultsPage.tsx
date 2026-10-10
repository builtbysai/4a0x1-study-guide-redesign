import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw, Home, ChevronDown, ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';
import { useAppStore, QUESTION_MAP, confirmSessionReplacement } from '../store/useAppStore';
import { calcSessionScore } from '../utils/dataHelpers';
import { Button, Card, ProgressBar, LevelBadge } from '../components/ui';
import type { Session, SessionQuestion } from '../types';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, lastCompletedSession, startSession, clearSession, userData } = useAppStore();

  const [showReview, setShowReview]     = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'unscored'>('all');
  const celebrated = useRef(false);

  // Prefer in-memory completed session; fall back to last persisted one so the
  // results page survives a browser refresh.
  const displaySession: Session | null =
    (session?.completedAt != null ? session : null) ?? lastCompletedSession ?? null;

  const score    = displaySession ? calcSessionScore(displaySession, QUESTION_MAP) : null;
  const scorePct = score ? Math.round((score.correct / Math.max(score.scored, 1)) * 100) : 0;
  const hasUnscored = (score?.unscorableCount ?? 0) > 0;

  // Retry set = questions the user got wrong or timed out on
  const retryIds = displaySession?.questions
    .filter(sq => sq.timedOut || sq.isCorrect === false)
    .map(sq => sq.questionId) ?? [];

  useEffect(() => {
    if (!score || celebrated.current) return;
    celebrated.current = true;
    // Respect the user's animations setting — no confetti if disabled
    if (scorePct >= 80 && userData.settings.animationsEnabled) {
      confetti({
        particleCount: 120, spread: 90, origin: { y: 0.6 },
        colors: ['#8C6D1B', '#2E7D4F', '#F6F3EA'],
      });
    }
  }, [score, scorePct, userData.settings.animationsEnabled]);

  if (!displaySession || !score) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted mb-4">No session results found.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const grade = scorePct >= 90 ? 'Exam ready' : scorePct >= 75 ? 'Strong' : scorePct >= 60 ? 'Getting there' : 'Keep drilling';
  const gradeColor = scorePct >= 90 ? 'text-pine' : scorePct >= 75 ? 'text-app' : scorePct >= 60 ? 'text-brass-deep' : 'text-brick';

  const reviewQuestions = displaySession.questions.filter(sq => {
    if (reviewFilter === 'correct')   return sq.isCorrect === true;
    if (reviewFilter === 'incorrect') return sq.isCorrect === false || sq.timedOut;
    if (reviewFilter === 'unscored')  return sq.isCorrect === null && !sq.timedOut;
    return true;
  });

  const retryMissed = () => {
    if (!retryIds.length) return;
    if (!confirmSessionReplacement()) return;
    if (startSession('missed', retryIds)) navigate('/session');
  };

  const retryAll = () => {
    if (!confirmSessionReplacement()) return;
    // BUG FIX #4: Build a map of original choice orders so "Retry Exact Set"
    // preserves the same answer arrangement the user originally saw.
    const choiceOrders = new Map(
      displaySession.questions.map(sq => [sq.questionId, sq.choiceOrder])
    );
    if (startSession(displaySession.mode, displaySession.originalQuestionIds, true, choiceOrders)) navigate('/session');
  };

  const sessionTimeMs = displaySession.questions.reduce((s, q) => s + (q.timeSpentMs ?? 0), 0);
  const mins = Math.floor(sessionTimeMs / 60000);
  const secs = Math.floor((sessionTimeMs % 60000) / 1000);
  const timeLabel = sessionTimeMs >= 1000
    ? (mins > 0 ? `${mins}m ${secs}s` : `${secs}s`)
    : null;

  return (
    <div className="min-h-screen bg-appbg">
      <div className="max-w-2xl mx-auto px-5 py-10 animate-slide-up">

        {/* Score */}
        <div className="text-center mb-8">
          <div className="kicker mb-2">Session complete · <LevelBadge level={displaySession.level} /></div>
          <div className={clsx('font-display text-[88px] leading-none tracking-wide', gradeColor)}>{scorePct}<span className="text-4xl text-muted">%</span></div>
          <div className="font-display text-3xl tracking-wide text-app mt-1">{grade}</div>

          <div className="flex justify-center gap-6 mt-5 font-mono text-xs text-muted">
            <span><span className="text-pine font-semibold">{score.correct}</span> correct</span>
            <span><span className="text-brick font-semibold">{score.incorrect}</span> incorrect</span>
            {score.unanswered > 0 && <span><span className="font-semibold">{score.unanswered}</span> skipped</span>}
          </div>

          {score.unscorableCount > 0 && (
            <div className="mt-3 text-xs text-brass-deep">
              {score.unscorableCount} unscored (no official answer key)
            </div>
          )}

          <div className="mt-5 max-w-xs mx-auto">
            <ProgressBar
              value={scorePct}
              variant={scorePct >= 80 ? 'success' : scorePct >= 60 ? 'brand' : 'error'}
              size="md"
              animated
            />
          </div>

          {timeLabel && (
            <p className="font-mono text-[11px] text-subtle mt-3">Time on task: {timeLabel}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          {retryIds.length > 0 && (
            <Button size="lg" fullWidth onClick={retryMissed} variant="danger">
              <RotateCcw size={16} /> Drill the {retryIds.length} missed
            </Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button size="md" variant="secondary" fullWidth onClick={retryAll}>
              Retry exact set
            </Button>
            <Button size="md" variant="secondary" fullWidth onClick={() => { clearSession(); navigate('/'); }}>
              <Home size={16} /> Home
            </Button>
          </div>
        </div>

        {/* Review toggle */}
        <button
          onClick={() => setShowReview(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 bg-surface border border-app rounded-card text-[15px] font-medium text-app"
          aria-expanded={showReview}
        >
          <span>Review answers</span>
          {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showReview && (
          <div className="mt-3 animate-slide-up">
            <div className="flex gap-2 mb-3 flex-wrap">
              {(['all', 'correct', 'incorrect', ...(hasUnscored ? ['unscored'] : [])] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f as typeof reviewFilter)}
                  className={clsx(
                    'px-3.5 h-9 rounded-ctl text-xs font-mono uppercase tracking-wider transition-colors',
                    reviewFilter === f
                      ? 'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                      : 'bg-surface border border-app text-muted hover:text-app'
                  )}
                >
                  {f === 'unscored' ? 'Unscored' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
              {reviewQuestions.map(sq => (
                <ReviewItem key={sq.questionId} sq={sq} />
              ))}
              {reviewQuestions.length === 0 && (
                <p className="text-center text-muted py-6 text-sm">No questions match this filter.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Review item ───────────────────────────────────────────────────────────

const ReviewItem: React.FC<{ sq: SessionQuestion }> = ({ sq }) => {
  const [open, setOpen] = useState(false);
  const q = QUESTION_MAP.get(sq.questionId);
  if (!q) return null;

  const isWrong = sq.isCorrect === false || sq.timedOut;
  const mark = sq.isCorrect === true ? 'text-pine' : isWrong ? 'text-brick' : 'text-subtle';
  const markLabel = sq.isCorrect === true ? '✓' : isWrong ? '✕' : '–';

  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className={clsx('font-mono text-sm w-5 flex-shrink-0', mark)} aria-hidden>{markLabel}</span>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] text-subtle uppercase tracking-wider mb-0.5">
            {q.groupLabel} {q.groupNumber} · Q{q.questionNumber}
            {sq.timedOut && <span className="ml-1 text-brick">(timed out)</span>}
          </p>
          <p className="text-[15px] text-app truncate">{q.text}</p>
        </div>
        {open ? <ChevronUp size={14} className="text-subtle flex-shrink-0" /> : <ChevronDown size={14} className="text-subtle flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1">
          <p className="text-app text-[15px] mb-3">{q.text}</p>
          <div className="space-y-1">
            {sq.choiceOrder
              .filter(key => q.choices[key] !== undefined)
              .map(key => (
                <div key={key} className={clsx(
                  'flex items-start gap-2 px-3 py-2 rounded-ctl text-sm border-l-2',
                  key === q.correctAnswer
                    ? 'border-pine bg-pine/10 text-app'
                    : key === sq.selectedAnswer && key !== q.correctAnswer
                    ? 'border-brick bg-brick/10 text-app'
                    : 'border-transparent text-muted'
                )}>
                  <span className="font-mono uppercase w-4 flex-shrink-0">{key}</span>
                  <span>{q.choices[key]}</span>
                </div>
              ))}
          </div>
          {sq.timedOut && (
            <p className="font-mono text-[11px] text-brick mt-2">Time expired — no answer selected</p>
          )}
        </div>
      )}
    </div>
  );
};
