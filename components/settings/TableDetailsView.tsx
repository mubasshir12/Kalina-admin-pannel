import React, { useState } from 'react';
import { PanelCard, StatCard } from '../ui';
import type { TableDetails } from '../../types';
import { 
    Database, Hash, ListChecks, ChevronRight, ArrowLeft
} from 'lucide-react';
// FIX: Import the new ConversationLogViewer and its type guard.
import ConversationLogViewer, { isConversationJson } from './ConversationLogViewer';

// --- Row Details View (Original Component) ---
const RowDetailView: React.FC<{ row: any; tableName: string; onBack: () => void }> = ({ row, tableName, onBack }) => {
    const renderValue = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-[var(--text-secondary)] opacity-70">NULL</span>;
        }
        if (typeof value === 'object') {
             // FIX: Apply max height and scroll to the raw JSON view
            return (
                <pre className="text-xs bg-[var(--subtle-bg)] p-3 rounded-md overflow-auto max-h-[60vh]">
                    <code>{JSON.stringify(value, null, 2)}</code>
                </pre>
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
                {Object.entries(row).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-[var(--border-color)] last:border-b-0">
                        <div className="font-mono text-sm font-semibold text-[var(--text-secondary)] break-all">{key}</div>
                        <div className="md:col-span-2 text-sm text-[var(--text-primary)] break-words">
                           {isConversationJson(value) ? (
                                <ConversationLogViewer data={value} />
                            ) : (
                                renderValue(value)
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TableDetailsView = React.forwardRef<HTMLDivElement, { details: TableDetails; description: string }>(
    ({ details, description }, ref) => {
        const [selectedRow, setSelectedRow] = useState<any | null>(null);

        const renderCellContent = (content: any) => {
            if (content === null || content === undefined) {
                return <span className="text-[var(--text-secondary)] opacity-70">NULL</span>;
            }
            if (isConversationJson(content)) {
                return <span className="accent-text font-mono text-xs">[Conversation Data]</span>;
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                        title="Total Rows"
                        value={details.rowCount.toLocaleString()}
                        description="Total number of records in the table."
                        icon={<Hash size={24} />}
                        borderColor="border-sky-500"
                    />
                    <StatCard 
                        title="Columns"
                        value={details.columns.length}
                        description="Number of columns in the table structure."
                        icon={<ListChecks size={24} />}
                        borderColor="border-green-500"
                    />
                    <StatCard 
                        title="Database"
                        value={details.dbName}
                        description="The database this table belongs to."
                        icon={<Database size={24} />}
                        borderColor="border-slate-500"
                    />
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
                                                                    {renderCellContent(cellValue)}
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