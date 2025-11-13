import React from 'react';

const LoadingSpinner: React.FC = () => (
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

export const AiChatPageSkeleton: React.FC = () => (
    <div className="ai-chat-container animate-pulse">
        <main className="chat-main">
            <div className="chat-messages-container space-y-6">
                {/* User message placeholder */}
                <div className="flex justify-end">
                    <div className="w-3/5 h-12 bg-slate-200 dark:bg-zinc-700 rounded-2xl rounded-br-none"></div>
                </div>
                {/* AI message placeholder */}
                <div className="flex justify-start">
                    <div className="w-4/5 h-24 bg-slate-200 dark:bg-zinc-700 rounded-2xl rounded-bl-none"></div>
                </div>
                 <div className="flex justify-end">
                    <div className="w-2/5 h-8 bg-slate-200 dark:bg-zinc-700 rounded-2xl rounded-br-none"></div>
                </div>
            </div>
            <div className="chat-input-wrapper">
                <div className="h-12 w-full bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
            </div>
        </main>
        <aside className="chat-sidebar p-6 space-y-6">
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-zinc-700 rounded"></div>
            <div className="space-y-3">
                <div className="h-12 w-full bg-slate-200 dark:bg-zinc-700 rounded-lg"></div>
                <div className="h-12 w-full bg-slate-200 dark:bg-zinc-700 rounded-lg"></div>
                <div className="h-12 w-full bg-slate-200 dark:bg-zinc-700 rounded-lg"></div>
            </div>
        </aside>
    </div>
);
