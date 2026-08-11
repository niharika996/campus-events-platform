import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import Dashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" />;
    }
    
    return children;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Events />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/my-events" element={
                        <ProtectedRoute>
                            <MyEvents />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute adminOnly>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin/create" element={
                        <ProtectedRoute adminOnly>
                            <CreateEvent />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;