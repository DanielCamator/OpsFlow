using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpsFlow.Application.DTOs;
using OpsFlow.Domain.Entities;
using OpsFlow.Infrastructure.Data;
using System.Security.Claims;

namespace OpsFlow.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkOrdersController : ControllerBase
    {
        private readonly OpsFlowDbContext _context;

        public WorkOrdersController(OpsFlowDbContext context)
        {
            _context = context;
        }

        // GET: api/workorders
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.WorkOrders
                .Include(w => w.CreatedBy)
                .Include(w => w.AssignedTo)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new
                {
                    w.Id,
                    w.Title,
                    w.CustomerName,
                    Status = w.Status.ToString(),
                    Priority = w.Priority.ToString(),
                    w.CreatedAt,
                    IsOverdue = w.IsOverdue(),
                    AssignedTo = w.AssignedTo != null ? w.AssignedTo.Username : "Unassigned"
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/workorders/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _context.WorkOrders
                .Include(w => w.CreatedBy)
                .Include(w => w.AssignedTo)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (order == null) return NotFound();

            return Ok(new
            {
                order.Id,
                order.Title,
                order.Description,
                order.CustomerName,
                Status = order.Status.ToString(),
                Priority = order.Priority.ToString(),
                order.DueDate,
                order.CreatedAt,
                order.CompletedAt,
                CreatedBy = order.CreatedBy.Username,
                AssignedTo = order.AssignedTo != null ? order.AssignedTo.Username : null,
                AssignedToId = order.AssignedToId
            });
        }

        // POST: api/workorders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkOrderDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

            var workOrder = new WorkOrder
            {
                Title = dto.Title,
                Description = dto.Description,
                CustomerName = dto.CustomerName,
                Priority = dto.Priority,
                DueDate = dto.TargetDate,
                CreatedById = userId
            };

            _context.WorkOrders.Add(workOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = workOrder.Id }, workOrder);
        }

        // PUT: api/workorders/{id}/assign
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> Assign(Guid id, [FromBody] AssignWorkOrderDto dto)
        {
            var order = await _context.WorkOrders.FindAsync(id);
            if (order == null) return NotFound();

            try
            {
                order.AssignTo(dto.AssignedToId);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/workorders/{id}/status/start
        [HttpPut("{id}/status/start")]
        public async Task<IActionResult> StartWork(Guid id)
        {
            var order = await _context.WorkOrders.FindAsync(id);
            if (order == null) return NotFound();

            try
            {
                order.StartWork();
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // PUT: api/workorders/{id}/status/complete
        [HttpPut("{id}/status/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var order = await _context.WorkOrders.FindAsync(id);
            if (order == null) return NotFound();

            try
            {
                order.Complete();
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
