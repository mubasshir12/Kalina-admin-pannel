import React, { useState, useEffect } from 'react';
import { fetchAdvancedAnalyticsData } from '../services/supabaseService';
import type { AdvancedAnalyticsData } from '../types';
import { AdvancedAnalyticsSkeleton } from '../components/skeletons';
import {
    UserAnalytics,
    ConversationAnalytics,
    AiMemoryAnalytics,
    ContentAnalytics,
    FeatureUsageAnalytics,
    SystemHealth,
} from '../components/advanced/AnalyticsSections';

const AdvancedAnalyticsPage: React.FC = () => {
    const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const fetchedData = await fetchAdvancedAnalyticsData();
                setData(fetchedData);
            } catch (error) {
                console.error("Failed to fetch advanced analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading || !data) {
        return <AdvancedAnalyticsSkeleton />;
    }

    return (
        <div className="space-y-10">
            <UserAnalytics data={data} />
            <ConversationAnalytics data={data} />
            <AiMemoryAnalytics data={data} />
            <ContentAnalytics data={data} />
            <FeatureUsageAnalytics data={data} />
            <SystemHealth data={data} />
        </div>
    );
};

export default AdvancedAnalyticsPage;
