import React, { useState, useRef } from 'react';
import { PanelLeft } from 'lucide-react';
import ChatHistoryDropdown from './ai/ChatHistoryDropdown';

const Header: React.FC<{
    pageTitle: string;
    onMenuClick: () => void;
    isCollapsed: boolean;
}> = ({ pageTitle, onMenuClick, isCollapsed }) => {
    const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
    const chatButtonRef = useRef<HTMLButtonElement>(null);
    
    return (
        <header className={`bg-white/80 backdrop-blur-lg px-4 flex items-center gap-4 flex-shrink-0 border-b border-gray-200 fixed top-0 w-full z-20 h-16 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-[calc(100%-5rem)] md:left-20' : 'md:w-[calc(100%-11rem)] md:left-44'}`}>
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={onMenuClick} aria-label="Open sidebar">
                <PanelLeft size={24} />
            </button>

            <div className="flex items-baseline gap-2.5 truncate">
                <h1 className="font-cursive text-xl gradient-text">Kalina AI</h1>
                <span className="text-slate-300 font-light">|</span>
                <span className="text-slate-700 font-semibold text-base">{pageTitle}</span>
            </div>

            <div className="flex-grow" />

            <button
                ref={chatButtonRef}
                onClick={() => setIsChatMenuOpen(prev => !prev)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200/80 hover:text-slate-800 transition-colors"
                aria-label="Open AI Assistant and chat history"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#a855f7' }} />
                            <stop offset="100%" style={{ stopColor: '#3b82f6' }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M12 0 Q12 12 24 12 Q12 12 12 24 Q12 12 0 12 Q12 12 12 0Z"
                        fill="url(#gem-gradient)"
                    />
                </svg>
            </button>
            <ChatHistoryDropdown
                isOpen={isChatMenuOpen}
                onClose={() => setIsChatMenuOpen(false)}
                anchorEl={chatButtonRef.current}
            />
        </header>
    );
};

export default Header;