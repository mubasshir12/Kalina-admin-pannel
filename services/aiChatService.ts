import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { 
    dbMain,
    fetchMainDashboardData, 
    fetchUsersData, 
    fetchNewsEngagementData,
    fetchAdvancedAnalyticsData,
    fetchAndCalculateAgentAnalytics,
    fetchAndCalculateNewsAnalytics,
} from './supabaseService';
import { finalSystemInstruction } from './systemPrompt';


// --- API Key Management (NEW) ---

export async function getApiKeys() {
    const { data, error } = await dbMain.from('ai_api_keys').select('*').order('created_at');
    if (error) throw error;
    return data;
}

export async function addApiKey(apiKey: string) {
    const { error } = await dbMain.from('ai_api_keys').insert({ api_key: apiKey, status: 'active' });
    if (error) throw error;
}

export async function deleteApiKey(id: number) {
    const { error } = await dbMain.from('ai_api_keys').delete().eq('id', id);
    if (error) throw error;
}

export async function resetApiKeysStatus() {
    const { error } = await dbMain.from('ai_api_keys').update({ status: 'active', failure_count: 0 }).eq('status', 'exhausted');
    if (error) throw error;
}

// Fetches the next available API key using the RPC function
async function getNextApiKey(): Promise<{ keyId: number; keyValue: string } | null> {
    const { data, error } = await dbMain.rpc('get_next_api_key');
    if (error) {
        console.error("Error fetching next API key:", error);
        return null;
    }
    if (data && data.length > 0) {
        return { keyId: data[0].key_id, keyValue: data[0].key_value };
    }
    return null;
}

// Marks an API key as exhausted using the RPC function
async function markKeyAsExhausted(keyId: number) {
    const { error } = await dbMain.rpc('mark_api_key_exhausted', { p_key_id: keyId });
    if (error) {
        console.error(`Error marking key ID ${keyId} as exhausted:`, error);
    }
}


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

const routerSystemInstruction = `You are a specialized AI agent for the Kalina AI admin dashboard. Your single purpose is to determine if a user's request requires fetching live, numerical data from the database. You have one tool: 'get_analytics_data'.

**Your Task:**
1.  **Analyze the user's query.**
2.  **If the query asks for current numbers, statistics, analytics, totals, counts, rates, trends, or a summary of recent activity, you MUST call the 'get_analytics_data' tool.**
    *   Examples: "how many users signed up today?", "show me agent stats", "what's the latest news engagement?", "summarize today's activity".
    *   When you call the tool, you MUST also provide a brief, user-facing status message in the 'text' field of your response. Example: "Sure, fetching the latest user data for you..."
3.  **If the query is a greeting, a general question about features ("what is...", "how to...", "explain..."), or is off-topic, you MUST NOT call any tools.**
    *   In this case, simply respond with a direct, conversational answer using your own knowledge.`;

const MAX_RETRIES = 5; // Max number of keys to try before giving up

export async function* processUserMessageStream(userInput: string, sessionId: string, history: any[]) {
    
    yield { type: 'thinking' };

    const userMessage = { role: 'user', parts: [{ text: userInput }] };
    await saveChatMessage(sessionId, 'user', { parts: userMessage.parts });
    
    let lastError: any = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const apiKeyInfo = await getNextApiKey();

        if (!apiKeyInfo) {
            const errorMsg = "Sorry, I can't function right now. No active API keys are available in the system. Please add one in the settings.";
            yield { type: 'content', text: errorMsg };
            await saveChatMessage(sessionId, 'model', { parts: [{ text: errorMsg }] });
            return;
        }

        const ai = new GoogleGenAI({ apiKey: apiKeyInfo.keyValue });

        try {
            // --- Agent 1: Router Agent Call ---
            const routerResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [...history, userMessage],
                config: { 
                    tools: [{ functionDeclarations: [getAnalyticsDataTool] }],
                    systemInstruction: routerSystemInstruction,
                },
            });

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

                // --- Final Streaming Call ---
                const stream = await ai.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: finalHistory,
                    config: { systemInstruction: finalSystemInstruction },
                });

                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        fullResponseText += chunkText;
                        yield { type: 'content', text: chunkText };
                    }
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
            
            // If we get here, the API call was successful, so we break the retry loop
            return;

        } catch (error: any) {
            lastError = error;
            const errorMessageString = error.toString();
            console.warn(`Attempt ${attempt + 1} failed with key ID ${apiKeyInfo.keyId}:`, errorMessageString);

            if (errorMessageString.includes('API key not valid') || errorMessageString.includes('API_KEY_INVALID')) {
                await markKeyAsExhausted(apiKeyInfo.keyId);
                // Continue to the next iteration to try a different key
            } else {
                // For other errors (e.g., network, server-side), don't retry, just fail.
                throw error;
            }
        }
    }

    // If the loop finishes without a successful call, it means all keys failed.
    console.error("All API key attempts failed. Last error:", lastError);
    const finalErrorMsg = "I'm sorry, but I was unable to connect to the AI service. All available API keys have failed. Please check the keys in the Settings page or add a new one.";
    yield { type: 'content', text: finalErrorMsg };
    await saveChatMessage(sessionId, 'model', { parts: [{ text: finalErrorMsg }] });
}