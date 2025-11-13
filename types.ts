





export interface AgentLog {
  id: number;
  created_at: string;
  agent_name: string;
  status: 'success' | 'failure';
  latency_ms: number;
  prompt: string;
  response: any;
  error_message?: string;
}

export interface NewsLog {
  id: number;
  created_at: string;
  status: 'SUCCESS' | 'FAILURE';
  duration_ms: number;
  summary: string[];
  details: string;
}

export interface AgentConfig {
  active_model_name: string;
  api_keys: string[];
}

export interface NewsConfig {
  gnews_api_keys: string[];
  gemini_api_keys: string[];
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
  created_at: string;
}

export interface UserStats {
  user: UserProfile;
  conversation_count: number;
  ltm_count: number;
  code_snippet_count: number;
}

export interface ArticleStats {
  category: string;
  views: number;
  likes: number;
  bookmarks: number;
}

export interface ArticleEngagementData {
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  statsByCategory: ArticleStats[];
  topArticles: { title: string; url: string; views: number }[];
}

export interface RecentActivityLog {
  id: number | string;
  type: 'agent' | 'news';
  timestamp: string;
  description: string;
  status: 'success' | 'failure' | 'SUCCESS' | 'FAILURE';
}

export interface MainDashboardData {
  totalAgentRequests: number;
  totalNewsUpdateRequests: number;
  successAgentRequests: number;
  successNewsUpdateRequests: number;
  totalUsers: number;
  totalConversations: number;
  totalArticles: number;
  summarizationFailureCount: number;
  recentActivity: RecentActivityLog[];
}
// FIX: Add types for Advanced Analytics page
export interface TrendDataPoint {
    time: string;
    count: number;
}

export interface BarDataPoint {
    name: string;
    count: number;
}

export interface DistributionDataPoint {
    name: string;
    count: number;
}

export interface AdvancedAnalyticsData {
    userGrowth: TrendDataPoint[];
    pinnedConversationRate: number;
    conversationTrend: TrendDataPoint[];
    conversationTypes: { voice: number; text: number };
    totalLtmFacts: number;
    totalCodeSnippets: number;
    ltmCategoryDistribution: BarDataPoint[];
    topCodeLanguages: BarDataPoint[];
    mostDiscussedArticles: BarDataPoint[];
    proactiveModeRate: number;
    apiKeyUsageRate: number;
    voiceModeAdoption: DistributionDataPoint[];
    summarizationFailureCount: number;
    articleCacheCount: number;
    totalConversations: number;
}

// Types for Settings Page
export interface TableDetails {
    tableName: string;
    dbName: 'Main App' | 'Agent';
    rowCount: number;
    columns: string[];
    recentRows: any[];
}
export interface ChatMessage {
    id?: number;
    session_id: string;
    role: 'user' | 'model';
    content: any; // Stored as JSONB
    created_at?: string;
}

export interface ChatSession {
    session_id: string;
    title: string | null;
    last_message_at: string;
}