import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { 
    fetchMainDashboardData, 
    fetchUsersData, 
    fetchNewsEngagementData,
    fetchAdvancedAnalyticsData,
    fetchAndCalculateAgentAnalytics,
    fetchAndCalculateNewsAnalytics,
} from './supabaseService';


// --- Supabase Client for Main App DB (Chat History) ---
// This service is self-contained and manages its own DB connection for chat.
const MAIN_SUPABASE_URL = process.env.VITE_MAIN_SUPABASE_URL || 'https://rrpwqxhwwcgcagzkfoip.supabase.co';
const MAIN_SUPABASE_SERVICE_KEY = process.env.VITE_MAIN_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycHdxeGh3d2NnY2Fnemtmb2lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIzNDE3NiwiZXhwIjoyMDc1ODEwMTc2fQ.RDHlMAYngd7I_UAzjdr7p0QDy9SgJrga5m_qOZYoGU4';
const dbMain = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_SERVICE_KEY);


// --- Chat History Management ---

async function saveChatMessage(sessionId: string, role: 'user' | 'model', content: any) {
    return await dbMain.from('ai_chat_history').insert({
        session_id: sessionId,
        role: role,
        content: content,
    });
}

export async function getChatHistory(sessionId: string) {
    const { data, error } = await dbMain
        .from('ai_chat_history')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching chat history:", error);
        return [];
    }
    
    // The 'content' column is JSONB, so Supabase returns it as a JS object.
    return data.map(row => ({
        role: row.role as 'user' | 'model',
        ...row.content
    }));
}

export async function getChatSessions() {
    // This RPC function needs to be created in Supabase SQL editor.
    const { data, error } = await dbMain.rpc('get_chat_sessions');
    if (error) {
        console.error("Error fetching chat sessions:", error);
        return [];
    }
    return data as { session_id: string; title: string | null; last_message_at: string }[];
}

export async function deleteChatHistory(sessionId: string) {
    return await dbMain
        .from('ai_chat_history')
        .delete()
        .eq('session_id', sessionId);
}


// --- Session and Initialization ---

export async function initializeSession(sessionId: string) {
    const dbHistory = await getChatHistory(sessionId);
    let history: any[] = [];
    
    if (dbHistory.length > 0) {
        history = dbHistory;
    } else {
        // If there's a session ID but no history, still provide a welcome message.
        history = [{
            role: 'model',
            parts: [{ text: "Hi! I'm the Kalina AI assistant. I can fetch live data and analytics from the dashboard for you. What would you like to know?" }]
        }];
    }
    return { sessionId, history };
}


// --- Tool Definitions and Handlers ---

const getAnalyticsDataTool: FunctionDeclaration = {
    name: 'get_analytics_data',
    description: "Fetches detailed analytics and statistics for a specific section of the dashboard. Use this to answer questions about charts, graphs, and specific metrics.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            section: {
                type: Type.STRING,
                description: "The specific dashboard section to get data for.",
                enum: [
                    'main_dashboard', 
                    'agent_analytics', 
                    'news_analytics', 
                    'news_engagement', 
                    'advanced_analytics', 
                    'user_statistics'
                ]
            }
        },
        required: ['section']
    }
};

const handleGetAnalyticsData = async (section: string) => {
    switch (section) {
        case 'main_dashboard':
            return await fetchMainDashboardData();
        case 'agent_analytics':
            return await fetchAndCalculateAgentAnalytics();
        case 'news_analytics':
            return await fetchAndCalculateNewsAnalytics();
        case 'news_engagement':
            return await fetchNewsEngagementData();
        case 'advanced_analytics':
            return await fetchAdvancedAnalyticsData();
        case 'user_statistics':
            const users = await fetchUsersData();
            return {
                totalUsers: users.length,
                totalConversations: users.reduce((acc, u) => acc + u.conversation_count, 0),
                totalLtmFacts: users.reduce((acc, u) => acc + u.ltm_count, 0),
            };
        default:
            return { error: `Invalid analytics section: ${section}` };
    }
};


// --- Core Chat Processing Logic (Streaming) ---

export async function* processUserMessageStream(userInput: string, sessionId: string, history: any[]) {
    const apiKey = sessionStorage.getItem('user_gemini_api_key');
    if (!apiKey) {
        const errorMsg = "Sorry, I can't function right now. No Gemini API key has been provided in this session. Please set your key to continue.";
        yield { type: 'content', text: errorMsg };
        return;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    yield { type: 'thinking' };

    const userMessage = { role: 'user', parts: [{ text: userInput }] };
    await saveChatMessage(sessionId, 'user', { parts: userMessage.parts });
    
    // --- Agent 1: Router Agent Call ---
    let routerResponse: GenerateContentResponse;
    try {
        routerResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, userMessage],
            config: { 
                tools: [{ functionDeclarations: [getAnalyticsDataTool] }],
                systemInstruction: `You are a specialized AI assistant for the Kalina AI admin dashboard. Your purpose is to intelligently route user requests. You have two capabilities:

1.  **Internal Knowledge**: You have a deep, built-in understanding of the application's features, pages, metrics, and settings. Use this for questions like "What is the Insights page?", "Explain LTM facts", or "How do I configure the News agent?".

2.  **Data Fetching Tool (\`get_analytics_data\`)**: This tool fetches LIVE, up-to-the-minute numerical data and statistics from the database.

**Your Task:**
- **If the user asks for current numbers, stats, analytics, or a summary of recent activity (e.g., "how many users today?", "show me agent stats", "what's the latest news engagement?"):** You MUST call the 'get_analytics_data' tool. You MUST also provide a brief, user-facing status message (e.g., "Fetching the latest user data...").

- **If the user asks a "what is", "how to", or "explain" question about a feature, page, or metric:** You MUST NOT call any tools. Answer directly using your internal knowledge base.

- **If the user's question is general conversation (greetings, off-topic):** You MUST NOT call any tools. Politely explain your specialized role and guide them back to dashboard-related topics.

**Example friendly refusal for off-topic questions:** "My apologies, I'm an assistant designed specifically for this dashboard and can't help with general questions. Is there anything about the system's features or analytics I can explain?"`
            },
        });
    } catch (error: any) {
        console.error("Router agent API call failed:", error);
        // Pass the error up to the UI to handle API key errors
        throw error;
    }


    let fullResponseText = '';

    if (routerResponse.functionCalls && routerResponse.functionCalls.length > 0) {
        if (routerResponse.text) {
            yield { type: 'tool_status', message: routerResponse.text };
        }
        
        const functionCalls = routerResponse.functionCalls;

        const toolExecutionPromises = functionCalls.map(async (fc) => {
            let result;
            if (fc.name === 'get_analytics_data') {
                result = await handleGetAnalyticsData(fc.args.section as string);
            } else {
                result = { error: `Unknown tool called: ${fc.name}` };
            }
            return {
                functionResponse: {
                    name: fc.name,
                    id: fc.id,
                    response: { result },
                }
            };
        });

        const functionResponseParts = await Promise.all(toolExecutionPromises);
        
        yield { type: 'generating' };

        const finalHistory = [
            ...history,
            userMessage,
            { role: 'model', parts: functionCalls.map(fc => ({ functionCall: fc })) },
            { role: 'user', parts: functionResponseParts }
        ];

        const systemInstruction = `You are a helpful, expert AI assistant for the Kalina AI admin dashboard. Your primary goal is to provide concise, clear, and user-friendly answers in Markdown based on the provided data and your extensive internal knowledge of the application.

**CRITICAL RULE:** When providing a link to a page, you MUST embed it directly into the sentence where it is relevant.
- **CORRECT:** "You can monitor user growth on the [Insights page](nav:/advanced-analytics)."
- **INCORRECT:** "Here are the stats. View more on the Insights page."
- **ABSOLUTELY FORBIDDEN:** Listing links at the end of your response.

Use this format for navigation links: [Link Text](nav:/path#view).

---

### INTERNAL KNOWLEDGE BASE

#### 1. Application Overview
The Kalina AI Admin Panel is a tool for monitoring and managing the entire Kalina AI ecosystem. It provides analytics on user engagement, AI agent performance, news content processing, and system health.

#### 2. Page & Feature Breakdown

*   **Overview (\`/\`)**: This is the main landing page. It shows high-level, at-a-glance metrics like total users, total articles, API request volume, and a feed of the most recent system activities (agent runs, news updates).
*   **Users (\`/users\`)**: A detailed table of all registered users. You can see their name, email, join date, and key stats like their total number of conversations, saved LTM facts (memories), and code snippets. You can also delete users from here.
*   **Insights (\`/advanced-analytics\`)**: This is the deep-dive analytics page. It contains charts and stats on:
    *   **User Growth**: A 30-day trend chart of new user sign-ups.
    *   **Conversation Trends**: A 30-day trend of new conversations.
    *   **Conversation Types**: A doughnut chart showing the split between Text and Voice conversations.
    *   **Pinned Conversations**: The percentage of conversations that users have pinned.
    *   **LTM & Code Snippets**: Total counts of Long-Term Memory facts and saved code snippets.
    *   **LTM Categories**: A bar chart of the most common categories for LTM facts (e.g., 'personal_preference', 'reminder').
    *   **Top Languages**: A bar chart showing the most frequently saved programming languages in code snippets.
    *   **Feature Usage**: Stats on how many users have enabled Proactive Mode or are using their own personal API keys.
*   **AI Assistant (\`/ai-chat\`)**: The chat interface you are currently using to help the admin. You can access previous conversations and start new ones from the chat icon in the main header.
*   **Space (\`/architecture\`)**: A visual diagram showing the entire system architecture, including frontends, Supabase Edge Functions, external APIs (Groq, GNews, Gemini), and the different databases. It illustrates how data flows through the system.
*   **Agent Panel (\`/agent\`)**: Manages the AI agents that respond to users in the main client app.
    *   **Analytics (\`#analytics\`)**: Shows charts for agent requests over time, average response latency, error rates, and which agents are used most.
    *   **Logs (\`#logs\`)**: A searchable, filterable table of every single agent request, including the user's prompt, the agent's full response (or error), status, and latency. This is for detailed debugging.
    *   **Settings (\`#settings\`)**: Configure the AI model name (e.g., 'llama3-8b-8192') and manage the pool of API keys used by the agents.
*   **News Panel (\`/news\`)**: Manages the system that automatically fetches and processes news articles.
    *   **Engagement (\`#engagement\`)**: Shows analytics on how users interact with news articles, including total views, likes, bookmarks, and a breakdown by category. It also lists the top 10 most viewed articles.
    *   **Analytics (\`#analytics\`)**: Tracks the performance of the news update function itself, showing total runs, success rate, and average processing duration.
    *   **Logs (\`#logs\`)**: A detailed log of each time the news update function ran, showing what was processed.
    *   **Settings (\`#settings\`)**: Manage the API keys for GNews (for fetching articles) and Gemini (for summarizing them).
*   **Settings (\`/settings\`)**: A powerful, low-level database management tool. Here you can:
    *   View the schema, column names, and row count for every table in both the Main and Agent databases.
    *   Preview the 5 most recent rows from any table.
    *   **Danger Zone**: Delete all data from a table (truncate) or reset a table's ID sequence. These are destructive actions.

#### 3. Glossary of Terms
*   **Agent**: An AI function designed for a specific task (e.g., 'thought-generator', 'router').
*   **LTM (Long-Term Memory)**: Facts the AI remembers about a user across conversations to provide a more personalized experience.
*   **Latency**: The time it takes for an AI agent to process a request and generate a response, measured in milliseconds.
*   **Proactive Mode**: A user setting in the client app where the AI might interject with helpful information without being prompted.
*   **Summarization Failure**: Occurs when a long conversation cannot be automatically summarized by the system, often due to its length or complexity.

---

Now, answer the user's question based on the live data provided by the tool (if any) and your extensive internal knowledge. Be helpful, clear, and concise. Remember to embed navigation links properly.`;

        // --- Final Streaming Call ---
        try {
            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: finalHistory,
                config: { systemInstruction },
            });

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullResponseText += chunkText;
                    yield { type: 'content', text: chunkText };
                }
            }
        } catch(error) {
            console.error("Final response generation failed:", error);
            const errorMsg = `Error: The AI failed to generate a response after processing the tool call. Please check the console.`;
            if (!fullResponseText) { // if nothing was yielded yet
                yield { type: 'content', text: errorMsg };
                fullResponseText = errorMsg; // ensure error is saved
            }
            throw error; // Let the UI catch this to stop the loading state
        }

    } else {
        // If no tool is called, use the router's direct text response
        yield { type: 'generating' };
        const directResponse = routerResponse.text;
        fullResponseText = directResponse;
        
        // Simulate streaming for a non-tool response for consistent UI behavior
        const words = directResponse.split(/(\s+)/); // Split by space but keep spaces
        for (const word of words) {
            await new Promise(resolve => setTimeout(resolve, 25)); // short delay
            yield { type: 'content', text: word };
        }
    }

    // After streaming is complete, save the final message to the database
    if (fullResponseText) {
        await saveChatMessage(sessionId, 'model', { parts: [{ text: fullResponseText }] });
    }
}