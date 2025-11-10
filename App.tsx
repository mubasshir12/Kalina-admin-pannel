import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Zap, X, AlertTriangle } from 'lucide-react';

import MainDashboard from './pages/MainDashboard';
import AgentAdminPage from './pages/AgentAdminPage';
import NewsAdminPage from './pages/NewsAdminPage';
import UsersPage from './pages/UsersPage';
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import SystemArchitecturePage from './pages/SystemArchitecturePage'; // New Page Import
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
    state: ErrorBoundaryState = {
        hasError: false
    };

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to the console, as requested.
        console.error("Kalina AI - Uncaught Application Error:", error, errorInfo);
    }

    // FIX: Converted the render method to an arrow function to ensure `this` is always correctly bound to the component instance, preventing errors where `this.props` might be undefined.
    render = (): ReactNode => {
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


const PageLayout: React.FC<{ theme: string, toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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
            case '/settings':
                setPageTitle('Settings');
                break;
            case '/architecture': // New Page Title
                setPageTitle('System Architecture');
                break;
            case '/':
            default:
                setPageTitle('Overview');
                break;
        }
    }, [location.pathname]);

    return (
        <div className="flex h-full overflow-hidden">
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-gray-900/50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <aside className={`sidebar w-fit flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'md:w-20 sidebar-collapsed' : 'md:w-44'}`}>
                <div className="flex items-center justify-between p-4 h-16 flex-shrink-0">
                    <h1 className={`sidebar-header-title flex items-center gap-2 ${isSidebarCollapsed ? 'md:justify-center md:w-full' : ''}`}>
                        <Zap size={20} className="text-indigo-400 shrink-0" />
                        <span className={isSidebarCollapsed ? 'md:hidden' : ''}>Kalina AI</span>
                    </h1>
                </div>
                <Sidebar 
                    className="flex-1 min-h-0"
                    closeSidebar={() => setIsSidebarOpen(false)} 
                    isCollapsed={isSidebarCollapsed}
                    isSidebarOpen={isSidebarOpen}
                    onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    theme={theme}
                    toggleTheme={toggleTheme}
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
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/architecture" element={<SystemArchitecturePage />} /> {/* New Route */}
                    </Routes>
                </main>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('kalina-theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('kalina-theme', theme);

        // Update Chart.js global defaults for theme
        if ((window as any).Chart) {
            const isDark = theme === 'dark';
            (window as any).Chart.defaults.color = isDark ? '#9ca3af' : '#6b7280';
            (window as any).Chart.defaults.borderColor = isDark ? 'rgba(55, 65, 81, 0.8)' : '#e5e7eb';
        }
    }, [theme]);
    
    return (
        <HashRouter>
            <ErrorBoundary>
                <PageLayout theme={theme} toggleTheme={toggleTheme} />
            </ErrorBoundary>
        </HashRouter>
    );
};

export default App;