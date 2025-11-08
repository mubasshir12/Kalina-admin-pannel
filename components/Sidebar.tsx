

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Settings, LineChart, History, HelpCircle, Users, TrendingUp } from 'lucide-react';

interface SidebarProps {
    closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    
    const isNewsPath = currentPath === '/news';
    const defaultHash = isNewsPath ? '#engagement' : '#analytics';
    const currentHash = location.hash || defaultHash; 
    
    const getNavLinkClass = (path: string) => 
        `sidebar-link ${currentPath === path ? 'active' : ''}`;

    const getNestedNavLinkClass = (path: string, hash: string) => 
        `sidebar-link sidebar-nested-link ${currentPath === path && currentHash === hash ? 'active' : ''}`;

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <NavLink to="/" className={() => getNavLinkClass('/')} onClick={closeSidebar}>
                    <Home size={18} className="w-5 fa-fw text-center" />
                    <span>Overview</span>
                </NavLink>

                <NavLink to="/users" className={() => getNavLinkClass('/users')} onClick={closeSidebar}>
                    <Users size={18} className="w-5 fa-fw text-center" />
                    <span>Users</span>
                </NavLink>

                 <NavLink to="/advanced-analytics" className={() => getNavLinkClass('/advanced-analytics')} onClick={closeSidebar}>
                    <TrendingUp size={18} className="w-5 fa-fw text-center" />
                    <span>Insights</span>
                </NavLink>
                
                <div className="pt-4">
                    <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                        Agent Panel
                    </div>
                    <div className="space-y-1">
                        <NavLink to="/agent#analytics" className={() => getNestedNavLinkClass('/agent', '#analytics')} onClick={closeSidebar}>
                            <LineChart size={18} className="w-5 fa-fw" /> Analytics
                        </NavLink>
                        <NavLink to="/agent#logs" className={() => getNestedNavLinkClass('/agent', '#logs')} onClick={closeSidebar}>
                            <History size={18} className="w-5 fa-fw" /> Logs
                        </NavLink>
                         <NavLink to="/agent#settings" className={() => getNestedNavLinkClass('/agent', '#settings')} onClick={closeSidebar}>
                            <Settings size={18} className="w-5 fa-fw" /> Settings
                        </NavLink>
                    </div>
                </div>

                <div className="pt-4">
                    <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                        News Panel
                    </div>
                    <div className="space-y-1">
                         <NavLink to="/news#engagement" className={() => getNestedNavLinkClass('/news', '#engagement')} onClick={closeSidebar}>
                            <TrendingUp size={18} className="w-5 fa-fw" /> Engagement
                        </NavLink>
                        <NavLink to="/news#analytics" className={() => getNestedNavLinkClass('/news', '#analytics')} onClick={closeSidebar}>
                            <LineChart size={18} className="w-5 fa-fw" /> Analytics
                        </NavLink>
                        <NavLink to="/news#logs" className={() => getNestedNavLinkClass('/news', '#logs')} onClick={closeSidebar}>
                            <History size={18} className="w-5 fa-fw" /> Logs
                        </NavLink>
                        <NavLink to="/news#settings" className={() => getNestedNavLinkClass('/news', '#settings')} onClick={closeSidebar}>
                            <Settings size={18} className="w-5 fa-fw" /> Settings
                        </NavLink>
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-[var(--sidebar-border)]">
                <a href="#" className="sidebar-link">
                    <HelpCircle size={18} className="w-5 fa-fw text-center" />
                    <span>Help & Support</span>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;