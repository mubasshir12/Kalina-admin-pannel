import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, LineChart, History, HelpCircle, Users, TrendingUp, ChevronsLeft } from 'lucide-react';

interface SidebarProps {
    closeSidebar: () => void;
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, isCollapsed, onToggle }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    
    const isNewsPath = currentPath === '/news';
    const defaultHash = isNewsPath ? '#engagement' : '#analytics';
    const currentHash = location.hash || defaultHash; 
    
    const getNavLinkClass = (path: string) => 
        `sidebar-link ${isCollapsed ? 'justify-center' : ''} ${currentPath === path ? 'active' : ''}`;

    const getNestedNavLinkClass = (path: string, hash: string) => 
        `sidebar-link sidebar-nested-link ${isCollapsed ? 'justify-center' : ''} ${currentPath === path && currentHash === hash ? 'active' : ''}`;

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <NavLink to="/" className={() => getNavLinkClass('/')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Overview' : undefined}>
                    <Home size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'hidden' : ''}>Overview</span>
                </NavLink>

                <NavLink to="/users" className={() => getNavLinkClass('/users')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Users' : undefined}>
                    <Users size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'hidden' : ''}>Users</span>
                </NavLink>

                 <NavLink to="/advanced-analytics" className={() => getNavLinkClass('/advanced-analytics')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Insights' : undefined}>
                    <TrendingUp size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'hidden' : ''}>Insights</span>
                </NavLink>
                
                <div className="pt-4">
                    {isCollapsed ? <hr className="my-2 border-zinc-700" /> : (
                        <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                            Agent Panel
                        </div>
                    )}
                    <div className="space-y-1">
                        <NavLink to="/agent#analytics" className={() => getNestedNavLinkClass('/agent', '#analytics')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Analytics' : undefined}>
                            <LineChart size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Analytics</span>
                        </NavLink>
                        <NavLink to="/agent#logs" className={() => getNestedNavLinkClass('/agent', '#logs')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Logs' : undefined}>
                            <History size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Logs</span>
                        </NavLink>
                         <NavLink to="/agent#settings" className={() => getNestedNavLinkClass('/agent', '#settings')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Settings' : undefined}>
                            <Settings size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
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
                         <NavLink to="/news#engagement" className={() => getNestedNavLinkClass('/news', '#engagement')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Engagement' : undefined}>
                            <TrendingUp size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Engagement</span>
                        </NavLink>
                        <NavLink to="/news#analytics" className={() => getNestedNavLinkClass('/news', '#analytics')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Analytics' : undefined}>
                            <LineChart size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Analytics</span>
                        </NavLink>
                        <NavLink to="/news#logs" className={() => getNestedNavLinkClass('/news', '#logs')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Logs' : undefined}>
                            <History size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Logs</span>
                        </NavLink>
                        <NavLink to="/news#settings" className={() => getNestedNavLinkClass('/news', '#settings')} onClick={closeSidebar} data-tooltip={isCollapsed ? 'Settings' : undefined}>
                            <Settings size={18} className="shrink-0 w-5" /> <span className={isCollapsed ? 'hidden' : ''}>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-[var(--sidebar-border)]">
                <a href="#" className={`sidebar-link ${isCollapsed ? 'justify-center' : ''}`} data-tooltip={isCollapsed ? 'Help & Support' : undefined}>
                    <HelpCircle size={18} className="shrink-0 w-5 text-center" />
                    <span className={isCollapsed ? 'hidden' : ''}>Help & Support</span>
                </a>
                 <button 
                    onClick={onToggle}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className="hidden md:flex items-center justify-center w-full h-10 mt-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 rounded-md transition-colors"
                >
                    <ChevronsLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;