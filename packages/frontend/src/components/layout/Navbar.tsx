import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../providers/ThemeProvider';

// ─── Types ──────────────────────────────────

interface NavbarProps {
  onMenuToggle: () => void;
  onCommandOpen: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  children?: ReactNode;
}

// ─── Component ──────────────────────────────

export function Navbar({ onMenuToggle, onCommandOpen, user, children }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolved, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommandOpen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCommandOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-900/80 lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800 lg:hidden"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Search / Command Trigger */}
      <button
        onClick={onCommandOpen}
        className="flex h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:bg-white dark:border-navy-700 dark:bg-navy-800 dark:text-gray-500 dark:hover:border-navy-600 dark:hover:bg-navy-700"
      >
        <svg
          className="h-4 w-4 shrink-0"
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
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-navy-600 dark:bg-navy-700 dark:text-gray-400 sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Custom children slot */}
        {children}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200 transition-colors"
          title={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolved === 'dark' ? (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <NotificationButton />

        {/* User Menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            >
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:block">
                {user.name}
              </span>
              <svg
                className={`hidden h-4 w-4 text-gray-400 transition-transform md:block ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-navy-800 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                {[
                  { label: 'Your Profile', icon: '👤' },
                  { label: 'Organization', icon: '🏢' },
                  { label: 'Settings', icon: '⚙️' },
                  { label: 'Billing', icon: '💳' },
                  { label: 'Help & Support', icon: '❓' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-navy-800 transition-colors"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-navy-800 mt-1 pt-1">
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                    <span className="text-base">🚪</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Notification Button ────────────────────

function NotificationButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const notifications = [
    {
      id: 1,
      title: 'Invoice #1042 paid',
      desc: 'Client payment of $5,200 received',
      time: '2m ago',
      read: false,
    },
    {
      id: 2,
      title: 'Journal entry posted',
      desc: '3 entries synced from bank feed',
      time: '15m ago',
      read: false,
    },
    {
      id: 3,
      title: 'Monthly report ready',
      desc: 'December 2024 income statement generated',
      time: '1h ago',
      read: true,
    },
    {
      id: 4,
      title: 'Team member joined',
      desc: 'Sarah Wilson accepted your invite',
      time: '3h ago',
      read: true,
    },
  ];

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200 transition-colors"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-navy-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50 dark:border-navy-800/50 dark:hover:bg-navy-800/50 transition-colors ${
                  !n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
              >
                <div className="mt-0.5">
                  {!n.read ? (
                    <span className="block h-2 w-2 rounded-full bg-primary-500" />
                  ) : (
                    <span className="block h-2 w-2" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  >
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{n.desc}</p>
                  <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-2.5 dark:border-navy-800">
            <button className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
