import React, { useState } from 'react';
import { PanelCard, CopyButton } from '../ui';
import { 
    ArrowLeft, Link as LinkIcon, FileText, Image as ImageIcon, Calendar, Globe,
    Eye, Heart, Bookmark, Hash
} from 'lucide-react';

// --- Type Guard to ensure the row has the expected structure ---
export const isArticleData = (row: any): boolean => {
    return (
        row &&
        typeof row === 'object' &&
        'article_data' in row &&
        'formatted_content_md' in row &&
        typeof row.article_data === 'object' &&
        typeof row.formatted_content_md === 'object'
    );
};

// --- Helper Components ---

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

const simpleMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
        .replace(/####\s(.*?)\n/g, '<h4 class="text-base font-bold text-[var(--text-primary)] mt-4 mb-2">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
};

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
                <div className="max-h-[70vh] overflow-y-auto">
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


// --- Structured Renderers ---

const ArticleDataStructured: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <p>No article data available.</p>;
    return (
        <div className="space-y-4">
            {data.image && (
                <img src={data.image} alt="Article Image" className="rounded-lg w-full h-48 object-cover bg-slate-100" />
            )}
            <h4 className="text-xl font-bold text-[var(--text-primary)]">
                <a href={data.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-color)] transition-colors">
                    {data.title}
                </a>
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">{data.description}</p>
            <div className="text-xs text-[var(--text-secondary)] space-y-2 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2"><Globe size={14}/>Source: <a href={data.source?.url} target="_blank" rel="noopener noreferrer" className="font-semibold accent-text">{data.source?.name}</a></div>
                <div className="flex items-center gap-2"><Calendar size={14}/>Published: {new Date(data.publishedAt).toLocaleString()}</div>
            </div>
        </div>
    );
};

const FormattedContentStructured: React.FC<{ data: any }> = ({ data }) => {
    if (!data || !data.markdown) return <p>No formatted content available.</p>;
    const htmlContent = simpleMarkdownToHtml(data.markdown);
    return (
        <div 
            className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};


// --- Main Article Viewer Component ---

const ArticleLogViewer: React.FC<{ row: any; onBack: () => void }> = ({ row, onBack }) => {
    const metadataItems = [
        { icon: <Hash size={16} />, label: "Article ID", value: row.id },
        { icon: <Eye size={16} />, label: "Views", value: row.views },
        { icon: <Heart size={16} />, label: "Likes", value: row.likes },
        { icon: <Bookmark size={16} />, label: "Bookmarks", value: row.bookmarks },
    ];

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </button>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Article Details</h3>
            </div>
            
            <PanelCard>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3">
                    {metadataItems.map(item => (
                         <div key={item.label} className="flex items-center gap-2 text-sm">
                             <div className="flex-shrink-0 text-slate-500">{item.icon}</div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{item.label}</p>
                                <div className="font-bold text-[var(--text-primary)]">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </PanelCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <JsonToggleCard
                    title="Article Data"
                    data={row.article_data}
                    structuredRenderer={(data) => <ArticleDataStructured data={data} />}
                />
                <JsonToggleCard
                    title="Formatted Content"
                    data={row.formatted_content_md}
                    structuredRenderer={(data) => <FormattedContentStructured data={data} />}
                />
            </div>
        </div>
    );
};

export default ArticleLogViewer;