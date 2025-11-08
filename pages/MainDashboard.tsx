
import React, { useState, useEffect } from 'react';
import { StatCard, PanelCard, timeAgo } from '../components/ui';
import { ApiDistributionChart, SuccessRateChart } from '../components/charts';
import { MainDashboardSkeleton } from '../components/skeletons';
import { fetchMainDashboardData } from '../services/supabaseService';
import type { MainDashboardData, RecentActivityLog } from '../types';
import { Zap, Newspaper, Users, LineChart, HeartCrack, X } from 'lucide-react';

const RecentActivityFeed: React.FC<{ activity: RecentActivityLog[] }> = ({ activity }) => (
    <PanelCard>
        <h3 className="font-semibold text-lg text-slate-800 mb-6">Recent Activity</h3>
        {activity.length > 0 ? (
            <div className="relative">
                {/* The timeline line */}
                <div className="absolute left-2.5 top-0 h-full w-0.5 bg-slate-200/70 -translate-x-1/2" aria-hidden="true"></div>
                
                <ul className="space-y-8">
                    {activity.map((log) => {
                        const isFailure = ['failure', 'FAILURE'].includes(log.status);
                        
                        const dotColor = isFailure 
                            ? 'bg-red-500' 
                            : log.type === 'agent' ? 'bg-indigo-500' : 'bg-amber-500';

                        return (
                            <li key={log.id} className="flex items-start gap-4">
                                {/* The Dot */}
                                <div className="relative z-10 mt-1 flex-shrink-0" aria-hidden="true">
                                    <div className={`h-5 w-5 rounded-full ${dotColor} border-4 border-white`}></div>
                                </div>

                                {/* The Content */}
                                <div className="flex-grow">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        {log.type === 'agent' ? 
                                          <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
                                            <Zap size={14} /> Agent
                                          </div>
                                        : <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                                            <Newspaper size={14} /> News
                                          </div>
                                        }
                                        {isFailure && (
                                            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                Failed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 mt-1">{log.description}</p>
                                    <p 
                                        className="text-xs text-slate-500 mt-1.5" 
                                        data-tooltip={new Date(log.timestamp).toLocaleString()}
                                    >
                                        {timeAgo(log.timestamp)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-10">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Zap size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-center text-slate-500 mt-4">No recent activity to show.</p>
                <p className="text-xs text-center text-slate-400 mt-1">System events will appear here as they happen.</p>
            </div>
        )}
    </PanelCard>
);


const MainDashboard: React.FC = () => {
    const [data, setData] = useState<MainDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const fetchedData = await fetchMainDashboardData();
                setData(fetchedData);
            } catch (error) {
                console.error("Failed to fetch main dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || !data) {
        return <MainDashboardSkeleton />;
    }

    const totalApiRequests = data.totalAgentRequests + data.totalNewsUpdateRequests;
    const totalApiSuccess = data.successAgentRequests + data.successNewsUpdateRequests;
    const successRate = totalApiRequests > 0 ? (totalApiSuccess / totalApiRequests) * 100 : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={data.totalUsers}
                    description="Registered users in the application"
                    icon={<Users size={24} />}
                    borderColor="border-sky-500"
                />
                <StatCard
                    title="Total News Articles"
                    value={data.totalArticles}
                    description="Published news articles"
                    icon={<Newspaper size={24} />}
                    borderColor="border-amber-500"
                />
                 <StatCard
                    title="Total API Requests"
                    value={totalApiRequests}
                    description="Agent & News Updater API calls"
                    icon={<LineChart size={24} />}
                    borderColor="border-indigo-500"
                />
                <StatCard
                    title="Summarization Failures"
                    value={data.summarizationFailureCount}
                    description="Conversations that failed to summarize"
                    icon={<HeartCrack size={24} />}
                    borderColor="border-red-500"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <PanelCard className="lg:col-span-3">
                    <h3 className="font-semibold mb-4">API Usage Distribution</h3>
                    <ApiDistributionChart agentCount={data.totalAgentRequests} newsCount={data.totalNewsUpdateRequests} />
                </PanelCard>
                <div className="lg:col-span-2 space-y-8">
                    <PanelCard>
                        <h3 className="font-semibold mb-4">Overall API Success Rate</h3>
                        <SuccessRateChart successRate={successRate} />
                    </PanelCard>
                    <RecentActivityFeed activity={data.recentActivity} />
                </div>
            </div>
        </div>
    );
};

export default MainDashboard;
