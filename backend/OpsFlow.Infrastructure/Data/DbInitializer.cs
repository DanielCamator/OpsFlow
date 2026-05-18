using OpsFlow.Domain.Entities;
using OpsFlow.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace OpsFlow.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(OpsFlowDbContext context)
        {
            context.Database.Migrate();

            if (context.Users.Any()) return;

            var adminId = Guid.NewGuid();
            var managerId = Guid.NewGuid();
            var agent1Id = Guid.NewGuid();
            var agent2Id = Guid.NewGuid();

            var users = new User[]
            {
                new User { Id = adminId, Username = "Admin", Email = "admin@opsflow.com", PasswordHash = "admin123", Role = UserRole.Admin },
                new User { Id = managerId, Username = "Manager", Email = "manager@opsflow.com", PasswordHash = "manager123", Role = UserRole.Manager },
                new User { Id = agent1Id, Username = "Agent 1", Email = "agent1@opsflow.com", PasswordHash = "agent123", Role = UserRole.Agent },
                new User { Id = agent2Id, Username = "Agent 2", Email = "agent2@opsflow.com", PasswordHash = "agent123", Role = UserRole.Agent },
                new User { Id = Guid.NewGuid(), Username = "Viewer", Email = "viewer@opsflow.com", PasswordHash = "viewer123", Role = UserRole.Viewer }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            var orders = new WorkOrder[]
            {
                CreateAssignedOrder("Inverter Inspection", "The main inverter is showing a voltage error.", "Solar Solutions LLC", adminId, agent1Id, DateTime.UtcNow.AddDays(2)),
                CreateAssignedOrder("Preventive Maintenance", "Cleaning of panels in sector B.", "Acme Corp", managerId, agent2Id, DateTime.UtcNow.AddDays(-2))
            };

            context.WorkOrders.AddRange(orders);
            context.SaveChanges();
        }

        private static WorkOrder CreateAssignedOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate)
        {
            var order = new WorkOrder { Title = title, Description = desc, CustomerName = customer, CreatedById = createdBy, DueDate = dueDate };
            order.AssignTo(assignedTo);
            return order;
        }
    }
}