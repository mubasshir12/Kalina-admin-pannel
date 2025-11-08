import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Zap, X, AlertTriangle } from 'lucide-react';

import MainDashboard from './pages/MainDashboard';
import AgentAdminPage from './pages/AgentAdminPage';
import NewsAdminPage from './pages/NewsAdminPage';
import UsersPage from './pages/UsersPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// --- Error Boundary Component ---
interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
// FIX: Removed `public` keyword for idiomatic React class component style.
    state: ErrorBoundaryState = {
        hasError: false
    };

// FIX: Removed `public` keyword.
    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

// FIX: Removed `public` keyword.
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to the console, as requested.
        console.error("Kalina AI - Uncaught Application Error:", error, errorInfo);
    }

// FIX: Removed `public` keyword.
    render() {
        if (this.state.hasError) {
            // Render a fallback UI when an error is caught
            return (
                <div className="flex items-center justify-center h-screen bg-slate-100">
                    <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-lg mx-auto border-t-4 border-red-500">
                        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                        <h1 className="mt-4 text-2xl font-bold text-slate-800">Oops! Something went wrong.</h1>
                        <p className="mt-2 text-slate-600">
                            An unexpected issue occurred. The error has been logged to the console for review. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 btn btn-primary"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}


const PageLayout: React.FC = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
        <div className="flex h-full bg-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <aside className={`sidebar w-64 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                <div className="flex items-center justify-between p-4 h-16 flex-shrink-0">
                    <h1 className={`sidebar-header-title flex items-center gap-2 ${isSidebarCollapsed ? 'md:justify-center md:w-full' : ''}`}>
                        <Zap size={20} className="text-indigo-400 shrink-0" />
                        <span className={isSidebarCollapsed ? 'md:hidden' : ''}>Kalina AI</span>
                    </h1>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <Sidebar 
                    closeSidebar={() => setIsSidebarOpen(false)} 
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header for all screens */}
                <Header 
                    pageTitle={pageTitle}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    isCollapsed={isSidebarCollapsed}
                />
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pt-20 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
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
            <ErrorBoundary>
                <PageLayout />
            </ErrorBoundary>
        </HashRouter>
    );
};

export default App;