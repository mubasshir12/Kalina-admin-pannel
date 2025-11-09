import React from 'react';
import { PanelCard, LogContentPanel, timeAgo } from '../ui';
import type { AgentLog } from '../../types';
import { 
    CalendarDays, 
    Clock, 
    Hash, 
    Rocket, 
    Timer, 
    Terminal,
    Code,
    Link,
    Lightbulb,
    Route,
    MapPin,
    FlaskConical,
    FileCode2,
    ArrowLeft,
    AlertTriangle,
    Globe,
    Workflow,
    CheckCircle2,
    FileX2,
} from 'lucide-react';


// --- Structured Response Views for Agent Logs (Enhanced) ---

const UrlExtractorView: React.FC<{ response: any }> = ({ response }) => {
    if (!response?.extracted_url) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <a href={response.extracted_url} target="_blank" rel="noopener noreferrer" className="block structured-view-panel theme-aware-hover transition-all">
            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Extracted URL</p>
            <p className="text-sm accent-text font-medium truncate mt-1">{response.extracted_url}</p>
        </a>
    );
};

const ThoughtGeneratorView: React.FC<{ response: any }> = ({ response }) => {
    if (!Array.isArray(response?.thoughts)) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <div className="space-y-4">
            {response.thoughts.map((thought: any, index: number) => (
                <div key={index} className="relative pl-8">
                    <div className="absolute left-1 top-1 h-full w-0.5" style={{ backgroundColor: 'var(--border-color)' }}></div>
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent-color)', border: '4px solid var(--card-bg)' }}></div>
                    <p className="text-xs font-bold accent-text">{thought.phase || `Step ${index + 1}`}</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{thought.step}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">({thought.concise_step})</p>
                </div>
            ))}
        </div>
    );
};

const StatusPill: React.FC<{
    type: 'success' | 'warning' | 'info' | 'neutral';
    icon: React.ReactNode;
    label: string;
}> = ({ type, icon, label }) => {
    return (
        <div 
            className="flex items-center gap-2 p-2 rounded-md text-sm font-medium"
            style={{
                backgroundColor: `var(--status-${type}-bg)`,
                color: `var(--status-${type}-text)`,
            }}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
};


const RouterView: React.FC<{ response: any }> = ({ response }) => {
    if (!response?.task) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    const isComplex = response.isComplex === true;
    const needsContext = response.needsCodeContext === true;

    return (
        <div className="space-y-3 structured-view-panel">
            <div className="flex items-center gap-3">
                <Workflow size={20} className="accent-text" />
                <div>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase">Task Routed To</p>
                    <p className="font-mono text-base font-semibold text-[var(--text-primary)]">{response.task}</p>
                </div>
            </div>
            <hr style={{ borderColor: 'var(--subtle-border)' }} />
            <div className="grid grid-cols-2 gap-3">
                <StatusPill
                    type={isComplex ? 'warning' : 'success'}
                    icon={isComplex ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    label={isComplex ? 'Complex Task' : 'Simple Task'}
                />
                <StatusPill
                    type={needsContext ? 'info' : 'neutral'}
                    icon={needsContext ? <FileCode2 size={16} /> : <FileX2 size={16} />}
                    label={needsContext ? 'Needs Context' : 'No Context'}
                />
            </div>
        </div>
    );
};

const LocationExtractorView: React.FC<{ response: any }> = ({ response }) => {
     if (!response?.location) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <div className="structured-view-panel flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-full mb-2" style={{ backgroundColor: 'var(--icon-bg-blue)' }}>
                <MapPin size={24} style={{ color: 'var(--icon-fg-blue)' }} />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Location Found</p>
            <p className="text-xl font-bold text-[var(--text-primary)] capitalize mt-1">{response.location}</p>
        </div>
    );
};

const MoleculePreprocessorView: React.FC<{ response: any }> = ({ response }) => {
    if (!response?.corrected_molecule_name) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <div className="structured-view-panel flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--icon-bg-purple)' }}>
                <FlaskConical size={20} style={{ color: 'var(--icon-fg-purple)' }} />
            </div>
            <div>
                <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider">Corrected Molecule</p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{response.corrected_molecule_name}</p>
            </div>
        </div>
    );
};

const SearchQueryGeneratorView: React.FC<{ response: any }> = ({ response }) => {
    if (!Array.isArray(response?.queries)) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <ul className="space-y-2">
            {response.queries.map((query: string, index: number) => (
                <li key={index} className="structured-list-item">
                    <Globe size={16} className="text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{query}</span>
                </li>
            ))}
        </ul>
    );
};

const UrlPreprocessorView: React.FC<{ response: any }> = ({ response }) => {
    if (!response?.extracted_url || !response?.final_prompt_for_tool) return <p className="text-[var(--text-secondary)]">Invalid response format.</p>;
    return (
        <div className="space-y-3">
            <UrlExtractorView response={{ extracted_url: response.extracted_url }} />
            <div>
                <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">Final Prompt</p>
                <p className="text-sm font-mono p-3 rounded-md" style={{ backgroundColor: 'var(--subtle-bg)' }}>{response.final_prompt_for_tool}</p>
            </div>
        </div>
    );
};

const renderResponsePanel = (log: AgentLog) => {
    const copyText = JSON.stringify(log.response, null, 2);
    const codeBlockClasses = "whitespace-pre-wrap bg-[var(--body-bg)] text-[var(--text-primary)] p-3 rounded-md text-xs h-full overflow-y-auto";

    const structuredViews: { [key: string]: { icon: React.ReactNode, title: string, component: React.ReactNode } } = {
        'url-extractor': { icon: <Link size={18} />, title: "URL Extractor", component: <UrlExtractorView response={log.response} /> },
        'thought-generator': { icon: <Lightbulb size={18} />, title: "Thought Generator", component: <ThoughtGeneratorView response={log.response} /> },
        'router': { icon: <Route size={18} />, title: "Router", component: <RouterView response={log.response} /> },
        'location-extractor': { icon: <MapPin size={18} />, title: "Location Extractor", component: <LocationExtractorView response={log.response} /> },
        'molecule-preprocessor': { icon: <FlaskConical size={18} />, title: "Molecule Preprocessor", component: <MoleculePreprocessorView response={log.response} /> },
        'search-query-generator': { icon: <Globe size={18} />, title: "Search Query Generator", component: <SearchQueryGeneratorView response={log.response} /> },
        'url-preprocessor': { icon: <FileCode2 size={18} />, title: "URL Preprocessor", component: <UrlPreprocessorView response={log.response} /> },
    };

    const view = structuredViews[log.agent_name];
    
    if (view) {
        return (
            <LogContentPanel title={`Response: ${view.title}`} icon={view.icon} copyText={copyText}>
                {view.component}
            </LogContentPanel>
        );
    }
    
    // Default fallback for unknown agents
    return (
        <LogContentPanel title="Response" icon={<Code size={18} />} copyText={copyText}>
            <pre className={codeBlockClasses}>{copyText}</pre>
        </LogContentPanel>
    );
};


const AgentLogDetail: React.FC<{ log: AgentLog; onBack: () => void; }> = ({ log, onBack }) => {
    const isSuccess = log.status.toLowerCase().includes('success');
    
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

    const metadataItems = [
        { icon: <Rocket size={18} />, label: 'Agent', value: log.agent_name },
        { icon: <Timer size={18} />, label: 'Latency', value: `${log.latency_ms} ms` },
        ...commonMetadata
    ];
    
    const codeBlockClasses = "whitespace-pre-wrap bg-[var(--body-bg)] text-[var(--text-primary)] p-3 rounded-md text-xs h-full overflow-y-auto";

    const errorMessagePanel = log.error_message ? (
        <div className="panel-card border-l-4 border-red-500 bg-red-50/80 !p-4">
            <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-600" />
                <h4 className="font-bold text-red-800">Error Message</h4>
            </div>
            <p className="text-sm text-red-700 mt-2 font-mono pl-8">{log.error_message}</p>
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
                <h2 className="text-2xl font-bold text-slate-800">Agent Log Details</h2>
            </div>

            {/* Main layout for all content */}
            <div className="flex flex-col gap-6">
                
                {/* Metadata Card (always on top) */}
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


                {/* Error Message Panel if it exists (also on top) */}
                {errorMessagePanel}

                {/* Content Panels Grid (side-by-side on md+) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LogContentPanel title="Prompt" icon={<Terminal size={18} />} copyText={log.prompt}>
                        <pre className={codeBlockClasses}>{log.prompt}</pre>
                    </LogContentPanel>
                    {renderResponsePanel(log)}
                </div>
            </div>
        </div>
    );
};

export default AgentLogDetail;