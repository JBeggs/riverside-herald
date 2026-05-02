/**
 * Theme constants safe to import from server and client.
 * Public site: classic | modern | dark. Admin: toggle classic ↔ dark only.
 */

export const THEMES = ['classic', 'modern', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export const DEFAULT_THEME: Theme = 'classic'

export const THEME_META: Record<
  Theme,
  { id: Theme; label: string; description: string }
> = {
  classic: {
    id: 'classic',
    label: 'Classic',
    description: 'Newsprint, serif headlines, crimson accent',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Bold editorial sans, yellow accent, sharp corners',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    description: 'High-contrast dark surfaces',
  },
}

export const THEME_COOKIE_KEY = 'site_theme'
export const THEME_STORAGE_KEY = 'site_theme'

export function isTheme(v: unknown): v is Theme {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v)
}

/** Before first paint — avoids flash; matches wire-and-bead pattern. */
export const THEME_BOOTSTRAP_SCRIPT = `
(function(){try{
  var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_KEY}=([^;]+)/);
  var t=m?decodeURIComponent(m[1]):null;
  if(!t){try{t=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(e){}}
  var allowed=${JSON.stringify(THEMES)};
  if(!t||allowed.indexOf(t)===-1)t='${DEFAULT_THEME}';
  document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();
`
