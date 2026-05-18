using Microsoft.EntityFrameworkCore;
using OpsFlow.Domain.Entities;
using OpsFlow.Domain.Enums;
using OpsFlow.Infrastructure.Security;

namespace OpsFlow.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(OpsFlowDbContext context)
        {
            context.Database.Migrate();

            if (context.WorkOrders.Any() || context.Users.Any()) return;

            var adminId = Guid.NewGuid();
            var managerId = Guid.NewGuid();
            var agent1Id = Guid.NewGuid();
            var agent2Id = Guid.NewGuid();

            var users = new User[]
            {
                new User { Id = adminId, Username = "Admin", Email = "admin@opsflow.com", PasswordHash = PasswordHasher.HashPassword("admin123"), Role = UserRole.Admin },
                new User { Id = managerId, Username = "Manager", Email = "manager@opsflow.com", PasswordHash = PasswordHasher.HashPassword("manager123"), Role = UserRole.Manager },
                new User { Id = agent1Id, Username = "Agent 1", Email = "agent1@opsflow.com", PasswordHash = PasswordHasher.HashPassword("agent123"), Role = UserRole.Agent },
                new User { Id = agent2Id, Username = "Agent 2", Email = "agent2@opsflow.com", PasswordHash = PasswordHasher.HashPassword("agent123"), Role = UserRole.Agent },
                new User { Id = Guid.NewGuid(), Username = "Viewer", Email = "viewer@opsflow.com", PasswordHash = PasswordHasher.HashPassword("viewer123"), Role = UserRole.Viewer }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            var orders = new List<WorkOrder>
            {
                CreateNewOrder("Solar Panel Installation Request", "Customer wants 12 panels installed on residential roof.", "John Doe", managerId, DateTime.UtcNow.AddDays(5), WorkOrderPriority.High),
                CreateNewOrder("Inverter Firmware Update", "Bulk update needed for model X10 in sector 4.", "EcoPower Solutions", adminId, DateTime.UtcNow.AddDays(10), WorkOrderPriority.Low),
                CreateNewOrder("Routine Efficiency Audit", "Analyze monthly yield drop reported by telematics.", "Acme Corp", managerId, DateTime.UtcNow.AddDays(15), WorkOrderPriority.Medium),

                CreateAssignedOrder("Inverter Inspection", "The main inverter is showing a voltage error grid-side.", "Solar Solutions LLC", adminId, agent1Id, DateTime.UtcNow.AddDays(2), WorkOrderPriority.Medium),
                CreateAssignedOrder("Battery Storage Setup", "Install 3 commercial storage packs in main garage.", "Alice Smith", managerId, agent2Id, DateTime.UtcNow.AddDays(4), WorkOrderPriority.High),

                CreateInProgressOrder("Grid Tie Connection", "Finalize utility paperwork and switch on breaker.", "City Grid Inc", managerId, agent1Id, DateTime.UtcNow.AddDays(1), WorkOrderPriority.High),
                CreateInProgressOrder("Commercial Roof Survey", "Drone thermal imaging mapping of 5000sqft roof.", "Logistics Hub", adminId, agent2Id, DateTime.UtcNow.AddDays(3), WorkOrderPriority.Medium),

                CreateBlockedOrder("Meter Replacement", "Waiting for utility company to unlock the external meter box.", "Bob Johnson", managerId, agent1Id, DateTime.UtcNow.AddDays(2), WorkOrderPriority.High),

                CreateInProgressOrder("Urgent Fuse Box Repair", "Sparking observed in main breaker unit during load tests.", "Emergency Housing", adminId, agent2Id, DateTime.UtcNow.AddDays(-3), WorkOrderPriority.High),
                CreateAssignedOrder("Cable Management Fix", "Secure loose high-voltage cables under array B3.", "Alpha Factory", managerId, agent1Id, DateTime.UtcNow.AddDays(-1), WorkOrderPriority.Medium),

                CreateCompletedOrder("Preventive Maintenance", "Cleaning of dust and debris from panels in sector B.", "Acme Corp", managerId, agent2Id, DateTime.UtcNow.AddDays(-2), WorkOrderPriority.Low),
                CreateCompletedOrder("Weather Station Recalibration", "Re-align wind and irradiance sensors after storm.", "Nexus Energy", adminId, agent1Id, DateTime.UtcNow.AddDays(-5), WorkOrderPriority.Low),

                CreateCancelledOrder("Duplicate Support Request", "Customer opened two identical tickets for the same inverter.", "Charlie Brown", managerId, DateTime.UtcNow.AddDays(7), WorkOrderPriority.Low),
                CreateCancelledOrder("Cancelled Site Survey", "Project cancelled by client prior to team deployment.", "Old Client Ltd", adminId, DateTime.UtcNow.AddDays(-2), WorkOrderPriority.Medium)
            };

            context.WorkOrders.AddRange(orders);
            context.SaveChanges();
        }

        private static WorkOrder CreateNewOrder(string title, string desc, string customer, Guid createdBy, DateTime dueDate, WorkOrderPriority priority)
        {
            return new WorkOrder
            {
                Title = title,
                Description = desc,
                CustomerName = customer,
                CreatedById = createdBy,
                DueDate = dueDate,
                Priority = priority
            };
        }

        private static WorkOrder CreateAssignedOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate, WorkOrderPriority priority)
        {
            var order = CreateNewOrder(title, desc, customer, createdBy, dueDate, priority);
            order.AssignTo(assignedTo);
            return order;
        }

        private static WorkOrder CreateInProgressOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate, WorkOrderPriority priority)
        {
            var order = CreateAssignedOrder(title, desc, customer, createdBy, assignedTo, dueDate, priority);
            order.StartWork();
            return order;
        }

        private static WorkOrder CreateBlockedOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate, WorkOrderPriority priority)
        {
            var order = CreateInProgressOrder(title, desc, customer, createdBy, assignedTo, dueDate, priority);
            order.ReportBlocked();
            return order;
        }

        private static WorkOrder CreateCompletedOrder(string title, string desc, string customer, Guid createdBy, Guid assignedTo, DateTime dueDate, WorkOrderPriority priority)
        {
            var order = CreateInProgressOrder(title, desc, customer, createdBy, assignedTo, dueDate, priority);
            order.Complete();
            return order;
        }

        private static WorkOrder CreateCancelledOrder(string title, string desc, string customer, Guid createdBy, DateTime dueDate, WorkOrderPriority priority)
        {
            var order = CreateNewOrder(title, desc, customer, createdBy, dueDate, priority);
            order.Cancel();
            return order;
        }
    }
}