using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpsFlow.Domain.Enums;
using OpsFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace OpsFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly OpsFlowDbContext _context;

        public DashboardController(OpsFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMetrics()
        {
            var now = DateTime.UtcNow;

            var metrics = new
            {
                Total = await _context.WorkOrders.CountAsync(),
                New = await _context.WorkOrders.CountAsync(w => w.Status == WorkOrderStatus.New),
                InProgress = await _context.WorkOrders.CountAsync(w => w.Status == WorkOrderStatus.InProgress),
                Blocked = await _context.WorkOrders.CountAsync(w => w.Status == WorkOrderStatus.Blocked),
                Overdue = await _context.WorkOrders.CountAsync(w =>
                    w.Status != WorkOrderStatus.Completed &&
                    w.Status != WorkOrderStatus.Cancelled &&
                    w.DueDate.HasValue && w.DueDate < now)
            };

            return Ok(metrics);
        }
    }
}
