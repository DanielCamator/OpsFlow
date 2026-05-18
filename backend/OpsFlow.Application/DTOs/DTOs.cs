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

    public class WorkOrderQueryParameters
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public OpsFlow.Domain.Enums.WorkOrderStatus? Status { get; set; }
        public OpsFlow.Domain.Enums.WorkOrderPriority? Priority { get; set; }
        public string? SortBy { get; set; } = "CreatedAt";
        public bool SortDescending { get; set; } = true;
    }

    public class PagedResponse<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}