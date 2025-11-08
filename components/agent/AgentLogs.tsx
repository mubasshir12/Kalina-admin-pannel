import React, { useRef, useEffect } from 'react';
import { PanelCard, CustomDropdown, timeAgo } from '../ui';
import type { AgentLog } from '../../types';
import { ChevronRight, Search, Trash2, CheckSquare, Square } from 'lucide-react';

const AgentLogs: React.FC<{ 
    logs: AgentLog[], 
    onShowDetails: (id: number) => void, 
    setSearch: (s:string)=>void, 
    setAgentFilter:(s:string)=>void, 
    agentFilter: string,
    setStatusFilter:(s:string)=>void, 
    statusFilter: string,
    uniqueAgents: string[],
    sortOption: string,
    setSortOption: (s: string) => void,
    onDelete: (id: number) => void,
    isSelectionMode: boolean,
    selectedLogs: Set<number>,
    onStartSelection: (id: number) => void,
    onToggleSelection: (id: number) => void,
    onSelectAll: () => void,
}> = ({ 
    logs, 
    onShowDetails, 
    setSearch, 
    setAgentFilter, 
    agentFilter, 
    setStatusFilter, 
    statusFilter, 
    uniqueAgents, 
    sortOption, 
    setSortOption,
    onDelete,
    isSelectionMode,
    selectedLogs,
    onStartSelection,
    onToggleSelection,
    onSelectAll
}) => {
    const pressTimer = useRef<number | null>(null);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    const handlePointerDown = (logId: number) => {
        if (isSelectionMode) return;
        pressTimer.current = window.setTimeout(() => {
            onStartSelection(logId);
            pressTimer.current = null;
        }, 1000);
    };

    const handlePointerUp = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
    };

    const handleRowClick = (logId: number) => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        if (isSelectionMode) {
            onToggleSelection(logId);
        } else {
            onShowDetails(logId);
        }
    };

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const isPartiallySelected = selectedLogs.size > 0 && selectedLogs.size < logs.length;
            selectAllCheckboxRef.current.indeterminate = isPartiallySelected;
        }
    }, [selectedLogs, logs.length]);

    const isAllSelected = logs.length > 0 && selectedLogs.size === logs.length;

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {/* Row 1: Search & Sort */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-grow w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input 
                            onChange={(e) => setSearch(e.target.value)} 
                            type="text" 
                            placeholder="Search prompts or agent names..." 
                            className="form-input w-full pl-11 rounded-full" 
                        />
                    </div>
                    <div className="w-48 shrink-0">
                        <CustomDropdown
                            value={sortOption}
                            options={['newest', 'oldest', 'latency']}
                            onChange={setSortOption}
                            displayLabels={{ 'newest': 'Newest First', 'oldest': 'Oldest First', 'latency': 'Highest Latency' }}
                            triggerClassName="rounded-full"
                        />
                    </div>
                </div>
                {/* Row 2: Filters */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <CustomDropdown
                            value={agentFilter}
                            options={uniqueAgents}
                            onChange={setAgentFilter}
                            triggerClassName="rounded-full"
                        />
                    </div>
                    <div>
                        <CustomDropdown
                            value={statusFilter}
                            options={['All', 'success', 'failure']}
                            onChange={setStatusFilter}
                            displayLabels={{ 'All': 'All Statuses' }}
                            triggerClassName="rounded-full"
                        />
                    </div>
                </div>
            </div>
            <PanelCard className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm log-table">
                        <thead>
                            <tr>
                                {isSelectionMode && (
                                    <th className="w-12 px-2 sm:px-4 text-center">
                                        <input
                                            ref={selectAllCheckboxRef}
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={isAllSelected}
                                            onChange={onSelectAll}
                                            aria-label="Select all logs"
                                        />
                                    </th>
                                )}
                                <th>Date</th>
                                <th>Time</th>
                                <th>Agent</th>
                                <th>Status</th>
                                <th>Latency</th>
                                <th className="text-center">Delete</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map(log => {
                                    const isSelected = selectedLogs.has(log.id);
                                    return (
                                        <tr 
                                            key={log.id} 
                                            className={`cursor-pointer group select-none ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : ''}`}
                                            onClick={() => handleRowClick(log.id)}
                                            onPointerDown={() => handlePointerDown(log.id)}
                                            onPointerUp={handlePointerUp}
                                            onPointerLeave={handlePointerUp}
                                        >
                                            {isSelectionMode && (
                                                <td className="whitespace-nowrap text-center px-2 sm:px-4">
                                                    <button 
                                                        className="p-2"
                                                        aria-label={isSelected ? 'Deselect log' : 'Select log'}
                                                    >
                                                        {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-400" />}
                                                    </button>
                                                </td>
                                            )}
                                            <td className="whitespace-nowrap">
                                                {new Date(log.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="whitespace-nowrap">
                                                <span data-tooltip={new Date(log.created_at).toLocaleString()}>
                                                    {timeAgo(log.created_at)}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs">{log.agent_name}</td>
                                            <td><span className={`status-badge ${log.status}`}>{log.status}</span></td>
                                            <td>{log.latency_ms} ms</td>
                                            <td className="text-center">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
                                                    className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-100"
                                                    data-tooltip="Delete Log"
                                                    aria-label="Delete log"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                            <td className="text-right pr-4"><ChevronRight size={16} className="text-slate-400 inline-block" /></td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isSelectionMode ? 8 : 7} className="text-center py-10 text-slate-500">
                                        No logs found for the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </PanelCard>
        </div>
    );
};

export default AgentLogs;