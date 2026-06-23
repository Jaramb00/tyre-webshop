using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartCommerce.Application.Common.Exceptions;
using SmartCommerce.Application.Common.Interfaces;
using SmartCommerce.Application.Features.Orders.DTOs;
using SmartCommerce.Domain.Entities;

namespace SmartCommerce.Application.Features.Orders.Commands;

public record CreateOrderCommand(Guid UserId, CreateOrderDto Dto) : IRequest<Guid>;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.Dto.ShippingAddress.FullName).NotEmpty();
        RuleFor(x => x.Dto.ShippingAddress.Line1).NotEmpty();
        RuleFor(x => x.Dto.ShippingAddress.City).NotEmpty();
        RuleFor(x => x.Dto.ShippingAddress.State).NotEmpty();
        RuleFor(x => x.Dto.ShippingAddress.PostalCode).NotEmpty();
        RuleFor(x => x.Dto.ShippingAddress.Country).NotEmpty().Length(2);
    }
}

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IEmailService _emailService;
    public CreateOrderCommandHandler(IApplicationDbContext context, INotificationService notificationService, IEmailService emailService)
    {
        _context = context;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(ci => ci.Product)
            .ThenInclude(p => p.Inventory)
            .FirstOrDefaultAsync(c => c.UserId == request.UserId && !c.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Cart not found.");

        if (!cart.Items.Any())
            throw new BusinessRuleException("Cannot create order from empty cart.");

        var dto = request.Dto;
        var shippingAddress = MapAddress(dto.ShippingAddress);
        var billingAddress = MapAddress(dto.BillingAddress);

        var order = Order.Create(request.UserId, shippingAddress, billingAddress, dto.Currency);
        if (dto.Notes != null) { /* set notes via method if needed */ }

        await _context.Orders.AddAsync(order, cancellationToken);

        var orderItems = new List<OrderItem>();
        foreach (var cartItem in cart.Items)
        {
            var inventory = cartItem.Product.Inventory
                ?? throw new BusinessRuleException($"Product '{cartItem.Product.Name}' has no inventory.");

            if (inventory.AvailableQuantity < cartItem.Quantity)
                throw new BusinessRuleException($"Insufficient stock for '{cartItem.Product.Name}'. Available: {inventory.AvailableQuantity}");

            var orderItem = OrderItem.Create(order.Id, cartItem.Product, cartItem.Quantity);
            order.AddItem(orderItem);
            orderItems.Add(orderItem);
            inventory.ReserveStock(cartItem.Quantity);
        }

        await _context.OrderItems.AddRangeAsync(orderItems, cancellationToken);

        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == dto.CouponCode.ToUpperInvariant(), cancellationToken);

            if (coupon != null && coupon.IsValid(order.Subtotal))
            {
                order.ApplyCoupon(coupon);
                coupon.IncrementUsage();
            }
        }

        order.SetShipping(CalculateShipping(order.Subtotal));
        order.SetTax(0.08m);
        order.Confirm();

        cart.Clear();
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user != null)
        {
            await _emailService.SendOrderConfirmationAsync(user.Email, order.OrderNumber, order.Total, cancellationToken);
            await _notificationService.SendAsync(
                user.Id,
                "Order Confirmed",
                $"Your order #{order.OrderNumber} has been confirmed.",
                Domain.Enums.NotificationType.OrderConfirmed,
                $"/orders/{order.Id}",
                cancellationToken);
        }

        return order.Id;
    }

    private static Address MapAddress(AddressDto dto) => new()
    {
        FullName = dto.FullName,
        Line1 = dto.Line1,
        Line2 = dto.Line2,
        City = dto.City,
        State = dto.State,
        PostalCode = dto.PostalCode,
        Country = dto.Country,
        PhoneNumber = dto.PhoneNumber
    };

    private static decimal CalculateShipping(decimal subtotal) =>
        subtotal >= 50m ? 0m : 5.99m;
}
