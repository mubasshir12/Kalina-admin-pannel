
import { createClient } from '@supabase/supabase-js';
// FIX: Import AdvancedAnalyticsData type
import type { AgentLog, NewsLog, AgentConfig, NewsConfig, MainDashboardData, UserStats, ArticleEngagementData, AdvancedAnalyticsData, BarDataPoint, TrendDataPoint, ChatMessage } from '../types';

// Client for the Agent Handler function (separate project)
const AGENT_SUPABASE_URL = process.env.VITE_AGENT_SUPABASE_URL || 'https://txlogzxtdltxcmkhcqsi.supabase.co';
const AGENT_SUPABASE_SERVICE_KEY = process.env.VITE_AGENT_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bG9nenh0ZGx0eGNta2hjcXNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg3NTgzMywiZXhwIjoyMDc2NDUxODMzfQ.OSQB7x3RgM6OKTjSckoSgL6r8vpOq3vnlNzfj-tDgLs';
export const dbAgent = createClient(AGENT_SUPABASE_URL, AGENT_SUPABASE_SERVICE_KEY);

// Client for the Main App functions (Update News, etc.)
const MAIN_SUPABASE_URL = process.env.VITE_MAIN_SUPABASE_URL || 'https://rrpwqxhwwcgcagzkfoip.supabase.co';
const MAIN_SUPABASE_SERVICE_KEY = process.env.VITE_MAIN_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycHdxeGh3d2NnY2Fnemtmb2lwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIzNDE3NiwiZXhwIjoyMDc1ODEwMTc2fQ.RDHlMAYngd7I_UAzjdr7p0QDy9SgJrga5m_qOZYoGU4';
export const dbMain = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_SERVICE_KEY);


// === Main Dashboard Data Fetching ===
export async function fetchMainDashboardData(): Promise<MainDashboardData> {
    const [
        agentTotalRes, newsTotalRes,
        agentSuccessRes, newsSuccessRes,
        usersRes, conversationsRes, articlesRes,
        summarizationFailRes,
        recentAgentLogsRes,
        recentNewsLogsRes,
    ] = await Promise.all([
        dbAgent.from('groq_agent_logs').select('*', { count: 'exact', head: true }),
        dbMain.from('update_news_logs').select('*', { count: 'exact', head: true }),
        dbAgent.from('groq_agent_logs').select('*', { count: 'exact', head: true }).eq('status', 'success'),
        dbMain.from('update_news_logs').select('*', { count: 'exact', head: true }).eq('status', 'SUCCESS'),
        dbMain.from('profiles').select('*', { count: 'exact', head: true }),
        dbMain.from('conversations').select('*', { count: 'exact', head: true }),
        dbMain.from('public_news_articles').select('*', { count: 'exact', head: true }),
        dbMain.from('conversations').select('*', { count: 'exact', head: true }).eq('summarization_failed', true),
        dbAgent.from('groq_agent_logs').select('id, created_at, agent_name, status').order('created_at', { ascending: false }).limit(5),
        dbMain.from('update_news_logs').select('id, created_at, status, summary').order('created_at', { ascending: false }).limit(3),
    ]);

    const agentActivity = (recentAgentLogsRes.data || []).map(log => ({
        id: `agent-${log.id}`,
        type: 'agent' as const,
        timestamp: log.created_at,
        description: `Agent "${log.agent_name}" ran.`,
        status: log.status as 'success' | 'failure',
    }));

    const newsActivity = (recentNewsLogsRes.data || []).map(log => ({
        id: `news-${log.id}`,
        type: 'news' as const,
        timestamp: log.created_at,
        description: log.summary?.find((s: string) => s.includes('Total Articles Updated')) || 'News update job ran.',
        status: log.status as 'SUCCESS' | 'FAILURE',
    }));

    const recentActivity = [...agentActivity, ...newsActivity]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

    return {
        totalAgentRequests: agentTotalRes.count || 0,
        totalNewsUpdateRequests: newsTotalRes.count || 0,
        successAgentRequests: agentSuccessRes.count || 0,
        successNewsUpdateRequests: newsSuccessRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalConversations: conversationsRes.count || 0,
        totalArticles: articlesRes.count || 0,
        summarizationFailureCount: summarizationFailRes.count || 0,
        recentActivity,
    };
}


// === Agent Admin Data Fetching and Updates ===
export async function fetchAgentData() {
    const [logsRes, configRes] = await Promise.all([
        dbAgent.from('groq_agent_logs').select('*').order('created_at', { ascending: false }),
        dbAgent.from('groq_agent_config').select('active_model_name, api_keys').eq('id', 1).single(),
    ]);
    return {
        logs: logsRes.data || [],
        config: configRes.data ? { api_keys: configRes.data.api_keys || [], active_model_name: configRes.data.active_model_name || '' } : { api_keys: [], active_model_name: '' },
    };
}

export async function updateAgentConfig(updates: Partial<AgentConfig>) {
    return await dbAgent.from('groq_agent_config').update({ ...updates, updated_at: new Date() }).eq('id', 1);
}

// === Agent Admin Data Deletion ===
export async function deleteAgentLog(id: number) {
    return await dbAgent.from('groq_agent_logs').delete().eq('id', id);
}

export async function deleteAgentLogsBatch(ids: number[]) {
    if (ids.length === 0) return { error: null };
    return await dbAgent.from('groq_agent_logs').delete().in('id', ids);
}


// === News Admin Data Fetching and Updates ===
export async function fetchNewsAdminData() {
    const [logsRes, configRes] = await Promise.all([
        dbMain.from('update_news_logs').select('*').order('created_at', { ascending: false }),
        dbMain.from('update_news_config').select('*').eq('id', 1).single()
    ]);

    return {
        logs: logsRes.data || [],
        config: {
            gnews_api_keys: configRes.data?.gnews_api_keys || [],
            gemini_api_keys: configRes.data?.gemini_api_keys || [],
        }
    };
}

export async function updateNewsConfig(updates: Partial<NewsConfig>) {
    return await dbMain.from('update_news_config').update({ ...updates, updated_at: new Date() }).eq('id', 1);
}

// === News Admin Data Deletion ===
export async function deleteNewsLog(id: number) {
    return await dbMain.from('update_news_logs').delete().eq('id', id);
}

export async function deleteNewsLogsBatch(ids: number[]) {
    if (ids.length === 0) return { error: null };
    return await dbMain.from('update_news_logs').delete().in('id', ids);
}

// === Users Page Data Fetching ===
export async function fetchUsersData(): Promise<UserStats[]> {
    const { data: profiles, error: profilesError } = await dbMain.from('profiles').select('id, full_name, avatar_url');
    if (profilesError) throw profilesError;
    if (!profiles) return [];
    
    const { data: authUsers, error: authError } = await dbMain.auth.admin.listUsers();
    if (authError) throw authError;

    const [
        { data: conversationsData, error: convosError },
        { data: ltmData, error: ltmError },
        { data: codeData, error: codeError }
    ] = await Promise.all([
        dbMain.from('conversations').select('user_id'),
        dbMain.from('ltm').select('user_id'),
        dbMain.from('code_memory').select('user_id')
    ]);

    if (convosError) console.error("Error fetching conversations:", convosError);
    if (ltmError) console.error("Error fetching ltm:", ltmError);
    if (codeError) console.error("Error fetching code_memory:", codeError);

    const createCountMap = (data: { user_id: string }[] | null): Map<string, number> => {
        const map = new Map<string, number>();
        if (!data) return map;
        for (const item of data) {
            map.set(item.user_id, (map.get(item.user_id) || 0) + 1);
        }
        return map;
    };

    const conversationCounts = createCountMap(conversationsData);
    const ltmCounts = createCountMap(ltmData);
    const codeCounts = createCountMap(codeData);
    
    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    return authUsers.users.map(user => {
        const profile = profilesMap.get(user.id);
        // FIX: Supabase's user.user_metadata can be 'unknown' or 'null'. Cast it to a known shape after ensuring it's not null.
        // We use optional chaining for `metadata` to safely access properties, as `user_metadata` itself can be null.
        const metadata = user.user_metadata as ({ full_name?: string; avatar_url?: string; } | null);

        return {
            user: {
                id: user.id,
                full_name: profile?.full_name || metadata?.full_name || 'N/A',
                avatar_url: profile?.avatar_url || metadata?.avatar_url || '',
                email: user.email || 'N/A',
                created_at: user.created_at,
            },
            conversation_count: conversationCounts.get(user.id) || 0,
            ltm_count: ltmCounts.get(user.id) || 0,
            code_snippet_count: codeCounts.get(user.id) || 0,
        };
    }).sort((a, b) => new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime());
}


// === User Page Data Deletion ===
export async function deleteUser(userId: string) {
    // Deleting a user from auth will cascade and remove their profile, etc.
    return await dbMain.auth.admin.deleteUser(userId);
}

export async function deleteUsersBatch(userIds: string[]) {
    if (userIds.length === 0) return { data: [], error: null };

    // Supabase JS SDK v2 doesn't have a batch delete users method.
    // We execute them in parallel using Promise.allSettled to handle individual failures.
    const deletePromises = userIds.map(id => dbMain.auth.admin.deleteUser(id));
    const results = await Promise.allSettled(deletePromises);

    // Find the first failed promise to report a specific error.
    const firstErrorResult = results.find(result => result.status === 'rejected');
    if (firstErrorResult) {
        const reason = (firstErrorResult as PromiseRejectedResult).reason;
        console.error("Batch user deletion failed for at least one user:", reason);
        return { data: [], error: reason };
    }

    return { data: results, error: null };
}


// === News Engagement Data Fetching ===
export async function fetchNewsEngagementData(): Promise<ArticleEngagementData> {
    const { data: articles, error } = await dbMain
        .from('public_news_articles')
        .select('category, article_data, views, likes, bookmarks');
    
    if (error) throw error;
    if (!articles) return { totalViews: 0, totalLikes: 0, totalBookmarks: 0, statsByCategory: [], topArticles: [] };

    let totalViews = 0;
    let totalLikes = 0;
    let totalBookmarks = 0;
    const categoryData: Record<string, { views: number; likes: number; bookmarks: number }> = {};

    articles.forEach(article => {
        const views = article.views || 0;
        const likes = article.likes || 0;
        const bookmarks = article.bookmarks || 0;
        const category = article.category || 'Uncategorized';

        totalViews += views;
        totalLikes += likes;
        totalBookmarks += bookmarks;

        if (!categoryData[category]) {
            categoryData[category] = { views: 0, likes: 0, bookmarks: 0 };
        }
        categoryData[category].views += views;
        categoryData[category].likes += likes;
        categoryData[category].bookmarks += bookmarks;
    });

    const statsByCategory = Object.entries(categoryData).map(([category, data]) => ({
        category,
        ...data
    })).sort((a, b) => b.views - a.views);

    const topArticles = articles
        .map(article => ({
            title: article.article_data?.title || 'No Title',
            url: article.article_data?.url || '#',
            views: article.views || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
        
    return {
        totalViews,
        totalLikes,
        totalBookmarks,
        statsByCategory,
        topArticles
    };
}

// FIX: Replace mock data fetching with real Supabase queries for trend charts
export async function fetchAdvancedAnalyticsData(): Promise<AdvancedAnalyticsData> {
    // FIX: Use UTC dates to avoid timezone-related issues in date filtering.
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    const processTrendData = (
        records: { created_at: string }[] | null,
        days: number
    ): TrendDataPoint[] => {
        const counts = new Map<string, number>();
        // FIX: Use UTC dates for initializing the map to match the UTC timestamps from the database.
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

        for (let i = 0; i < days; i++) {
            const d = new Date(todayUTC);
            d.setUTCDate(d.getUTCDate() - i);
            counts.set(d.toISOString().split('T')[0], 0);
        }

        if (records) {
            for (const record of records) {
                // Supabase timestamptz is ISO 8601 format, so splitting by 'T' is a safe way to get the UTC date.
                const recordDate = record.created_at.split('T')[0];
                if (counts.has(recordDate)) {
                    counts.set(recordDate, counts.get(recordDate)! + 1);
                }
            }
        }

        return Array.from(counts.entries())
            .map(([time, count]) => ({ time, count }))
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    };

    const [
        totalConvosRes, pinnedConvosRes, voiceConvosRes, totalLtmRes, totalCodeRes,
        ltmCategoryRes, topLangsRes, discussedArticlesRes, proactiveUsersRes,
        apiKeyUsersRes, voiceAdoptionRes, summarizationFailRes, cacheCountRes, totalProfilesRes,
        // FIX: Fetch users from auth.users, not profiles, for accurate created_at timestamps.
        userGrowthRes, 
        conversationTrendRes,
    ] = await Promise.all([
        dbMain.from('conversations').select('*', { count: 'exact', head: true }),
        dbMain.from('conversations').select('*', { count: 'exact', head: true }).eq('is_pinned', true),
        dbMain.from('conversations').select('*', { count: 'exact', head: true }).eq('is_voice_conversation', true),
        dbMain.from('ltm').select('*', { count: 'exact', head: true }),
        dbMain.from('code_memory').select('*', { count: 'exact', head: true }),
        dbMain.from('ltm').select('category').neq('category', null),
        dbMain.from('code_memory').select('language').neq('language', null),
        dbMain.from('article_conversations').select('article_url', { count: 'exact' }),
        dbMain.from('user_settings').select('*', { count: 'exact', head: true }).eq('voice_proactive_mode', true),
        dbMain.from('user_settings').select('*', { count: 'exact', head: true }).not('api_key', 'is', null),
        dbMain.from('user_settings').select('voice_mode_voice').not('voice_mode_voice', 'is', null),
        dbMain.from('conversations').select('*', { count: 'exact', head: true }).eq('summarization_failed', true),
        dbMain.from('public_article_cache').select('*', { count: 'exact', head: true }),
        dbMain.from('profiles').select('*', { count: 'exact', head: true }),
        // FIX: Use auth.admin.listUsers() to get accurate creation dates. This is the source of truth.
        // We fetch up to 1000 users, which should be sufficient for this dashboard's scope.
        dbMain.auth.admin.listUsers({ perPage: 1000 }),
        dbMain.from('conversations').select('created_at').gte('created_at', thirtyDaysAgoISO),
    ]);

    const totalConvos = totalConvosRes.count ?? 0;
    const totalProfiles = totalProfilesRes.count ?? 0;

    const toBarData = (data: Record<string, number>): BarDataPoint[] => 
        Object.entries(data).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

    const groupAndCount = (data: any[], key: string): Record<string, number> => {
        if (!data) return {};
        return data.reduce((acc, item) => {
            const val = item[key];
            if (val) acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    return {
        // FIX: Process the user list from the auth response.
        userGrowth: processTrendData(userGrowthRes.data?.users || [], 30),
        pinnedConversationRate: totalConvos > 0 ? ((pinnedConvosRes.count ?? 0) / totalConvos) * 100 : 0,
        conversationTrend: processTrendData(conversationTrendRes.data, 30),
        conversationTypes: {
            voice: voiceConvosRes.count ?? 0,
            text: totalConvos - (voiceConvosRes.count ?? 0),
        },
        totalLtmFacts: totalLtmRes.count ?? 0,
        totalCodeSnippets: totalCodeRes.count ?? 0,
        ltmCategoryDistribution: toBarData(groupAndCount(ltmCategoryRes.data, 'category')),
        topCodeLanguages: toBarData(groupAndCount(topLangsRes.data, 'language')),
        mostDiscussedArticles: toBarData(groupAndCount(discussedArticlesRes.data, 'article_url')),
        proactiveModeRate: totalProfiles > 0 ? ((proactiveUsersRes.count ?? 0) / totalProfiles) * 100 : 0,
        apiKeyUsageRate: totalProfiles > 0 ? ((apiKeyUsersRes.count ?? 0) / totalProfiles) * 100 : 0,
        voiceModeAdoption: toBarData(groupAndCount(voiceAdoptionRes.data, 'voice_mode_voice')),
        summarizationFailureCount: summarizationFailRes.count ?? 0,
        articleCacheCount: cacheCountRes.count ?? 0,
        totalConversations: totalConvos,
    };
}


// === AI Chat Tools (Analytics) ===

export async function fetchAndCalculateAgentAnalytics() {
    const { data: logs, error } = await dbAgent.from('groq_agent_logs').select('*');
    if (error) throw error;
    if (!logs) return {};

    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.status === 'success').length;
    const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests * 100) : 0;
    const successfulLogs = logs.filter(log => log.status === 'success' && log.latency_ms);
    const avgLatency = successfulLogs.length > 0 ? (successfulLogs.reduce((acc, log) => acc + log.latency_ms, 0) / successfulLogs.length) : 0;
    
    return {
        totalRequests,
        successfulRequests,
        errorRate: parseFloat(errorRate.toFixed(1)),
        avgLatency: parseInt(avgLatency.toFixed(0)),
    };
}

export async function fetchAndCalculateNewsAnalytics() {
    const { data: logs, error } = await dbMain.from('update_news_logs').select('*');
    if (error) throw error;
    if (!logs) return {};
    
    const totalRuns = logs.length;
    const successfulRuns = logs.filter(l => l.status === 'SUCCESS').length;
    const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100) : 100;
    const avgDuration = totalRuns > 0 ? (logs.reduce((acc, l) => acc + l.duration_ms, 0) / totalRuns) : 0;
    const articlesUpdated = logs.reduce((acc, l) => {
        const summaryLine = l.summary?.find(s => s.includes('Total Articles Updated'));
        return acc + (parseInt(summaryLine?.split(': ')[1] || '0', 10));
    }, 0);

    return {
        totalRuns,
        successfulRuns,
        successRate: parseFloat(successRate.toFixed(1)),
        avgDurationSeconds: parseFloat((avgDuration / 1000).toFixed(2)),
        totalArticlesUpdated: articlesUpdated,
    };
}