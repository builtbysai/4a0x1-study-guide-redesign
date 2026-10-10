import React from 'react';
import { Bookmark, Star, Flag } from 'lucide-react';
import { clsx } from 'clsx';
import type { Question, SessionQuestion, QuestionProgress, AnswerKey } from '../../types';
import { AnswerButton } from './AnswerButton';

interface QuestionCardProps {
  question:          Question;
  sessionQ:          SessionQuestion;
  progress:          QuestionProgress | null;
  groupLabel:        string;
  questionLabel:     string;
  revealed:          boolean;
  onAnswer:          (key: AnswerKey) => void;
  onToggleFavorite?: () => void;
  onToggleFlag?:     () => void;
  onToggleReview?:   () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question, sessionQ, progress, groupLabel, questionLabel,
  revealed, onAnswer, onToggleFavorite, onToggleFlag, onToggleReview,
}) => {
  const hasAnswer      = sessionQ.selectedAnswer !== null || sessionQ.timedOut;
  const isUnknown      = !question.isScorableQuestion;
  const choiceEntries  = sessionQ.choiceOrder
    .filter(k => question.choices[k] !== undefined)
    .map(k => [k, question.choices[k]!] as [AnswerKey, string]);

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {groupLabel}
          </span>
          <span className="font-mono text-[11px] text-subtle">{questionLabel}</span>
          {question.verified && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-pine">
              Verified
            </span>
          )}
          {sessionQ.timedOut && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-brick bg-brick/10 px-1.5 py-0.5 rounded-ctl">
              Timed out
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {onToggleFavorite && (
            <ActionIcon
              label={progress?.isFavorite ? 'Remove favorite' : 'Favorite'}
              active={progress?.isFavorite}
              onClick={onToggleFavorite}
              icon={<Star size={16} />}
              activeColor="text-brass-deep"
            />
          )}
          {onToggleFlag && (
            <ActionIcon
              label={progress?.isFlagged ? 'Unflag' : 'Flag as confusing'}
              active={progress?.isFlagged}
              onClick={onToggleFlag}
              icon={<Flag size={16} />}
              activeColor="text-brick"
            />
          )}
          {onToggleReview && (
            <ActionIcon
              label={progress?.isMarkedForReview ? 'Remove bookmark' : 'Bookmark'}
              active={progress?.isMarkedForReview}
              onClick={onToggleReview}
              icon={<Bookmark size={16} />}
              activeColor="text-brass-deep"
            />
          )}
        </div>
      </div>

      <div className="bg-surface rounded-card border border-app p-5">
        {isUnknown && (
          <div className="mb-3 text-brass-deep text-xs font-medium">
            Official correct answer not available for this question
          </div>
        )}
        <p className="text-app text-[17px] leading-relaxed">{question.text}</p>
        {question.sourcePageRange && (
          <p className="font-mono text-[11px] text-subtle mt-3">Ref: {question.sourcePageRange}</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Answer choices">
        {choiceEntries.map(([key, text]) => {
          const isCorrect = revealed && question.correctAnswer === key
            ? true
            : revealed && sessionQ.selectedAnswer === key && question.correctAnswer !== key
            ? false
            : null;

          return (
            <AnswerButton
              key={key}
              choiceKey={key}
              text={text}
              selected={sessionQ.selectedAnswer === key}
              correct={isCorrect}
              revealed={revealed && hasAnswer}
              disabled={hasAnswer}
              onClick={onAnswer}
            />
          );
        })}
      </div>

      {revealed && hasAnswer && (
        <FeedbackPanel
          isCorrect={sessionQ.timedOut ? false : sessionQ.isCorrect}
          isUnknown={isUnknown}
          correctText={question.correctText}
          timedOut={sessionQ.timedOut}
        />
      )}
    </div>
  );
};

const ActionIcon: React.FC<{
  label: string; active?: boolean; onClick: () => void;
  icon: React.ReactNode; activeColor: string;
}> = ({ label, active, onClick, icon, activeColor }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className={clsx(
      'p-2 rounded-ctl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
      active ? activeColor : 'text-subtle hover:text-muted hover:bg-raised'
    )}
  >
    {icon}
  </button>
);

const FeedbackPanel: React.FC<{
  isCorrect: boolean | null;
  isUnknown: boolean;
  correctText: string | null;
  timedOut: boolean;
}> = ({ isCorrect, isUnknown, correctText, timedOut }) => {
  if (isUnknown) return (
    <div className="rounded-card border border-brass/40 bg-brass/10 p-4">
      <p className="text-brass-deep text-sm font-medium">
        {timedOut
          ? 'Time expired. No official answer to compare against.'
          : 'Practice answer recorded. No official answer to compare against.'}
      </p>
    </div>
  );

  if (isCorrect === null) return null;

  return (
    <div className={clsx(
      'rounded-card border-l-4 p-4 bg-surface border border-app',
      isCorrect ? 'border-l-pine' : 'border-l-brick'
    )}>
      <div className={clsx(
        'font-display text-xl tracking-wide mb-1',
        isCorrect ? 'text-pine' : 'text-brick'
      )}>
        {timedOut ? 'Time expired' : isCorrect ? 'Correct' : 'Not quite'}
      </div>
      {!isCorrect && correctText && (
        <p className="text-sm text-app">
          Correct answer: <strong>{correctText}</strong>
        </p>
      )}
    </div>
  );
};
