import React, { useRef } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    handleSendMessage: (prompt: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSendMessage, isLoading }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // This effect dynamically adjusts the textarea height based on content
    React.useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto'; // Reset height to recalculate
            const scrollHeight = el.scrollHeight;
            // A cap to prevent infinite growth.
            const maxHeight = 200; 
            el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            // Enable scrolling if content exceeds max height
            el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);


    return (
        <div className="chat-input-wrapper">
            <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
                className="chat-command-bar"
            >
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(input); } }}
                    placeholder="Ask about dashboard stats, users, agents..."
                    className="w-full"
                    rows={1}
                    disabled={isLoading}
                    style={{ overflowY: 'hidden' }} // Start with hidden scrollbar
                />
                <button 
                    type="submit" 
                    className="btn btn-primary !rounded-xl !w-10 !h-10 !p-0 shrink-0" 
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                >
                    <ArrowUp size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;
