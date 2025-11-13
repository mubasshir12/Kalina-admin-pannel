import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConfirmationModal, BatchActionToolbar } from '../components/ui';
import AgentLogDetail from '../components/agent/AgentLogDetail';
import { AgentAdminPageSkeleton } from '../components/skeletons';
import { fetchAgentData, deleteAgentLog, deleteAgentLogsBatch } from '../services/supabaseService';
import type { AgentLog, AgentConfig } from '../types';

import AgentAnalytics from '../components/agent/AgentAnalytics';
import AgentLogs from '../components/agent/AgentLogs';
import AgentSettings from '../components/agent/AgentSettings';

const AgentAdminPage: React.FC = () => {
    const location = useLocation();
    const [view, setView] = useState('analytics');
    
    const [logs, setLogs] = useState<AgentLog[]>([]);
    const [config, setConfig] = useState<AgentConfig>({ api_keys: [], active_model_name: '' });
    const [loading, setLoading] = useState(true);
    
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

    const [logSearch, setLogSearch] = useState('');
    const [agentFilter, setAgentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });
    const [sortOption, setSortOption] = useState('newest');

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: number[]; isBatch: boolean } | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());

    
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const { logs, config } = await fetchAgentData();
            setLogs(logs as AgentLog[]);
            setConfig(config);
        } catch (error) {
            console.error("Failed to fetch agent data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['analytics', 'logs', 'settings'].includes(hash)) {
            setView(hash);
            if (hash !== 'logs') {
                setSelectedLogId(null);
            }
        } else {
            setView('analytics');
        }
    }, [location.hash]);

    const filteredLogsByDate = useMemo(() => {
        if (!dateRange.startDate || !dateRange.endDate) {
            return logs; // 'All time'
        }
        return logs.filter(log => {
            const logDate = new Date(log.created_at);
            return logDate >= dateRange.startDate! && logDate <= dateRange.endDate!;
        });
    }, [logs, dateRange]);

    const analyticsData = useMemo(() => {
        const relevantLogs = filteredLogsByDate;
        const totalRequests = relevantLogs.length;
        const successfulRequests = relevantLogs.filter(log => log.status === 'success').length;
        const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests * 100).toFixed(1) : '0.0';
        const successfulLogs = relevantLogs.filter(log => log.status === 'success' && log.latency_ms);
        const avgLatency = successfulLogs.length > 0 ? (successfulLogs.reduce((acc, log) => acc + log.latency_ms, 0) / successfulLogs.length).toFixed(0) : '0';
        
        // FIX: Replaced `reduce` with a `for...of` loop to ensure proper type inference for agentCounts.
        const agentCounts: Record<string, number> = {};
        for (const log of relevantLogs) {
            agentCounts[log.agent_name] = (agentCounts[log.agent_name] || 0) + 1;
        }
        
        // FIX: Replaced `reduce` with a `for...of` loop to ensure proper type inference for agentLatencies.
        const agentLatencies: Record<string, { total: number; count: number }> = {};
        for (const log of relevantLogs) {
             if (log.status === 'success' && log.latency_ms) {
                if (!agentLatencies[log.agent_name]) {
                    agentLatencies[log.agent_name] = { total: 0, count: 0 };
                }
                agentLatencies[log.agent_name].total += log.latency_ms;
                agentLatencies[log.agent_name].count += 1;
            }
        }

        const avgAgentLatency = Object.entries(agentLatencies).map(([name, data]) => {
            return { name, avg: data.count ? Math.round(data.total / data.count) : 0 };
        }).sort((a,b) => b.avg - a.avg);

        const mostActiveAgent = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        return { totalRequests, avgLatency, errorRate, mostActiveAgent, agentCounts, avgAgentLatency };
    }, [filteredLogsByDate]);

    const filteredLogs = useMemo(() => {
        let processed = filteredLogsByDate.filter(log =>
            (log.prompt?.toLowerCase().includes(logSearch.toLowerCase()) || log.agent_name?.toLowerCase().includes(logSearch.toLowerCase())) &&
            (agentFilter === 'All' || log.agent_name === agentFilter) &&
            (statusFilter === 'All' || log.status === statusFilter)
        );

        switch (sortOption) {
            case 'oldest':
                processed.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case 'latency':
                processed.sort((a, b) => b.latency_ms - a.latency_ms);
                break;
            case 'newest':
            default:
                processed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
        }

        return processed;
    }, [filteredLogsByDate, logSearch, agentFilter, statusFilter, sortOption]);

    const uniqueAgents = useMemo(() => ['All', ...new Set(logs.map(log => log.agent_name))], [logs]);
    
    const triggerHapticFeedback = () => {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20);
        }
    };
    
    const handleDeleteRequest = (id: number) => {
        setDeleteConfirmation({ ids: [id], isBatch: false });
    };

    const handleBatchDeleteRequest = () => {
        if (selectedLogs.size > 0) {
            setDeleteConfirmation({ ids: Array.from(selectedLogs), isBatch: true });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { ids, isBatch } = deleteConfirmation;
        const { error } = isBatch
            ? await deleteAgentLogsBatch(ids)
            : await deleteAgentLog(ids[0]);
        
        setDeleteConfirmation(null);

        if (error) {
            alert(`Failed to delete log(s): ${error.message}`);
        } else {
            if (isBatch) {
                handleCancelSelection();
            }
            loadData();
        }
    };
    
    const handleStartSelection = (logId: number) => {
        triggerHapticFeedback();
        setIsSelectionMode(true);
        setSelectedLogs(new Set([logId]));
    };

    const handleToggleSelection = (logId: number) => {
        triggerHapticFeedback();
        const newSelection = new Set(selectedLogs);
        if (newSelection.has(logId)) {
            newSelection.delete(logId);
        } else {
            newSelection.add(logId);
        }
        
        if (newSelection.size === 0) {
            setIsSelectionMode(false);
        }
        setSelectedLogs(newSelection);
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedLogs(new Set());
    };

    const handleSelectAll = () => {
        triggerHapticFeedback();
        const allLogIds = filteredLogs.map(l => l.id);
        if (selectedLogs.size === allLogIds.length) {
            setSelectedLogs(new Set());
            setIsSelectionMode(false);
        } else {
            setSelectedLogs(new Set(allLogIds));
            setIsSelectionMode(true);
        }
    };

    if (loading) {
        return <AgentAdminPageSkeleton view={view} />;
    }

    const selectedLog = logs.find(log => log.id === selectedLogId);

    const PillNav = () => (
        <div className="pill-nav-container">
            <div className="pill-nav">
                {['analytics', 'logs', 'settings'].map(v => (
                    <Link 
                        key={v} 
                        to={`#${v}`}
                        onClick={() => setSelectedLogId(null)} 
                        className={`pill-nav-item ${view === v ? 'active' : ''}`}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Link>
                ))}
            </div>
        </div>
    );

    const renderViewContent = () => {
        if (view === 'logs' && selectedLog) {
            return <AgentLogDetail log={selectedLog} onBack={() => setSelectedLogId(null)} />;
        }
        
        switch(view) {
            case 'analytics':
                return <AgentAnalytics logs={filteredLogsByDate} analyticsData={analyticsData} onDateChange={setDateRange} />;
            case 'logs':
                return <AgentLogs 
                    logs={filteredLogs} 
                    onShowDetails={(id) => setSelectedLogId(id)} 
                    setSearch={setLogSearch} 
                    setAgentFilter={setAgentFilter} agentFilter={agentFilter} 
                    setStatusFilter={setStatusFilter} statusFilter={statusFilter} 
                    uniqueAgents={uniqueAgents}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    onDelete={handleDeleteRequest}
                    isSelectionMode={isSelectionMode}
                    selectedLogs={selectedLogs}
                    onStartSelection={handleStartSelection}
                    onToggleSelection={handleToggleSelection}
                    onSelectAll={handleSelectAll}
                />;
            case 'settings':
                return <AgentSettings config={config} onUpdate={loadData} />;
            default:
                // This case should not be hit due to the useEffect logic, but as a safeguard:
                return <AgentAnalytics logs={filteredLogsByDate} analyticsData={analyticsData} onDateChange={setDateRange} />;
        }
    };

    return (
        <div className="space-y-6">
            <PillNav />
            {renderViewContent()}
            {isSelectionMode && (
                <BatchActionToolbar
                    selectedCount={selectedLogs.size}
                    onCancel={handleCancelSelection}
                    onDelete={handleBatchDeleteRequest}
                />
            )}
            <ConfirmationModal
                isOpen={deleteConfirmation !== null}
                onClose={() => setDeleteConfirmation(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Log Deletion"
                message={
                    deleteConfirmation?.isBatch 
                        ? <>Are you sure you want to permanently delete <strong>{deleteConfirmation.ids.length} log records</strong>? This action cannot be undone.</>
                        : <>Are you sure you want to permanently delete this log record? This action cannot be undone.</>
                }
                confirmText={deleteConfirmation?.isBatch ? `Delete ${deleteConfirmation.ids.length} Logs` : "Delete Log"}
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default AgentAdminPage;