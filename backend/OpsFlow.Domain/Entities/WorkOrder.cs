using OpsFlow.Domain.Common;
using OpsFlow.Domain.Enums;

namespace OpsFlow.Domain.Entities
{
    public class WorkOrder : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        public WorkOrderPriority Priority { get; set; } = WorkOrderPriority.Medium;
        public WorkOrderStatus Status { get; private set; } = WorkOrderStatus.New;

        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; private set; }

        public Guid CreatedById { get; set; }
        public User CreatedBy { get; set; } = null!;

        public Guid? AssignedToId { get; set; }
        public User? AssignedTo { get; set; }

        public void AssignTo(Guid userId)
        {
            if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
                throw new InvalidOperationException("You cannot assign a closed order.");

            AssignedToId = userId;
            Status = WorkOrderStatus.Assigned;
            SetUpdateDate();
        }

        public void StartWork()
        {
            if (Status == WorkOrderStatus.New)
                throw new InvalidOperationException("The order must be assigned before starting.");

            if (Status != WorkOrderStatus.Assigned && Status != WorkOrderStatus.Blocked)
                throw new InvalidOperationException("The order must be assigned or blocked to start/resume work.");

            Status = WorkOrderStatus.InProgress;
            SetUpdateDate();
        }

        public void ReportBlocked()
        {
            if (Status != WorkOrderStatus.InProgress)
                throw new InvalidOperationException("Only an order in progress can be blocked.");

            Status = WorkOrderStatus.Blocked;
            SetUpdateDate();
        }

        public void Complete()
        {
            if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
                throw new InvalidOperationException("The order is already closed.");

            Status = WorkOrderStatus.Completed;
            CompletedAt = DateTime.UtcNow;
            SetUpdateDate();
        }

        public void Cancel()
        {
            if (Status == WorkOrderStatus.Completed)
                throw new InvalidOperationException("You cannot cancel an order that has already been completed.");

            Status = WorkOrderStatus.Cancelled;
            SetUpdateDate();
        }

        public bool IsOverdue()
        {
            if (Status == WorkOrderStatus.Completed || Status == WorkOrderStatus.Cancelled)
                return false;

            return DueDate.HasValue && DueDate.Value < DateTime.UtcNow;
        }
    }
}
