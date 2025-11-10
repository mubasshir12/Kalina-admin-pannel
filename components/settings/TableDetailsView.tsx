import React, { useState } from 'react';
import { PanelCard, StatCard, CopyButton } from '../ui';
import type { TableDetails } from '../../types';
import { 
    Database, Hash, ListChecks, ChevronRight, ArrowLeft
} from 'lucide-react';
// FIX: Import the new ConversationLogViewer and its type guard.
import ConversationLogViewer, { isConversationJson } from './ConversationLogViewer';
// New: Import the ArticleLogViewer and its type guard
import ArticleLogViewer, { isArticleData } from './ArticleLogViewer';
// New: Import the UpdateNewsLogViewer and its type guard
import UpdateNewsLogViewer, { isUpdateNewsLog } from './UpdateNewsLogViewer';


// --- Row Details View (Original Component) ---
const RowDetailView: React.FC<{ row: any; tableName: string; onBack: () => void }> = ({ row, tableName, onBack }) => {
    // New: If the table is 'update_news_logs', render the specialized viewer.
    if (tableName === 'update_news_logs' && isUpdateNewsLog(row)) {
        return <UpdateNewsLogViewer row={row} onBack={onBack} />;
    }
    
    // New: If the table is 'public_news_articles', render the specialized viewer.
    if (tableName === 'public_news_articles' && isArticleData(row)) {
        return <ArticleLogViewer row={row} onBack={onBack} />;
    }
    
    // --- NEW: Component for Conversation Rows with inline toggle ---
    const ConversationRow: React.FC<{ title: string; data: any }> = ({ title, data }) => {
        const [isStructured, setIsStructured] = useState(true);

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

        return (
            <div className="py-2 border-b border-[var(--border-color)] last:border-b-0">
                <div className="flex justify-between items-center">
                    <div className="font-mono text-sm font-semibold text-[var(--text-secondary)] break-all">{title}</div>
                    <ViewToggle isStructured={isStructured} onToggle={() => setIsStructured(p => !p)} />
                </div>
                <div className="mt-2 text-sm text-[var(--text-primary)] break-words">
                    <ConversationLogViewer data={data} isStructured={isStructured} />
                </div>
            </div>
        );
    };


    // Fallback to the generic viewer for all other tables.
    const renderValue = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-[var(--text-secondary)] opacity-70">NULL</span>;
        }
        if (typeof value === 'object') {
            const jsonString = JSON.stringify(value, null, 2);
            return (
                <div className="relative group">
                    <CopyButton textToCopy={jsonString} />
                    <pre className="text-xs bg-[var(--subtle-bg)] p-3 rounded-md max-h-[60vh] overflow-auto">
                        <code>{jsonString}</code>
                    </pre>
                </div>
            );
        }
        if (typeof value === 'boolean') {
            return <span className={`font-semibold ${value ? 'text-green-600' : 'text-red-600'}`}>{String(value)}</span>;
        }
        return String(value);
    };

    return (
        <div className="animate-fade-in-up">
            <div className="mb-6 flex items-center gap-4">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">
                    Row Details from <span className="font-mono">{tableName}</span>
                </h3>
            </div>
            <div className="border border-[var(--border-color)] rounded-lg p-6 space-y-4">
                {Object.entries(row).map(([key, value]) => {
                    if (isConversationJson(value)) {
                        return <ConversationRow key={key} title={key} data={value} />;
                    }
                    
                    return (
                        <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-[var(--border-color)] last:border-b-0">
                            <div className="font-mono text-sm font-semibold text-[var(--text-secondary)] break-all">{key}</div>
                            <div className="md:col-span-2 text-sm text-[var(--text-primary)] break-words">
                               {renderValue(value)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const TableDetailsView = React.forwardRef<HTMLDivElement, { details: TableDetails; description: string }>(
    ({ details, description }, ref) => {
        const [selectedRow, setSelectedRow] = useState<any | null>(null);

        const renderCellContent = (content: any, columnName: string) => {
            if (content === null || content === undefined) {
                return <span className="text-[var(--text-secondary)] opacity-70">NULL</span>;
            }
            if (isConversationJson(content)) {
                return <span className="accent-text font-mono text-xs">[Conversation Data]</span>;
            }
            // New: Better preview for article data columns
            if (columnName === 'article_data' && typeof content === 'object' && content?.title) {
                 return <span className="text-blue-600 dark:text-blue-400 font-mono text-xs truncate">[Article: {content.title}]</span>
            }
            if (columnName === 'formatted_content_md' && typeof content === 'object' && content?.markdown) {
                return <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">[Formatted MD]</span>
            }
            // New: Preview for update_news_logs
            if (columnName === 'summary' && Array.isArray(content) && content.length > 0 && typeof content[0] === 'string' && content[0].startsWith('Start Time:')) {
                return <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">[Log Summary]</span>
            }
            if (columnName === 'details' && typeof content === 'string' && content.includes('[INFO]')) {
                return <span className="text-purple-600 dark:text-purple-400 font-mono text-xs">[Log Details]</span>
            }
            if (typeof content === 'object') {
                return <span className="accent-text font-mono text-xs">[Object]</span>;
            }
            if (typeof content === 'boolean') {
                return String(content);
            }
            return String(content);
        };

        // If a row is selected, show the detailed view
        if (selectedRow) {
            return (
                <PanelCard ref={ref}>
                    <RowDetailView 
                        row={selectedRow} 
                        tableName={details.tableName} 
                        onBack={() => setSelectedRow(null)} 
                    />
                </PanelCard>
            );
        }

        // Default view with table stats and preview
        return (
            <PanelCard ref={ref}>
                <div className="border-b border-[var(--border-color)] pb-4 mb-6">
                    <h2 id="table-details-header" className="text-2xl font-bold text-[var(--text-primary)] font-mono">{details.tableName}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
                </div>
                
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Database size={16} className="text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{details.dbName} Database Stats</h4>
                    </div>
                    {/* --- NEW STATS LAYOUT --- */}
                    <div className="w-full bg-gradient-to-r from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900/50 border border-[var(--border-color)] rounded-xl p-4 flex items-stretch">
                        {/* Left Stat: Total Rows */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                            <div className="text-sky-500 mb-2">
                                <Hash size={28} />
                            </div>
                            <p className="text-3xl font-bold text-[var(--text-primary)]">{details.rowCount.toLocaleString()}</p>
                            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mt-1">Total Rows</p>
                        </div>
                        
                        {/* Divider */}
                        <div className="w-px bg-[var(--border-color)] opacity-60"></div>

                        {/* Right Stat: Columns */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                             <div className="text-green-500 mb-2">
                                <ListChecks size={28} />
                            </div>
                            <p className="text-3xl font-bold text-[var(--text-primary)]">{details.columns.length}</p>
                            <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mt-1">Columns</p>
                        </div>
                    </div>
                    {/* --- END NEW STATS LAYOUT --- */}
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-3">Columns</h3>
                        {details.columns.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {details.columns.map(col => (
                                    <span key={col} className="font-mono text-xs bg-[var(--subtle-bg)] text-[var(--text-primary)] px-2.5 py-1 rounded-full">
                                        {col}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No columns found. The table might be empty.</p>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-3">Recent Rows Preview (up to 5)</h3>
                         {details.recentRows.length > 0 ? (
                            <div className="grid grid-cols-1">
                                <div className="overflow-x-auto">
                                     <table className="min-w-full text-sm log-table">
                                        <thead>
                                            <tr>
                                                {details.columns.map(col => (
                                                    <th key={col} className="font-mono text-left">{col}</th>
                                                ))}
                                                <th className="w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.recentRows.map((row, rowIndex) => (
                                                <tr 
                                                    key={rowIndex} 
                                                    id={`details-row-${rowIndex}`}
                                                    className="cursor-pointer group"
                                                    onClick={() => setSelectedRow(row)}
                                                >
                                                    {details.columns.map(col => {
                                                        const cellValue = row[col];
                                                        return (
                                                            <td key={`${rowIndex}-${col}`} className="font-mono text-xs text-left">
                                                                <div className="truncate max-w-[20ch]">
                                                                    {renderCellContent(cellValue, col)}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-right pr-4">
                                                        <ChevronRight size={16} className="text-[var(--text-secondary)] opacity-70 inline-block transition-transform group-hover:translate-x-1" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-lg">
                                <p className="font-medium text-[var(--text-secondary)]">This table is currently empty.</p>
                            </div>
                        )}
                    </div>
                </div>

            </PanelCard>
        );
    }
);
TableDetailsView.displayName = 'TableDetailsView';

export default TableDetailsView;