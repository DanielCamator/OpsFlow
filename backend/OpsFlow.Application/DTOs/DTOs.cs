using OpsFlow.Domain.Enums;

namespace OpsFlow.Application.DTOs
{
    public class CreateWorkOrderDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public WorkOrderPriority Priority { get; set; }
        public DateTime? TargetDate { get; set; }
    }

    public class AssignWorkOrderDto
    {
        public Guid AssignedToId { get; set; }
    }
}