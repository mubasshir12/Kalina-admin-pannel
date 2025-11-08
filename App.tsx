

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Zap, X } from 'lucide-react';

import MainDashboard from './pages/MainDashboard';
import AgentAdminPage from './pages/AgentAdminPage';
import NewsAdminPage from './pages/NewsAdminPage';
import UsersPage from './pages/UsersPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const PageLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pageTitle, setPageTitle] = useState('Overview');

    useEffect(() => {
        switch (location.pathname) {
            case '/agent':
                setPageTitle('Agent Panel');
                break;
            case '/news':
                setPageTitle('News Panel');
                break;
            case '/users':
                setPageTitle('Users');
                break;
            case '/advanced-analytics':
                setPageTitle('Insights');
                break;
            case '/':
            default:
                setPageTitle('Overview');
                break;
        }
    }, [location.pathname]);

    return (
        <div className="flex h-full bg-gray-100">
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <aside className={`sidebar w-64 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 h-16 flex-shrink-0">
                    <h1 className="sidebar-header-title flex items-center gap-2">
                        <Zap size={20} className="text-indigo-400" />
                        <span>Kalina AI</span>
                    </h1>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <Header 
                    pageTitle={pageTitle}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                
                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<MainDashboard />} />
                        <Route path="/agent" element={<AgentAdminPage />} />
                        <Route path="/news" element={<NewsAdminPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <HashRouter>
            <PageLayout />
        </HashRouter>
    );
};

export default App;