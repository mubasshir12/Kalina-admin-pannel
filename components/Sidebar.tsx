


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

    const linkTextClasses = "transition-opacity whitespace-nowrap delay-200 md:opacity-0 group-hover:md:opacity-100";

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <NavLink to="/" title="Overview" className={() => getNavLinkClass('/') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                    <Home size={18} className="w-5 fa-fw text-center" />
                    <span className={linkTextClasses}>Overview</span>
                </NavLink>

                <NavLink to="/users" title="Users" className={() => getNavLinkClass('/users') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                    <Users size={18} className="w-5 fa-fw text-center" />
                    <span className={linkTextClasses}>Users</span>
                </NavLink>

                 <NavLink to="/advanced-analytics" title="Insights" className={() => getNavLinkClass('/advanced-analytics') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                    <TrendingUp size={18} className="w-5 fa-fw text-center" />
                    <span className={linkTextClasses}>Insights</span>
                </NavLink>
                
                <div className="pt-4">
                    <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider md:text-center group-hover:md:text-left overflow-hidden whitespace-nowrap">
                        <span className={linkTextClasses}>Agent Panel</span>
                    </div>
                    <div className="space-y-1">
                        <NavLink to="/agent#analytics" title="Analytics" className={() => getNestedNavLinkClass('/agent', '#analytics') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <LineChart size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Analytics</span>
                        </NavLink>
                        <NavLink to="/agent#logs" title="Logs" className={() => getNestedNavLinkClass('/agent', '#logs') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <History size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Logs</span>
                        </NavLink>
                         <NavLink to="/agent#settings" title="Settings" className={() => getNestedNavLinkClass('/agent', '#settings') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <Settings size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Settings</span>
                        </NavLink>
                    </div>
                </div>

                <div className="pt-4">
                    <div className="px-2 pb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider md:text-center group-hover:md:text-left overflow-hidden whitespace-nowrap">
                        <span className={linkTextClasses}>News Panel</span>
                    </div>
                    <div className="space-y-1">
                         <NavLink to="/news#engagement" title="Engagement" className={() => getNestedNavLinkClass('/news', '#engagement') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <TrendingUp size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Engagement</span>
                        </NavLink>
                        <NavLink to="/news#analytics" title="Analytics" className={() => getNestedNavLinkClass('/news', '#analytics') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <LineChart size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Analytics</span>
                        </NavLink>
                        <NavLink to="/news#logs" title="Logs" className={() => getNestedNavLinkClass('/news', '#logs') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <History size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Logs</span>
                        </NavLink>
                        <NavLink to="/news#settings" title="Settings" className={() => getNestedNavLinkClass('/news', '#settings') + ' md:justify-center group-hover:md:justify-start overflow-hidden'} onClick={closeSidebar}>
                            <Settings size={18} className="w-5 fa-fw" /> <span className={linkTextClasses}>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </nav>
            <div className="p-4 border-t border-[var(--sidebar-border)]">
                <a href="#" title="Help & Support" className="sidebar-link md:justify-center group-hover:md:justify-start overflow-hidden">
                    <HelpCircle size={18} className="w-5 fa-fw text-center" />
                    <span className={linkTextClasses}>Help & Support</span>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;