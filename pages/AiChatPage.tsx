import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bot, User, CornerDownLeft, Sparkles, ChevronRight, Server, Users, Newspaper, LineChart, Database, KeyRound, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { ConfirmationModal, CopyButton } from '../components/ui';
import { initializeSession, processUserMessageStream, deleteChatHistory } from '../services/aiChatService';
import AiChatStyles from '../components/ai/AiChatStyles';
import ChatInput from '../components/ai/ChatInput';
import { LoadingSpinner } from '../components/skeletons';

// --- Helper Components ---

const SimpleMarkdown: React.FC<{ text: string }> = React.memo(({ text }) => {
    const navLinkRegex = /\[([^\]]+)\]\(nav:([^)]+)\)/g;

    const renderSegment = (segment: string, key: string) => {
        // These replacements are now handled by CSS, but keeping strong/em for semantic HTML
        const html = segment
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
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
                    className="chat-nav-link"
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
        <div className="chat-markdown-content space-y-4">
            {parts.map((part, index) => {
                if (!part) return null;

                if (part.startsWith('```')) {
                    const codeContent = part.replace(/^```\w*\n?|```$/g, '').trim();
                    return (
                        <div key={index} className="chat-code-block not-prose">
                            <div className="chat-code-block-header">
                                <span>code</span>
                                <CopyButton textToCopy={codeContent} className="chat-code-copy-button" />
                            </div>
                            <pre className="chat-code-block-pre"><code className="chat-code-block-code">{codeContent}</code></pre>
                        </div>
                    );
                }

                return part.trim().split(/\n{2,}/).map((para, pIndex) => {
                    if (!para.trim()) return null;
                    const paraKey = `${index}-${pIndex}`;
                    
                    if (para.trim().startsWith('- ')) {
                        const items = para.split('\n').map(item => item.replace(/^- /, ''));
                        return (
                            <ul key={paraKey}>
                                {items.map((item, i) => (
                                    <li key={i}>{renderWithLinks(item, `${paraKey}-${i}`)}</li>
                                ))}
                            </ul>
                        );
                    }
                    if (para.startsWith('### ')) {
                        return <h3 key={paraKey}>{renderWithLinks(para.substring(4), paraKey)}</h3>;
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

const ChatBubble: React.FC<{ message: any }> = React.memo(({ message }) => {
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
                    {hasContent ? (
                        <SimpleMarkdown text={message.parts[0].text} />
                    ) : (
                        <>
                            {/* Initial thinking state with new spinner */}
                            {message.status === 'thinking' && (
                                <div className="flex items-center gap-3">
                                    <Loader2 size={16} className="animate-spin text-[var(--text-secondary)]" />
                                    <span className="text-sm text-[var(--text-secondary)]">{message.statusMessage}</span>
                                </div>
                            )}

                            {/* State when tool is called and we are waiting for the final response */}
                            {(message.status === 'tool' || (message.status === 'generating' && message.toolUsed)) && (
                                <div className="flex flex-col items-start gap-2">
                                    {message.statusMessage && (
                                        <span className="text-sm text-[var(--text-secondary)]">{message.statusMessage}</span>
                                    )}
                                    <div className="thinking-dots"><span></span><span></span><span></span></div>
                                </div>
                            )}
                            
                            {/* Fallback for non-tool generating phase to keep a loading indicator */}
                            {message.status === 'generating' && !message.toolUsed && (
                                 <div className="thinking-dots"><span></span><span></span><span></span></div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
    return null;
});

// --- The main AI Chat Page component ---
const AiChatPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Effect to manage session ID from URL
    useEffect(() => {
        const hash = location.hash;
        let sidFromUrl: string | null = null;
        if (hash && hash.startsWith('#session=')) {
            sidFromUrl = hash.substring('#session='.length);
        }
        
        if (sidFromUrl) {
            if (sessionId !== sidFromUrl) {
                setSessionId(sidFromUrl);
            }
        } else if (location.pathname === '/ai-chat' && !sessionId) {
             const newSid = crypto.randomUUID();
            // Using a timeout to ensure this navigation doesn't conflict with initial render cycles.
            setTimeout(() => navigate(`/ai-chat#session=${newSid}`, { replace: true }), 0);
        }
    }, [location.hash, location.pathname, navigate, sessionId]);


    // Effect to fetch chat history when session ID changes
    useEffect(() => {
        if (!sessionId) {
            // If there's no session ID yet, we're likely about to create one.
            // Avoid setting initializing to false immediately to prevent a flash of the welcome screen.
            return;
        }
    
        const setupSession = async () => {
            setIsInitializing(true);
            setMessages([]); // Clear previous session's messages
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
    }, [sessionId]);

    useEffect(() => {
        scrollToBottom();
        if (textareaRef.current && !isLoading) {
            textareaRef.current.focus();
        }
    }, [messages, isLoading]);


    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading || !sessionId) return;
    
        const userMessage = { role: 'user', parts: [{ text: prompt }] };
        const initialModelMessage = { 
            role: 'model', 
            parts: [{ text: '' }],
            status: 'thinking',
            statusMessage: 'Thinking...',
            toolUsed: false,
        };
    
        setMessages(prev => [...prev, userMessage, initialModelMessage]);
        setInput('');
        setIsLoading(true);
        
        const userTimestamp = new Date().toISOString();
    
        try {
            const stream = processUserMessageStream(prompt, sessionId, messages, userTimestamp);
            let finalContent = '';
    
            for await (const chunk of stream) {
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
    
                    if (lastMessage && lastMessage.role === 'model') {
                        let updatedMessage = { ...lastMessage };
                        if (chunk.type === 'tool_status') {
                            updatedMessage.status = 'tool';
                            updatedMessage.statusMessage = chunk.message;
                            updatedMessage.toolUsed = true;
                        } else if (chunk.type === 'generating') {
                            updatedMessage.status = 'generating';
                            updatedMessage.statusMessage = null; // Clear status message when content starts
                        } else if (chunk.type === 'content') {
                            updatedMessage.parts = [{ text: lastMessage.parts[0].text + chunk.text }];
                            finalContent += chunk.text;
                        }
                        newMessages[newMessages.length - 1] = updatedMessage;
                    }
                    return newMessages;
                });
            }
    
        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMessage = { 
                role: 'model', 
                parts: [{ text: "Oops, something went wrong. It might be a tool execution issue or an API error. Please check the console." }] 
            };
            setMessages(prev => {
                const newMessages = [...prev];
                // Replace the placeholder with the error message
                if (newMessages[newMessages.length - 1]?.role === 'model') {
                    newMessages[newMessages.length - 1] = errorMessage;
                } else {
                    newMessages.push(errorMessage);
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
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
                    {messages.length === 0 ? (
                        <WelcomeView onPromptClick={(p) => handleSendMessage(p)} />
                    ) : (
                        <div className="space-y-6">
                            {renderedMessages}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <ChatInput
                    input={input}
                    setInput={setInput}
                    handleSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
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
            </aside>
        </div>
    );
};

export default AiChatPage;