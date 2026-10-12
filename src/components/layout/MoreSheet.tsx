import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Settings, ExternalLink, ChevronRight } from '../icons';
import { clsx } from 'clsx';

const ITEMS = [
  { to: '/stats',    label: 'Stats',         Icon: BarChart2, external: false },
  { to: '/settings', label: 'Settings',      Icon: Settings,  external: false },
  { to: 'https://lms-jets.cce.af.mil/moodle/course/section.php?id=99658', label: 'Official CDCs', Icon: ExternalLink, external: true },
];

export const MoreSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 md:hidden transition-[visibility] duration-300',
        open ? 'visible' : 'invisible delay-200'
      )}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={clsx(
          'absolute inset-0 bg-black/35 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="More"
        tabIndex={-1}
        className={clsx(
          'absolute bottom-0 left-0 right-0 bg-surface border-t border-app rounded-t-[20px] px-3 pt-2 pb-10 safe-bottom',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="w-10 h-1 rounded-full bg-[rgb(var(--border))] mx-auto my-3" aria-hidden="true" />
        <nav aria-label="More destinations">
          {ITEMS.map(({ to, label, Icon, external }) => {
            const row = (
              <>
                <span className="flex items-center justify-center w-10 h-10 rounded-ctl bg-raised text-muted">
                  <Icon size={19} strokeWidth={1.8} />
                </span>
                <span className="flex-1 text-[16px] font-medium text-app">{label}</span>
                <ChevronRight size={16} className="text-subtle" />
              </>
            );
            const cls = 'w-full flex items-center gap-3 px-2 py-2 rounded-ctl hover:bg-raised active:bg-raised transition-colors min-h-[60px] text-left';
            return external ? (
              <a key={to} href={to} target="_blank" rel="noopener noreferrer" className={cls}>
                {row}
              </a>
            ) : (
              <Link key={to} to={to} onClick={onClose} className={cls}>
                {row}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
