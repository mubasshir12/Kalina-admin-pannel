import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[20rem] gap-4">
        <span className="loader"></span>
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading data...</p>
    </div>
);

// --- Full Page Skeletons ---

export const MainDashboardSkeleton: React.FC = () => <LoadingSpinner />;
export const AgentAdminPageSkeleton: React.FC<{ view: string }> = () => <LoadingSpinner />;
export const NewsAdminPageSkeleton: React.FC<{ view: string }> = () => <LoadingSpinner />;
export const UsersPageSkeleton: React.FC = () => <LoadingSpinner />;
export const AdvancedAnalyticsSkeleton: React.FC = () => <LoadingSpinner />;
