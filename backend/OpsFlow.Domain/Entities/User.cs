using OpsFlow.Domain.Common;
using OpsFlow.Domain.Enums;

namespace OpsFlow.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Viewer;
    }
}
