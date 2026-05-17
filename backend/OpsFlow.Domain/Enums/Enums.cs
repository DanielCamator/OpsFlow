namespace OpsFlow.Domain.Enums
{
    public enum WorkOrderStatus
    {
        New,
        Assigned,
        InProgress,
        Blocked,
        Completed,
        Cancelled
    }

    public enum WorkOrderPriority
    {
        Low,
        Medium,
        High,
        Urgent
    }

    public enum UserRole
    {
        Admin,
        Manager,
        Agent,
        Viewer
    }
}
