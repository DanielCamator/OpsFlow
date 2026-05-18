import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface DashboardMetrics {
    total: number;
    new: number;
    assigned: number;
    inProgress: number;
    blocked: number;
    completed: number;
    cancelled: number;
    urgent: number;
    unassigned: number;
    overdue: number;
}

export const DashboardView = () => {
    const { token } = useAuth();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch(`${API_URL}/api/dashboard`, {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch telemetry payload.');

                const data = await response.json();
                setMetrics(data);
            } catch (err: any) {
                setError(err.message || 'Error communicating with Dashboard API.');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 font-mono text-sm text-slate-500">
                <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-4"></div>
                Syncing system telemetry matrix...
            </div>
        );
    }

    if (error || !metrics) {
        return (
            <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-400 font-mono rounded-lg text-sm">
                ⚠️ Telemetry Link Error: {error}
            </div>
        );
    }

    const getPercentage = (value: number) => {
        if (!metrics || !metrics.total) return '0%';
        return `${Math.round((value / metrics.total) * 100)}%`;
    };

    return (
        <div className="space-y-8">
            
            {/* CUADRÍCULA DE TARJETAS KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Pipeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-cyan-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Registry</p>
                            <h3 className="text-4xl font-black text-white mt-2 font-mono">{metrics.total ?? 0}</h3>
                        </div>
                        <div className="p-2 bg-cyan-950/40 rounded-lg text-cyan-400 border border-cyan-900/60">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-mono">Global context footprint.</p>
                </div>

                {/* Urgent Threats */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-red-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Urgent Threats</p>
                            <h3 className="text-4xl font-black text-red-400 mt-2 font-mono flex items-center gap-2">
                                {metrics.urgent ?? 0}
                                {(metrics.urgent ?? 0) > 0 && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>}
                            </h3>
                        </div>
                        <div className="p-2 bg-red-950/40 rounded-lg text-red-400 border border-red-900/60">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-mono">Immediate execution criticals.</p>
                </div>

                {/* Overdue Breaches */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Overdue Breaches</p>
                            <h3 className="text-4xl font-black text-amber-400 mt-2 font-mono">{metrics.overdue ?? 0}</h3>
                        </div>
                        <div className="p-2 bg-amber-950/40 rounded-lg text-amber-400 border border-amber-900/60">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-mono">Active items past target SLA.</p>
                </div>

                {/* Unassigned Backlog */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Unassigned</p>
                            <h3 className="text-4xl font-black text-purple-400 mt-2 font-mono">{metrics.unassigned ?? 0}</h3>
                        </div>
                        <div className="p-2 bg-purple-950/40 rounded-lg text-purple-400 border border-purple-900/60">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 font-mono">Awaiting operator dispatch.</p>
                </div>

            </div>

            {/* SECCIÓN DE DESGLOSE COMPLETO DE BARRAS DE STATUS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                <h4 className="text-sm font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 mb-6">
                    Active Pipeline Status Allocation
                </h4>

                <div className="space-y-6">
                    {/* [0] New */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-cyan-400">// Status: New</span>
                            <span className="text-slate-300">
                                {metrics.new ?? 0} orders ({getPercentage(metrics.new ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-cyan-500 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.new ?? 0) }}></div>
                        </div>
                    </div>

                    {/* [1] Assigned */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-blue-400">// Status: Assigned</span>
                            <span className="text-slate-300">
                                {metrics.assigned ?? 0} orders ({getPercentage(metrics.assigned ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-blue-500 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.assigned ?? 0) }}></div>
                        </div>
                    </div>

                    {/* [2] In Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-purple-400">// Status: In Progress</span>
                            <span className="text-slate-300">
                                {metrics.inProgress ?? 0} orders ({getPercentage(metrics.inProgress ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-purple-500 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.inProgress ?? 0) }}></div>
                        </div>
                    </div>

                    {/* [3] Blocked */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-amber-500">// Status: Blocked</span>
                            <span className="text-slate-300">
                                {metrics.blocked ?? 0} orders ({getPercentage(metrics.blocked ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-amber-500 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.blocked ?? 0) }}></div>
                        </div>
                    </div>

                    {/* [4] Completed */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-emerald-400">// Status: Completed</span>
                            <span className="text-slate-300">
                                {metrics.completed ?? 0} orders ({getPercentage(metrics.completed ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-emerald-500 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.completed ?? 0) }}></div>
                        </div>
                    </div>

                    {/* [5] Cancelled */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-500">// Status: Cancelled</span>
                            <span className="text-slate-300">
                                {metrics.cancelled ?? 0} orders ({getPercentage(metrics.cancelled ?? 0)})
                            </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div className="bg-slate-700 h-2 transition-all duration-500" style={{ width: getPercentage(metrics.cancelled ?? 0) }}></div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};