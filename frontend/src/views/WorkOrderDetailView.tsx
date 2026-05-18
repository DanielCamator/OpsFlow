import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WorkOrderPriority, WorkOrderStatus } from '../types/workOrder';
import { API_URL } from '../config';

interface WorkOrderDetails {
    id: string;
    title: string;
    description: string;
    customerName: string;
    status: number;
    priority: number;
    dueDate: string | null;
    assignedToId: string | null;
}

interface AgentListItem {
    id: string;
    name: string;
    email: string;
}

export const WorkOrderDetailView = () => {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const isViewer = user?.role?.toLowerCase() === 'viewer';

    const [order, setOrder] = useState<WorkOrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<WorkOrderDetails>>({});
    const [agents, setAgents] = useState<AgentListItem[]>([]);

    const parseStatusStringToNumber = (statusStr: string | number): number => {
        if (typeof statusStr === 'number') return statusStr;
        const mapping: Record<string, number> = {
            'new': 0, 'assigned': 1, 'inprogress': 2, 'blocked': 3, 'completed': 4, 'cancelled': 5
        };
        return mapping[statusStr.toLowerCase()] ?? 0;
    };

    const parsePriorityStringToNumber = (priorityStr: string | number): number => {
        if (typeof priorityStr === 'number') return priorityStr;
        const mapping: Record<string, number> = {
            'low': 0, 'medium': 1, 'high': 2, 'urgent': 3
        };
        return mapping[priorityStr.toLowerCase()] ?? 0;
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${API_URL}/api/workorders/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Could not retrieve work order details.');
                const data = await response.json();
                
                data.status = parseStatusStringToNumber(data.status ?? data.Status);
                data.priority = parsePriorityStringToNumber(data.priority ?? data.Priority);

                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, token]);

    useEffect(() => {
        if (isViewer) return;
        const fetchAgents = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/agents`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAgents(data);
                } else {
                    setAgents([
                        { id: '22222222-2222-2222-2222-222222222222', name: 'Agent Support Alpha', email: 'agent@opsflow.com' },
                        { id: '33333333-3333-3333-3333-333333333333', name: 'John Doe Agent', email: 'johndoe@opsflow.com' }
                    ]);
                }
            } catch (e) {
                console.error("Error fetching agents catalog", e);
            }
        };
        fetchAgents();
    }, [token, isViewer]);

    const handleStartEditing = () => {
        if (!order) return;
        setEditForm({
            title: order.title,
            customerName: order.customerName,
            description: order.description,
            dueDate: order.dueDate ? order.dueDate.split('T')[0] : ''
        });
        setIsEditing(true);
    };

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order || isViewer) return;
        setUpdating(true);
        setActionError(null);
        try {
            const response = await fetch(`${API_URL}/api/workorders/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editForm.title,
                    customerName: editForm.customerName,
                    description: editForm.description,
                    dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
                    priority: order.priority,
                    status: order.status
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to update structural fields.');
            }

            setOrder(prev => prev ? {
                ...prev,
                title: editForm.title!,
                customerName: editForm.customerName!,
                description: editForm.description!,
                dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null
            } : null);
            setIsEditing(false);
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateStatusOrPriority = async (field: 'status' | 'priority', value: number) => {
        if (isViewer) return;
        setUpdating(true);
        setActionError(null);
        try {
            let url = `${API_URL}/api/workorders/${id}`;
            let body: any = null;

            if (field === 'priority') {
                url = `${API_URL}/api/workorders/${id}`;
                body = JSON.stringify({
                    title: order?.title,
                    customerName: order?.customerName,
                    description: order?.description,
                    dueDate: order?.dueDate,
                    priority: value
                });
            } else if (field === 'status') {
                if (value === 2) url += '/status/start';
                else if (value === 3) url += '/status/block';
                else if (value === 4) url += '/status/complete';
                else if (value === 5) url += '/status/cancel';
                else {
                    throw new Error("Transición directa de estado no permitida por las reglas de negocio.");
                }
                body = null;
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: body
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to update ${field}.`);
            }
            
            setOrder(prev => prev ? { ...prev, [field]: value } : null);
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignAgent = async (agentId: string) => {
        if (isViewer) return;
        if (!order) return;

        if (agentId === "" && order.assignedToId) {
            setActionError("Domain Violation: Once assigned, the work order cannot be reverted to unassigned.");
            return;
        }

        setUpdating(true);
        setActionError(null);
        try {
            const response = await fetch(`${API_URL}/api/workorders/${id}/assign`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ assignedToId: agentId === "" ? null : agentId })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to assign the work order.');
            }
            
            setOrder(prev => prev ? { 
                ...prev, 
                assignedToId: agentId === "" ? null : agentId, 
                status: agentId === "" ? prev.status : 1 
            } : null);
        } catch (err: any) {
            setActionError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center font-mono text-sm text-slate-500 py-12">Loading order matrix...</div>;
    if (error || !order) return <div className="p-4 bg-red-950/20 border border-red-900/50 text-red-400 font-mono rounded-lg">{error || 'Order not found.'}</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                {isEditing ? (
                    <form onSubmit={handleSaveDetails} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Order Title</label>
                            <input
                                type="text"
                                required
                                value={editForm.title || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Customer Name</label>
                            <input
                                type="text"
                                required
                                value={editForm.customerName || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Due Date</label>
                            <input
                                type="date"
                                value={editForm.dueDate || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Description</label>
                            <textarea
                                rows={5}
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium text-xs rounded-lg transition-colors">Save Matrix Changes</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div>
                            <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest">Order ID: {order.id.slice(0, 8)}...</span>
                            <h2 className="text-2xl font-bold text-white mt-1">{order.title}</h2>
                            <p className="text-sm text-slate-400 mt-2 font-mono">Customer: <span className="text-slate-200">{order.customerName}</span></p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4">
                            <h3 className="text-xs font-mono uppercase text-slate-400 mb-2">Description</h3>
                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-sm text-slate-300 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                                {order.description || 'No additional details provided for this work order.'}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-800/60">
                            <button onClick={() => navigate('/work-orders')} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors">← Back to List</button>
                            {!isViewer && (
                                <button onClick={handleStartEditing} className="text-xs bg-slate-800 border border-slate-700 hover:border-cyan-500/50 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-all">🔧 Edit Details</button>
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
                {updating && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-center items-center z-10">
                        <div className="animate-spin h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
                
                <div className="space-y-6">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
                        Operational Controls
                    </h3>

                    {actionError && (
                        <div className="p-3 bg-red-950/40 border border-red-800 text-red-400 text-xs rounded-lg font-mono flex items-start gap-1 justify-between shadow-inner">
                            <span>⚠️ {actionError}</span>
                            <button onClick={() => setActionError(null)} className="text-red-400/60 hover:text-red-400 font-bold ml-1 text-sm leading-none">×</button>
                        </div>
                    )}

                    {isViewer && (
                        <div className="p-3 bg-slate-950 border border-slate-800 text-slate-500 text-xs rounded-lg font-mono">
                            🔒 Mode: Read-Only. Your account permissions do not allow alterations.
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Current Status</label>
                        <select
                            disabled={isViewer}
                            value={order.status}
                            onChange={(e) => handleUpdateStatusOrPriority('status', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-cyan-500/40 disabled:opacity-50"
                        >
                            <option value={WorkOrderStatus.New}>New</option>
                            <option value={WorkOrderStatus.Assigned}>Assigned</option>
                            <option value={WorkOrderStatus.InProgress}>In Progress</option>
                            <option value={WorkOrderStatus.Blocked}>Blocked</option>
                            <option value={WorkOrderStatus.Completed}>Completed</option>
                            <option value={WorkOrderStatus.Cancelled}>Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Priority Level</label>
                        <select
                            disabled={isViewer}
                            value={order.priority}
                            onChange={(e) => handleUpdateStatusOrPriority('priority', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-cyan-500/40 disabled:opacity-50"
                        >
                            <option value={WorkOrderPriority.Low}>Low</option>
                            <option value={WorkOrderPriority.Medium}>Medium</option>
                            <option value={WorkOrderPriority.High}>High</option>
                            <option value={WorkOrderPriority.Urgent}>Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Assigned Operator (Agent)</label>
                        <select
                            disabled={isViewer}
                            value={order.assignedToId || ''}
                            onChange={(e) => handleAssignAgent(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-cyan-500/40 disabled:opacity-50 font-sans"
                        >
                            <option value="" disabled={!!order.assignedToId}>
                                Unassigned {order.assignedToId ? '🔒 (Locked)' : ''}
                            </option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <span className="block text-xs font-mono uppercase text-slate-500 mb-1">Target Completion</span>
                        <span className="text-sm font-mono text-slate-300">
                            {(() => {
                                const rawDate = order.dueDate || (order as any).DueDate;
                                return rawDate ? new Date(rawDate).toLocaleDateString() : 'No deadline defined';
                            })()}
                        </span>
                    </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 text-center mt-6 border-t border-slate-800/60 pt-4">
                    Security Policy Scope: {user?.role}
                </div>
            </div>

        </div>
    );
};