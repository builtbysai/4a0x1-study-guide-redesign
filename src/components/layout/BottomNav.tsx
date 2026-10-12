import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Zap, Bookmark, More } from '../icons';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { getMissedQuestions, getReviewQuestions } from '../../utils/dataHelpers';
import { MoreSheet } from './MoreSheet';

const LINKS = [
  { to: '/',        label: 'Home',    Icon: Home },
  { to: '/modules', label: 'Modules', Icon: BookOpen },
  { to: '/quiz',    label: 'Quiz',    Icon: Zap },
  // Review covers both revisit queues; active on either route.
  { to: '/review',  label: 'Review',  Icon: Bookmark, match: ['/review', '/missed'] },
];

export const BottomNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();
  const activeQuestions = useAppStore(s => s.activeQuestions);
  const userData        = useAppStore(s => s.userData);
  const missedCount     = getMissedQuestions(activeQuestions, userData).length;
  const reviewCount     = getReviewQuestions(activeQuestions, userData).length;
  const reviewBadge     = missedCount + reviewCount;

  const itemClass = (isActive: boolean) => clsx(
    'relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors duration-150 min-h-[64px]',
    isActive ? 'text-app' : 'text-muted'
  );

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-app safe-bottom md:hidden"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch">
          {LINKS.map(({ to, label, Icon, match }) => {
            const isActive = match ? match.includes(pathname) : pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={itemClass(isActive)}
              >
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-accent rounded-b" aria-hidden />}
                <span className="relative">
                  <Icon size={21} strokeWidth={isActive ? 2.2 : 1.7} className={isActive ? 'text-accent-deep' : ''} />
                  {label === 'Review' && reviewBadge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-accent text-white dark:text-[#171512] text-[9px] font-mono rounded-full flex items-center justify-center leading-none">
                      {reviewBadge > 99 ? '99+' : reviewBadge}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            className={itemClass(moreOpen)}
          >
            <More size={21} strokeWidth={1.7} />
            <span>More</span>
          </button>
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
};
