import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, LineChart, History, Users, TrendingUp, ChevronsLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
    closeSidebar: () => void;
    isCollapsed: boolean;
    className?: string;
    isSidebarOpen?: boolean;
    onToggleCollapse: () => void;
    theme: string;
    toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, isCollapsed, className, isSidebarOpen, onToggleCollapse, theme, toggleTheme }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    
    const isNewsPath = currentPath === '/news';
    const defaultHash = isNewsPath ? '#engagement' : '#analytics';
    const currentHash = location.hash || defaultHash; 
    
    const getNavLinkClass = (path: string) => 
        `sidebar-link ${isCollapsed ? 'md:justify-center' : ''} ${currentPath === path ? 'active' : ''}`;

    const getNestedNavLinkClass = (path: string, hash: string) => 
        `sidebar-link sidebar-nested-link ${isCollapsed ? 'md:justify-center' : ''} ${currentPath === path && currentHash === hash ? 'active' : ''}`;

    return (
        <div className={`flex flex-col flex-1 relative ${className || ''}`}>
            {/* Mobile-only Close Button */}
            <button
                onClick={closeSidebar}
                aria-label="Close sidebar"
                className={`md:hidden absolute top-4 right-[-16px] z-50 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-300 ease-in-out shadow-md border border-gray-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <ChevronsLeft size={20} />
            </button>
            {/* Desktop-only Collapse Button */}
            <button
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={`hidden md:flex absolute top-4 right-[-16px] z-50 w-8 h-8 items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-300 ease-in-out shadow-md border border-gray-200`}
            >
                <ChevronsLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <NavLink to="/" className={() => getNavLinkClass('/')} onClick={closeSidebar}>
                    <Home size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'md:hidden' : ''}>Overview</span>
                </NavLink>

                <NavLink to="/users" className={() => getNavLinkClass('/users')} onClick={closeSidebar}>
                    <Users size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'md:hidden' : ''}>Users</span>
                </NavLink>

                 <NavLink to="/advanced-analytics" className={() => getNavLinkClass('/advanced-analytics')} onClick={closeSidebar}>
                    <TrendingUp size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'md:hidden' : ''}>Insights</span>
                </NavLink>
                
                <div className="pt-4">
                    {isCollapsed ? <hr className="my-2 border-zinc-700" /> : (
                        <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                            Agent Panel
                        </div>
                    )}
                    <div className="space-y-1">
                        <NavLink to="/agent#analytics" className={() => getNestedNavLinkClass('/agent', '#analytics')} onClick={closeSidebar}>
                            <LineChart size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Analytics</span>
                        </NavLink>
                        <NavLink to="/agent#logs" className={() => getNestedNavLinkClass('/agent', '#logs')} onClick={closeSidebar}>
                            <History size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Logs</span>
                        </NavLink>
                         <NavLink to="/agent#settings" className={() => getNestedNavLinkClass('/agent', '#settings')} onClick={closeSidebar}>
                            <Settings size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Settings</span>
                        </NavLink>
                    </div>
                </div>

                <div className="pt-4">
                    {isCollapsed ? <hr className="my-2 border-zinc-700" /> : (
                        <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                            News Panel
                        </div>
                    )}
                    <div className="space-y-1">
                         <NavLink to="/news#engagement" className={() => getNestedNavLinkClass('/news', '#engagement')} onClick={closeSidebar}>
                            <TrendingUp size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Engagement</span>
                        </NavLink>
                        <NavLink to="/news#analytics" className={() => getNestedNavLinkClass('/news', '#analytics')} onClick={closeSidebar}>
                            <LineChart size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Analytics</span>
                        </NavLink>
                        <NavLink to="/news#logs" className={() => getNestedNavLinkClass('/news', '#logs')} onClick={closeSidebar}>
                            <History size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Logs</span>
                        </NavLink>
                        <NavLink to="/news#settings" className={() => getNestedNavLinkClass('/news', '#settings')} onClick={closeSidebar}>
                            <Settings size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'md:hidden' : ''}>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </nav>
            <div className={`p-4 border-t border-[var(--sidebar-border)]`}>
                <div className={`grid grid-cols-2 gap-2 items-center justify-items-center ${isCollapsed ? 'md:grid-cols-1' : ''}`}>
                    <div
                        className="sidebar-tooltip-wrapper w-full flex justify-center"
                        data-tooltip={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    >
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div>
                    <div
                        className="sidebar-tooltip-wrapper w-full flex justify-center"
                        data-tooltip="Demo Settings"
                    >
                        <button 
                            className="p-2 rounded-full text-[var(--sidebar-text-secondary)] hover:bg-[var(--sidebar-link-hover-bg)] hover:text-[var(--sidebar-text-primary)] transition-colors"
                            aria-label="Demo Settings"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;