import React from 'react';
import { clsx } from 'clsx';

// ─── Button ─────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-ctl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary:   'bg-app text-app border-2 border-app hover:bg-subtle',
      secondary: 'bg-surface text-app border border-app hover:border-muted',
      ghost:     'text-muted hover:bg-raised hover:text-app',
      danger:    'bg-brick text-white hover:opacity-90',
      success:   'bg-pine text-white hover:opacity-90',
    };
    const sizes = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-6 text-[15px]', lg: 'h-[52px] px-8 text-base' };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// NOTE: primary buttons are ink-on-paper inverted via .btn-ink for the main CTA
export const InkButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'lg', fullWidth, loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-ctl',
        'bg-[#1A2332] text-[#F6F3EA] dark:bg-[#E8E4D4] dark:text-[#1A2332]',
        'hover:opacity-90 active:translate-y-px transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'h-9 px-4 text-sm' : size === 'md' ? 'h-11 px-6 text-[15px]' : 'h-[52px] px-8 text-base',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
);
InkButton.displayName = 'InkButton';

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ padded = true, hoverable, className, children, ...props }) => (
  <div
    className={clsx(
      'bg-surface rounded-card border border-app',
      padded && 'p-5',
      hoverable && 'transition-all duration-150 hover:border-muted cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'brand' | 'neutral' | 'level5' | 'level7';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variants: Record<string, string> = {
    default: 'bg-raised text-muted',
    success: 'bg-pine/15 text-pine',
    error:   'bg-brick/15 text-brick',
    warning: 'bg-brass/15 text-brass-deep',
    brand:   'bg-brass/15 text-brass-deep',
    neutral: 'bg-raised text-muted',
    level5:  'bg-raised text-app border border-app',
    level7:  'bg-raised text-app border border-app',
  };
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-ctl text-xs font-mono uppercase tracking-wider',
      variants[variant] ?? variants.default,
      className
    )}>
      {children}
    </span>
  );
};

// ─── Level Badge ─────────────────────────────────────────────────────────────

export const LevelBadge: React.FC<{ level: '5-level' | '7-level' | 'both'; className?: string }> = ({ level, className }) => {
  if (level === 'both') return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-ctl text-xs font-mono uppercase tracking-wider bg-raised text-app border border-app', className)}>
      5 + 7 Level
    </span>
  );
  return (
    <Badge variant={level === '5-level' ? 'level5' : 'level7'} className={className}>
      {level === '5-level' ? '5-Level' : '7-Level'}
    </Badge>
  );
};

// ─── Progress Bar ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number;
  variant?: 'brand' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  animated?: boolean;
  className?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, variant = 'brand', size = 'sm', animated, className, label
}) => {
  const colors = {
    brand:   'bg-brass',
    success: 'bg-pine',
    warning: 'bg-brass-deep',
    error:   'bg-brick',
  };
  const heights = { sm: 'h-1.5', md: 'h-2' };
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('w-full bg-raised rounded-full overflow-hidden', heights[size], className)}>
      <div
        className={clsx(colors[variant], heights[size], 'rounded-full transition-all duration-500', animated && 'progress-fill')}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}%`}
      />
    </div>
  );
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-8 w-8 border-[3px]' };
  return <div className={clsx('rounded-full border-current border-t-transparent animate-spin opacity-60', sizes[size])} role="status" aria-label="Loading" />;
};

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
    {icon && <div className="w-12 h-12 rounded-ctl bg-raised flex items-center justify-center text-muted mb-4">{icon}</div>}
    <h3 className="font-display text-2xl text-app mb-1">{title}</h3>
    {description && <p className="text-muted text-sm max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── Stat ────────────────────────────────────────────────────────────────────
// Deliberately typographic: no icon per stat.

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub }) => (
  <div className="bg-surface rounded-card border border-app p-5">
    <div className="kicker mb-2">{label}</div>
    <div className="font-display text-4xl text-app leading-none">{value}</div>
    {sub && <div className="text-subtle text-xs mt-2 font-mono">{sub}</div>}
  </div>
);

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description, disabled }) => (
  <div className={clsx('flex items-center justify-between gap-4 py-3', disabled && 'opacity-50')}>
    <div>
      <div className="text-app text-sm font-medium">{label}</div>
      {description && <div className="text-muted text-xs mt-0.5">{description}</div>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed',
        checked ? 'bg-brass' : 'bg-raised border border-app'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
        checked && 'translate-x-5'
      )} />
    </button>
  </div>
);

// ─── Section Header ──────────────────────────────────────────────────────────

export const SectionHeader: React.FC<{ kicker?: string; title: string; action?: React.ReactNode }> = ({ kicker, title, action }) => (
  <div className="flex items-end justify-between mb-4">
    <div>
      {kicker && <div className="kicker mb-1">{kicker}</div>}
      <h2 className="font-display text-3xl text-app leading-none">{title}</h2>
    </div>
    {action}
  </div>
);
