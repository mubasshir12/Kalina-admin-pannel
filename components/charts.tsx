import React, { useEffect, useRef } from 'react';
import type { Chart } from 'chart.js';
// FIX: Add new data point types for advanced analytics charts
import type { ArticleStats, TrendDataPoint, DistributionDataPoint, BarDataPoint } from '../types';

type ChartProps = {
    data: any;
    options: any;
    type: 'pie' | 'doughnut' | 'bar' | 'line';
};

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { 
            position: 'bottom' as const,
            labels: { 
                font: { size: 14, family: "'Inter', sans-serif" },
                color: '#6b7280', // text-secondary
                boxWidth: 12,
                padding: 20,
            }
        },
        tooltip: {
            boxPadding: 4,
            bodyFont: { family: "'Inter', sans-serif" },
            titleFont: { family: "'Inter', sans-serif", weight: 'bold' },
        }
    } 
};

const getAdaptiveFontSize = (context: any, baseSize: number = 11, minSize: number = 8) => {
    const count = context.scale.ticks?.length || 0;
    if (count === 0) return baseSize;

    const chartArea = context.chart.chartArea;
    if (!chartArea) return baseSize;

    const isVerticalAxis = context.scale.axis === 'y';
    const availableSpace = isVerticalAxis ? chartArea.height : chartArea.width;
    
    const spacePerLabel = availableSpace / count;

    if (spacePerLabel < 25) return minSize;
    if (spacePerLabel < 40) return Math.max(minSize, baseSize - 2);
    
    return baseSize;
};


const ChartComponent: React.FC<ChartProps> = ({ data, options, type }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                chartRef.current = new (window as any).Chart(ctx, {
                    type,
                    data,
                    options,
                });
            }
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, options, type]);

    return <canvas ref={canvasRef}></canvas>;
};

export const ApiDistributionChart: React.FC<{ agentCount: number; newsCount: number }> = ({ agentCount, newsCount }) => {
    const data = {
        labels: ['Agents', 'News Updater'],
        datasets: [{
            label: 'Total Requests',
            data: [agentCount, newsCount],
            backgroundColor: ['#4f46e5', '#f59e0b'],
            borderColor: '#ffffff',
            borderWidth: 4,
        }]
    };
    return <div className="h-80"><ChartComponent type="pie" data={data} options={commonOptions} /></div>;
};

export const SuccessRateChart: React.FC<{ successRate: number }> = ({ successRate }) => {
    const data = {
        labels: ['Success', 'Failure'],
        datasets: [{
            data: [successRate, 100 - successRate],
            backgroundColor: ['#10b981', '#f87171'],
            borderColor: '#ffffff',
            borderWidth: 4,
            circumference: 180,
            rotation: -90,
        }]
    };
    const options = { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } }, cutout: '70%', };
    return (
        <div className="h-80 relative flex items-center justify-center">
            <ChartComponent type="doughnut" data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-14">
                <span className="text-5xl font-bold text-slate-800">{successRate.toFixed(1)}%</span>
                <span className="text-sm text-slate-500">Success Rate</span>
            </div>
        </div>
    );
};

export const AgentRequestsChart: React.FC<{ logs: any[] }> = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No data for selected period.</div>;
    }

    const logDates = logs.map(l => new Date(l.created_at));
    const minDate = new Date(Math.min.apply(null, logDates.map(d => d.getTime())));
    minDate.setHours(0, 0, 0, 0);
    const maxDate = new Date(Math.max.apply(null, logDates.map(d => d.getTime())));
    maxDate.setHours(0, 0, 0, 0);

    const diffDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    const dateMap = new Map<string, { success: number, failure: number }>();
    
    for (let i = 0; i < diffDays; i++) {
        const d = new Date(minDate);
        d.setDate(d.getDate() + i);
        const dateString = d.toISOString().split('T')[0];
        dateMap.set(dateString, { success: 0, failure: 0 });
    }

    logs.forEach(log => {
        const logDate = new Date(log.created_at);
        const dateString = logDate.toISOString().split('T')[0];
        const dayData = dateMap.get(dateString);
        if (dayData) {
            if (log.status === 'success') dayData.success++;
            else dayData.failure++;
        }
    });

    const sortedEntries = Array.from(dateMap.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
    
    const labels = sortedEntries.map(([dateString]) => new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    const successData = sortedEntries.map(([, data]) => data.success);
    const failureData = sortedEntries.map(([, data]) => data.failure);

    const data = {
        labels,
        datasets: [
            { label: 'Success', data: successData, backgroundColor: '#22c55e', barPercentage: 0.8, categoryPercentage: 0.6, borderRadius: 4 },
            { label: 'Failure', data: failureData, backgroundColor: '#ef4444', barPercentage: 0.8, categoryPercentage: 0.6, borderRadius: 4 }
        ]
    };
    const options = { 
        ...commonOptions, 
        scales: { 
            x: { 
                stacked: true, 
                grid: { display: false },
                ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            }, 
            y: { 
                stacked: true, 
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            } 
        } 
    };
    return <div className="h-80"><ChartComponent type="bar" data={data} options={options} /></div>;
};


export const AgentUsageChart: React.FC<{ agentCounts: { [key: string]: number } }> = ({ agentCounts }) => {
    if (!agentCounts || Object.keys(agentCounts).length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No agent usage data available.</div>;
    }
    const data = {
        labels: Object.keys(agentCounts),
        datasets: [{ data: Object.values(agentCounts), backgroundColor: ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#14b8a6', '#f43f5e'] }]
    };
    const options = { ...commonOptions };
    return <div className="h-80"><ChartComponent type="doughnut" data={data} options={options} /></div>;
};

export const NewsArticlesChart: React.FC<{ logs: any[] }> = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No data for selected period.</div>;
    }
    const sortedLogs = logs.slice().sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const labels = sortedLogs.map(l => new Date(l.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    const articlesData = sortedLogs.map(l => {
        const summaryLine = l.summary?.find((s: string) => s.includes('Total Articles Updated'));
        return parseInt(summaryLine?.split(': ')[1] || '0', 10);
    });
    
    const data = {
        labels,
        datasets: [{
            label: 'Articles Updated',
            data: articlesData,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#4f46e5',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 4,
        }]
    };
    const options = { 
        ...commonOptions, 
        scales: { 
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            },
            y: { 
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            } 
        }
    };
    return <div className="h-80"><ChartComponent type="line" data={data} options={options} /></div>;
};

export const AvgLatencyChart: React.FC<{ agentLatencyData: { name: string; avg: number }[] }> = ({ agentLatencyData }) => {
    if (!agentLatencyData || agentLatencyData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No latency data available.</div>;
    }
    // Sort by name for a consistent line
    const sortedData = [...agentLatencyData].sort((a, b) => a.name.localeCompare(b.name));

    const data = {
        labels: sortedData.map(d => d.name),
        datasets: [{
            label: 'Avg Latency (ms)',
            data: sortedData.map(d => d.avg),
            fill: true,
            borderColor: '#4f46e5',
            backgroundColor: (context: any) => {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) {
                    return null;
                }
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
                gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
                return gradient;
            },
            tension: 0.4,
            pointBackgroundColor: '#4f46e5',
            pointBorderColor: '#fff',
            pointHoverRadius: 7,
            pointRadius: 5,
            pointHoverBorderWidth: 2,
        }]
    };
    const options = { 
        ...commonOptions, 
        plugins: { 
            ...commonOptions.plugins, 
            legend: { display: false } 
        }, 
        scales: { 
            x: { 
                grid: { display: false },
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            },
            y: { 
                beginAtZero: true,
                 ticks: {
                    padding: 10,
                    callback: function(value: string | number) {
                        return `${value} ms`;
                    },
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            }
        } 
    };
    return <div className="h-80"><ChartComponent type="line" data={data} options={options} /></div>;
};


export const AvgDurationChart: React.FC<{ durationData: { time: string; duration: number }[] }> = ({ durationData }) => {
     if (!durationData || durationData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No data for selected period.</div>;
    }
    const data = {
        labels: durationData.map(d => d.time),
        datasets: [{
            label: 'Duration (s)',
            data: durationData.map(d => d.duration),
            backgroundColor: '#f59e0b',
            borderRadius: 4,
        }]
    };
    const options = { 
        ...commonOptions, 
        plugins: { ...commonOptions.plugins, legend: { display: false } }, 
        scales: { 
            x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            },
            y: { 
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            } 
        } 
    };
    return <div className="h-80"><ChartComponent type="bar" data={data} options={options} /></div>;
};

export const CategoryEngagementChart: React.FC<{ categoryData: ArticleStats[] }> = ({ categoryData }) => {
    if (!categoryData || categoryData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No engagement data available.</div>;
    }

    const labels = categoryData.map(d => d.category);
    const data = {
        labels,
        datasets: [
            { label: 'Views', data: categoryData.map(d => d.views), backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: 'Likes', data: categoryData.map(d => d.likes), backgroundColor: '#ec4899', borderRadius: 4 },
            { label: 'Bookmarks', data: categoryData.map(d => d.bookmarks), backgroundColor: '#f59e0b', borderRadius: 4 },
        ]
    };
    const options = { 
        ...commonOptions,
        indexAxis: 'y' as const,
        scales: { 
            x: { 
                stacked: true,
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            }, 
            y: { 
                stacked: true,
                grid: { display: false },
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context, 10, 8)
                    }),
                    maxRotation: 45,
                    minRotation: 45,
                }
            } 
        } 
    };
    return <div className="h-[400px]"><ChartComponent type="bar" data={data} options={options} /></div>;
};
// FIX: Add new chart components for Advanced Analytics page
export const TrendChart: React.FC<{ trendData: TrendDataPoint[]; label: string; color: string }> = ({ trendData, label, color }) => {
    if (!trendData || trendData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No trend data available.</div>;
    }
    const data = {
        labels: trendData.map(d => new Date(d.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [{
            label,
            data: trendData.map(d => d.count),
            borderColor: color,
            backgroundColor: `${color}1A`, // semi-transparent
            tension: 0.3,
            fill: true,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 4,
        }]
    };
    const options = { 
        ...commonOptions,
        scales: {
             x: {
                ticks: {
                    autoSkip: true,
                    maxRotation: 45,
                    minRotation: 0,
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            },
            y: { 
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            }
        }
    };
    return <div className="h-80"><ChartComponent type="line" data={data} options={options} /></div>;
};

export const DistributionChart: React.FC<{ distData: DistributionDataPoint[]; type: 'pie' | 'doughnut' }> = ({ distData, type }) => {
    if (!distData || distData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No distribution data available.</div>;
    }
    const colors = ['#4f46e5', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#14b8a6', '#f43f5e'];
    const data = {
        labels: distData.map(d => d.name),
        datasets: [{
            data: distData.map(d => d.count),
            backgroundColor: distData.map((_, i) => colors[i % colors.length]),
            borderColor: '#ffffff',
            borderWidth: 4,
        }]
    };
    const options = type === 'doughnut' ? { ...commonOptions, cutout: '60%' } : commonOptions;
    return <div className="h-80"><ChartComponent type={type} data={data} options={options} /></div>;
};

export const HorizontalBarChart: React.FC<{ barData: BarDataPoint[]; label: string; color: string }> = ({ barData, label, color }) => {
    if (!barData || barData.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-500">No data available.</div>;
    }
    const sortedData = [...barData].sort((a, b) => a.count - b.count);
    const data = {
        labels: sortedData.map(d => d.name),
        datasets: [{
            label,
            data: sortedData.map(d => d.count),
            backgroundColor: color,
            borderRadius: 4,
        }]
    };
    const options = {
        ...commonOptions,
        indexAxis: 'y' as const,
        plugins: {
            ...commonOptions.plugins,
            legend: {
                display: false,
            }
        },
        scales: {
            x: { 
                beginAtZero: true,
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context)
                    })
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: (context: any) => ({
                        size: getAdaptiveFontSize(context, 10, 8)
                    })
                }
            }
        }
    };
    return <div className="h-[400px]"><ChartComponent type="bar" data={data} options={options} /></div>;
};