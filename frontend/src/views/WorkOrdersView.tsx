import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { WorkOrderPriority, WorkOrderStatus, WorkOrderQueryParameters, PagedResponse } from '../types/workOrder';
import { API_URL } from '../config';

interface WorkOrderListItem {
    id: string;
    title: string;
    customerName: string;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    dueDate: string | null;
    createdAt: string;
}

export const WorkOrdersView = () => {
    const { token, user } = useAuth();
    
    const rawRole = user?.role || user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const userRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
    const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
    
    const [queryParams, setQueryParams] = useState<WorkOrderQueryParameters>({
        pageNumber: 1,
        pageSize: 10,
        searchTerm: '',
        status: undefined,
        priority: undefined,
        sortBy: 'CreatedAt',
        sortDescending: true
    });

    const [data, setData] = useState<PagedResponse<WorkOrderListItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (queryParams.pageNumber) params.append('pageNumber', queryParams.pageNumber.toString());
            if (queryParams.pageSize) params.append('pageSize', queryParams.pageSize.toString());
            if (queryParams.searchTerm) params.append('searchTerm', queryParams.searchTerm);
            if (queryParams.status !== undefined && queryParams.status !== null) params.append('status', queryParams.status.toString());
            if (queryParams.priority !== undefined && queryParams.priority !== null) params.append('priority', queryParams.priority.toString());
            if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
            if (queryParams.sortDescending !== undefined) params.append('sortDescending', queryParams.sortDescending.toString());

            const response = await fetch(`${API_URL}/api/workorders?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Error al cargar las órdenes de trabajo.');
            
            const result: PagedResponse<WorkOrderListItem> = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkOrders();
    }, [queryParams]);

    const getPriorityBadge = (priority: any) => {
        if (priority === undefined || priority === null) return <span className="text-slate-600">—</span>;
        
        const p = priority.toString().toLowerCase();

        const styles: Record<string, string> = {
            '0': 'bg-slate-900 border-slate-700 text-slate-400',
            'low': 'bg-slate-900 border-slate-700 text-slate-400',
            '1': 'bg-blue-950/40 border-blue-800 text-blue-400',
            'medium': 'bg-blue-950/40 border-blue-800 text-blue-400',
            '2': 'bg-orange-950/40 border-orange-800 text-orange-400',
            'high': 'bg-orange-950/40 border-orange-800 text-orange-400',
            '3': 'bg-red-950/50 border-red-500/50 text-red-400 animate-pulse',
            'urgent': 'bg-red-950/50 border-red-500/50 text-red-400 animate-pulse',
        };

        const labels: Record<string, string> = {
            '0': 'Low', 'low': 'Low',
            '1': 'Medium', 'medium': 'Medium',
            '2': 'High', 'high': 'High',
            '3': 'Urgent', 'urgent': 'Urgent',
        };

        return (
            <span className={`px-2 py-1 text-xs font-mono border rounded-md ${styles[p] || 'bg-slate-800 text-slate-400'}`}>
                {labels[p] || p}
            </span>
        );
    };

    const getStatusBadge = (status: any) => {
        if (status === undefined || status === null) return <span className="text-slate-600">—</span>;
        
        const s = status.toString().toLowerCase();

        const styles: Record<string, string> = {
            '0': 'bg-cyan-950/40 border-cyan-800 text-cyan-400',
            'new': 'bg-cyan-950/40 border-cyan-800 text-cyan-400',
            '1': 'bg-blue-950/40 border-blue-800 text-blue-400',
            'assigned': 'bg-blue-950/40 border-blue-800 text-blue-400',
            '2': 'bg-purple-950/40 border-purple-800 text-purple-400',
            'inprogress': 'bg-purple-950/40 border-purple-800 text-purple-400',
            '3': 'bg-amber-950/40 border-amber-800 text-amber-400',
            'blocked': 'bg-amber-950/40 border-amber-800 text-amber-400',
            '4': 'bg-emerald-950/40 border-emerald-800 text-emerald-400',
            'completed': 'bg-emerald-950/40 border-emerald-800 text-emerald-400',
            '5': 'bg-zinc-900 border-zinc-800 text-zinc-500',
            'cancelled': 'bg-zinc-900 border-zinc-800 text-zinc-500',
        };

        const labels: Record<string, string> = {
            '0': 'New', 'new': 'New',
            '1': 'Assigned', 'assigned': 'Assigned',
            '2': 'In Progress', 'inprogress': 'In Progress',
            '3': 'Blocked', 'blocked': 'Blocked',
            '4': 'Completed', 'completed': 'Completed',
            '5': 'Cancelled', 'cancelled': 'Cancelled',
        };

        return (
            <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${styles[s] || 'bg-slate-800 text-slate-400'}`}>
                {labels[s] || s}
            </span>
        );
    };

    const totalCount = data?.totalCount ?? (data as any)?.TotalCount ?? 0;
    const currentPage = data?.pageNumber ?? (data as any)?.PageNumber ?? 1;
    const pageSize = data?.pageSize ?? (data as any)?.PageSize ?? 10;
    
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1 max-w-3xl">
                    
                    <input
                        type="text"
                        placeholder="Search by title or customer..."
                        value={queryParams.searchTerm}
                        onChange={(e) => setQueryParams(prev => ({ ...prev, searchTerm: e.target.value, pageNumber: 1 }))}
                        className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 focus:border-cyan-500/40 rounded-lg px-4 py-2 text-sm text-white outline-none transition-colors"
                    />

                    <select
                        value={queryParams.status ?? ''}
                        onChange={(e) => setQueryParams(prev => ({ ...prev, status: e.target.value === '' ? undefined : Number(e.target.value), pageNumber: 1 }))}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-cyan-500/40"
                    >
                        <option value="">All Statuses</option>
                        <option value={WorkOrderStatus.New}>New</option>
                        <option value={WorkOrderStatus.Assigned}>Assigned</option>
                        <option value={WorkOrderStatus.InProgress}>In Progress</option>
                        <option value={WorkOrderStatus.Blocked}>Blocked</option>
                        <option value={WorkOrderStatus.Completed}>Completed</option>
                        <option value={WorkOrderStatus.Cancelled}>Cancelled</option>
                    </select>

                    <select
                        value={queryParams.priority ?? ''}
                        onChange={(e) => setQueryParams(prev => ({ ...prev, priority: e.target.value === '' ? undefined : Number(e.target.value), pageNumber: 1 }))}
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-cyan-500/40"
                    >
                        <option value="">All Priorities</option>
                        <option value={WorkOrderPriority.Low}>Low</option>
                        <option value={WorkOrderPriority.Medium}>Medium</option>
                        <option value={WorkOrderPriority.High}>High</option>
                        <option value={WorkOrderPriority.Urgent}>Urgent</option>
                    </select>
                </div>

                {isAdminOrManager && (
                    <Link 
                        to="/work-orders/new"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium text-sm rounded-lg transition-colors shadow-lg shadow-cyan-950/20 text-center inline-block"
                    >
                        + New Work Order
                    </Link>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg font-mono text-sm">
                    ⚠️ Error: {error}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
                
                {loading && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-center items-center z-10">
                        <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-mono uppercase tracking-wider text-slate-400">
                                <th className="p-4">Title</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Priority</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Target Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-sm">
                            {data && data.items.length > 0 ? (
                                data.items.map((order: any) => {
                                    const priorityVal = order.priority !== undefined ? order.priority : order.Priority;
                                    const statusVal = order.status !== undefined ? order.status : order.Status;
                                    const dateVal = order.dueDate !== undefined ? order.dueDate : order.DueDate;
                                    const titleVal = order.title !== undefined ? order.title : order.Title;
                                    const customerVal = order.customerName !== undefined ? order.customerName : order.CustomerName;
                                    const idVal = order.id !== undefined ? order.id : order.Id;

                                    return (
                                        <tr key={idVal} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-4 font-medium text-white group-hover:text-cyan-400 transition-colors">
                                                {titleVal}
                                            </td>
                                            <td className="p-4 text-slate-400">{customerVal}</td>
                                            <td className="p-4">{getPriorityBadge(priorityVal)}</td>
                                            <td className="p-4">{getStatusBadge(statusVal)}</td>
                                            <td className="p-4 font-mono text-xs text-slate-400">
                                                {(() => {
                                                    const rawDate = dateVal;
                                                    if (!rawDate) return '—';
                                                    const date = new Date(rawDate);
                                                    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
                                                })()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link 
                                                    to={`/work-orders/${idVal}`}
                                                    className="text-xs bg-slate-800 border border-slate-700 hover:border-cyan-500/50 hover:text-white px-3 py-1.5 rounded transition-all inline-block text-center"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-500 font-mono text-sm">
                                            No work orders found matching the criteria.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {data && totalPages > 1 && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between font-mono text-xs text-slate-400">
                        <div>
                            Showing page <span className="text-slate-200">{currentPage}</span> of <span className="text-slate-200">{totalPages}</span> ({totalCount} total items)
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage <= 1}
                                onClick={() => setQueryParams(prev => ({ ...prev, pageNumber: currentPage - 1 }))}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded disabled:opacity-40 disabled:hover:border-slate-700 hover:border-slate-500 text-white transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() => setQueryParams(prev => ({ ...prev, pageNumber: currentPage + 1 }))}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded disabled:opacity-40 disabled:hover:border-slate-700 hover:border-slate-500 text-white transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};