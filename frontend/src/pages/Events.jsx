import React, { useState, useEffect } from 'react';
import API from '../services/api';
import EventCard from '../components/EventCard';

function Events() {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEvents();
    }, [filter, search]);

    const fetchEvents = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (filter) params.append('category', filter);
            if (search) params.append('search', search);
            
            const url = `/events${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await API.get(url);
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await API.post('/registrations', { event_id: eventId });
            alert('✅ Successfully registered for the event!');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.error || 'Registration failed');
        }
    };

    const handleUnregister = async (eventId) => {
        try {
            await API.delete(`/registrations/${eventId}`);
            alert('✅ Registration cancelled successfully');
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.error || 'Cancellation failed');
        }
    };

    const categories = ['hackathon', 'workshop', 'seminar', 'contest', 'club', 'technical'];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-xl text-gray-600">Loading events...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">📅 Upcoming Events</h1>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="🔍 Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {events.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No events found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRegister={handleRegister}
                            onUnregister={handleUnregister}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Events;