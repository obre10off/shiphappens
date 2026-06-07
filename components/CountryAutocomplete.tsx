'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Search, X } from 'lucide-react';
import { toIso2 } from '@/lib/sanctions/countries';

/** ISO-3166-1 alpha-2 → flag emoji (regional indicator pair). */
function flagFor(country: string): string {
  const iso = toIso2(country);
  if (!iso || iso.length !== 2) return '🏳️';
  const cp = [...iso.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65));
  if (cp.some((n) => n < 0x1f1e6 || n > 0x1f1ff)) return '🏳️';
  return String.fromCodePoint(...cp);
}

type Props = {
  countries: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function CountryAutocomplete({ countries, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  // The text shown in the field: the live query while typing/open, else the selection.
  const display = open ? query : value;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    const starts: string[] = [];
    const contains: string[] = [];
    for (const c of countries) {
      const lc = c.toLowerCase();
      if (lc.startsWith(q)) starts.push(c);
      else if (lc.includes(q)) contains.push(c);
    }
    return [...starts, ...contains];
  }, [countries, query]);

  // Keep the highlighted row in range and scrolled into view.
  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results.length, active]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openMenu = () => {
    setQuery('');
    setActive(Math.max(0, results.findIndex((c) => c === value)));
    setOpen(true);
  };

  const choose = (country: string) => {
    onChange(country);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const clear = () => {
    onChange('');
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[active]) choose(results[active]);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div className="field-wrap" data-open={open || undefined}>
        <span className="field-lead" aria-hidden>
          {value && !open ? (
            <span className="text-base leading-none">{flagFor(value)}</span>
          ) : open ? (
            <Search className="w-4 h-4" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
        </span>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listboxId}-${active}` : undefined}
          className="field field-has-lead field-has-trail"
          placeholder={placeholder ?? 'Start typing a country…'}
          value={display}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
            setActive(0);
          }}
          onFocus={openMenu}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <span className="field-trail">
          {value ? (
            <button
              type="button"
              onClick={clear}
              className="field-trail-btn"
              aria-label="Clear country"
              tabIndex={-1}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden
            />
          )}
        </span>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="combobox-menu animate-fade-in"
        >
          {results.length === 0 ? (
            <li className="px-3.5 py-3 text-sm text-faint">No countries match “{query}”.</li>
          ) : (
            results.map((c, i) => {
              const selected = c === value;
              return (
                <li
                  key={c}
                  id={`${listboxId}-${i}`}
                  data-idx={i}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(c);
                  }}
                  className={`combobox-option ${i === active ? 'is-active' : ''}`}
                >
                  <span className="text-base leading-none w-5 text-center">{flagFor(c)}</span>
                  <span className="flex-1 truncate">{c}</span>
                  {selected && <Check className="w-4 h-4 text-accent shrink-0" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
