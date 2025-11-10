
import React from 'react';
import SystemArchitecture from '../components/architecture/SystemArchitecture';

const SystemArchitecturePage: React.FC = () => {
    return (
        // A container with a dark background and overflow handling for the visualization
        // This ensures the desktop layout is preserved on mobile and can be scrolled horizontally.
        <div className="w-full bg-zinc-950 rounded-xl overflow-auto hide-scrollbar border border-zinc-800">
            <SystemArchitecture />
        </div>
    );
};

export default SystemArchitecturePage;
