import React, { useState, useEffect } from 'react';
import API from '../services/api';

function MyEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        setLoading(true);
        try {
            const response = await API.get('/registrations/my-events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load your events');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (eventId) => {
        if (!confirm('Are you sure you want to cancel your registration?')) return;
        
        try {
            await API.delete(`/registrations/${eventId}`);
            setEvents(events.filter(e => e.id !== eventId));
            alert('✅ Registration cancelled successfully');
        } catch (error) {
            alert(error.response?.data?.error || 'Cancellation failed');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-xl text-gray-600">Loading your events...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">🎯 My Registered Events</h1>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {events.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <p className="text-2xl mb-2">😅</p>
                    <p className="text-gray-500 text-lg">You haven't registered for any events yet</p>
                    <p className="text-gray-400 text-sm mt-2">Browse events and register to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                                        {event.category}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Registered: {new Date(event.registered_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {event.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {event.description}
                                </p>
                                
                                <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                                    <div className="flex items-center">
                                        <span className="mr-2">📅</span>
                                        {new Date(event.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="mr-2">📍</span>
                                        {event.venue || 'TBD'}
                                    </div>
                                    {event.club_name && (
                                        <div className="flex items-center">
                                            <span className="mr-2">🏛️</span>
                                            {event.club_name}
                                        </div>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => handleCancel(event.id)}
                                    className="mt-4 w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold transition"
                                >
                                    Cancel Registration
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyEvents;