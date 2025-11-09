import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { AgentLog, NewsLog } from '../types';
import { 
    ChevronDown, 
    CalendarDays, 
    CalendarRange, 
    Clock, 
    Hash, 
    Rocket, 
    Timer, 
    Newspaper,
    Terminal,
    Code,
    List,
    Info,
    Copy,
    Check,
    ArrowLeft,
    AlertTriangle,
    Trash2,
    X,
} from 'lucide-react';

export const PanelCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`panel-card p-6 ${className}`}>
        {children}
    </div>
);

export const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode; borderColor?: string; valueClassName?: string; }> = ({ title, value, description, icon, borderColor = 'border-slate-200', valueClassName = '' }) => (
    <PanelCard className={`relative overflow-hidden border-t-4 ${borderColor}`}>
        <div className="flex items-start justify-between">
            <div className="flex-grow">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                 <p className={`text-3xl font-bold text-slate-800 mt-2 ${valueClassName}`}>{value}</p>
            </div>
            <div className="text-slate-400">
                {icon}
            </div>
        </div>
        <p className="text-sm text-slate-500 mt-4 truncate" data-tooltip={description}>{description}</p>
    </PanelCard>
);

export const timeAgo = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// === New Log Detail View Components ===

interface LogDetailViewProps {
    log: AgentLog | NewsLog | null;
    onBack: () => void;
}

const MetadataListItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; }> = ({ icon, label, value }) => (
    <div className="flex items-start justify-between py-3">
        <div className="flex items-center gap-3 text-sm">
            <div className="w-5 flex items-center justify-center text-slate-400">{icon}</div>
            <span className="font-medium text-slate-600">{label}</span>
        </div>
        <div className="text-right font-semibold text-slate-800 text-sm max-w-[60%] truncate">
            {value}
        </div>
    </div>
);

const LogContentPanel: React.FC<{ title: string; children: React.ReactNode; copyText: string; icon: React.ReactNode }> = ({ title, children, copyText, icon }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!copyText) return;
        navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="panel-card overflow-hidden !p-0 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                     <div className="w-5 flex items-center justify-center text-slate-500">{icon}</div>
                    <h4 className="font-semibold text-slate-800 text-base">{title}</h4>
                </div>
                <button 
                    onClick={handleCopy} 
                    data-tooltip="Copy to clipboard"
                    className={`text-slate-500 hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-200 ${copied ? 'text-green-500' : ''}`}
                    disabled={!copyText}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
            </div>
            <div className="p-4 bg-white text-sm flex-grow min-h-0">
                {children}
            </div>
        </div>
    );
};

export const LogDetailView: React.FC<LogDetailViewProps> = ({ log, onBack }) => {
    if (!log) return null;

    const isAgentLog = 'agent_name' in log;
    const isSuccess = (status: string) => status.toLowerCase().includes('success');
    
    const articlesUpdated = !isAgentLog ? log.summary?.find(s => s.includes('Total Articles Updated'))?.split(': ')[1] || 'N/A' : 'N/A';
    
    const logDate = new Date(log.created_at);
    const dateString = logDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const fullTimestamp = logDate.toLocaleString();

    const commonMetadata = [
        { 
            icon: <CalendarDays size={18} />, 
            label: 'Date', 
            value: dateString 
        },
        { 
            icon: <Clock size={18} />, 
            label: 'Time', 
            value: (
                <span data-tooltip={fullTimestamp}>
                    {timeAgo(logDate)}
                </span>
            )
        },
        { icon: <Hash size={18} />, label: 'Log ID', value: log.id }
    ];

    const metadataItems = isAgentLog ? [
        { icon: <Rocket size={18} />, label: 'Agent', value: (log as AgentLog).agent_name },
        { icon: <Timer size={18} />, label: 'Latency', value: `${(log as AgentLog).latency_ms} ms` },
        ...commonMetadata
    ] : [
        { icon: <Timer size={18} />, label: 'Duration', value: `${((log as NewsLog).duration_ms / 1000).toFixed(2)} s` },
        { icon: <Newspaper size={18} />, label: 'Articles Updated', value: articlesUpdated },
        ...commonMetadata
    ];

    const contentPanels = isAgentLog ? (
        <>
            <LogContentPanel title="Prompt" icon={<Terminal size={18} />} copyText={(log as AgentLog).prompt}>
                <div className="whitespace-pre-wrap font-sans leading-relaxed h-full overflow-y-auto">{(log as AgentLog).prompt}</div>
            </LogContentPanel>
            <LogContentPanel title="Response" icon={<Code size={18} />} copyText={JSON.stringify((log as AgentLog).response, null, 2)}>
                <pre className="whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded-md text-xs h-full overflow-y-auto">{JSON.stringify((log as AgentLog).response, null, 2)}</pre>
            </LogContentPanel>
        </>
    ) : (
        <>
            <LogContentPanel title="Summary" icon={<List size={18} />} copyText={JSON.stringify((log as NewsLog).summary, null, 2)}>
                <pre className="whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded-md text-xs h-full overflow-y-auto">{JSON.stringify((log as NewsLog).summary, null, 2)}</pre>
            </LogContentPanel>
            <LogContentPanel title="Details" icon={<Info size={18} />} copyText={(log as NewsLog).details || ''}>
                <pre className="whitespace-pre-wrap bg-slate-900 text-slate-100 p-3 rounded-md text-xs h-full overflow-y-auto">{(log as NewsLog).details || 'No detailed logs available.'}</pre>
            </LogContentPanel>
        </>
    );

    const errorMessagePanel = isAgentLog && (log as AgentLog).error_message ? (
        <div className="panel-card border-l-4 border-red-500 bg-red-50/80 !p-4">
            <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-600" />
                <h4 className="font-bold text-red-800">Error Message</h4>
            </div>
            <p className="text-sm text-red-700 mt-2 font-mono pl-8">{(log as AgentLog).error_message}</p>
        </div>
    ) : null;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with back button */}
            <div className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back to Logs</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Log Details</h2>
            </div>

            {/* Main layout for all content */}
            <div className="flex flex-col gap-6">
                
                {/* Metadata Card (always on top) */}
                <PanelCard className="!p-0">
                    <div className={`p-4 border-b-4 ${isSuccess(log.status) ? 'border-green-500' : 'border-red-500'}`}>
                        <span className={`status-badge ${isSuccess(log.status) ? 'success' : 'failure'}`}>{log.status}</span>
                    </div>
                    <div className="p-4 divide-y divide-slate-100">
                        {metadataItems.map(item => <MetadataListItem key={item.label} {...item} />)}
                    </div>
                </PanelCard>

                {/* Error Message Panel if it exists (also on top) */}
                {errorMessagePanel}

                {/* Content Panels Grid (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contentPanels}
                </div>
            </div>
        </div>
    );
};

export const CustomDropdown: React.FC<{
    options: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    displayLabels?: Record<string, string>;
    triggerClassName?: string;
}> = ({ options, value, onChange, className = '', displayLabels, triggerClassName = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayValue = displayLabels?.[value] || value;

    return (
        <div ref={dropdownRef} className={`custom-dropdown-wrapper ${className}`}>
            <button
                type="button"
                className={`custom-dropdown-trigger ${triggerClassName}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="capitalize truncate">{displayValue}</span>
                <ChevronDown size={16} className="text-slate-500 chevron" />
            </button>
            <div
                className={`custom-dropdown-panel ${isOpen ? 'open' : ''}`}
                role="listbox"
            >
                <div className="max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={value === option}
                            className={`custom-dropdown-option capitalize truncate ${value === option ? 'active' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {displayLabels?.[option] || option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CustomDateInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <label className="text-xs font-medium text-slate-500 block mb-1.5">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="form-input w-full text-sm pr-9"
                />
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => inputRef.current?.showPicker()}
                >
                    <CalendarDays size={18} />
                </div>
            </div>
        </div>
    );
};

export const DateRangeFilter: React.FC<{
    onChange: (dates: { startDate: Date | null; endDate: Date | null }) => void;
}> = ({ onChange }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | '7d' | 'custom'>('all');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const customButtonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const handlePresetChange = useCallback((filter: 'all' | '7d') => {
        setActiveFilter(filter);
        setIsPopoverOpen(false); 

        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let startDate: Date | null = null;
        let endDate: Date | null = new Date(now);

        switch (filter) {
            case '7d':
                startDate = new Date();
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'all':
                startDate = null;
                endDate = null;
                break;
        }
        onChange({ startDate, endDate });
    }, [onChange]);
    
    useEffect(() => {
        handlePresetChange('all');
    }, [handlePresetChange]);

    const handleCustomApply = () => {
        if (customStartDate && customEndDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            
            if (start > end) {
                alert("Start date cannot be after end date.");
                return;
            }

            setActiveFilter('custom');
            onChange({ startDate: start, endDate: end });
            setIsPopoverOpen(false);
        } else {
            alert("Please select both a start and end date.");
        }
    };

    const togglePopover = () => {
        if (customButtonRef.current) {
            const rect = customButtonRef.current.getBoundingClientRect();
            const popoverWidth = 340;
            let leftPos = rect.right + window.scrollX - popoverWidth;
            if (leftPos < 10) leftPos = 10;
            if (leftPos + popoverWidth > window.innerWidth - 10) {
                leftPos = window.innerWidth - (popoverWidth + 10);
            }
            
            setPopoverPosition({
                top: rect.bottom + window.scrollY + 8,
                left: leftPos,
            });
        }
        setIsPopoverOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                customButtonRef.current &&
                !customButtonRef.current.contains(event.target as Node)
            ) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const PresetButton: React.FC<{ label: string; filter: 'all' | '7d' }> = ({ label, filter }) => (
        <button
            onClick={() => handlePresetChange(filter)}
            className={`btn text-sm px-4 py-2 ${
                activeFilter === filter
                    ? 'btn-primary'
                    : 'btn-secondary'
            }`}
        >
            {label}
        </button>
    );
    
    const getCustomDisplayLabel = () => {
        if (activeFilter === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
            const end = new Date(customEndDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
            return `${start} - ${end}`;
        }
        return 'Custom Range';
    };

    const popoverContent = isPopoverOpen ? ReactDOM.createPortal(
        <div
            ref={popoverRef}
            style={{ 
                top: `${popoverPosition.top}px`, 
                left: `${popoverPosition.left}px`,
                position: 'absolute',
                width: '340px',
            }}
            className="z-50"
        >
            <div className="panel-card !p-4 shadow-xl border border-slate-200/80">
                <h4 className="font-semibold text-sm mb-3 text-slate-800">Select Custom Date Range</h4>
                <div className="grid grid-cols-2 gap-3 items-end">
                    <CustomDateInput 
                        label="Start Date"
                        value={customStartDate}
                        onChange={setCustomStartDate}
                    />
                    <CustomDateInput 
                        label="End Date"
                        value={customEndDate}
                        onChange={setCustomEndDate}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setIsPopoverOpen(false)} className="btn btn-secondary text-sm px-3 py-1.5">Cancel</button>
                    <button onClick={handleCustomApply} className="btn btn-primary text-sm px-3 py-1.5">Apply</button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="flex flex-wrap items-center gap-2 justify-end">
            <PresetButton label="All Time" filter="all" />
            <PresetButton label="Last 7 Days" filter="7d" />
            
            <button
                ref={customButtonRef}
                onClick={togglePopover}
                className={`btn text-sm px-4 py-2 flex items-center gap-2 ${
                    activeFilter === 'custom'
                        ? 'btn-primary'
                        : 'btn-secondary'
                }`}
            >
                <CalendarRange size={16} />
                <span>{getCustomDisplayLabel()}</span>
            </button>
            {popoverContent}
        </div>
    );
};


export const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonClass = 'btn-primary'
}) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center modal-bg"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-content w-full max-w-md m-4">
                <div className="p-6">
                    <h3 id="modal-title" className="text-lg font-bold text-slate-800">{title}</h3>
                    <div className="text-sm text-slate-600 mt-2">
                        {message}
                    </div>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="btn btn-secondary">{cancelText}</button>
                    <button onClick={onConfirm} className={`btn ${confirmButtonClass}`}>{confirmText}</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const BatchActionToolbar: React.FC<{
    selectedCount: number;
    onCancel: () => void;
    onDelete: () => void;
}> = ({ selectedCount, onCancel, onDelete }) => (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 text-white rounded-lg shadow-2xl flex items-center gap-4 p-3 animate-fade-in-up">
        <span className="font-bold text-sm px-2">{selectedCount} selected</span>
        <button onClick={onDelete} className="btn btn-danger flex items-center gap-2 !py-2 !px-3">
            <Trash2 size={16} />
            Delete
        </button>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700" aria-label="Cancel selection">
            <X size={18} />
        </button>
    </div>
);