import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, BookOpen, Zap, AlertCircle, BarChart2, Settings, ExternalLink, Bookmark } from '../icons';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/useAppStore';
import { getMissedQuestions, getReviewQuestions } from '../../utils/dataHelpers';
import { LevelBadge } from '../ui';

const LINKS = [
  { to: '/',        label: 'Home',    Icon: Home },
  { to: '/modules', label: 'Modules', Icon: BookOpen },
  { to: '/quiz',    label: 'Quiz',    Icon: Zap },
  { to: '/missed',  label: 'Missed',  Icon: AlertCircle },
  { to: '/review',  label: 'Review',  Icon: Bookmark },
  { to: '/stats',   label: 'Stats',   Icon: BarChart2 },
];

export const Sidebar: React.FC = () => {
  const activeQuestions = useAppStore(s => s.activeQuestions);
  const userData        = useAppStore(s => s.userData);
  const missedCount     = getMissedQuestions(activeQuestions, userData).length;
  const reviewCount     = getReviewQuestions(activeQuestions, userData).length;

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto scrollbar-none bg-surface border-r border-app py-6 px-4">
      <Link to="/" className="px-2 mb-1 block">
        <div className="font-display text-[26px] leading-none text-app tracking-wide">4A0X1</div>
        <div className="kicker mt-1">CDC Study Guide</div>
      </Link>

      <div className="px-2 mt-3 mb-6">
        <LevelBadge level={userData.activeLevel} />
      </div>

      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Main navigation">
        {LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'relative flex items-center gap-3 px-2 py-2.5 rounded-ctl text-[15px] font-medium transition-colors duration-150',
              isActive ? 'text-app' : 'text-muted hover:text-app hover:bg-raised'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-accent rounded-full" aria-hidden />}
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.7} className={isActive ? 'text-accent-deep' : ''} />
                <span>{label}</span>
                {label === 'Missed' && missedCount > 0 && (
                  <span className="ml-auto bg-wrong text-white text-xs font-mono px-1.5 py-0.5 rounded-ctl min-w-[20px] text-center leading-none">
                    {missedCount > 99 ? '99+' : missedCount}
                  </span>
                )}
                {label === 'Review' && reviewCount > 0 && (
                  <span className="ml-auto bg-accent text-white text-xs font-mono px-1.5 py-0.5 rounded-ctl min-w-[20px] text-center leading-none">
                    {reviewCount > 99 ? '99+' : reviewCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <a
          href="https://lms-jets.cce.af.mil/moodle/course/section.php?id=99658"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-2 py-2.5 rounded-ctl text-[15px] font-medium text-muted hover:text-app hover:bg-raised transition-colors duration-150"
        >
          <ExternalLink size={17} strokeWidth={1.7} />
          <span>Official CDCs</span>
        </a>
      </nav>

      <NavLink
        to="/settings"
        className={({ isActive }) => clsx(
          'flex items-center gap-3 px-2 py-2.5 rounded-ctl text-[15px] font-medium transition-colors duration-150',
          isActive ? 'text-app' : 'text-muted hover:text-app hover:bg-raised'
        )}
      >
        <Settings size={17} strokeWidth={1.7} />
        <span>Settings</span>
      </NavLink>
    </aside>
  );
};
