import React from 'react';
import { StatCard, PanelCard } from '../ui';
import { TrendChart, DistributionChart, HorizontalBarChart } from '../charts';
import type { AdvancedAnalyticsData } from '../../types';
import { 
    MessageCircle, 
    Pin, 
    BrainCircuit, 
    Code, 
    Zap, 
    KeyRound, 
    HeartCrack, 
    Database, 
    MessageSquareOff 
} from 'lucide-react';

type AnalyticsProps = {
    data: AdvancedAnalyticsData;
};

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
);

export const UserAnalytics: React.FC<AnalyticsProps> = ({ data }) => (
    <div className="space-y-6">
        <SectionHeader title="User Analytics" subtitle="Insights into your user base growth and health." />
        <PanelCard>
            <h3 className="font-semibold mb-4">User Growth Over Time</h3>
            <TrendChart trendData={data.userGrowth} label="New Users" color="#3b82f6" />
        </PanelCard>
    </div>
);

export const ConversationAnalytics: React.FC<AnalyticsProps> = ({ data }) => (
    <div className="space-y-6">
        <SectionHeader title="Conversation Analytics" subtitle="Analyze how users are interacting with the application." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Conversations" value={data.totalConversations} description="All conversations started by users" icon={<MessageCircle size={24} />} borderColor="border-teal-500" />
            <StatCard title="Pinned Conversations" value={`${data.pinnedConversationRate.toFixed(1)}%`} description="Percentage of conversations pinned by users" icon={<Pin size={24} />} borderColor="border-violet-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <PanelCard className="lg:col-span-3">
                <h3 className="font-semibold mb-4">New Conversations Trend</h3>
                <TrendChart trendData={data.conversationTrend} label="New Conversations" color="#14b8a6" />
            </PanelCard>
            <PanelCard className="lg:col-span-2">
                <h3 className="font-semibold mb-4">Conversation Type Distribution</h3>
                <DistributionChart distData={[
                    { name: 'Voice', count: data.conversationTypes.voice },
                    { name: 'Text', count: data.conversationTypes.text }
                ]} type="doughnut" />
            </PanelCard>
        </div>
    </div>
);

export const AiMemoryAnalytics: React.FC<AnalyticsProps> = ({ data }) => (
    <div className="space-y-6">
        <SectionHeader title="AI & Memory Analytics" subtitle="Performance and learning insights of the AI." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             <StatCard title="Total LTM Facts" value={data.totalLtmFacts} description="Long-term memory facts stored" icon={<BrainCircuit size={24} />} borderColor="border-fuchsia-500" />
            <StatCard title="Code Snippets Saved" value={data.totalCodeSnippets} description="Code snippets saved by users" icon={<Code size={24} />} borderColor="border-slate-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <PanelCard>
                <h3 className="font-semibold mb-4">LTM Category Distribution</h3>
                <HorizontalBarChart barData={data.ltmCategoryDistribution} label="Facts" color="#d946ef" />
            </PanelCard>
            <PanelCard>
                <h3 className="font-semibold mb-4">Top Programming Languages Saved</h3>
                <HorizontalBarChart barData={data.topCodeLanguages} label="Snippets" color="#64748b" />
            </PanelCard>
        </div>
    </div>
);

export const ContentAnalytics: React.FC<AnalyticsProps> = ({ data }) => (
    <div className="space-y-6">
        <SectionHeader title="Content & Engagement Analytics" subtitle="Performance of the 'Explore' feature and news articles." />
        <PanelCard>
            <h3 className="font-semibold mb-4">Most Discussed Articles</h3>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                     <thead>
                        <tr className="border-b">
                            <th className="text-left font-semibold p-2">Article URL</th>
                            <th className="text-right font-semibold p-2">Follow-up Conversations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.mostDiscussedArticles.slice(0, 15).map((article, index) => (
                            <tr key={index} className="border-b last:border-b-0">
                                <td className="p-2">
                                    <a href={article.name} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors truncate block max-w-md lg:max-w-2xl" title={article.name}>
                                        {article.name}
                                    </a>
                                </td>
                                <td className="text-right p-2 font-semibold text-slate-700">{article.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </PanelCard>
    </div>
);

export const FeatureUsageAnalytics: React.FC<AnalyticsProps> = ({ data }) => (
    <div className="space-y-6">
        <SectionHeader title="Feature Usage Analytics" subtitle="Adoption rates of specific application features." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <StatCard title="Proactive Mode Usage" value={`${data.proactiveModeRate.toFixed(1)}%`} description="Users with Proactive Mode enabled" icon={<Zap size={24} />} borderColor="border-amber-500" />
            <StatCard title="Personal API Key Usage" value={`${data.apiKeyUsageRate.toFixed(1)}%`} description="Users who have set their own API key" icon={<KeyRound size={24} />} borderColor="border-rose-500" />
        </div>
        <PanelCard>
            <h3 className="font-semibold mb-4">Voice Mode Adoption (Popular Voices)</h3>
            <DistributionChart distData={data.voiceModeAdoption} type="pie" />
        </PanelCard>
    </div>
);

export const SystemHealth: React.FC<AnalyticsProps> = ({ data }) => (
     <div className="space-y-6">
        <SectionHeader title="System Health & Monitoring" subtitle="Key metrics for monitoring the application's internal health." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <StatCard title="Summarization Failures" value={data.summarizationFailureCount} description="Conversations that failed to summarize" icon={<HeartCrack size={24} />} borderColor="border-red-600" />
            <StatCard title="Cached Articles" value={data.articleCacheCount} description="Unique articles in cache" icon={<Database size={24} />} borderColor="border-lime-500" />
            <StatCard title="Dead-End Conversations" value={data.deadEndConversationCount} description="Conversations with no AI response" icon={<MessageSquareOff size={24} />} borderColor="border-orange-500" />
        </div>
    </div>
);