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
        public async Task<IActionResult> GetAll([FromQuery] WorkOrderQueryParameters queryParams)
        {
            var query = _context.WorkOrders
                .Include(w => w.CreatedBy)
                .Include(w => w.AssignedTo)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var search = queryParams.SearchTerm.ToLower();
                query = query.Where(w =>
                    w.Title.ToLower().Contains(search) ||
                    w.CustomerName.ToLower().Contains(search));
            }

            if (queryParams.Status.HasValue)
                query = query.Where(w => w.Status == queryParams.Status.Value);

            if (queryParams.Priority.HasValue)
                query = query.Where(w => w.Priority == queryParams.Priority.Value);

            query = queryParams.SortBy?.ToLower() switch
            {
                "title" => queryParams.SortDescending ? query.OrderByDescending(w => w.Title) : query.OrderBy(w => w.Title),
                "duedate" => queryParams.SortDescending ? query.OrderByDescending(w => w.DueDate) : query.OrderBy(w => w.DueDate),
                _ => queryParams.SortDescending ? query.OrderByDescending(w => w.CreatedAt) : query.OrderBy(w => w.CreatedAt)
            };

            var totalCount = await query.CountAsync();

            var orders = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .Select(w => new
                {
                    w.Id,
                    w.Title,
                    w.CustomerName,
                    Status = w.Status.ToString(),
                    Priority = w.Priority.ToString(),
                    w.CreatedAt,
                    w.DueDate,
                    IsOverdue = w.IsOverdue(),
                    AssignedTo = w.AssignedTo != null ? w.AssignedTo.Username : "Unassigned"
                })
                .ToListAsync();

            var response = new PagedResponse<object>
            {
                Items = orders,
                TotalCount = totalCount,
                PageNumber = queryParams.PageNumber,
                PageSize = queryParams.PageSize
            };

            return Ok(response);
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
        [Authorize(Roles = "Admin,Manager")]
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
                DueDate = dto.DueDate,
                CreatedById = userId
            };

            _context.WorkOrders.Add(workOrder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = workOrder.Id }, workOrder);
        }

        // PUT: api/workorders/{id}/assign
        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Admin,Manager")]
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
        [Authorize(Roles = "Admin,Manager,Agent")]
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
        [Authorize(Roles = "Admin,Manager,Agent")]
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

        // PUT: api/workorders/{id}/status/block
        [HttpPut("{id}/status/block")]
        [Authorize(Roles = "Admin,Manager,Agent")]
        public async Task<IActionResult> Block(Guid id)
        {
            var order = await _context.WorkOrders.FindAsync(id);
            if (order == null) return NotFound();

            try
            {
                order.ReportBlocked();
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // PUT: api/workorders/{id}/status/cancel
        [HttpPut("{id}/status/cancel")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var order = await _context.WorkOrders.FindAsync(id);
            if (order == null) return NotFound();

            try
            {
                order.Cancel();
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
