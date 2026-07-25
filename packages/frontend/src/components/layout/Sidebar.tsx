import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';
import { sidebarNavigation, iconMap } from './sidebar-nav';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user?: { name: string; email: string; avatar?: string };
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, user }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-navy-800 dark:bg-navy-900 ${collapsed ? 'w-[68px]' : 'w-60'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-gray-100 px-4 dark:border-navy-800">
          <Logo size={collapsed ? 'sm' : 'md'} />
          {!collapsed && <div className="flex-1" />}
          {onToggle && (
            <button onClick={onToggle} className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-navy-800 dark:hover:text-gray-300 transition-colors">
              <svg className={`h-3.5 w-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {sidebarNavigation.map((group) => (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <p className="mb-1 px-2.5 text-2xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-100 ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/15 dark:text-primary-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-navy-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                          {iconMap[item.icon]}
                        </span>
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-2xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User */}
        {user && (
          <div className="border-t border-gray-100 p-2.5 dark:border-navy-800">
            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
