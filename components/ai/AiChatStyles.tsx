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

/* NEW: Themed styles for code blocks in chat */
.chat-code-block {
    background-color: var(--chat-code-header-bg);
    color: var(--chat-code-text);
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;
    font-size: 0.875rem;
}
.chat-code-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
    background-color: var(--chat-code-bg);
    color: var(--chat-code-header-text);
}
.chat-code-block-pre {
    padding: 1rem;
    overflow-x: auto;
}
.chat-code-block-code {
    font-family: monospace;
}
.chat-code-copy-button {
    opacity: 1 !important;
    position: static !important;
    background-color: transparent !important;
    color: var(--chat-code-header-text) !important;
}
.chat-code-copy-button:hover {
    background-color: var(--chat-code-copy-hover-bg) !important;
}

/* NEW: Theme-aware nav links inside chat */
.chat-nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    margin: 0.25rem 0;
    background-color: var(--chat-link-bg);
    color: var(--chat-link-text);
    font-weight: 600;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    transition: background-color 0.2s ease-in-out;
    text-decoration: none;
}
.chat-nav-link:hover {
    background-color: var(--chat-link-hover-bg);
    text-decoration: none;
}

/* NEW: Theme-aware active session in dropdown */
.chat-session-active {
    background-color: var(--chat-active-item-bg);
    color: var(--chat-active-item-text);
}

/* NEW: Centralized markdown content styles */
.chat-markdown-content {
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--chat-model-bubble-text);
}
.chat-markdown-content > *:last-child {
    margin-bottom: 0;
}
.chat-markdown-content p {
    margin-bottom: 1rem;
}
.chat-markdown-content strong {
    font-weight: 600;
    color: var(--text-primary);
}
.chat-markdown-content em {
    font-style: italic;
}
.chat-markdown-content ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}
.chat-markdown-content li {
    margin-bottom: 0.25rem;
}
.chat-markdown-content h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
}
/* This is for inline code, distinct from code blocks */
.chat-markdown-content code {
    background-color: var(--chat-suggestion-bg);
    color: var(--chat-suggestion-text);
    font-family: monospace;
    font-size: 0.875rem;
    border-radius: 0.25rem;
    padding: 0.125rem 0.375rem;
    border: 1px solid var(--border-color);
}
`;

const chatThemeVariables = `
:root {
    --chat-bg: #f9fafb;
    --chat-sidebar-bg: #ffffff;
    --chat-input-bg: #ffffff;
    --chat-user-bubble-bg: #4f46e5;
    --chat-user-bubble-text: #ffffff;
    --chat-model-bubble-bg: #ffffff;
    --chat-model-bubble-text: #1f2937;
    --chat-suggestion-bg: #f3f4f6;
    --chat-suggestion-hover-bg: #e5e7eb;
    --chat-suggestion-text: #4b5563;
    --chat-code-bg: #f1f5f9;
    --chat-code-header-bg: #e2e8f0;
    --chat-code-text: #1e293b;
    --chat-code-header-text: #475569;
    --chat-code-copy-hover-bg: #cbd5e1;
    --dropdown-footer-bg: #f9fafb;
    --chat-link-bg: #e0e7ff;
    --chat-link-text: #4338ca;
    --chat-link-hover-bg: #c7d2fe;
    --chat-active-item-bg: #e0e7ff;
    --chat-active-item-text: #3730a3;
}

html.dark {
    --chat-bg: #1f2937;
    --chat-sidebar-bg: #1f2937;
    --chat-input-bg: #27272A;
    --chat-user-bubble-bg: #4f46e5;
    --chat-user-bubble-text: #ffffff;
    --chat-model-bubble-bg: #27272A;
    --chat-model-bubble-text: #f4f4f5;
    --chat-suggestion-bg: #3f3f46;
    --chat-suggestion-hover-bg: #52525b;
    --chat-suggestion-text: #d4d4d8;
    --chat-code-bg: #1e293b;
    --chat-code-header-bg: #0f172a;
    --chat-code-text: #e2e8f0;
    --chat-code-header-text: #94a3b8;
    --chat-code-copy-hover-bg: #334155;
    --dropdown-footer-bg: rgba(39, 39, 42, 0.5);
    --chat-link-bg: rgba(99, 102, 241, 0.2);
    --chat-link-text: #a5b4fc;
    --chat-link-hover-bg: rgba(99, 102, 241, 0.3);
    --chat-active-item-bg: rgba(99, 102, 241, 0.25);
    --chat-active-item-text: #c7d2fe;
}
`;

const AiChatStyles: React.FC = () => {
    return <style>{chatThemeVariables + chatStyles}</style>;
};

export default AiChatStyles;