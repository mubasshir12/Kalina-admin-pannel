import React from 'react';
import type { NewsLog } from '../../types';
import {
    List,
    Info,
    ArrowLeft,
    CalendarDays,
    Clock,
    Hash,
    Timer,
    Newspaper,
} from 'lucide-react';
import { PanelCard, LogContentPanel, timeAgo } from '../ui';


// --- Helper to convert GMT to local IST time string without label ---
const convertGmtToIstTime = (gmtDateString: string): string => {
    try {
        const date = new Date(gmtDateString);
        if (isNaN(date.getTime())) return gmtDateString;

        const istOptions: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };
        return date.toLocaleTimeString('en-IN', istOptions);
    } catch (error) {
        console.error("Error converting GMT to IST:", error);
        return gmtDateString; 
    }
};

// --- StructuredSummary Component ---
const StructuredSummary: React.FC<{ summary: string[] }> = ({ summary }) => {
    if (!summary || summary.length === 0) {
        return <p style={{ color: 'var(--text-secondary)' }}>No summary available.</p>;
    }

    const generalInfo: { [key: string]: string } = {};
    const categoryStats: { category: string, fetched: string, formatted: string, failed: string }[] = [];
    let totalArticlesUpdated = '';

    summary.forEach(line => {
        if (line.startsWith('Start Time:') || line.startsWith('End Time:')) {
            const [key, ...valueParts] = line.split(': ');
            const gmtValue = valueParts.join(': ').trim();
            generalInfo[key.trim()] = convertGmtToIstTime(gmtValue);
        } else if (line.startsWith('Total Duration:')) {
            const [key, ...valueParts] = line.split(': ');
            generalInfo[key.trim()] = valueParts.join(': ').trim();
        } else if (line.startsWith('[')) {
            const match = line.match(/\[(.*?)\] Fetched: (\d+), Formatted: (\d+), Failed: (\d+)/);
            if (match) {
                categoryStats.push({
                    category: match[1],
                    fetched: match[2],
                    formatted: match[3],
                    failed: match[4],
                });
            }
        } else if (line.startsWith('Total Articles Updated:')) {
            totalArticlesUpdated = line.split(': ')[1];
        }
    });
    
    categoryStats.sort((a, b) => a.category.localeCompare(b.category));

    return (
        <div className="space-y-4 text-sm font-sans">
            <div className="space-y-2">
                {Object.entries(generalInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                        <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                ))}
            </div>

            {(categoryStats.length > 0 || totalArticlesUpdated) && <hr style={{ borderColor: 'var(--border-color)' }} />}

            {categoryStats.length > 0 && (
                <div>
                    <h5 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Category Breakdown</h5>
                    <div className="grid grid-cols-1 gap-3">
                        {categoryStats.map(stat => (
                            <div key={stat.category} className="p-3 border rounded-lg" style={{ backgroundColor: 'var(--sidebar-link-hover-bg)', borderColor: 'var(--border-color)' }}>
                                <p className="font-bold capitalize" style={{ color: 'var(--accent-color)' }}>{stat.category}</p>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Fetched</p>
                                        <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{stat.fetched}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Formatted</p>
                                        <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{stat.formatted}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Failed</p>
                                        <p className={`font-bold text-lg ${parseInt(stat.failed) > 0 ? 'text-red-500' : ''}`} style={parseInt(stat.failed) === 0 ? { color: 'var(--text-primary)' } : {}}>{stat.failed}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {totalArticlesUpdated && (
                <div className="flex justify-between items-center text-base font-bold p-4 rounded-lg border" style={{ backgroundColor: 'var(--sidebar-link-hover-bg)', borderColor: 'var(--border-color)' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total Articles Updated</span>
                    <span className="text-2xl" style={{ color: 'var(--accent-color)' }}>{totalArticlesUpdated}</span>
                </div>
            )}
        </div>
    );
};


// --- StructuredDetails Component (New implementation) ---
const StructuredDetails: React.FC<{ details: string }> = ({ details }) => {
    if (!details) {
        return <p style={{ color: 'var(--text-secondary)' }}>No detailed logs available.</p>;
    }

    const parseLogLine = (line: string) => {
        const match = line.match(/^\[(.*?)\] \[(.*?)\] (.*)/);
        if (!match) {
            return { timestamp: null, level: null, message: line, category: null };
        }

        const [, timestampStr, level, rawMessage] = match;
        const date = new Date(timestampStr);
        const timestamp = isNaN(date.getTime()) ? timestampStr : date.toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const categoryMatch = rawMessage.match(/^\[(.*?)\] (.*)/);
        let category = null;
        let message = rawMessage;
        if (categoryMatch) {
            category = categoryMatch[1];
            message = categoryMatch[2];
        }
        
        return { timestamp, level, message, category };
    };

    const logLines = details.split('\n').filter(line => line.trim() !== '');

    const levelColors: { [key: string]: string } = {
        'INFO': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'SUCCESS': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'FAILURE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        'WARN': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
        <div className="font-mono text-xs text-[var(--text-primary)]">
             <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1">
                {logLines.map((line, index) => {
                    const { timestamp, level, message, category } = parseLogLine(line);
                    const levelColor = level ? (levelColors[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200') : '';
                    return (
                        <React.Fragment key={index}>
                            <div className="text-right text-[var(--text-secondary)] select-none">{timestamp}</div>
                            <div>
                                {level && <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${levelColor}`}>{level}</span>}
                            </div>
                            <div className="whitespace-pre-wrap break-words">
                                {category && <span className="font-bold text-[var(--accent-color)] capitalize">[{category}] </span>}
                                {message}
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};


// --- Main NewsLogDetail Component ---
const NewsLogDetail: React.FC<{ log: NewsLog; onBack: () => void; }> = ({ log, onBack }) => {
    const isSuccess = log.status.toLowerCase().includes('success');
    const articlesUpdated = log.summary?.find(s => s.includes('Total Articles Updated'))?.split(': ')[1] || 'N/A';
    const logDate = new Date(log.created_at);
    const dateString = logDate.toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const fullTimestamp = logDate.toLocaleString();

    const metadataItems = [
        { icon: <Timer size={18} />, label: 'Duration', value: `${(log.duration_ms / 1000).toFixed(2)} s` },
        { icon: <Newspaper size={18} />, label: 'Articles Updated', value: articlesUpdated },
        { icon: <CalendarDays size={18} />, label: 'Date', value: dateString },
        { icon: <Clock size={18} />, label: 'Time', value: <span data-tooltip={fullTimestamp}>{timeAgo(logDate)}</span> },
        { icon: <Hash size={18} />, label: 'Log ID', value: log.id }
    ];

    return (
         <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back to Logs</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">News Log Details</h2>
            </div>
            <div className="flex flex-col gap-6">
                <PanelCard className="!p-0">
                     <div className={`p-4 border-b-4 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
                        <span className={`status-badge ${isSuccess ? 'success' : 'failure'}`}>{log.status}</span>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-4">
                            {metadataItems.map((item, index) => (
                                <React.Fragment key={item.label}>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex-shrink-0 text-slate-500 bg-slate-100 p-2 rounded-full dark:bg-zinc-700 dark:text-zinc-300">
                                            {React.cloneElement(item.icon, { size: 16 })}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold dark:text-zinc-400">{item.label}</p>
                                            <div className="font-bold text-[var(--text-primary)] text-base">{item.value}</div>
                                        </div>
                                    </div>
                                    {index < metadataItems.length - 1 && (
                                        <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-zinc-700 self-center"></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </PanelCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LogContentPanel title="Summary" icon={<List size={18} />} copyText={JSON.stringify(log.summary, null, 2)} className="h-[855px]">
                        <StructuredSummary summary={log.summary} />
                    </LogContentPanel>
                    <LogContentPanel title="Details" icon={<Info size={18} />} copyText={log.details || ''} className="h-[855px]">
                        <StructuredDetails details={log.details} />
                    </LogContentPanel>
                </div>
            </div>
        </div>
    );
};

export default NewsLogDetail;