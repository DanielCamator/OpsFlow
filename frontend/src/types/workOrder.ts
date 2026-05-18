export enum WorkOrderPriority {
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

export enum WorkOrderStatus {
    New = 0,
    InProgress = 1,
    Blocked = 2,
    Completed = 3,
    Cancelled = 4
}

export interface CreateWorkOrderDto {
    title: string;
    description: string;
    customerName: string;
    priority: WorkOrderPriority;
    dueDate?: string;
}

export interface AssignWorkOrderDto {
    assignedToId: string;
}

export interface WorkOrderQueryParameters {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    status?: WorkOrderStatus;
    priority?: WorkOrderPriority;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}