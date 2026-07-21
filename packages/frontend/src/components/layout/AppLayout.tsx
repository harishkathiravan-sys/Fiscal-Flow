import { useState, useCallback, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from './CommandPalette';
import { AiAssistant } from './AiAssistant';

// ─── Props ──────────────────────────────────

interface AppLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// ─── Component ──────────────────────────────

export function AppLayout({ children, user }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const handleCommandOpen = useCallback(() => setCommandOpen(true), []);
  const handleCommandClose = useCallback(() => setCommandOpen(false), []);
  const handleAiToggle = useCallback(() => setAiOpen((prev) => !prev), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        user={user}
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <Navbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          onCommandOpen={handleCommandOpen}
          user={user}
        >
          {/* AI Assistant toggle */}
          <button
            onClick={handleAiToggle}
            className={`rounded-lg p-2 transition-colors ${
              aiOpen
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200'
            }`}
            title="AI Assistant"
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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
          </button>
        </Navbar>

        <main>{children}</main>
      </div>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={handleCommandClose} />

      {/* AI Assistant Panel */}
      <AiAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
