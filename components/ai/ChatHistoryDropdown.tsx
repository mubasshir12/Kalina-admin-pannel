import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, MessageSquare, Loader2, KeyRound, Settings } from 'lucide-react';
import { getChatSessions, deleteChatHistory } from '../../services/aiChatService';
import { timeAgo } from '../ui';
import type { ChatSession } from '../../types';
import { ChatSessionItemSkeletonLoader } from '../skeletons'; // FIX: Import the correct skeleton loader

// Helper to check dates
const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const isYesterday = (someDate: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return someDate.getDate() === yesterday.getDate() &&
        someDate.getMonth() === yesterday.getMonth() &&
        yesterday.getFullYear() === someDate.getFullYear(); // FIX: Added full year comparison
};


const ChatHistoryDropdown: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}> = ({ isOpen, onClose, anchorEl }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true); // Initialize loading state

    const fetchAndSetSessions = async () => {
        setLoading(true);
        try {
            const fetchedSessions = await getChatSessions();
            setSessions(fetchedSessions);
        } catch (error) {
            console.error("Failed to fetch chat sessions:", error);
            // Optionally, handle error display to user
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            fetchAndSetSessions();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    const handleDelete = async (sessionIdToDelete: string) => {
        const currentSessionId = location.hash.substring('#session='.length);
        await deleteChatHistory(sessionIdToDelete);
        
        // Refetch sessions after deletion
        fetchAndSetSessions();
        
        // If the deleted chat was the active one, navigate to a new chat
        if (currentSessionId === sessionIdToDelete) {
            navigate('/ai-chat');
        }
    };

    const handleManageKeys = () => {
        navigate('/settings');
        onClose();
    };

    const handleNewChat = () => {
        // A new session ID is generated, and we navigate directly to it.
        const newSid = crypto.randomUUID();
        navigate(`/ai-chat#session=${newSid}`);
        onClose();
    };

    // Grouping logic
    const { today, yesterday, older } = React.useMemo(() => {
        const groups: { today: ChatSession[], yesterday: ChatSession[], older: ChatSession[] } = { today: [], yesterday: [], older: [] };
        sessions.forEach(session => {
            const sessionDate = new Date(session.last_message_at);
            if (isToday(sessionDate)) {
                groups.today.push(session);
            } else if (isYesterday(sessionDate)) {
                groups.yesterday.push(session);
            } else {
                groups.older.push(session);
            }
        });
        return groups;
    }, [sessions]);
    
    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        right: `${window.innerWidth - rect.right - window.scrollX}px`,
    };

    // FIX: Explicitly typing as React.FC helps TypeScript correctly infer that this is a component that can accept a `key` prop.
    const ChatSessionItem: React.FC<{ session: ChatSession }> = ({ session }) => {
        const isActive = location.hash.includes(session.session_id);
        return (
            <li className="relative group">
                 <Link
                    to={`/ai-chat#session=${session.session_id}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-2 w-full transition-colors rounded-md ${
                        isActive
                            ? 'chat-session-active'
                            : 'hover:bg-[var(--sidebar-link-hover-bg)]'
                    }`}
                >
                    <MessageSquare size={16} className="shrink-0" />
                    <div className="flex-grow min-w-0">
                        <p className="truncate text-sm">{session.title || 'New Chat'}</p>
                        <p className={`text-xs ${isActive ? '' : 'text-[var(--text-secondary)]'}`}>{timeAgo(session.last_message_at)}</p>
                    </div>
                </Link>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(session.session_id); }}
                        className="p-2 rounded-full text-[var(--danger)] dark:text-red-400 hover:bg-[var(--status-danger-subtle-bg)] transition-colors"
                        aria-label={`Delete chat: ${session.title || 'New Chat'}`}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </li>
        );
    };

    const ChatGroup = ({ title, sessions }: { title: string, sessions: ChatSession[] }) => {
        if (sessions.length === 0) return null;
        return (
            <div>
                <h4 className="text-xs font-bold text-[var(--sidebar-text-muted)] uppercase tracking-wider px-4 pt-3 pb-1">{title}</h4>
                <ul className="space-y-0.5 p-2">
                    {sessions.map(session => <ChatSessionItem key={session.session_id} session={session} />)}
                </ul>
            </div>
        );
    };

    return (
        <div 
            ref={dropdownRef} 
            style={style} 
            className="fixed z-50 w-[70vw] md:w-[30vw] max-w-md animate-fade-in-up"
        >
            <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--border-color)] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-color)]">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">AI Assistant</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">Review past conversations or start a new one.</p>
                </div>
                
                {/* Main Content */}
                <div className="flex-grow max-h-80 overflow-y-auto hide-scrollbar">
                    {loading ? (
                        <ChatSessionItemSkeletonLoader numberOfItems={Math.max(3, sessions.length)} />
                    ) : sessions.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center text-sm text-[var(--text-secondary)] py-8 px-4">
                            <MessageSquare size={32} className="opacity-60 mb-2"/>
                            <p className="font-semibold text-[var(--text-primary)]">No recent chats found.</p>
                            <p className="text-xs opacity-80">Start a new conversation to see it here.</p>
                         </div>
                    ) : (
                        <div>
                           <ChatGroup title="Today" sessions={today} />
                           <ChatGroup title="Yesterday" sessions={yesterday} />
                           <ChatGroup title="Older" sessions={older} />
                        </div>
                    )}
                </div>

                 {/* Footer */}
                <div className="p-2 border-t border-[var(--border-color)] dropdown-footer flex items-center justify-center gap-2 rounded-b-xl">
                    <button
                        onClick={handleManageKeys}
                        className="btn btn-secondary !py-2 !px-3 text-xs whitespace-nowrap"
                    >
                        <Settings size={16} /> Manage Keys
                    </button>
                    <button
                        onClick={handleNewChat}
                        className="btn btn-primary !py-2 !px-3 text-xs whitespace-nowrap"
                    >
                        <PlusCircle size={16} /> New Chat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHistoryDropdown;
