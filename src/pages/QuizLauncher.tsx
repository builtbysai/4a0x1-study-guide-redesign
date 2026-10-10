import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from '../components/icons';
import { clsx } from 'clsx';
import { useAppStore, confirmSessionReplacement } from '../store/useAppStore';
import {
  getMissedQuestions, getFavoriteQuestions,
  getUnseenQuestions, getReviewQuestions, getGroupNumbers,
} from '../utils/dataHelpers';
import { Button, Card, Toggle, LevelBadge, InkButton } from '../components/ui';
import type { SessionMode, CDCLevel } from '../types';

interface GroupSelection { level: CDCLevel; groupNumber: number; }

const VALID_MODES = new Set<SessionMode>(['study', 'quiz', 'random', 'missed', 'favorites', 'unseen', 'review']);

function parseMode(raw: string | null): SessionMode {
  if (raw && VALID_MODES.has(raw as SessionMode)) return raw as SessionMode;
  return 'study';
}

const GROUP_MODES = new Set<SessionMode>(['study', 'quiz', 'random']);
const TIMER_PRESETS = [15, 30, 60] as const;
const SESSION_LIMITS = [
  { label: '10',  value: 10 },
  { label: '20',  value: 20 },
  { label: '50',  value: 50 },
  { label: 'All', value: null },
] as const;

export const QuizLauncher: React.FC = () => {
  const {
    questions, activeQuestions, userData, session,
    startSession, updateSettings, setActiveLevel,
  } = useAppStore();
  const navigate = useNavigate();
  const [params]  = useSearchParams();

  const [selectedMode, setSelectedMode] = useState<SessionMode>(
    parseMode(params.get('mode'))
  );
  const [selectedGroups, setSelectedGroups] = useState<GroupSelection[]>([]);
  const [startError, setStartError]         = useState<string | null>(null);

  const { settings, activeLevel } = userData;

  const missed    = getMissedQuestions(activeQuestions, userData);
  const favorites = getFavoriteQuestions(activeQuestions, userData);
  const unseen    = getUnseenQuestions(activeQuestions, userData);
  const review    = getReviewQuestions(activeQuestions, userData);

  const groupNumbers = useMemo(() => {
    if (activeLevel === 'both') {
      return {
        '5-level': getGroupNumbers(questions, '5-level'),
        '7-level': getGroupNumbers(questions, '7-level'),
      };
    }
    return { [activeLevel]: getGroupNumbers(questions, activeLevel as CDCLevel) };
  }, [questions, activeLevel]);

  const MODES: { mode: SessionMode; title: string; desc: string; count?: number }[] = [
    { mode: 'study',     title: 'Study mode',    desc: 'Instant feedback after each answer' },
    { mode: 'quiz',      title: 'Test mode',     desc: 'Results revealed only at the end' },
    { mode: 'random',    title: 'Random mix',    desc: 'Shuffled from all or selected groups' },
    { mode: 'missed',    title: 'Missed only',   desc: `${missed.length} to revisit`,    count: missed.length },
    { mode: 'favorites', title: 'Favorites',     desc: `${favorites.length} starred`,    count: favorites.length },
    { mode: 'unseen',    title: 'New questions', desc: `${unseen.length} not yet seen`,  count: unseen.length },
    { mode: 'review',    title: 'Bookmarked',    desc: `${review.length} marked`,         count: review.length },
  ];

  const isGroupSelected = (level: CDCLevel, num: number) =>
    selectedGroups.some(g => g.level === level && g.groupNumber === num);

  const toggleGroup = (level: CDCLevel, num: number) => {
    setStartError(null);
    setSelectedGroups(prev =>
      isGroupSelected(level, num)
        ? prev.filter(g => !(g.level === level && g.groupNumber === num))
        : [...prev, { level, groupNumber: num }]
    );
  };

  const showGroupSelect = GROUP_MODES.has(selectedMode);

  const handleModeChange = (mode: SessionMode) => {
    setSelectedMode(mode);
    setStartError(null);
    if (!GROUP_MODES.has(mode)) setSelectedGroups([]);
  };

  const modeCount: number | undefined =
    selectedMode === 'missed'    ? missed.length    :
    selectedMode === 'favorites' ? favorites.length :
    selectedMode === 'unseen'    ? unseen.length    :
    selectedMode === 'review'    ? review.length    :
    undefined;
  const canStart = modeCount === undefined || modeCount > 0;

  const hasActiveSession = session !== null && session.completedAt === null;

  const handleStart = () => {
    setStartError(null);
    if (hasActiveSession) {
      if (!confirmSessionReplacement()) return;
    }
    let questionIds: string[] | undefined;
    if (showGroupSelect && selectedGroups.length > 0) {
      questionIds = selectedGroups.flatMap(({ level, groupNumber }) =>
        questions
          .filter(q => q.level === level && q.groupNumber === groupNumber)
          .map(q => q.id)
      );
    }
    const ok = startSession(selectedMode, questionIds);
    if (!ok) {
      setStartError('No questions available for the current combination. Try different settings.');
      return;
    }
    navigate('/session');
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="kicker mb-2">New session</div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide mb-8">Start a session</h1>

      {hasActiveSession && (
        <button
          onClick={() => navigate('/session')}
          className="w-full mb-8 flex items-center gap-4 bg-surface border-2 border-brass rounded-card px-5 py-4 text-left hover:bg-subtle transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl tracking-wide text-app">Resume in-progress session</div>
            <div className="font-mono text-xs text-muted mt-1">
              {session!.questions.filter(q => q.selectedAnswer !== null || q.timedOut).length}/
              {session!.questions.length} answered
            </div>
          </div>
          <ChevronRight size={18} className="text-brass-deep flex-shrink-0" />
        </button>
      )}

      <div className="mb-8">
        <div className="kicker mb-3">Dataset</div>
        <div className="flex gap-2 flex-wrap">
          {(['both', '5-level', '7-level'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => { setActiveLevel(lvl); setSelectedGroups([]); setStartError(null); }}
              className={clsx(
                'flex items-center gap-2 px-4 h-10 rounded-ctl text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                activeLevel === lvl
                  ? 'bg-[#1A2332] text-[#F6F3EA] border-transparent dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                  : 'bg-surface border-app text-muted hover:text-app'
              )}
            >
              <LevelBadge level={lvl} />
              {lvl === 'both' ? 'All levels' : lvl === '5-level' ? '4A051 Journeyman' : '4A071 Craftsman'}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="kicker mb-3">Mode</div>
        <div className="bg-surface border border-app rounded-card divide-y divide-[rgb(var(--border))]">
          {MODES.map(({ mode, title, desc, count }) => {
            const isEmpty = count !== undefined && count === 0;
            const selected = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => !isEmpty && handleModeChange(mode)}
                disabled={isEmpty}
                aria-pressed={selected}
                className={clsx(
                  'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                  selected ? 'bg-subtle' : 'hover:bg-subtle'
                )}
              >
                <span className={clsx(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  selected ? 'bg-brass' : 'bg-raised border border-app'
                )} aria-hidden />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-app text-[15px]">{title}</span>
                  <span className="block text-sm text-muted">{desc}</span>
                </span>
                {count !== undefined && (
                  <span className="font-mono text-xs text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showGroupSelect && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="kicker">Groups</span>
            <button onClick={() => setSelectedGroups([])} className="text-xs text-brass-deep hover:underline">
              All groups
            </button>
          </div>
          {Object.entries(groupNumbers).map(([lvl, nums]) => (
            <div key={lvl} className="mb-3">
              {activeLevel === 'both' && (
                <div className="mb-2"><LevelBadge level={lvl as CDCLevel} /></div>
              )}
              <div className="flex flex-wrap gap-2">
                {(nums as number[]).map(num => {
                  const selected = isGroupSelected(lvl as CDCLevel, num);
                  return (
                    <button
                      key={`${lvl}-${num}`}
                      onClick={() => toggleGroup(lvl as CDCLevel, num)}
                      className={clsx(
                        'px-3 h-9 rounded-ctl text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                        selected
                          ? 'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                          : 'bg-surface border border-app text-muted hover:text-app'
                      )}
                    >
                      {lvl === '5-level' ? `M${num}` : `L${String(num).padStart(3, '0')}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {selectedGroups.length === 0 && (
            <p className="text-muted text-xs mt-1">No selection means all groups are included.</p>
          )}
        </div>
      )}

      <Card className="mb-8 divide-y divide-[rgb(var(--border))]">
        {selectedMode !== 'study' && selectedMode !== 'quiz' && (
          <Toggle
            label="Instant feedback"
            description="Show correct / incorrect after each answer"
            checked={settings.instantFeedback}
            onChange={v => updateSettings({ instantFeedback: v })}
          />
        )}
        {selectedMode === 'study' && (
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-app text-sm font-medium">Instant feedback</div>
              <div className="text-muted text-xs mt-0.5">Always on in study mode</div>
            </div>
            <span className="font-mono text-xs text-pine uppercase tracking-wider">On</span>
          </div>
        )}
        {selectedMode === 'quiz' && (
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-app text-sm font-medium">Instant feedback</div>
              <div className="text-muted text-xs mt-0.5">Off in test mode</div>
            </div>
            <span className="font-mono text-xs text-brick uppercase tracking-wider">Off</span>
          </div>
        )}

        <Toggle
          label="Shuffle questions"
          checked={settings.shuffleQuestions}
          onChange={v => updateSettings({ shuffleQuestions: v })}
        />
        <Toggle
          label="Shuffle answer choices"
          checked={settings.shuffleAnswers}
          onChange={v => updateSettings({ shuffleAnswers: v })}
        />

        <div className="py-3">
          <Toggle
            label="Timed mode"
            description={`${settings.timerSeconds}s per question`}
            checked={settings.timedMode}
            onChange={v => updateSettings({ timedMode: v })}
          />
          {settings.timedMode && (
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-xs text-muted mr-1">Presets</span>
              {TIMER_PRESETS.map(sec => (
                <button
                  key={sec}
                  onClick={() => updateSettings({ timerSeconds: sec })}
                  className={clsx(
                    'px-3 h-8 rounded-ctl text-xs font-mono transition-colors',
                    settings.timerSeconds === sec
                      ? 'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                      : 'bg-surface border border-app text-muted hover:text-app'
                  )}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="py-3">
          <div className="mb-2">
            <span className="text-app text-sm font-medium">Questions per session</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SESSION_LIMITS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => updateSettings({ sessionLimit: value })}
                className={clsx(
                  'px-4 h-9 rounded-ctl text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                  settings.sessionLimit === value
                    ? 'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                    : 'bg-surface border border-app text-muted hover:text-app'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {settings.sessionLimit !== null && (
            <p className="text-muted text-xs mt-1.5">
              Capped at {settings.sessionLimit} questions from the filtered pool.
            </p>
          )}
        </div>
      </Card>

      {startError && (
        <div className="mb-4 px-4 py-3 bg-brick/10 border border-brick/30 rounded-ctl text-sm text-brick">
          {startError}
        </div>
      )}

      <InkButton fullWidth onClick={handleStart} disabled={!canStart}>
        Start session
      </InkButton>

      {!canStart && (
        <p className="text-muted text-xs text-center mt-3">
          No questions available for this mode.
          {selectedMode === 'missed'    && ' Answer some questions incorrectly first.'}
          {selectedMode === 'favorites' && ' Star some questions to build a favorites list.'}
          {selectedMode === 'unseen'    && ' Every question has been seen.'}
          {selectedMode === 'review'    && ' Bookmark questions during a session to add them here.'}
        </p>
      )}
    </div>
  );
};
