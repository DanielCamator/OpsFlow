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
    public class UsersController : ControllerBase
    {
        private readonly OpsFlowDbContext _context;

        public UsersController(OpsFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
        {
            var agents = await _context.Users
                .Where(u => u.Role == UserRole.Agent)
                .Select(u => new
                {
                    Id = u.Id,
                    Name = u.Username,
                    Email = u.Email
                })
                .ToListAsync();

            return Ok(agents);
        }
    }
}
