import React from 'react';
import { StatCard, PanelCard, DateRangeFilter } from '../ui';
import { AgentRequestsChart, AgentUsageChart, AvgLatencyChart } from '../charts';
import type { AgentLog } from '../../types';
import { Server, Timer, AlertTriangle, Rocket } from 'lucide-react';

const AgentAnalytics: React.FC<{ 
    logs: AgentLog[], 
    analyticsData: any,
    onDateChange: (dates: { startDate: Date | null, endDate: Date | null }) => void 
}> = ({ logs, analyticsData, onDateChange }) => {
    
    const capitalizedAgentName = analyticsData.mostActiveAgent && typeof analyticsData.mostActiveAgent === 'string'
        ? analyticsData.mostActiveAgent.charAt(0).toUpperCase() + analyticsData.mostActiveAgent.slice(1)
        : analyticsData.mostActiveAgent;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-slate-700">Analytics Dashboard</h3>
                <DateRangeFilter onChange={onDateChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Requests" value={analyticsData.totalRequests} description="API calls by agents" icon={<Server size={24} />} borderColor="border-indigo-500" />
                <StatCard title="Avg. Latency" value={`${analyticsData.avgLatency} ms`} description="Average success response time" icon={<Timer size={24} />} borderColor="border-blue-500" />
                <StatCard title="Error Rate" value={`${analyticsData.errorRate}%`} description="Percentage of failed calls" icon={<AlertTriangle size={24} />} borderColor="border-red-500" />
                <StatCard title="Most Active" value={capitalizedAgentName} description="Agent with the most requests" icon={<Rocket size={24} />} borderColor="border-purple-500" valueClassName="font-cursive font-normal italic" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <PanelCard className="lg:col-span-3"><h3 className="font-semibold mb-4">Requests Over Time</h3><AgentRequestsChart logs={logs} /></PanelCard>
                <PanelCard className="lg:col-span-2"><h3 className="font-semibold mb-4">Avg. Latency by Agent</h3><AvgLatencyChart agentLatencyData={analyticsData.avgAgentLatency} /></PanelCard>
                <PanelCard className="lg:col-span-5"><h3 className="font-semibold mb-4">Agent Usage Distribution</h3><AgentUsageChart agentCounts={analyticsData.agentCounts} /></PanelCard>
            </div>
        </div>
    );
};

export default AgentAnalytics;