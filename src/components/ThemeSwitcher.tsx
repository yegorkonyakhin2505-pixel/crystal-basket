import { u } from '../lib/url';
import { useEffect, useState } from 'react';
import { THEMES, type Mode, type ThemeId } from '../lib/themes';

/**
 * Floating theme drawer so the owner can preview every palette on the live
 * site. Persists to localStorage; also honours ?theme=&mode= in the URL.
 */
export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>('ivory');
  const [mode, setMode] = useState<Mode>('light');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setTheme((el.getAttribute('data-theme') as ThemeId) || 'ivory');
    setMode((el.getAttribute('data-mode') as Mode) || 'light');
    const onMode = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    window.addEventListener('cb:mode', onMode);
    return () => window.removeEventListener('cb:mode', onMode);
  }, []);

  function apply(t: ThemeId, m: Mode) {
    const el = document.documentElement;
    el.setAttribute('data-theme', t);
    el.setAttribute('data-mode', m);
    try {
      localStorage.setItem('cb-theme', t);
      localStorage.setItem('cb-mode', m);
    } catch {}
    setTheme(t);
    setMode(m);
  }

  function share() {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('mode', mode);
    navigator.clipboard?.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="mb-3 w-[300px] bg-surface border border-border rounded-brand shadow-2xl shadow-black/15 p-4 text-text">
          <div className="flex items-center justify-between mb-3">
            <p className="eyebrow">Colour theme</p>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-text text-sm" aria-label="Close">✕</button>
          </div>
          <div className="grid gap-1.5">
            {THEMES.map((t) => {
              const sw = mode === 'dark' ? t.darkSwatch : t.swatch;
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => apply(t.id, mode)}
                  className={`flex items-center gap-3 p-2 rounded-brand border text-left transition-colors ${active ? 'border-accent bg-surface-2' : 'border-transparent hover:bg-surface-2'}`}
                >
                  <span className="flex -space-x-1.5 shrink-0">
                    {sw.map((c, i) => (
                      <span key={i} className="w-5 h-5 rounded-full ring-1 ring-black/10" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.85rem] leading-tight">{t.name}</span>
                    <span className="block text-[0.7rem] text-muted leading-tight truncate">{t.fonts}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex-1 flex bg-surface-2 rounded-brand p-0.5 text-[0.78rem]">
              {(['light', 'dark'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => apply(theme, m)}
                  className={`flex-1 py-1.5 rounded-brand capitalize transition-colors ${mode === m ? 'bg-surface shadow-sm' : 'text-muted'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button onClick={share} className="btn btn-outline !py-1.5 !px-3 text-[0.75rem]">
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <a href={u('/themes')} className="block mt-3 text-[0.75rem] text-accent hover:underline">Compare all themes →</a>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 bg-surface border border-border text-text shadow-lg shadow-black/10 rounded-full pl-2.5 pr-4 py-2 text-[0.82rem] hover:-translate-y-0.5 transition-transform"
        aria-expanded={open}
        aria-label="Change colour theme"
      >
        <span className="w-5 h-5 rounded-full ring-1 ring-black/10" style={{ background: `conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--bg), var(--accent))` }} />
        Theme
      </button>
    </div>
  );
}
