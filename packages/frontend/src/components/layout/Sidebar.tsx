import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { sidebarNavigation, iconMap, type SidebarGroup } from './sidebar-nav';

// ─── Props ──────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// ─── Component ──────────────────────────────

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, user }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-navy-800 dark:bg-navy-900 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-100 px-4 dark:border-navy-800">
          <Logo size={collapsed ? 'sm' : 'md'} />
          {!collapsed && <div className="flex-1" />}
          <button
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-800 dark:hover:text-gray-300 transition-colors"
          >
            <svg
              className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sidebarNavigation.map((group) => (
            <SidebarGroupComponent
              key={group.title}
              group={group}
              collapsed={collapsed}
              currentPath={location.pathname}
              onMobileClose={onMobileClose}
            />
          ))}
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-gray-100 p-3 dark:border-navy-800">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

// ─── Group Component ────────────────────────

function SidebarGroupComponent({
  group,
  collapsed,
  currentPath,
  onMobileClose,
}: {
  group: SidebarGroup;
  collapsed: boolean;
  currentPath: string;
  onMobileClose: () => void;
}) {
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {group.title}
        </p>
      )}
      <ul className="space-y-0.5">
        {group.items.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                  }`}
                >
                  {iconMap[item.icon] || (
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
                        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z"
                      />
                    </svg>
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
