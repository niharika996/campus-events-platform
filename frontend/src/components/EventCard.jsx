import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function EventCard({ event, onRegister, onUnregister }) {
    const [isRegistered, setIsRegistered] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        checkRegistration();
    }, []);

    const checkRegistration = async () => {
        if (!user) return;
        try {
            const response = await API.get(`/registrations/check/${event.id}`);
            setIsRegistered(response.data.registered);
        } catch (error) {
            console.error('Error checking registration:', error);
        }
    };

    const handleRegister = async () => {
        await onRegister(event.id);
        setIsRegistered(true);
    };

    const handleUnregister = async () => {
        await onUnregister(event.id);
        setIsRegistered(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            hackathon: 'bg-purple-100 text-purple-800',
            workshop: 'bg-blue-100 text-blue-800',
            seminar: 'bg-green-100 text-green-800',
            contest: 'bg-yellow-100 text-yellow-800',
            club: 'bg-pink-100 text-pink-800',
            technical: 'bg-indigo-100 text-indigo-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                        {event.category}
                    </span>
                    <span className="text-sm text-gray-500">
                        {event.club_name || 'General'}
                    </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
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
                    <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        {event.registered_count || 0} / {event.max_capacity || '∞'} registered
                    </div>
                </div>
                
                {user && user.role === 'student' && (
                    <button
                        onClick={isRegistered ? handleUnregister : handleRegister}
                        className={`mt-4 w-full py-2 rounded-md font-semibold transition ${
                            isRegistered 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {isRegistered ? 'Cancel Registration' : 'Register Now'}
                    </button>
                )}
                
                {user && user.role === 'admin' && (
                    <div className="mt-4 flex space-x-2">
                        <Link to={`/admin/edit/${event.id}`} className="flex-1">
                            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md font-semibold transition">
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={() => onUnregister(event.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-semibold transition"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventCard;