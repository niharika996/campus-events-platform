import React, { useState, useEffect } from 'react';
import API from '../../services/api';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await API.get('/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Events', value: stats?.totalEvents || 0, icon: '📅', color: 'blue' },
        { title: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: '👥', color: 'green' },
        { title: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: '⏰', color: 'purple' },
        { title: 'Active Clubs', value: stats?.totalClubs || 0, icon: '🏛️', color: 'orange' },
    ];

    const colorClasses = {
        blue: 'border-blue-500 bg-blue-50',
        green: 'border-green-500 bg-green-50',
        purple: 'border-purple-500 bg-purple-50',
        orange: 'border-orange-500 bg-orange-50',
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>
                <button
                    onClick={fetchStats}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                >
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`border-l-4 ${colorClasses[stat.color]} p-6 rounded-r-lg shadow-sm`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <span className="text-4xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Popular Events */}
            {stats?.popularEvents && stats.popularEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔥 Popular Events</h2>
                    <div className="space-y-3">
                        {stats.popularEvents.map((event, index) => (
                            <div key={index} className="flex justify-between items-center border-b pb-2">
                                <span className="text-gray-700">{event.title}</span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {event.registrations} registrations
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Stats */}
            {stats?.categoryStats && stats.categoryStats.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Events by Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {stats.categoryStats.map((cat, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                                <p className="text-lg font-semibold text-gray-800">{cat.category}</p>
                                <p className="text-2xl font-bold text-blue-600">{cat.count}</p>
                                <p className="text-sm text-gray-500">events</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;