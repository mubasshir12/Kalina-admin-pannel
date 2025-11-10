import React, { useState } from 'react';
import { PanelCard, CopyButton } from '../ui';
import { ArrowLeft, List, Info } from 'lucide-react';

// --- Type Guard ---
export const isUpdateNewsLog = (row: any): boolean => {
    return (
        row &&
        typeof row === 'object' &&
        'duration_ms' in row &&
        'summary' in row &&
        Array.isArray(row.summary) &&
        'details' in row &&
        typeof row.details === 'string'
    );
};

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


// --- StructuredDetails Component ---
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
                            <div className="whitespace-pre-wrap break-words min-w-0">
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

// --- Reusable Toggle Card Component ---
const ViewToggle: React.FC<{ isStructured: boolean; onToggle: () => void }> = ({ isStructured, onToggle }) => (
    <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: !isStructured ? 'var(--accent-text)' : 'var(--text-secondary)' }}>Raw</span>
        <button
            onClick={onToggle}
            role="switch"
            aria-checked={isStructured}
            style={{ backgroundColor: isStructured ? 'var(--accent-color)' : 'var(--pill-nav-bg)' }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isStructured ? 'translate-x-5' : 'translate-x-0'}`}
            />
        </button>
        <span className="text-sm font-medium" style={{ color: isStructured ? 'var(--accent-text)' : 'var(--text-secondary)' }}>Structured</span>
    </div>
);

const JsonToggleCard: React.FC<{
    title: string;
    data: any;
    structuredRenderer: (data: any) => React.ReactNode;
}> = ({ title, data, structuredRenderer }) => {
    const [isStructured, setIsStructured] = useState(true);
    const rawJsonString = JSON.stringify(data, null, 2);

    return (
        <PanelCard>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
                <ViewToggle isStructured={isStructured} onToggle={() => setIsStructured(!isStructured)} />
            </div>

            <div className="relative group border-t border-[var(--border-color)] pt-4 mt-2">
                 {!isStructured && <CopyButton textToCopy={rawJsonString} />}
                <div className="max-h-[70vh] overflow-y-auto hide-scrollbar">
                    {isStructured ? (
                        structuredRenderer(data)
                    ) : (
                        <pre className="text-xs bg-[var(--subtle-bg)] p-3 rounded-md overflow-auto">
                            <code>{rawJsonString}</code>
                        </pre>
                    )}
                </div>
            </div>
        </PanelCard>
    );
};


// --- Main Viewer Component ---
const UpdateNewsLogViewer: React.FC<{ row: any; onBack: () => void }> = ({ row, onBack }) => {
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Log Details for <span className="font-mono">update_news_logs</span></h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                 <JsonToggleCard
                    title="Summary"
                    data={row.summary}
                    structuredRenderer={(data) => <StructuredSummary summary={data} />}
                />
                <JsonToggleCard
                    title="Details"
                    data={row.details}
                    structuredRenderer={(data) => <StructuredDetails details={data} />}
                />
            </div>
        </div>
    );
};

export default UpdateNewsLogViewer;