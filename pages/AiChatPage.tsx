import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, User, CornerDownLeft, Sparkles, ChevronRight, Server, Users, Newspaper, LineChart, Database, KeyRound, PlusCircle, Trash2 } from 'lucide-react';
import { ConfirmationModal, CopyButton } from '../components/ui';
import { initializeSession, processUserMessageStream, deleteChatHistory } from '../services/aiChatService';
import AiChatStyles from '../components/ai/AiChatStyles';
import ChatInput from '../components/ai/ChatInput';
import { LoadingSpinner } from '../components/skeletons';

// --- Helper Components ---

const SimpleMarkdown: React.FC<{ text: string }> = React.memo(({ text }) => {
    const navLinkRegex = /\[([^\]]+)\]\(nav:([^)]+)\)/g;

    const renderSegment = (segment: string, key: string) => {
        const html = segment
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-[var(--chat-suggestion-bg)] font-mono text-sm rounded px-1 py-0.5">$1</code>')
            .replace(/\n/g, '<br />');
        return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const renderWithLinks = (content: string, baseKey: string) => {
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;
        let counter = 0;
        
        while ((match = navLinkRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                elements.push(renderSegment(content.substring(lastIndex, match.index), `${baseKey}-text-${counter}`));
            }
            elements.push(
                <Link
                    key={`${baseKey}-link-${counter}`}
                    to={match[2]}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg text-sm hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                >
                    {match[1]} <ChevronRight size={14} />
                </Link>
            );
            lastIndex = match.index + match[0].length;
            counter++;
        }

        if (lastIndex < content.length) {
            elements.push(renderSegment(content.substring(lastIndex), `${baseKey}-text-${counter}`));
        }
        return elements;
    };

    const parts = text.split(/(```[\s\S]*?```)/g);

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed space-y-4">
            {parts.map((part, index) => {
                if (!part) return null;

                if (part.startsWith('```')) {
                    const codeContent = part.replace(/^```\w*\n?|```$/g, '').trim();
                    return (
                        <div key={index} className="bg-slate-900 text-white rounded-lg overflow-hidden relative group text-sm not-prose">
                            <div className="flex justify-between items-center text-xs px-4 py-1.5 bg-slate-800 text-slate-400">
                                <span>code</span>
                                <CopyButton textToCopy={codeContent} className="!opacity-100 !static !bg-transparent hover:!bg-slate-700 !text-white" />
                            </div>
                            <pre className="p-4 overflow-x-auto"><code className="font-mono">{codeContent}</code></pre>
                        </div>
                    );
                }

                return part.trim().split(/\n{2,}/).map((para, pIndex) => {
                    if (!para.trim()) return null;
                    const paraKey = `${index}-${pIndex}`;
                    
                    if (para.trim().startsWith('- ')) {
                        const items = para.split('\n').map(item => item.replace(/^- /, ''));
                        return (
                            <ul key={paraKey} className="list-disc pl-5 space-y-1">
                                {items.map((item, i) => (
                                    <li key={i}>{renderWithLinks(item, `${paraKey}-${i}`)}</li>
                                ))}
                            </ul>
                        );
                    }
                    if (para.startsWith('### ')) {
                        return <h3 key={paraKey} className="text-lg font-bold">{renderWithLinks(para.substring(4), paraKey)}</h3>;
                    }
                    return <p key={paraKey}>{renderWithLinks(para, paraKey)}</p>;
                });
            })}
        </div>
    );
});

const SuggestionCard: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="suggestion-card w-full text-left">
        <div className="flex items-start gap-3">
            <div className="text-slate-500 dark:text-zinc-400 mt-0.5">{icon}</div>
            <p className="text-sm font-medium">{text}</p>
        </div>
    </button>
);

const WelcomeView: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => {
    const prompts = [
        { icon: <LineChart size={20} />, text: "Summarize today's agent analytics." },
        { icon: <Users size={20} />, text: "Who are the 3 newest users?" },
        { icon: <Newspaper size={20} />, text: "What are the latest news engagement stats?" },
        { icon: <Server size={20} />, text: "Compare agent vs. news API calls." },
    ];

    return (
        <div className="chat-welcome-view animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mb-4">
                <Sparkles size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Kalina AI Assistant</h2>
            <p className="text-[var(--text-secondary)] mt-1 max-w-md">Your co-pilot for the dashboard. Ask me anything about your analytics, users, or system health.</p>
            <div className="w-full max-w-2xl mt-8">
                <div className="prompt-suggestions-grid">
                    {prompts.map((p, i) => (
                        <SuggestionCard key={i} icon={p.icon} text={p.text} onClick={() => onPromptClick(p.text)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChatBubble: React.FC<{ 
    message: any; 
    streamStatus?: 'thinking' | 'tool' | 'generating';
    statusMessage?: string | null;
}> = React.memo(({ message, streamStatus, statusMessage }) => {
    if (message.role === 'user') {
        return (
            <div className="flex items-start gap-3 justify-end animate-fade-in-up">
                <div className="p-3 rounded-2xl rounded-br-none bg-[var(--chat-user-bubble-bg)] text-[var(--chat-user-bubble-text)] max-w-2xl">
                    <p>{message.parts[0].text}</p>
                </div>
            </div>
        );
    }

    if (message.role === 'model') {
        const hasContent = message.parts[0].text && message.parts[0].text.length > 0;
        return (
            <div className="animate-fade-in-up">
                <div className="text-[var(--chat-model-bubble-text)] max-w-4xl">
                    {!hasContent && streamStatus ? (
                        <div className="flex items-center gap-3">
                            {streamStatus === 'generating' ? (
                                <div className="thinking-dots"><span></span><span></span><span></span></div>
                            ) : (
                                <span className="text-sm text-[var(--text-secondary)]">{statusMessage}</span>
                            )}
                        </div>
                    ) : (
                        <SimpleMarkdown text={message.parts[0].text} />
                    )}
                </div>
            </div>
        );
    }
    return null;
});

const ApiKeyInputView: React.FC<{ onKeySubmit: (key: string) => void }> = ({ onKeySubmit }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onKeySubmit(key.trim());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg mb-4">
                <KeyRound size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Enter Your Gemini API Key</h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-md">
                Your API key is stored only in your browser's session and is required to use the AI Assistant.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm flex flex-col gap-3">
                <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your API key here..."
                    className="form-input w-full text-center"
                    autoFocus
                />
                <button type="submit" className="btn btn-primary" disabled={!key.trim()}>
                    Save and Continue
                </button>
            </form>
             <p className="text-xs text-[var(--text-secondary)] mt-4 max-w-md">
                You can get a key from 
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-[var(--accent-color)] ml-1">
                    Google AI Studio
                </a>.
            </p>
        </div>
    );
};


// --- The main AI Chat Page component ---
const AiChatPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [streamingMessage, setStreamingMessage] = useState<{
        content: string;
        status: 'thinking' | 'tool' | 'generating';
        statusMessage: string | null;
        toolUsed: boolean;
    } | null>(null);
    const [apiKeyReady, setApiKeyReady] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => {
        const storedKey = sessionStorage.getItem('user_gemini_api_key');
        if (storedKey) {
            setApiKeyReady(true);
        } else {
            setIsInitializing(false);
        }
    }, []);

    // Effect to manage session ID from URL
    useEffect(() => {
        const hash = location.hash;
        let sidFromUrl: string | null = null;
        if (hash && hash.startsWith('#session=')) {
            sidFromUrl = hash.substring('#session='.length);
        }
        
        if (sidFromUrl) {
            setSessionId(sidFromUrl);
        } else if (apiKeyReady) {
            // Only create a new session if API key is ready and there's no session in URL
            const newSid = crypto.randomUUID();
            navigate(`/ai-chat#session=${newSid}`, { replace: true });
        }
    }, [location.hash, navigate, apiKeyReady]);

    // Effect to fetch chat history when session ID changes
    useEffect(() => {
        if (!apiKeyReady || !sessionId) return;

        const setupSession = async () => {
            setIsInitializing(true);
            try {
                const { history } = await initializeSession(sessionId);
                setMessages(history);
            } catch (error) {
                console.error("AI Chat Initialization Error:", error);
                setMessages([{
                    role: 'model',
                    parts: [{ text: "Sorry, I couldn't initialize my connection. Please check the console for errors." }]
                }]);
            } finally {
                setIsInitializing(false);
            }
        };
        setupSession();
    }, [sessionId, apiKeyReady]);

    useEffect(() => {
        scrollToBottom();
        if (textareaRef.current && !isLoading) {
            textareaRef.current.focus();
        }
    }, [messages, isLoading, streamingMessage]);

    const handleSaveKey = (key: string) => {
        sessionStorage.setItem('user_gemini_api_key', key);
        setApiKeyReady(true);
        // This will trigger the useEffect to create a new session via navigation
        navigate('/ai-chat');
    };

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading || !sessionId) return;

        const userMessage = { role: 'user', parts: [{ text: prompt }] };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setStreamingMessage({ content: '', status: 'thinking', statusMessage: 'Thinking...', toolUsed: false });

        try {
            const stream = processUserMessageStream(prompt, sessionId, newMessages);
            let finalMessage = { content: '', toolUsed: false };

            for await (const chunk of stream) {
                if (chunk.type === 'thinking') {
                    setStreamingMessage(prev => ({ ...prev!, status: 'thinking', statusMessage: 'Thinking...' }));
                } else if (chunk.type === 'tool_status') {
                    setStreamingMessage(prev => ({ ...prev!, status: 'tool', statusMessage: chunk.message, toolUsed: true }));
                    finalMessage.toolUsed = true;
                } else if (chunk.type === 'generating') {
                     setStreamingMessage(prev => ({ ...prev!, status: 'generating', statusMessage: null }));
                } else if (chunk.type === 'content') {
                    finalMessage.content += chunk.text;
                    setStreamingMessage(prev => ({ ...prev!, content: finalMessage.content }));
                }
            }
            
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: finalMessage.content }], toolUsed: finalMessage.toolUsed }]);

        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMessageString = error.toString();
            if (errorMessageString.includes('API key not valid') || errorMessageString.includes('API_KEY_INVALID')) {
                sessionStorage.removeItem('user_gemini_api_key');
                setApiKeyReady(false);
                setMessages([]);
                setSessionId(null);
                navigate('/ai-chat', { replace: true });
                alert("Your API key appears to be invalid. Please enter a valid key to continue.");
                return;
            }
            const errorMessage = { role: 'model', parts: [{ text: "Oops, something went wrong. It might be a tool execution issue or an API error. Please check the console." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setStreamingMessage(null);
        }
    };

    const renderedMessages = useMemo(() => 
        messages.map((msg, index) => <ChatBubble key={`${sessionId}-${index}`} message={msg} />)
    , [messages, sessionId]);
    
    const sidebarPrompts = [
        { icon: <LineChart size={16}/>, text: "Show advanced analytics summary" },
        { icon: <Users size={16} />, text: "What's the user retention rate?" },
        { icon: <Newspaper size={16} />, text: "Which news category is most popular?" },
    ];

    if (isInitializing) {
        return <LoadingSpinner />;
    }

    return (
        <div className="ai-chat-container flex-1 min-h-0">
            <AiChatStyles />
            <main className="chat-main">
                <div className="chat-messages-container hide-scrollbar">
                    {!apiKeyReady ? (
                        <ApiKeyInputView onKeySubmit={handleSaveKey} />
                    ) : messages.length === 0 && !streamingMessage ? (
                        <WelcomeView onPromptClick={(p) => handleSendMessage(p)} />
                    ) : (
                        <div className="space-y-6">
                            {renderedMessages}
                            {streamingMessage && (
                                <ChatBubble 
                                    message={{ 
                                        role: 'model', 
                                        parts: [{ text: streamingMessage.content }],
                                        toolUsed: streamingMessage.toolUsed,
                                    }} 
                                    streamStatus={streamingMessage.status}
                                    statusMessage={streamingMessage.statusMessage}
                                />
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                 {apiKeyReady && (
                    <ChatInput
                        input={input}
                        setInput={setInput}
                        handleSendMessage={handleSendMessage}
                        isLoading={isLoading}
                    />
                )}
            </main>
            <aside className="chat-sidebar p-6 space-y-6">
                 <div>
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Suggestions</h3>
                    <div className="space-y-2">
                        {sidebarPrompts.map((p, i) => (
                           <SuggestionCard key={i} icon={p.icon} text={p.text} onClick={() => handleSendMessage(p.text)} />
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Settings</h3>
                    <button 
                        onClick={() => {
                            sessionStorage.removeItem('user_gemini_api_key');
                            setApiKeyReady(false);
                            setMessages([]);
                            setSessionId(null);
                            navigate('/ai-chat', { replace: true });
                        }} 
                        className="suggestion-card w-full text-left"
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-slate-500 dark:text-zinc-400 mt-0.5"><KeyRound size={20} /></div>
                            <p className="text-sm font-medium">Change API Key</p>
                        </div>
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default AiChatPage;