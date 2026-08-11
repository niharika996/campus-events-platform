import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../services/api';

function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [clubs, setClubs] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'hackathon',
        date: '',
        venue: '',
        max_capacity: 100,
        club_id: ''
    });

    const categories = ['hackathon', 'workshop', 'seminar', 'contest', 'club', 'technical'];

    useEffect(() => {
        fetchEvent();
        fetchClubs();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await API.get(`/events/${id}`);
            const event = response.data;
            // Format date for datetime-local input
            const date = new Date(event.date);
            const formattedDate = date.toISOString().slice(0, 16);
            
            setFormData({
                title: event.title,
                description: event.description || '',
                category: event.category,
                date: formattedDate,
                venue: event.venue || '',
                max_capacity: event.max_capacity || 100,
                club_id: event.club_id || ''
            });
        } catch (error) {
            setError('Failed to load event data');
        } finally {
            setFetching(false);
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await API.get('/clubs');
            setClubs(response.data);
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formattedDate = new Date(formData.date).toISOString();
            
            await API.put(`/events/${id}`, {
                ...formData,
                date: formattedDate,
                max_capacity: parseInt(formData.max_capacity)
            });

            setSuccess('✅ Event updated successfully!');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-xl text-gray-600">Loading event data...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">✏️ Edit Event</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Venue
                        </label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Capacity
                        </label>
                        <input
                            type="number"
                            name="max_capacity"
                            value={formData.max_capacity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Club (Optional)
                    </label>
                    <select
                        name="club_id"
                        value={formData.club_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">No Club</option>
                        {clubs.map(club => (
                            <option key={club.id} value={club.id}>
                                {club.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Event'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditEvent;