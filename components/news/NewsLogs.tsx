import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PanelCard, timeAgo } from '../ui';
import type { NewsLog } from '../../types';
import { ChevronRight, Trash2, CheckSquare, Square } from 'lucide-react';

const NewsLogs: React.FC<{ 
    logs: NewsLog[], 
    onShowDetails: (id: number) => void, 
    onDelete: (id: number) => void,
    isSelectionMode: boolean,
    selectedLogs: Set<number>,
    onStartSelection: (id: number) => void,
    onToggleSelection: (id: number) => void,
    onSelectAll: () => void,
}> = ({ 
    logs, 
    onShowDetails, 
    onDelete, 
    isSelectionMode, 
    selectedLogs, 
    onStartSelection, 
    onToggleSelection,
    onSelectAll
}) => {
    const pressTimer = useRef<number | null>(null);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    // --- Virtualization State and Logic ---
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const ROW_HEIGHT = 53; // Estimated row height in pixels. Must be constant.
    const OVERSCAN = 5;

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const handleScroll = () => setScrollTop(container.scrollTop);
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const { paddingTop, paddingBottom, visibleLogs } = useMemo(() => {
        const containerHeight = scrollContainerRef.current?.clientHeight || window.innerHeight;
        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
        const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
        const endIndex = Math.min(logs.length - 1, startIndex + visibleCount + OVERSCAN);

        const visLogs = logs.slice(startIndex, endIndex + 1);

        const pt = startIndex * ROW_HEIGHT;
        const totalHeight = logs.length * ROW_HEIGHT;
        const pb = totalHeight - (pt + visLogs.length * ROW_HEIGHT);

        return {
            paddingTop: pt,
            paddingBottom: Math.max(0, pb),
            visibleLogs: visLogs,
        };
    }, [scrollTop, logs]);
    // --- End Virtualization Logic ---

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
        if (pressTimer.current) { // Prevent click if long press is in progress
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
    const numColumns = isSelectionMode ? 8 : 7;

    return (
        <PanelCard className="overflow-hidden !p-0 h-[70vh] flex flex-col">
            <div ref={scrollContainerRef} className="overflow-y-auto flex-grow">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm log-table">
                        <thead className="sticky top-0 z-10 bg-[var(--card-bg)] shadow-sm">
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
                                <th>Status</th>
                                <th>Duration</th>
                                <th>Articles Updated</th>
                                <th className="text-center">Delete</th>
                                <th className="text-center pr-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                <>
                                    <tr style={{ height: `${paddingTop}px` }}>
                                        <td colSpan={numColumns} style={{ padding: 0, border: 'none' }}></td>
                                    </tr>
                                    {visibleLogs.map(log => {
                                        const isSelected = selectedLogs.has(log.id);
                                        return (
                                            <tr 
                                                key={log.id} 
                                                className={`cursor-pointer group select-none ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : ''}`}
                                                onClick={() => handleRowClick(log.id)}
                                                onPointerDown={() => handlePointerDown(log.id)}
                                                onPointerUp={handlePointerUp}
                                                onPointerLeave={handlePointerUp}
                                                style={{ height: `${ROW_HEIGHT}px` }}
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
                                                    <span data-tooltip={new Date(log.created_at).toLocaleTimeString()}>
                                                        {timeAgo(log.created_at)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap"><span className={`status-badge ${log.status === 'SUCCESS' ? 'success' : 'failure'}`}>{log.status}</span></td>
                                                <td className="whitespace-nowrap">{(log.duration_ms / 1000).toFixed(2)} s</td>
                                                <td className="whitespace-nowrap">{log.summary?.find(s => s.includes('Total Articles Updated'))?.split(': ')[1] || 'N/A'}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(log.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-100"
                                                        data-tooltip="Delete Log"
                                                        aria-label="Delete log"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                                <td className="text-center pr-4">
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr style={{ height: `${paddingBottom}px` }}>
                                        <td colSpan={numColumns} style={{ padding: 0, border: 'none' }}></td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td colSpan={numColumns} className="text-center py-10 text-slate-500">
                                        No logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </PanelCard>
    );
};

export default NewsLogs;