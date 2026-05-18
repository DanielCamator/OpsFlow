import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard' },
        { path: '/work-orders', label: 'Work Orders' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">OpsFlow</h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">System Control</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path}
                            className={`block px-4 py-3 rounded-lg transition-colors ${
                                location.pathname === item.path 
                                ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                                : 'hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="mb-4 px-2">
                        <p className="text-sm text-white">{user?.email}</p>
                        <p className="text-xs text-emerald-400 font-mono mt-1">Role: {user?.role}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded transition border border-slate-700 hover:border-slate-500"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-slate-800 flex items-center px-8 bg-slate-900/50 backdrop-blur-md">
                    <h2 className="text-lg font-medium text-slate-100">
                        {navItems.find(n => n.path === location.pathname)?.label || 'Overview'}
                    </h2>
                </header>
                <div className="flex-1 overflow-auto p-8">
                    {/*(Dashboard, List, etc) */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};