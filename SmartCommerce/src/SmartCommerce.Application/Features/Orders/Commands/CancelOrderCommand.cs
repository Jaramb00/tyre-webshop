using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;

namespace SmartCommerce.Application.Features.Orders.Commands;

public record CancelOrderCommand(Guid OrderId, Guid UserId, string Reason) : IRequest;

public class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderCommandValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    public CancelOrderCommandHandler(IApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(oi => oi.Product)
            .ThenInclude(p => p.Inventory)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.Id == request.OrderId && !o.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.Order), request.OrderId);

        if (order.UserId != request.UserId)
            throw new ForbiddenException("You can only cancel your own orders.");

        order.Cancel(request.Reason);

        // Release reserved stock
        foreach (var item in order.Items)
        {
            item.Product.Inventory?.ReleaseReservation(item.Quantity);
        }

        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            order.UserId,
            "Order Cancelled",
            $"Your order #{order.OrderNumber} has been cancelled.",
            Domain.Enums.NotificationType.OrderCancelled,
            $"/orders/{order.Id}",
            cancellationToken);
    }
}
