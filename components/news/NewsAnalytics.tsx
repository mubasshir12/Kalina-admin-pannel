import React from 'react';
import { StatCard, PanelCard, DateRangeFilter } from '../ui';
import { NewsArticlesChart, AvgDurationChart } from '../charts';
import type { NewsLog } from '../../types';
import { PlayCircle, Percent, Timer, Newspaper } from 'lucide-react';

const NewsAnalytics: React.FC<{ 
    logs: NewsLog[], 
    analyticsData: any,
    onDateChange: (dates: { startDate: Date | null, endDate: Date | null }) => void
}> = ({ logs, analyticsData, onDateChange }) => (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <h3 className="text-xl font-bold text-slate-700">Analytics Dashboard</h3>
            <DateRangeFilter onChange={onDateChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Runs" value={analyticsData.totalRuns} description="Total news update operations" icon={<PlayCircle size={24} />} borderColor="border-indigo-500" />
            <StatCard title="Success Rate" value={`${analyticsData.successRate}%`} description="Rate of successful update runs" icon={<Percent size={24} />} borderColor="border-green-500" />
            <StatCard title="Avg. Duration" value={`${analyticsData.avgDuration} s`} description="Average time per operation" icon={<Timer size={24} />} borderColor="border-yellow-500" />
            <StatCard title="Articles Updated" value={analyticsData.articlesUpdated} description="Total articles processed" icon={<Newspaper size={24} />} borderColor="border-sky-500" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PanelCard>
                <h3 className="font-semibold mb-4">Articles Processed per Run</h3>
                <NewsArticlesChart logs={logs} />
            </PanelCard>
            <PanelCard>
                <h3 className="font-semibold mb-4">Run Duration</h3>
                <AvgDurationChart durationData={analyticsData.avgDurationData} />
            </PanelCard>
        </div>
    </div>
);

export default NewsAnalytics;