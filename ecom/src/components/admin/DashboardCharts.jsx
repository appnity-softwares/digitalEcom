import React, { useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Package } from 'lucide-react';
import { useDashboardStats, useRevenueChart, useUserGrowth, useTopProducts } from '../../hooks/useQueries';
import api from '../../services/api';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#0055FF', '#7C3AED', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

const DashboardCharts = () => {
    const [period, setPeriod] = useState(30);

    // React Query hooks
    const { data: statsData, isLoading: statsLoading } = useDashboardStats();
    const dashboardStats = statsData?.stats || statsData;

    const { data: revenueRes, isLoading: revenueLoading } = useQuery({
        queryKey: ['admin', 'revenue-chart', period],
        queryFn: async () => {
            const res = await api.get(`/dashboard/revenue?days=${period}`);
            return res.data.data || [];
        },
    });
    const revenueData = revenueRes || [];

    const { data: userGrowthRes, isLoading: userLoading } = useQuery({
        queryKey: ['admin', 'user-growth', period],
        queryFn: async () => {
            const res = await api.get(`/dashboard/user-growth?days=${period}`);
            return res.data.data || [];
        },
    });
    const userGrowth = userGrowthRes || [];

    const { data: productsRes } = useTopProducts();
    const topProducts = productsRes?.products || productsRes || [];

    const { data: subscriptionStats } = useQuery({
        queryKey: ['admin', 'subscription-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/subscriptions');
            return res.data;
        },
    });

    const loading = statsLoading || revenueLoading || userLoading;

    const formatCurrency = (value) => {
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
        return `$${value}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with period selector */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Analytics Overview</h2>
                <div className="flex gap-2">
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setPeriod(days)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === days
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {days === 7 ? '7 Days' : days === 30 ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards with growth indicators */}
            {dashboardStats && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Revenue"
                        value={`$${dashboardStats.revenue?.total?.toFixed(2) || 0}`}
                        growth={dashboardStats.revenue?.growth}
                        icon={DollarSign}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Total Orders"
                        value={dashboardStats.orders?.total || 0}
                        growth={dashboardStats.orders?.growth}
                        icon={ShoppingCart}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Users"
                        value={dashboardStats.users?.total || 0}
                        growth={dashboardStats.users?.growth}
                        icon={Users}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="Products"
                        value={dashboardStats.content?.products || 0}
                        icon={Package}
                        color="bg-amber-500"
                    />
                </div>
            )}

            {/* Revenue Chart */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-6">Revenue Over Time</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0055FF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                stroke="#9CA3AF"
                                fontSize={12}
                            />
                            <YAxis
                                tickFormatter={formatCurrency}
                                stroke="#9CA3AF"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                                formatter={(value) => [`$${value?.toFixed(2)}`, 'Revenue']}
                                labelFormatter={formatDate}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#0055FF"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-6">User Growth</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={formatDate}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="signups"
                                    stroke="#7C3AED"
                                    strokeWidth={2}
                                    dot={{ fill: '#7C3AED', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Top Products</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="title"
                                    stroke="#9CA3AF"
                                    fontSize={11}
                                    width={120}
                                    tickFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [value, 'Sales']}
                                />
                                <Bar dataKey="numSales" fill="#0055FF" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Subscription breakdown */}
            {subscriptionStats && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold mb-4">Subscription Plans</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={subscriptionStats.planDistribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {(subscriptionStats.planDistribution || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 justify-center">
                            {(subscriptionStats.planDistribution || []).map((item, index) => (
                                <div key={item.planName} className="flex items-center gap-2 text-sm">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-gray-400">{item.planName}: {item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold mb-4">Revenue Metrics</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-400 text-sm">Monthly Recurring Revenue</p>
                                <p className="text-3xl font-bold text-green-400">
                                    ${subscriptionStats.mrr?.toFixed(2) || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Active Subscriptions</p>
                                <p className="text-2xl font-bold">{subscriptionStats.active || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">This Month Cancellations</p>
                                <p className="text-2xl font-bold text-red-400">
                                    {subscriptionStats.cancelledThisMonth || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            {dashboardStats && (
                                <>
                                    <QuickStat
                                        label="Premium Docs"
                                        value={dashboardStats.content?.premiumDocs || 0}
                                    />
                                    <QuickStat
                                        label="SaaS Tools"
                                        value={dashboardStats.content?.saasTools || 0}
                                    />
                                    <QuickStat
                                        label="Active API Keys"
                                        value={dashboardStats.apiKeys?.active || 0}
                                    />
                                    <QuickStat
                                        label="Total API Requests"
                                        value={dashboardStats.apiKeys?.totalRequests || 0}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, growth, icon: Icon, color }) => (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
                {growth !== undefined && (
                    <div className={`flex items-center gap-1 text-sm mt-2 ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {growth >= 0 ? '+' : ''}{growth?.toFixed(1)}% from last period
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

// Quick Stat Component
const QuickStat = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold">{value}</span>
    </div>
);

export default DashboardCharts;
