import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ──────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  href?: string;
  action?: string;
  category: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

// ─── Commands ───────────────────────────────

const commands: CommandItem[] = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    icon: '📊',
    href: '/dashboard',
    category: 'Navigation',
  },
  {
    id: 'accounts',
    label: 'Chart of Accounts',
    icon: '📒',
    href: '/accounts',
    category: 'Navigation',
  },
  {
    id: 'journal',
    label: 'Journal Entries',
    icon: '📝',
    href: '/journal-entries',
    category: 'Navigation',
  },
  { id: 'invoices', label: 'Invoices', icon: '🧾', href: '/invoices', category: 'Navigation' },
  {
    id: 'reports',
    label: 'Financial Reports',
    icon: '📈',
    href: '/reports',
    category: 'Navigation',
  },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', category: 'Navigation' },
  { id: 'team', label: 'Team Management', icon: '👥', href: '/team', category: 'Navigation' },
  { id: 'clients', label: 'Clients', icon: '🤝', href: '/clients', category: 'Navigation' },
  {
    id: 'new-entry',
    label: 'Create Journal Entry',
    icon: '➕',
    href: '/journal-entries/new',
    category: 'Actions',
  },
  {
    id: 'new-invoice',
    label: 'Create Invoice',
    icon: '🧾',
    href: '/invoices/new',
    category: 'Actions',
  },
  {
    id: 'upload-doc',
    label: 'Upload Document',
    icon: '📤',
    href: '/documents/upload',
    category: 'Actions',
  },
  {
    id: 'run-report',
    label: 'Generate Report',
    icon: '📊',
    href: '/reports/new',
    category: 'Actions',
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Dark Mode',
    icon: '🌓',
    action: 'toggle-theme',
    category: 'Preferences',
  },
  {
    id: 'keyboard',
    label: 'Keyboard Shortcuts',
    icon: '⌨️',
    action: 'shortcuts',
    category: 'Preferences',
  },
];

// ─── Component ──────────────────────────────

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()),
  );

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex] as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const execute = useCallback(
    (cmd: CommandItem) => {
      if (cmd.action === 'toggle-theme') {
        document.documentElement.classList.toggle('dark');
      } else if (cmd.href) {
        navigate(cmd.href);
      }
      onClose();
    },
    [navigate, onClose],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        execute(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, selectedIndex, execute, onClose],
  );

  if (!open) return null;

  // Group by category
  const groups = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>,
  );

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-navy-800">
          <svg
            className="h-5 w-5 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="h-12 flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-gray-500"
          />
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No results found</p>
            </div>
          ) : (
            Object.entries(groups).map(([category, items]) => (
              <div key={category} className="mb-2">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {category}
                </p>
                {items.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-800'
                      }`}
                    >
                      <span className="text-base">{cmd.icon}</span>
                      <div className="flex-1 text-left">
                        <span className="font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="ml-2 text-xs opacity-60">{cmd.description}</span>
                        )}
                      </div>
                      {cmd.href && (
                        <svg
                          className="h-4 w-4 opacity-40"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2.5 dark:border-navy-800">
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-navy-700 dark:bg-navy-800">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-navy-700 dark:bg-navy-800">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-[10px] dark:border-navy-700 dark:bg-navy-800">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
