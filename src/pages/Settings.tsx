import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../store/useAppStore';
import { exportUserData, importUserData } from '../utils/storage';
import { Card, Toggle, Button, SectionHeader } from '../components/ui';

const TIMER_PRESETS  = [15, 30, 60] as const;
const SESSION_LIMITS = [
  { label: '10',  value: 10 },
  { label: '20',  value: 20 },
  { label: '50',  value: 50 },
  { label: 'All', value: null },
] as const;

export const Settings: React.FC = () => {
  const { userData, updateSettings, setTheme, resetAllProgress, setUserData } = useAppStore();
  const { settings, theme } = userData;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState<'all' | '5-level' | '7-level' | null>(null);
  const [importError, setImportError]   = useState<string | null>(null);
  const [imported, setImported]         = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importUserData(file);
      setUserData(data);
      setImported(true);
      setImportError(null);
      setTimeout(() => setImported(false), 3000);
    } catch (err) {
      setImportError((err as Error).message);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-6">
      <div className="kicker mb-2">Preferences</div>
      <h1 className="font-display text-[44px] leading-none text-app tracking-wide mb-8">Settings</h1>

      {/* Theme */}
      <div className="mb-6">
        <SectionHeader title="Appearance" />
        <Card>
          <div className="inline-flex bg-raised rounded-ctl p-1 gap-1">
            {([
              { value: 'light',  label: 'Light' },
              { value: 'dark',   label: 'Dark' },
              { value: 'system', label: 'System' },
            ] as { value: typeof theme; label: string }[]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={clsx(
                  'px-5 h-10 rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                  theme === opt.value
                    ? 'bg-surface text-app shadow-sm'
                    : 'text-muted hover:text-app'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Study preferences */}
      <div className="mb-6">
        <SectionHeader title="Study Preferences" />
        <Card padded={false} className="divide-y divide-border px-4">
          <Toggle
            label="Instant Feedback"
            description="Show correct/incorrect immediately (Study-like modes)"
            checked={settings.instantFeedback}
            onChange={v => updateSettings({ instantFeedback: v })}
          />
          <Toggle
            label="Shuffle Questions"
            description="Randomize question order each session"
            checked={settings.shuffleQuestions}
            onChange={v => updateSettings({ shuffleQuestions: v })}
          />
          <Toggle
            label="Shuffle Answer Choices"
            description="Randomize A/B/C/D order"
            checked={settings.shuffleAnswers}
            onChange={v => updateSettings({ shuffleAnswers: v })}
          />
        </Card>
      </div>

      {/* Timer */}
      <div className="mb-6">
        <SectionHeader title="Timer" />
        <Card padded={false} className="px-4">
          <Toggle
            label="Timed Mode"
            description={`${settings.timerSeconds}s per question`}
            checked={settings.timedMode}
            onChange={v => updateSettings({ timedMode: v })}
          />
          {settings.timedMode && (
            <div className="pb-3">
              <div className="mb-2">
                <span className="text-xs text-muted font-medium">Seconds per question</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {TIMER_PRESETS.map(sec => (
                  <button
                    key={sec}
                    onClick={() => updateSettings({ timerSeconds: sec })}
                    className={clsx(
                      'px-3 py-1.5 rounded-ctl text-xs font-display font-semibold border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                      settings.timerSeconds === sec
                        ? 'bg-[#1A2332] text-[#F6F3EA] border-transparent dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                        : 'border-border text-muted hover:border-muted'
                    )}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <p className="text-subtle text-xs mt-2">
                Questions that exceed the timer are automatically marked incorrect.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Session length */}
      <div className="mb-6">
        <SectionHeader title="Session Length" />
        <Card>
          <div className="mb-3">
            <span className="text-sm font-medium text-app">Questions per session</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SESSION_LIMITS.map(({ label, value }) => (
              <button
                key={label}
                onClick={() => updateSettings({ sessionLimit: value })}
                className={clsx(
                  'px-3 py-1.5 rounded-ctl text-xs font-display font-semibold border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass',
                  settings.sessionLimit === value
                    ? 'bg-[#1A2332] text-[#F6F3EA] border-transparent dark:bg-[#E8E4D4] dark:text-[#1A2332]'
                    : 'border-border text-muted hover:border-muted'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-subtle text-xs mt-2">
            {settings.sessionLimit === null
              ? 'All available questions will be included each session.'
              : `Sessions are capped at ${settings.sessionLimit} questions from the filtered pool.`}
          </p>
        </Card>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <SectionHeader title="Experience" />
        <Card padded={false} className="divide-y divide-border px-4">
          <Toggle label="Animations"      description="Smooth transitions and effects" checked={settings.animationsEnabled} onChange={v => updateSettings({ animationsEnabled: v })} />
          <Toggle label="Sound Effects"                                                 checked={settings.soundEnabled}      onChange={v => updateSettings({ soundEnabled: v })} />
          <Toggle label="Haptic Feedback" description="Vibration on supported devices" checked={settings.hapticsEnabled}    onChange={v => updateSettings({ hapticsEnabled: v })} />
        </Card>
      </div>

      {/* Mastery threshold */}
      <div className="mb-6">
        <SectionHeader title="Mastery System" />
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-app">Mastery Threshold</div>
              <div className="text-xs text-muted">Correct answers needed to master a question</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ masteryThreshold: Math.max(1, settings.masteryThreshold - 1) })}
                className="w-8 h-8 rounded-ctl border border-app flex items-center justify-center text-muted hover:bg-raised transition-colors font-bold"
                aria-label="Decrease mastery threshold"
              >−</button>
              <span className="w-6 text-center font-display font-bold text-app">{settings.masteryThreshold}</span>
              <button
                onClick={() => updateSettings({ masteryThreshold: Math.min(10, settings.masteryThreshold + 1) })}
                className="w-8 h-8 rounded-ctl border border-app flex items-center justify-center text-muted hover:bg-raised transition-colors font-bold"
                aria-label="Increase mastery threshold"
              >+</button>
            </div>
          </div>
        </Card>
      </div>

      {/* Official CDCs */}
      <div className="mb-6">
        <SectionHeader title="Official Resources" />
        <a
          href="https://lms-jets.cce.af.mil/moodle/course/section.php?id=99658"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-surface border border-app rounded-card px-4 py-3 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-ctl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            <ExternalLink size={16} className="text-muted group-hover:text-indigo-500 transition-colors" />
          </div>
          <div>
            <div className="font-display font-semibold text-sm text-app">View Official CDC Modules</div>
            <div className="text-muted text-xs">JET-S LMS · opens in new tab</div>
          </div>
        </a>
      </div>

      {/* Data management */}
      <div className="mb-6">
        <SectionHeader title="Data" />
        <div className="flex flex-col gap-3">
          <Button variant="secondary" fullWidth onClick={() => exportUserData(userData)} className="gap-2 justify-start">
            <Download size={16} /> Export Progress
          </Button>
          <Button variant="secondary" fullWidth onClick={() => fileRef.current?.click()} className="gap-2 justify-start">
            <Upload size={16} /> Import Progress
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {imported    && <p className="text-pine text-xs text-center">✓ Progress imported successfully</p>}
          {importError && <p className="text-brick text-xs text-center">{importError}</p>}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-6">
        <SectionHeader title="Danger Zone" />
        <div className="flex flex-col gap-2">
          {confirmReset ? (
            <Card className="border-brick/40 bg-brick/10">
              <div className="flex items-center gap-2 mb-3 text-brick">
                <AlertTriangle size={16} />
                <span className="font-display font-semibold text-sm">
                  Reset {confirmReset === 'all' ? 'all' : `${confirmReset} only`} progress? This cannot be undone.
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" fullWidth onClick={() => { resetAllProgress(confirmReset === 'all' ? undefined : confirmReset); setConfirmReset(null); }}>
                  Confirm Reset
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setConfirmReset(null)}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <>
              <Button variant="secondary" fullWidth onClick={() => setConfirmReset('5-level')} className="gap-2 text-brick border-red-200 dark:border-red-800">
                <Trash2 size={16} /> Reset 5-Level Progress
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setConfirmReset('7-level')} className="gap-2 text-brick border-red-200 dark:border-red-800">
                <Trash2 size={16} /> Reset 7-Level Progress
              </Button>
              <Button variant="danger" fullWidth onClick={() => setConfirmReset('all')}>
                <Trash2 size={16} /> Reset All Progress
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="text-center text-subtle text-xs pb-4">
        <p className="font-display text-lg tracking-wide text-app">4A0X1 CDC Study Guide</p>
        <p className="mt-0.5">200 questions · 5-Level (Modules 1–11) · 7-Level (Lessons 001–016)</p>
        <p className="mt-0.5">Schema v{userData.schemaVersion}</p>
      </div>
    </div>
  );
};
