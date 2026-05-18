import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WorkOrderPriority } from '../types/workOrder';
import { API_URL } from '../config';

interface AgentListItem {
    id: string;
    name: string;
    email: string;
}

export const CreateWorkOrderView = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        customerName: '',
        priority: WorkOrderPriority.Medium,
        dueDate: '',
        assignedToId: ''
    });

    const [agents, setAgents] = useState<AgentListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
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
                console.error("Error loading agents for initialization", e);
            }
        };
        fetchAgents();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'priority' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGlobalError(null);
        setFieldErrors({});

        if (form.title.trim().length < 5) {
            setGlobalError('Client Validation: Title must be at least 5 characters long.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/workorders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    customerName: form.customerName,
                    priority: form.priority,
                    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                    assignedToId: form.assignedToId === '' ? null : form.assignedToId 
                })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData = await response.json();
                    if (errorData.errors) {
                        setFieldErrors(errorData.errors);
                        throw new Error('Please fix the validation errors below.');
                    }
                }
                throw new Error('Failed to create the work order. Server error.');
            }

            navigate('/work-orders');
        } catch (err: any) {
            setGlobalError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            
            <h2 className="text-xl font-bold text-slate-100 mb-6 font-mono uppercase tracking-wider text-cyan-400">
                Create New Work Order
            </h2>

            {globalError && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm font-mono">
                    ⚠️ {globalError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Order Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={form.title}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-white outline-none"
                            placeholder="Describe the core requirement"
                        />
                        {fieldErrors.Title?.map((err, i) => (
                            <p key={i} className="text-red-400 text-xs mt-1 font-mono">{err}</p>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Customer Name</label>
                        <input
                            type="text"
                            name="customerName"
                            required
                            value={form.customerName}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-white outline-none"
                            placeholder="Client company or individual"
                        />
                        {fieldErrors.CustomerName?.map((err, i) => (
                            <p key={i} className="text-red-400 text-xs mt-1 font-mono">{err}</p>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Priority Level</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none"
                        >
                            <option value={WorkOrderPriority.Low}>Low</option>
                            <option value={WorkOrderPriority.Medium}>Medium</option>
                            <option value={WorkOrderPriority.High}>High</option>
                            <option value={WorkOrderPriority.Urgent}>Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Target Date (Optional)</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={form.dueDate}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Assign Operator (Optional)</label>
                        <select
                            name="assignedToId"
                            value={form.assignedToId}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none font-sans"
                        >
                            <option value="">Unassigned</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.AssignedToId?.map((err, i) => (
                            <p key={i} className="text-red-400 text-xs mt-1 font-mono">{err}</p>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Detailed Description</label>
                    <textarea
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2.5 text-sm text-white outline-none resize-none"
                        placeholder="Provide deep context, technical specs, or specific requests..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                    <button
                        type="button"
                        onClick={() => navigate('/work-orders')}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium rounded-lg transition-colors text-slate-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-slate-950 font-medium text-sm rounded-lg transition-colors shadow-lg shadow-cyan-950/20 flex items-center gap-2"
                    >
                        {loading && <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>}
                        Save Work Order
                    </button>
                </div>
            </form>
        </div>
    );
};