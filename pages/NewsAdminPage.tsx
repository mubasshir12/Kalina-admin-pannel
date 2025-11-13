import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConfirmationModal, BatchActionToolbar } from '../components/ui';
import { NewsAdminPageSkeleton } from '../components/skeletons';
import { fetchNewsAdminData, fetchNewsEngagementData, deleteNewsLog, deleteNewsLogsBatch } from '../services/supabaseService';
import type { NewsLog, NewsConfig, ArticleEngagementData } from '../types';
import NewsAnalytics from '../components/news/NewsAnalytics';
import NewsLogs from '../components/news/NewsLogs';
import NewsSettings from '../components/news/NewsSettings';
import NewsEngagement from '../components/news/NewsEngagement';
import NewsLogDetail from '../components/news/NewsLogDetail';


const NewsAdminPage: React.FC = () => {
    const location = useLocation();
    const [view, setView] = useState('engagement');

    const [logs, setLogs] = useState<NewsLog[]>([]);
    const [config, setConfig] = useState<NewsConfig>({ gnews_api_keys: [], gemini_api_keys: [] });
    const [engagementData, setEngagementData] = useState<ArticleEngagementData | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ ids: number[]; isBatch: boolean } | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set());

    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null, endDate: Date | null }>({ startDate: null, endDate: null });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [{ logs, config }, engagementData] = await Promise.all([
                fetchNewsAdminData(),
                fetchNewsEngagementData()
            ]);
            setLogs(logs as NewsLog[]);
            setConfig(config);
            setEngagementData(engagementData);
        } catch (error) {
            console.error("Failed to fetch News admin data:", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['engagement', 'analytics', 'logs', 'settings'].includes(hash)) {
            setView(hash);
            if (hash !== 'logs') {
                setSelectedLogId(null);
            }
        } else {
            setView('engagement');
        }
    }, [location.hash]);
    
    const triggerHapticFeedback = () => {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(20); // A shorter, subtle vibration
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
            ? await deleteNewsLogsBatch(ids)
            : await deleteNewsLog(ids[0]);
        
        setDeleteConfirmation(null); // Close modal

        if (error) {
            alert(`Failed to delete log(s): ${error.message}`);
        } else {
            if (isBatch) {
                handleCancelSelection(); // Exit selection mode
            }
            loadData(); // Refresh data on success
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
        const allLogIds = logs.map(l => l.id);
        if (selectedLogs.size === allLogIds.length) {
            // All selected, so deselect all
            setSelectedLogs(new Set());
            setIsSelectionMode(false);
        } else {
            // Some or none selected, so select all
            setSelectedLogs(new Set(allLogIds));
            setIsSelectionMode(true);
        }
    };

    const filteredLogsByDate = useMemo(() => {
        if (!dateRange.startDate || !dateRange.endDate) {
            return logs;
        }
        return logs.filter(log => {
            const logDate = new Date(log.created_at);
            return logDate >= dateRange.startDate! && logDate <= dateRange.endDate!;
        });
    }, [logs, dateRange]);

    const analyticsData = useMemo(() => {
        const relevantLogs = filteredLogsByDate;
        const totalRuns = relevantLogs.length;
        const successfulRuns = relevantLogs.filter(l => l.status === 'SUCCESS').length;
        const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : '100.0';
        const avgDuration = totalRuns > 0 ? (relevantLogs.reduce((acc, l) => acc + l.duration_ms, 0) / totalRuns / 1000).toFixed(2) : '0';
        const articlesUpdated = relevantLogs.reduce((acc, l) => {
            const summaryLine = l.summary?.find(s => s.includes('Total Articles Updated'));
            return acc + (parseInt(summaryLine?.split(': ')[1] || '0', 10));
        }, 0);
        
        return { totalRuns, successRate, avgDuration, articlesUpdated };
    }, [filteredLogsByDate]);

    if (loading) {
        return <NewsAdminPageSkeleton view={view} />;
    }

    const selectedLog = logs.find(log => log.id === selectedLogId);

    const PillNav = () => (
        <div className="pill-nav-container">
            <div className="pill-nav">
                {[
                    {id: 'engagement', label: 'Engagement'},
                    {id: 'analytics', label: 'Analytics'}, 
                    {id: 'logs', label: 'Logs'},
                    {id: 'settings', label: 'Settings'},
                ].map(v => (
                    <Link 
                        key={v.id} 
                        to={`#${v.id}`}
                        onClick={() => setSelectedLogId(null)} 
                        className={`pill-nav-item ${view === v.id ? 'active' : ''}`}
                    >
                        {v.label}
                    </Link>
                ))}
            </div>
        </div>
    );

    const renderViewContent = () => {
        if (view === 'logs' && selectedLog) {
            return <NewsLogDetail log={selectedLog} onBack={() => setSelectedLogId(null)} />;
        }

        switch (view) {
            case 'engagement':
                return <NewsEngagement engagementData={engagementData} onRefresh={loadData} />;
            case 'analytics':
                return <NewsAnalytics logs={filteredLogsByDate} analyticsData={analyticsData} onDateChange={setDateRange} />;
            case 'logs':
                return <NewsLogs 
                    logs={logs} 
                    onShowDetails={(id) => setSelectedLogId(id)} 
                    onDelete={handleDeleteRequest} 
                    isSelectionMode={isSelectionMode}
                    selectedLogs={selectedLogs}
                    onStartSelection={handleStartSelection}
                    onToggleSelection={handleToggleSelection}
                    onSelectAll={handleSelectAll}
                />;
            case 'settings':
                return <NewsSettings currentConfig={config} onUpdate={loadData} />;
            default:
                // Safeguard to render the default view instead of null
                return <NewsEngagement engagementData={engagementData} onRefresh={loadData} />;
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

export default NewsAdminPage;