import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { getChatSessions, deleteChatHistory } from '../../services/aiChatService';
import { timeAgo } from '../ui';
import type { ChatSession } from '../../types';

const ChatHistoryDropdown: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}> = ({ isOpen, onClose, anchorEl }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAndSetSessions = async () => {
        setLoading(true);
        const fetchedSessions = await getChatSessions();
        setSessions(fetchedSessions);
        setLoading(false);
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
        
        // After deleting, refetch sessions to update the list
        fetchAndSetSessions();
        
        // If the currently active chat was deleted, navigate to a new chat
        if (currentSessionId === sessionIdToDelete) {
            navigate('/ai-chat');
        }
    };
    
    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 8}px`,
        right: `${window.innerWidth - rect.right - window.scrollX}px`,
    };

    return (
        <div 
            ref={dropdownRef} 
            style={style} 
            className="fixed z-50 w-full max-w-sm animate-fade-in-up"
        >
            <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden">
                <div className="p-2 border-b border-[var(--border-color)]">
                    <Link
                        to="/ai-chat"
                        onClick={onClose}
                        className="flex items-center gap-2 font-semibold text-[var(--accent-color)] dark:text-[var(--accent-text)] w-full text-left p-2 rounded-lg transition-colors hover:bg-[var(--sidebar-link-hover-bg)]"
                    >
                        <PlusCircle size={18} /> New Chat Session
                    </Link>
                </div>
                <div className="max-h-96 overflow-y-auto p-2 hide-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] py-4">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Loading chats...</span>
                        </div>
                    ) : sessions.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center text-sm text-[var(--text-secondary)] py-8 px-4">
                            <MessageSquare size={32} className="opacity-60 mb-2"/>
                            <p className="font-semibold text-[var(--text-primary)]">No recent chats found.</p>
                            <p className="text-xs opacity-80">Start a new conversation to see it here.</p>
                         </div>
                    ) : (
                        <ul className="space-y-1">
                            {sessions.map(session => (
                                <li 
                                    key={session.session_id}
                                    className="relative flex justify-between items-center group rounded-lg transition-colors hover:bg-[var(--sidebar-link-hover-bg)]"
                                >
                                    <Link
                                        to={`/ai-chat#session=${session.session_id}`}
                                        onClick={onClose}
                                        className="flex-grow p-2"
                                    >
                                        <p className="truncate font-medium text-sm text-[var(--text-primary)]">{session.title || 'New Chat'}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{timeAgo(session.last_message_at)}</p>
                                    </Link>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(session.session_id); }}
                                            className="p-2 rounded-full text-[var(--danger)] dark:text-red-400 hover:bg-[var(--status-danger-subtle-bg)] transition-colors"
                                            aria-label={`Delete chat: ${session.title || 'New Chat'}`}
                                            data-tooltip="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHistoryDropdown;