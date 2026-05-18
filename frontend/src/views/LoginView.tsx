import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const SEEDED_USERS = [
    { email: 'admin@opsflow.com', pass: 'admin123', role: 'Admin', color: 'border-cyan-500/30 text-cyan-400' },
    { email: 'manager@opsflow.com', pass: 'manager123', role: 'Manager', color: 'border-blue-500/30 text-blue-400' },
    { email: 'agent1@opsflow.com', pass: 'agent123', role: 'Agent1', color: 'border-purple-500/30 text-purple-400' },
    { email: 'agent2@opsflow.com', pass: 'agent123', role: 'Agent2', color: 'border-purple-500/30 text-purple-400' },
    { email: 'viewer@opsflow.com', pass: 'viewer123', role: 'Viewer', color: 'border-slate-500/30 text-slate-400' },
];

export const LoginView = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleQuickSelect = (uEmail: string, uPass: string) => {
        setEmail(uEmail);
        setPassword(uPass);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Invalid credentials or server error.');
            }

            const data = await response.json();
            
            if (data.token) {
                login(data.token);
                navigate('/');
            } else {
                throw new Error('Token not found in response.');
            }
        } catch (err: any) {
            setError(err.message || 'Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
            
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        OpsFlow
                    </h1>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">
                        Work Order Management System
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                    
                    <h2 className="text-xl font-semibold mb-6 text-slate-200">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 text-red-400 text-sm rounded-lg font-mono">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 font-medium text-sm text-slate-950 py-3 rounded-lg transition-colors flex justify-center items-center shadow-lg shadow-cyan-950/20"
                        >
                            {loading ? (
                                <span className="inline-block animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 bg-slate-900/40 border border-slate-900 p-5 rounded-xl">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 text-center">
                        Reviewer Quick Access (Seeded Users)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {SEEDED_USERS.map((u) => (
                            <button
                                key={u.role}
                                type="button"
                                onClick={() => handleQuickSelect(u.email, u.pass)}
                                className={`p-2 bg-slate-900/60 hover:bg-slate-900 border ${u.color} rounded-lg text-left transition-all hover:scale-[1.02]`}
                            >
                                <p className="text-xs font-bold font-mono uppercase">{u.role}</p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{u.email}</p>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};