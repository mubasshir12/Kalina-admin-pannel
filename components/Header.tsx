import React from 'react';
import { PanelLeft, ChevronsLeft } from 'lucide-react';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
    isCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick, isCollapsed }) => {
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
        </header>
    );
};

export default Header;