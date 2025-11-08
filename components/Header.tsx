import React from 'react';
import { PanelLeft } from 'lucide-react';

interface HeaderProps {
    pageTitle: string;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick }) => {
    return (
        <header className="bg-white/80 backdrop-blur-lg px-4 flex items-center gap-4 flex-shrink-0 border-b border-gray-200 fixed top-0 w-full md:w-[calc(100%-16rem)] md:left-64 z-20 h-16">
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={onMenuClick}>
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