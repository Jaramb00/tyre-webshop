using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Orders.Commands;

public record UpdateOrderStatusCommand(Guid OrderId, string Status, string? TrackingNumber) : IRequest;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    public UpdateOrderStatusCommandHandler(IApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Shipment)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && !o.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order), request.OrderId);

        if (!Enum.TryParse<Domain.Enums.OrderStatus>(request.Status, out var newStatus))
            throw new BusinessRuleException($"Invalid status: {request.Status}");

        switch (newStatus)
        {
            case Domain.Enums.OrderStatus.Processing:
                order.MarkAsProcessing();
                break;
            case Domain.Enums.OrderStatus.Shipped:
                if (string.IsNullOrEmpty(request.TrackingNumber))
                    throw new BusinessRuleException("Tracking number required when marking as shipped.");
                order.MarkAsShipped(request.TrackingNumber);
                await _emailService.SendOrderShippedAsync(order.User.Email, order.OrderNumber, request.TrackingNumber, cancellationToken);
                break;
            case Domain.Enums.OrderStatus.Delivered:
                order.MarkAsDelivered();
                break;
            default:
                throw new BusinessRuleException($"Cannot manually set status to {request.Status}.");
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            order.UserId,
            $"Order {newStatus}",
            $"Your order #{order.OrderNumber} status has been updated to {newStatus}.",
            Domain.Enums.NotificationType.OrderConfirmed,
            $"/orders/{order.Id}",
            cancellationToken);
    }
}
