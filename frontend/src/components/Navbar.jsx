import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/" className="text-xl font-bold">
                            🎓 Campus Events
                        </Link>
                        <div className="hidden md:flex space-x-4">
                            <Link to="/" className="hover:text-blue-200 transition">
                                Browse Events
                            </Link>
                            <Link to="/my-events" className="hover:text-blue-200 transition">
                                My Events
                            </Link>
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" className="hover:text-blue-200 transition">
                                        Dashboard
                                    </Link>
                                    <Link to="/admin/create" className="hover:text-blue-200 transition">
                                        Create Event
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">
                            👤 {user.name} {user.role === 'admin' && '🔑'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;