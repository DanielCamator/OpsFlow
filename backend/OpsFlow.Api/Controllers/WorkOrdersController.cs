using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpsFlow.Infrastructure.Data;

namespace OpsFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkOrdersController : ControllerBase
    {
        private readonly OpsFlowDbContext _context;

        public WorkOrdersController(OpsFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet("test")]
        public async Task<IActionResult> GetSeededOrders()
        {
            var orders = await _context.WorkOrders
                .Include(w => w.CreatedBy)
                .Include(w => w.AssignedTo)
                .ToListAsync();

            var response = orders.Select(w => new
            {
                w.Id,
                w.Title,
                w.Description,
                w.CustomerName,
                Status = w.Status.ToString(),
                Priority = w.Priority.ToString(),
                w.DueDate,
                w.CreatedAt,
                IsOverdue = w.IsOverdue(),
                CreatedBy = new
                {
                    w.CreatedBy.Id,
                    w.CreatedBy.Username,
                    Role = w.CreatedBy.Role.ToString()
                },
                AssignedTo = w.AssignedTo != null ? new
                {
                    w.AssignedTo.Id,
                    w.AssignedTo.Username,
                    Role = w.AssignedTo.Role.ToString()
                } : null
            });

            return Ok(response);
        }
    }
}
