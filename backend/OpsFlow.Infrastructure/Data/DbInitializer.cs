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
            var agentId = Guid.NewGuid();

            var users = new User[]
            {
                new User { Id = adminId, Username = "admin", Email = "admin@opsflow.com", PasswordHash = "admin123", Role = UserRole.Admin },
                new User { Id = managerId, Username = "manager", Email = "manager@opsflow.com", PasswordHash = "manager123", Role = UserRole.Manager },
                new User { Id = agentId, Username = "agent", Email = "agent@opsflow.com", PasswordHash = "agent123", Role = UserRole.Agent },
                new User { Id = Guid.NewGuid(), Username = "viewer", Email = "viewer@opsflow.com", PasswordHash = "viewer123", Role = UserRole.Viewer }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            var orders = new WorkOrder[]
            {
                CreateOrder("Inverter Inspection", "The main inverter is showing a voltage error.", "Solar Solutions LLC", adminId),
                
                CreateAssignedOrder("Preventive Maintenance", "Cleaning of panels in sector B.", "Acme Corp", managerId, agentId, DateTime.UtcNow.AddDays(-2))
            };

            context.WorkOrders.AddRange(orders);
            context.SaveChanges();
        }

        private static WorkOrder CreateOrder(string title, string desc, string customer, Guid createdBy)
        {
            var order = new WorkOrder { Title = title, Description = desc, CustomerName = customer, CreatedById = createdBy };
            return order;
        }

        private static WorkOrder CreateAssignedOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate)
        {
            var order = new WorkOrder { Title = title, Description = desc, CustomerName = customer, CreatedById = createdBy, DueDate = dueDate };
            order.AssignTo(assignedTo);
            return order;
        }
    }
}