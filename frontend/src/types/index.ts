export enum WorkOrderStatus {
  New = "New",
  InProgress = "InProgress",
  Blocked = "Blocked",
  Completed = "Completed",
  Cancelled = "Cancelled"
}

export enum WorkOrderPriority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Urgent = "Urgent"
}

export interface CreateWorkOrderDto {
  title: string;
  description: string;
  customerName: string;
  priority: WorkOrderPriority;
  targetDate?: string;
}

export interface AssignWorkOrderDto {
  assignedToId: string;
}

export interface WorkOrderQueryParameters {
  pageNumber: number;
  pageSize: number;
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


export interface WorkOrderDto {
  id: string;
  title: string;
  description: string;
  customerName: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  targetDate?: string;
  createdAt: string;
  updatedAt?: string;
  assignedToId?: string;
}