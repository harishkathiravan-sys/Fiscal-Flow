import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../providers/ThemeProvider';

interface NavbarProps {
  onMenuToggle: () => void;
  onCommandOpen: () => void;
  user?: { name: string; email: string; avatar?: string };
  children?: ReactNode;
}

export function Navbar({ onMenuToggle, onCommandOpen, user, children }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolved, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onCommandOpen(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCommandOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-900/80 lg:px-5">
      <button onClick={onMenuToggle} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800 lg:hidden">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
      </button>

      {/* Search */}
      <button onClick={onCommandOpen} className="flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:bg-white dark:border-navy-700 dark:bg-navy-800 dark:text-gray-500 dark:hover:border-navy-600 dark:hover:bg-navy-700 sm:max-w-sm">
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1 py-0.5 text-2xs font-medium text-gray-400 dark:border-navy-600 dark:bg-navy-700 dark:text-gray-500 sm:inline">⌘K</kbd>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {children}
        {/* Theme toggle */}
        <button onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200 transition-colors [&>svg]:h-4 [&>svg]:w-4"
          title={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}>
          {resolved === 'dark' ? (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
          ) : (
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200 transition-colors [&>svg]:h-4 [&>svg]:w-4">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:block">{user.name}</span>
              <svg className={`hidden h-3.5 w-3.5 text-gray-400 transition-transform md:block ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-navy-800 dark:bg-navy-900 animate-scale-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-navy-800 mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                </div>
                {['Your Profile', 'Settings', 'Help'].map((item) => (
                  <button key={item} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800 transition-colors">
                    {item}
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-navy-800 mt-1 pt-1">
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
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
