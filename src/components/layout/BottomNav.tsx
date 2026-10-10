import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Zap, AlertCircle, BarChart2, Settings, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { getMissedQuestions, getReviewQuestions } from '../../utils/dataHelpers';

const LINKS = [
  { to: '/',         label: 'Home',     Icon: Home },
  { to: '/modules',  label: 'Modules',  Icon: BookOpen },
  { to: '/quiz',     label: 'Quiz',     Icon: Zap },
  { to: '/missed',   label: 'Missed',   Icon: AlertCircle },
  { to: '/review',   label: 'Review',   Icon: Bookmark },
  { to: '/stats',    label: 'Stats',    Icon: BarChart2 },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

export const BottomNav: React.FC = () => {
  const activeQuestions = useAppStore(s => s.activeQuestions);
  const userData        = useAppStore(s => s.userData);
  const missedCount     = getMissedQuestions(activeQuestions, userData).length;
  const reviewCount     = getReviewQuestions(activeQuestions, userData).length;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-app safe-bottom md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-150',
              isActive ? 'text-app' : 'text-muted'
            )}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-brass rounded-b" aria-hidden />}
                <div className="relative">
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.7} className={isActive ? 'text-brass-deep' : ''} />
                  {label === 'Missed' && missedCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-brick text-white text-[8px] font-mono rounded-full flex items-center justify-center leading-none">
                      {missedCount > 99 ? '99+' : missedCount}
                    </span>
                  )}
                  {label === 'Review' && reviewCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-brass text-white text-[8px] font-mono rounded-full flex items-center justify-center leading-none">
                      {reviewCount > 99 ? '99+' : reviewCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
