import React from 'react';

const chatStyles = `
/* --- AI Chat Redesign Styles --- */
.ai-chat-container {
    display: grid;
    grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
    .ai-chat-container {
        grid-template-columns: 1fr 320px; /* Main chat and sidebar */
    }
}

.chat-main {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.chat-sidebar {
    background-color: var(--chat-sidebar-bg);
    border-left: 1px solid var(--border-color);
    overflow-y: auto;
    display: none; /* Hidden on mobile */
}
@media (min-width: 1024px) {
    .chat-sidebar {
        display: block;
    }
}

.chat-messages-container {
    flex-grow: 1;
    overflow-y: auto;
    padding: 1.5rem 1rem;
}

.chat-welcome-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}

.prompt-suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
}

.suggestion-card {
    background-color: var(--chat-suggestion-bg);
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding: 0.75rem;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}
.suggestion-card:hover {
    background-color: var(--chat-suggestion-hover-bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
.suggestion-card p {
    color: var(--chat-suggestion-text);
}

.chat-input-wrapper {
    background-color: var(--chat-bg);
}

/* The form is a full-width bar, taking up the whole wrapper */
.chat-command-bar {
    background-color: var(--chat-input-bg);
    border-top: 1px solid var(--border-color);
    transition: border-top-color 0.2s ease-in-out;
    display: flex;
    align-items: flex-end; /* Aligns button to the bottom as textarea grows */
    padding: 1rem;
    padding-top: calc(1rem - 1px); /* Compensate for border width */
    gap: 0.75rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
}

.chat-command-bar:focus-within {
    border-top-color: var(--accent-color);
}

/* The textarea is transparent, making the form the visual element */
.chat-command-bar textarea {
    flex-grow: 1;
    background-color: transparent;
    border: none;
    padding: 0; /* Padding is now on the parent form */
    color: var(--text-primary);
    resize: none;
    line-height: 1.5;
    outline: none;
    box-shadow: none; /* Remove any residual shadow */
    align-self: stretch; /* Make it fill height within the flex container */
}

.chat-command-bar textarea::placeholder {
    color: var(--text-secondary);
}

.thinking-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent-color);
  margin: 0 2px;
  animation: thinking-bounce 1.4s infinite ease-in-out both;
}
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes thinking-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}
`;

const AiChatStyles: React.FC = () => {
    return <style>{chatStyles}</style>;
};

export default AiChatStyles;