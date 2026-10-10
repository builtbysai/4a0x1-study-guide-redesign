import React, { useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { AnswerKey } from '../../types';

interface AnswerButtonProps {
  choiceKey:  AnswerKey;
  text:       string;
  selected:   boolean;
  correct:    boolean | null;
  revealed:   boolean;
  disabled:   boolean;
  onClick:    (key: AnswerKey) => void;
}

const LABELS: Record<AnswerKey, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  choiceKey, text, selected, correct, revealed, disabled, onClick,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) onClick(choiceKey);
  }, [disabled, onClick, choiceKey]);

  const showCorrect = revealed && correct === true;
  const showWrong   = revealed && selected && correct === false;
  const isNeutral   = !revealed && !selected;
  const isSelected  = !revealed && selected;

  return (
    <button
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3.5 rounded-ctl border text-left transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2',
        !disabled && 'cursor-pointer active:translate-y-px',
        isNeutral   && 'border-app bg-surface hover:border-muted',
        isSelected  && 'border-brass-deep bg-brass/10',
        showCorrect && 'border-pine bg-pine/10',
        showWrong   && 'border-brick bg-brick/10',
        revealed && !selected && !showCorrect && 'opacity-45',
        disabled && 'cursor-not-allowed',
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${LABELS[choiceKey]}: ${text}`}
    >
      <span className={clsx(
        'w-8 h-8 rounded-ctl flex items-center justify-center text-xs font-mono flex-shrink-0 transition-colors border',
        isNeutral   && 'bg-raised text-muted border-app',
        isSelected  && 'bg-brass text-white border-brass',
        showCorrect && 'bg-pine text-white border-pine',
        showWrong   && 'bg-brick text-white border-brick',
        revealed && !selected && !showCorrect && 'bg-raised text-subtle border-app',
      )} aria-hidden>
        {revealed && selected && correct !== null
          ? correct
            ? <Check size={14} strokeWidth={3} />
            : <X     size={14} strokeWidth={3} />
          : LABELS[choiceKey]
        }
      </span>

      <span className={clsx(
        'text-[15px] leading-snug',
        showCorrect ? 'text-app font-medium' :
        showWrong   ? 'text-app' :
        isSelected  ? 'text-app font-medium' :
        'text-app'
      )}>
        {text}
      </span>

      {showCorrect && !selected && (
        <span className="ml-auto flex-shrink-0">
          <Check size={16} className="text-pine" strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
};
