import React from 'react';
import { StatCard, PanelCard } from '../ui';
import { CategoryEngagementChart } from '../charts';
import type { ArticleEngagementData } from '../../types';
import { Eye, Heart, Bookmark, RotateCw } from 'lucide-react';

const NewsEngagement: React.FC<{ 
    engagementData: ArticleEngagementData | null,
    onRefresh: () => void;
}> = ({ engagementData, onRefresh }) => {
    
    if (!engagementData) {
        return (
            <div className="flex items-center justify-center h-96 text-slate-500">
                <p>No engagement data available.</p>
            </div>
        );
    }

    const { totalViews, totalLikes, totalBookmarks, statsByCategory, topArticles } = engagementData;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <h3 className="text-xl font-bold text-slate-700">Content Engagement</h3>
                <button onClick={onRefresh} className="btn btn-secondary text-sm">
                    <RotateCw size={14} /> Refresh Data
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Views" value={totalViews} description="Total times articles have been viewed" icon={<Eye size={24} />} borderColor="border-blue-500" />
                <StatCard title="Total Likes" value={totalLikes} description="Total likes across all articles" icon={<Heart size={24} />} borderColor="border-pink-500" />
                <StatCard title="Total Bookmarks" value={totalBookmarks} description="Total times articles were bookmarked" icon={<Bookmark size={24} />} borderColor="border-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <PanelCard className="lg:col-span-3">
                    <h3 className="font-semibold mb-4">Engagement by Category</h3>
                    <CategoryEngagementChart categoryData={statsByCategory} />
                </PanelCard>
                <PanelCard className="lg:col-span-2">
                    <h3 className="font-semibold mb-4">Top 10 Most Viewed Articles</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left font-semibold p-2">Title</th>
                                    <th className="text-right font-semibold p-2">Views</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topArticles.map((article, index) => (
                                    <tr key={index} className="border-b last:border-b-0">
                                        <td className="p-2">
                                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors truncate block max-w-xs" title={article.title}>
                                                {article.title}
                                            </a>
                                        </td>
                                        <td className="text-right p-2 font-semibold text-slate-700">{article.views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PanelCard>
            </div>
        </div>
    );
};

export default NewsEngagement;