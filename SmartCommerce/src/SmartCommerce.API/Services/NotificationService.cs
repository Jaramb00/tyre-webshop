using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.API.Hubs;
using SmartCommerce.Domain.Entities;
using SmartCommerce.Domain.Enums;

namespace SmartCommerce.API.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IApplicationDbContext _context;

    public NotificationService(IHubContext<NotificationHub> hubContext, IApplicationDbContext context)
    {
        _hubContext = hubContext;
        _context = context;
    }

    public async Task SendAsync(
        Guid userId,
        string title,
        string message,
        NotificationType type,
        string? actionUrl = null,
        CancellationToken cancellationToken = default)
    {
        var notification = Notification.Create(userId, title, message, type, actionUrl);
        await _context.Notifications.AddAsync(notification, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        await _hubContext.Clients.Group($"user-{userId}").SendAsync(
            "ReceiveNotification",
            new { notification.Id, title, message, type = type.ToString(), actionUrl, notification.CreatedAt },
            cancellationToken);
    }

    public async Task SendToRoleAsync(
        string role,
        string title,
        string message,
        NotificationType type,
        CancellationToken cancellationToken = default)
    {
        var userIds = await _context.UserRoles
            .Where(ur => ur.Role.Name == role)
            .Select(ur => ur.UserId)
            .ToListAsync(cancellationToken);

        foreach (var userId in userIds)
            await SendAsync(userId, title, message, type, null, cancellationToken);
    }
}
